"use client";
import { useEffect } from "react";
import { useSidebar } from "./ui/sidebar";

export function SidebarAutoTrigger() {
  const { setOpen, open } = useSidebar();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 50 && !open) {
        setOpen(true);
      } else if (e.clientX > 255 && open) {
        setOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [setOpen, open]);

  return null; // No UI, just logic
}
