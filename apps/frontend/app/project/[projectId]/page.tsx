"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { WORKER_API_URL, WORKER_URL } from "@/config";
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
  const [prompt, setPrompt] = useState<string>("");
  const { getToken } = useAuth();

  return (
    <div className="flex h-screen gap-2">
      <div className="w-1/4 h-[90%] flex flex-col justify-between">
        <div>
          <div className="font-bold text-xl m-2">Chat history</div>
          <div className="bg-[#171717] p-4 mb-4 rounded-2xl">
            {prompts
              //.filter((prompt) => prompt.type === "USER")
              .map((prompt) => (
                <div key={prompt.id} className="flex flex-col justify-start">
                  {prompt.type === "USER" && (
                    <div className="text-wrap break-words">
                      {prompt.content}
                    </div>
                  )}
                  {prompt.Action.map((action) => {
                    const indexSeparator = action.content.indexOf(":");
                    if (indexSeparator == -1) {
                      return (
                        <div
                          key={action.id}
                          className="flex justify-start gap-2 p-1"
                        >
                          <CheckIcon className="stroke-green-500 w-full max-w-5" />
                          <div className="flex justify-start">
                            {action.content}
                          </div>
                        </div>
                      );
                    } else {
                      const [heading, content] = action.content.split(":");
                      return (
                        <div key={action.id} className="">
                          <div className="flex justify-start gap-2 p-1">
                            <CheckIcon className="stroke-green-500 w-full max-w-5" />
                            <div className="text-white">{heading}</div>
                          </div>
                          <div className="text-[#FF757F] bg-[#262626] rounded p-[5px] px-4">
                            {content.trim()}
                          </div>
                        </div>
                      );
                    }
                  })}
                  <Separator className="my-2" />
                </div>
              ))}
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
