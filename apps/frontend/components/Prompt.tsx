"use client";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/config";

export default function Prompt() {
  const [prompt, setPrompt] = useState("");
  const { getToken } = useAuth();

  return (
    <div className="flex justify-center gap-4">
      <Textarea
        className="placeholder-[#E5E5E5]"
        placeholder="Create a chess application..."
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
        }}
      />
      <div>
        <Button
          size={"icon"}
          className="size-16"
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
          }}
        >
          <Send className="size-6" />
        </Button>
      </div>
    </div>
  );
}
