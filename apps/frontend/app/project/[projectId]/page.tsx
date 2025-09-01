"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="flex h-[calc(100vh-72px)] gap-2 mb-2 mx-2">
      <div className="w-1/4 h-full flex flex-col justify-between">
        <div>
          <div className="font-bold text-xl m-2">Chat history</div>
          <div className="bg-[#FFFFFF] dark:bg-[#171717] p-4 mb-4 rounded-2xl h-[calc(100vh-190px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overflow-y-auto border border-gray-300 space-y-2 shadow-md">
            {prompts
              //.filter((prompt) => prompt.type === "USER")
              .map((prompt) => (
                <div key={prompt.id} className="flex flex-col justify-start">
                  {prompt.type === "USER" && (
                    <div className="text-wrap break-words text-black dark:text-white">
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
                          <div className="flex justify-start text-black dark:text-white">
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
                            <div className="text-black dark:text-white">
                              {heading}
                            </div>
                          </div>
                          <div className="text-[#FF757F] bg-[#ECECEC] dark:bg-[#262626] rounded p-[5px] px-4">
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
        <div className="flex justify-center items-center w-full">
          <div className="relative w-full">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={(e) => e.target.classList.add("h-40")}
              onBlur={(e) => e.target.classList.remove("h-40")}
              className="transition-all duration-300 h-12 min-h-12 w-full resize-none overflow-y-auto pr-12 absolute bottom-0 bg-white dark:bg-[#262626] text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md z-10"
              placeholder="Your next prompt here..."
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full z-20"
              onClick={async () => {
                const token = await getToken();
                axios.post(
                  `${WORKER_API_URL}/prompt`,
                  { projectId, prompt },
                  { headers: { Authorization: `Bearer ${token}` } },
                );
              }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-3/4">
        <iframe
          src={`${WORKER_URL}`}
          width={"100%"}
          height={"100%"}
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}
