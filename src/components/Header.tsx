"use client";

import { Avatar, Surface, Button } from "@heroui/react";
import { FaUser, FaBell, FaSun } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-separator bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-full items-center justify-between px-4 md:px-6 py-3">
        <h1 className="text-2xl font-bold text-foreground">kadara</h1>
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" isIconOnly size="sm">
            <IoSearch className="w-4 h-4" />
          </Button>
          <Button variant="ghost" isIconOnly size="sm">
            <FaBell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" isIconOnly size="sm">
            <FaSun className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-separator">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">Admin</span>
              <span className="text-xs text-muted">admin@kadara.com</span>
            </div>
            <Avatar size="md" className="bg-accent text-accent-foreground">
              <Avatar.Fallback>
                <FaUser className="w-4 h-4" />
              </Avatar.Fallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
