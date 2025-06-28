"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_API_URL, WORKER_URL } from "@/config";
import useActions from "@/hooks/useActions";
import usePrompts from "@/hooks/usePrompts";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Send } from "lucide-react";
import React, { useState } from "react";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);
  const { prompts } = usePrompts(projectId);
  const { actions } = useActions(projectId);
  const [prompt, setPrompt] = useState<string>("");
  const { getToken } = useAuth();

  return (
    <div className="flex h-screen gap-2">
      <div className="w-1/4 h-[90%] flex flex-col justify-between">
        <div>
          Chat history
          {prompts
            .filter((prompt) => prompt.type === "USER")
            .map((prompt) => (
              <div key={prompt.id}>{prompt.content}</div>
            ))}
          {actions.map((action) => (
            <div key={action.id}>{action.content}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
          />
          <Button
            onClick={async () => {
              const token = await getToken();
              axios.post(
                `${WORKER_API_URL}/prompt`,
                {
                  projectId,
                  prompt,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
            }}
          >
            <Send />
          </Button>
        </div>
      </div>
      <div className="w-3/4">
        <iframe
          src={`${WORKER_URL}`}
          width={"100%"}
          height={"90%"}
          className=""
        />
      </div>
    </div>
  );
}
