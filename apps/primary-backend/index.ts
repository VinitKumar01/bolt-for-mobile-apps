import { prismaClient } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/project", authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  const userId = req.userId;
  // add logic to get a useful name from prompt
  const description = prompt.split("\n");
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

app.get("/projects", async (req, res) => {
  const userId = req.userId;

  const projects = await prismaClient.project.findMany({
    where: {
      userId,
    },
  });
  res.json(projects);
});

app.listen(3001, () => {
  console.log("Listening on port 3001");
});
