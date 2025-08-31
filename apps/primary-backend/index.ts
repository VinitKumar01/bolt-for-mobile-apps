import { prismaClient } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware";
import { verifyWebhook } from "@clerk/express/webhooks";

const app = express();
app.use(cors());

app.post(
  "/api/clerk/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = await verifyWebhook(req, {
        signingSecret: process.env.CLERK_WEBHOOK_SECRET,
      });

      if (event.type === "user.created") {
        const { id, email_addresses } = event.data;
        await prismaClient.user.create({
          data: {
            userId: id,
            email: email_addresses[0]?.email_address as string,
          },
        });
      }
      res.status(200).json({ message: "Handled" });
    } catch (error) {
      console.error("Error handling Clerk webhook:", error);
      res.status(500).json({ error: "Failed to handle webhook" });
    }
  },
);

app.use(express.json());

app.post("/project", authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  const userId = req.userId;
  // add logic to get a useful name from prompt
  const description = prompt.split("\n")[0];
  const project = await prismaClient.project.create({
    data: {
      description,
      userId,
    },
  });
  res.json({
    projectId: project.id,
  });
});

app.get("/projects", authMiddleware, async (req, res) => {
  const userId = req.userId;

  const projects = await prismaClient.project.findMany({
    where: {
      userId,
    },
  });
  res.json(projects);
});

app.get("/prompts/:projectId", authMiddleware, async (req, res) => {
  //const userId = req.userId;
  const projectId = req.params.projectId;

  const prompts = await prismaClient.prompt.findMany({
    where: {
      projectId,
    },
    orderBy: { createdAt: "asc" },
    include: {
      Action: true,
    },
  });

  res.json({ prompts });
});

app.listen(9090, () => {
  console.log("Listening on port 9090");
});
