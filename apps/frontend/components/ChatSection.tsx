import usePrompts from "@/hooks/usePrompts";
import { CheckIcon, DownloadIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { WORKER_API_URL } from "@/config";

export default function ChatSection({ projectId }: { projectId: string }) {
  const { prompts } = usePrompts(projectId);

  return (
    <div>
      <div className="flex justify-between items-center my-2">
        <div className="font-bold text-xl m-2">Chat history</div>
        <Button
          onClick={() => {
            window.location.href = WORKER_API_URL + "/download-all";
          }}
        >
          <DownloadIcon />
          Source Code
        </Button>
      </div>
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
  );
}
