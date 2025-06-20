"use client";
import { BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";

interface Action {
  id: string;
  content: string;
  createdAt: string;
}

export default function useActions(projectId: string) {
  const [actions, setActions] = useState<Action[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    async function getActions() {
      const token = await getToken();
      const response = await axios.get(`${BACKEND_URL}/actions/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActions(response.data.actions);
    }

    getActions();
    const interval = setInterval(getActions, 1000);

    return clearInterval(interval);
  }, [projectId, getToken]);

  return {
    actions,
  };
}
