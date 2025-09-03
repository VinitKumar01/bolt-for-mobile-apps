"use client";
import axios from "axios";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { BACKEND_URL, WORKER_API_URL } from "@/config";
import { Send } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePrompt() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState<string>("");
  const router = useRouter();

  return (
    <div className="flex justify-center items-center w-full">
      <div className="relative w-full">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={(e) => e.target.classList.add("h-40")}
          onBlur={(e) => e.target.classList.remove("h-40")}
          className="transition-all duration-300 h-16 min-h-12 w-full resize-none overflow-y-auto pr-12 absolute bottom-[-4] bg-white dark:bg-[#262626] text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md z-10"
          placeholder="Create a todo application..."
        />
        <Button
          size="icon"
          className="absolute top-4 right-2 h-8 w-8 rounded-full z-20"
          onClick={async () => {
            const token = await getToken();
            const response = await axios.post(
              `${BACKEND_URL}/project`,
              {
                prompt: prompt,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            axios.post(`${WORKER_API_URL}/prompt`, {
              projectId: response.data.projectId,
              prompt,
            });

            router.push(`/project/${response.data.projectId}`);
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
