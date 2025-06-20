"use client";
import { BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";

interface Prompt {
  id: string;
  content: string;
  type: "USER" | "SYSTEM";
  createdAt: string;
}

export default function usePrompts(projectId: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    async function getPrompts() {
      const token = await getToken();
      const response = await axios.get(`${BACKEND_URL}/prompts/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPrompts(response.data.prompts);
    }

    getPrompts();
    const interval = setInterval(getPrompts, 1000);

    return clearInterval(interval);
  }, [projectId, getToken]);

  return {
    prompts,
  };
}
