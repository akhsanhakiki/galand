"use client";

import { Avatar, Button, Surface } from "@heroui/react";
import { FaUser, FaSun, FaMoon } from "react-icons/fa6";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeaderProps {
  collapsed?: boolean;
  isMobile?: boolean;
}

export default function Header({
  collapsed = false,
  isMobile = false,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mobile view - full header at top
  if (isMobile) {
    return (
      <div className="w-full px-4 py-4">
        <Surface className="mx-auto flex max-w-full items-center justify-between w-full h-full rounded-3xl p-2">
          <h1 className="text-2xl font-bold text-primary pl-4">kadara</h1>
          <div className="flex items-center gap-2 md:gap-3">
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
            <div className="flex items-center gap-2 pl-2">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">
                  Admin
                </span>
                <span className="text-xs text-default-500">
                  admin@kadara.com
                </span>
              </div>
              <Avatar size="md" className="bg-primary text-primary-foreground">
                <Avatar.Fallback>
                  <FaUser className="w-4 h-4" />
                </Avatar.Fallback>
              </Avatar>
            </div>
          </div>
        </Surface>
      </div>
    );
  }

  // Desktop view - collapsible in sidebar
  return (
    <div className="w-full flex flex-col gap-2">
      {collapsed ? (
        // Collapsed state - vertical layout with icons only
        <div className="flex flex-col items-center gap-2 w-full">
          <Button
            variant="ghost"
            isIconOnly
            size="sm"
            className="w-10 h-10"
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <FaSun className="w-4 h-4 text-default-500" />
            ) : (
              <FaMoon className="w-4 h-4 text-default-500" />
            )}
          </Button>
          <Avatar size="sm" className="bg-primary text-primary-foreground">
            <Avatar.Fallback>
              <FaUser className="w-3 h-3" />
            </Avatar.Fallback>
          </Avatar>
        </div>
      ) : (
        // Expanded state - horizontal layout with full info
        <div className="flex flex-col gap-2">
          <Button
            className="flex items-center gap-4 w-full justify-start p-4"
            variant="ghost"
            isIconOnly
            size="md"
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <FaMoon className="w-4 h-4 text-default-500" />
            ) : (
              <FaSun className="w-4 h-4 text-default-500" />
            )}
            <p className="text-xs font-medium text-foreground">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </p>
          </Button>
          <div className="flex items-center gap-2 px-2 pb-1">
            <Avatar size="sm" className="bg-primary text-primary-foreground">
              <Avatar.Fallback>
                <FaUser className="w-3 h-3" />
              </Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground truncate">
                Admin
              </span>
              <span className="text-xs text-default-500 truncate">
                admin@kadara.com
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
