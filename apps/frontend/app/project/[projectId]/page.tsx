"use client";
import ChatSection from "@/components/ChatSection";
import CodeEditor from "@/components/CodeEditor";
import ProjectPrompt from "@/components/ProjectPrompt";
import React from "react";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);

  return (
    <div className="flex h-[calc(100vh-72px)] gap-2 mb-2 mx-2">
      <div className="w-1/4 h-full flex flex-col justify-between">
        <ChatSection projectId={projectId} />
        <ProjectPrompt projectId={projectId} />
      </div>
      <CodeEditor />
    </div>
  );
}
