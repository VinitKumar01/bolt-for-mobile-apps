import cors from "cors";
import express, { type Request, type Response } from "express";
import { prismaClient } from "db/client";
import axios from "axios";
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onShellCommand } from "./os";
import archiver from "archiver";
import { spawn } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/prompt", async (req: Request, res: Response) => {
  try {
    const { prompt, projectId } = req.body;

    if (!prompt || !projectId) {
      res.status(400).json({
        error: "Missing required fields: prompt and projectId",
      });
      return;
    }

    await prismaClient.prompt.create({
      data: {
        content: prompt,
        projectId,
        type: "USER",
      },
    });

    const allPrompts = await prismaClient.prompt.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    const requestData = {
      contents: allPrompts.map((p) => ({
        role: p.type === "USER" ? "user" : "model",
        parts: [{ text: p.content }],
      })),
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        //maxOutputTokens: 8000,
        temperature: 0.7,
      },
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestData,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 300000,
      },
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;

    let createdPrompt = await prismaClient.prompt.create({
      data: {
        content: generatedText,
        projectId,
        type: "SYSTEM",
      },
    });

    let promptId = createdPrompt.id;

    let artifactProcessor = new ArtifactProcessor(
      "",
      onFileUpdate,
      onShellCommand,
      projectId,
      promptId,
    );
    artifactProcessor.append(generatedText);
    artifactProcessor.parse();

    artifactProcessor.reset();

    res.json({
      success: true,
      response: generatedText,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      const errWithResponse = error as {
        response?: { status: number; data: any };
      };

      if (errWithResponse.response) {
        res.status(errWithResponse.response.status).json({
          error: "API request failed",
          details: errWithResponse.response.data,
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
          details: error.message,
        });
      }
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: String(error),
      });
    }
  }
});

app.get("/download-all", (req, res) => {
  const folderPath = "/tmp/bolty-worker";
  const zipName = "source-code.zip";

  res.setHeader("Content-Disposition", `attachment; filename=${zipName}`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  archive.directory(folderPath, false);
  archive.finalize();
});

app.post("/run", (req, res) => {
  const result = spawn(
    "/usr/local/bin/docker",
    ["exec", "code-server-update", "pm2", "delete", "expo"],
    {
      cwd: process.env.HOME,
      stdio: "pipe",
    },
  ).on("close", () => {
    spawn(
      "/usr/local/bin/docker",
      [
        "exec",
        "-d",
        "code-server-update",
        "pm2",
        "start",
        "npx",
        "--name",
        "expo",
        "--cwd",
        "/tmp/bolty-worker",
        "--",
        "expo",
        "start",
      ],
      {
        cwd: process.env.HOME,
      },
    );
  });

  console.log(result);
  res.json({
    message: result,
  });
});

app.listen(9091, () => {
  console.log(`Server listening on port 9091`);
});

export default app;
