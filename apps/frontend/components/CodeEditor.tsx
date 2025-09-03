import { WORKER_API_URL, WORKER_URL } from "@/config";
import { Button } from "./ui/button";
import { FullscreenIcon } from "lucide-react";
import axios from "axios";

export default function CodeEditor() {
  return (
    <div className="w-3/4 bg-[#DDDDDD] dark:bg-[#3C3C3C] rounded-2xl max-h-[calc(100vh-108px)]">
      <div className="flex justify-end items-center">
        <Button
          variant={"ghost"}
          onClick={async () => {
            await axios.post(`${WORKER_API_URL}/run`);
            window.open(
              "http://localhost:8081",
              "_blank",
              "noopener,noreferrer",
            );
          }}
        >
          <FullscreenIcon /> Preview
        </Button>
      </div>
      <iframe
        src={`${WORKER_URL}`}
        width={"100%"}
        height={"100%"}
        className="rounded-2xl"
      />
    </div>
  );
}
