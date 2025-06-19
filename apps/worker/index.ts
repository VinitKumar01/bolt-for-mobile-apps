import cors from "cors";
import express from "express";
import { prismaClient } from "db/client";
import axios from "axios";
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onShellCommand } from "./os";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/prompt", async (req, res) => {
  try {
    const { prompt, projectId } = req.body;

    if (!prompt || !projectId) {
      return res.status(400).json({
        error: "Missing required fields: prompt and projectId",
      });
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
        maxOutputTokens: 8000,
        temperature: 0.7,
      },
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestData,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      },
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;

    // Process with artifact processor
    let artifactProcessor = new ArtifactProcessor(
      "",
      onFileUpdate,
      onShellCommand,
    );
    artifactProcessor.append(generatedText);
    artifactProcessor.parse();

    // Save the response
    await prismaClient.prompt.create({
      data: {
        content: generatedText,
        projectId,
        type: "SYSTEM",
      },
    });

    res.json({
      success: true,
      response: generatedText,
    });
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      res.status(error.response.status).json({
        error: "API request failed",
        details: error.response.data,
      });
    } else {
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
});
app.listen(9091, () => {
  console.log(`Server listening on port 9091`);
});

export default app;
