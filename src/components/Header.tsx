"use client";

import {
  Avatar,
  Button,
  Surface,
  Disclosure,
  Modal,
  Switch,
  Label,
} from "@heroui/react";
import {
  LuUser,
  LuSun,
  LuMoon,
  LuLogOut,
  LuMail,
  LuShield,
  LuIdCard,
  LuX,
} from "react-icons/lu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  collapsed?: boolean;
  isMobile?: boolean;
}

export default function Header({
  collapsed = false,
  isMobile = false,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExpandedChange = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  const handleLogout = async () => {
    await signOut();
    window.location.replace("/login");
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "No email";
  const displayRole = user?.role || "User";

  // Mobile view - full header at top
  if (isMobile) {
    return (
      <>
        <div className="w-full px-4 py-2">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg font-bold text-primary">kadara</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted && theme === "dark" ? (
                  <LuSun className="w-4 h-4 text-default-500" />
                ) : (
                  <LuMoon className="w-4 h-4 text-default-500" />
                )}
              </Button>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="cursor-pointer"
              >
                <Avatar
                  size="sm"
                  className="bg-primary text-primary-foreground"
                >
                  {user?.image ? (
                    <Avatar.Image src={user.image} alt={displayName} />
                  ) : null}
                  <Avatar.Fallback>
                    {authLoading ? (
                      <LuUser className="w-3 h-3" />
                    ) : (
                      getUserInitials()
                    )}
                  </Avatar.Fallback>
                </Avatar>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Modal */}
        {isProfileModalOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col h-full">
            <div className="w-full px-4 py-2 flex items-center justify-between border-b border-default-200">
              <h2 className="text-lg font-bold text-foreground">Profil</h2>
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                onPress={() => setIsProfileModalOpen(false)}
              >
                <LuX className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <Avatar
                  size="lg"
                  className="bg-primary text-primary-foreground w-20 h-20"
                >
                  {user?.image ? (
                    <Avatar.Image src={user.image} alt={displayName} />
                  ) : null}
                  <Avatar.Fallback>
                    {authLoading ? (
                      <LuUser className="w-10 h-10" />
                    ) : (
                      getUserInitials()
                    )}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {authLoading ? "Loading..." : displayName}
                  </h3>
                  <p className="text-sm text-default-500">
                    {authLoading ? "" : displayEmail}
                  </p>
                  {displayRole && (
                    <div className="flex items-center gap-1 mt-1">
                      {displayRole === "admin" ? (
                        <LuShield className="w-4 h-4 text-primary" />
                      ) : (
                        <LuIdCard className="w-4 h-4 text-default-500" />
                      )}
                      <span className="text-xs text-default-500 capitalize">
                        {displayRole}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <div className="flex items-center justify-between w-full py-2 px-3">
                  <div className="flex items-center gap-3">
                    {mounted && theme === "dark" ? (
                      <LuMoon className="w-5 h-5 text-default-500" />
                    ) : (
                      <LuSun className="w-5 h-5 text-default-500" />
                    )}
                    <Label className="text-base font-medium text-foreground">
                      {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </Label>
                  </div>
                  <Switch
                    isSelected={mounted && theme === "dark"}
                    onChange={(isSelected) =>
                      setTheme(isSelected ? "dark" : "light")
                    }
                    size="md"
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
                <Button
                  className="w-full transition-all duration-200 rounded-2xl justify-start h-12 hover:bg-danger-100 hover:text-danger text-foreground"
                  variant="ghost"
                  onPress={handleLogout}
                >
                  <LuLogOut className="w-5 h-5 mr-1 shrink-0" />
                  <span className="text-base font-medium">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
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
              <LuSun className="w-4 h-4 text-default-500" />
            ) : (
              <LuMoon className="w-4 h-4 text-default-500" />
            )}
          </Button>
          <Avatar size="sm" className="bg-primary text-primary-foreground">
            {user?.image ? (
              <Avatar.Image src={user.image} alt={displayName} />
            ) : null}
            <Avatar.Fallback>
              {authLoading ? <LuUser className="w-3 h-3" /> : getUserInitials()}
            </Avatar.Fallback>
          </Avatar>
        </div>
      ) : (
        // Expanded state - horizontal layout with expandable user menu using Disclosure
        <Disclosure
          isExpanded={isExpanded}
          onExpandedChange={handleExpandedChange}
          className="w-full"
        >
          <Disclosure.Heading>
            <Button
              slot="trigger"
              className="w-full transition-all duration-200 rounded-2xl justify-between h-auto p-2 hover:bg-default-100 text-foreground"
              variant="ghost"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar
                  size="sm"
                  className="bg-primary text-primary-foreground shrink-0"
                >
                  {user?.image ? (
                    <Avatar.Image src={user.image} alt={displayName} />
                  ) : null}
                  <Avatar.Fallback>
                    {authLoading ? (
                      <LuUser className="w-3 h-3" />
                    ) : (
                      getUserInitials()
                    )}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-foreground truncate text-left">
                    {authLoading ? "Loading..." : displayName}
                  </span>
                  <p className="text-xs font-medium text-foreground truncate">
                    {authLoading ? "Loading..." : displayEmail}
                  </p>
                </div>
              </div>
              <Disclosure.Indicator />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className="flex flex-col gap-2">
              {/* User Info Section */}

              <Button
                className="w-full transition-all duration-200 rounded-2xl justify-start h-10 hover:bg-default-100 text-foreground"
                variant="ghost"
                onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted && theme === "dark" ? (
                  <LuMoon className="w-4 h-4 mr-2 shrink-0" />
                ) : (
                  <LuSun className="w-4 h-4 mr-2 shrink-0" />
                )}
                <span className="text-sm font-medium truncate">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </Button>
              <Button
                className="w-full transition-all duration-200 rounded-2xl justify-start h-10 hover:bg-danger-100 hover:text-danger text-foreground"
                variant="ghost"
                onPress={handleLogout}
              >
                <LuLogOut className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm font-medium truncate">Logout</span>
              </Button>
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      )}
    </div>
  );
}
