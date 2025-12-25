"use client";

import { Avatar } from "@heroui/react";
import { FaUser } from "react-icons/fa6";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-bold text-foreground">kadara</h1>
        <div className="flex items-center gap-3">
          <Avatar size="md" color="accent">
            <Avatar.Fallback>
              <FaUser className="w-5 h-5" />
            </Avatar.Fallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
