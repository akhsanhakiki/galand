"use client";

import { Avatar, Button } from "@heroui/react";
import { FaUser, FaBell, FaSun, FaMoon } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";


export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-full items-center justify-between px-4 md:px-6 py-3">
        <h1 className="text-2xl font-bold text-primary">kadara</h1>
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" isIconOnly size="sm">
            <IoSearch className="w-4 h-4 text-default-500" />
          </Button>
          <Button variant="ghost" isIconOnly size="sm">
            <FaBell className="w-4 h-4 text-default-500" />
          </Button>
          <Button 
            variant="ghost" 
            isIconOnly 
            size="sm"
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <FaSun className="w-4 h-4 text-default-500" />
            ) : (
              <FaMoon className="w-4 h-4 text-default-500" />
            )}
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-divider">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">Admin</span>
              <span className="text-xs text-default-500">admin@kadara.com</span>
            </div>
            <Avatar size="md" className="bg-primary text-primary-foreground">
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
