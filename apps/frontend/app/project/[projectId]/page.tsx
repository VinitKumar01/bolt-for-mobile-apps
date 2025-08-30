"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_API_URL, WORKER_URL } from "@/config";
import useActions from "@/hooks/useActions";
import usePrompts from "@/hooks/usePrompts";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { CheckIcon, Send } from "lucide-react";
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
    <div className="flex h-full gap-2">
      <div className="w-1/4 h-[90%] flex flex-col justify-between">
        <div>
          <div className="font-bold text-xl m-2">Chat history</div>
          <div className="bg-[#262626] p-4 mb-4 rounded-2xl">
            {prompts
              .filter((prompt) => prompt.type === "USER")
              .map((prompt) => (
                <div key={prompt.id} className="flex justify-start">
                  {prompt.content}
                </div>
              ))}
          </div>
          <div className="bg-[#262626] p-4 mb-4 gap-2 rounded-2xl">
            {actions.map((action) => {
              const indexSeparator = action.content.indexOf(":");
              if (indexSeparator == -1) {
                return (
                  <div key={action.id} className="flex justify-start gap-2 p-1">
                    <CheckIcon className="stroke-green-500 w-full max-w-5" />
                    <div className="flex justify-start">{action.content}</div>
                  </div>
                );
              } else {
                const [heading, content] = action.content.split(":");
                return (
                  <div key={action.id} className="flex justify-start gap-2 p-1">
                    <CheckIcon className="stroke-green-500 w-full max-w-5" />
                    <div className="flex justify-start">
                      <div className="text-white">{heading + ": "}</div>
                      <div className="text-[#FF757F] bg-[#262626] rounded p-[5px]">
                        {content.trim()}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
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
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}
