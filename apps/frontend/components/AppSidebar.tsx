"use client";

import { BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { MessageCircleIcon } from "lucide-react";

interface TypeProject {
  id: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export default function AppSidebar() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string>("");
  const [projects, setProjects] = useState<TypeProject[]>([]);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) setToken(t);
    })();
  }, [getToken]);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res = await axios.get<TypeProject[]>(`${BACKEND_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    })();
  }, [token]);

  return (
    <div>
      <Sidebar>
        <SidebarHeader>
          <div className="text-4xl font-bold">Bolty</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <Separator />
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <a href="#" className="w-60 truncate">
                        <MessageCircleIcon />
                        <span>{project.description}</span>
                      </a>
                    </SidebarMenuButton>
                    <Separator />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
