"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Shapes,
  CheckSquare2,
  Columns3,
  ChartNoAxesCombined,
  History,
  Bell,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  X,
  Orbit,
  Sun,
  Moon,
  Building2,
  Sparkles,
  PanelLeft,
} from "lucide-react";
import { label, routeAllowed, cn } from "@/lib/utils";
import { Avatar } from "@/components/common";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export const navLinks = [
  { href: "/dashboard", title: "Overview", icon: LayoutDashboard },
  { href: "/employees", title: "People", icon: Users },
  { href: "/teams", title: "Teams", icon: Shapes },
  { href: "/tasks", title: "All tasks", icon: CheckSquare2 },
  { href: "/board", title: "Task board", icon: Columns3 },
  { href: "/reports", title: "Reports", icon: ChartNoAxesCombined },
  { href: "/audit-logs", title: "Activity log", icon: History },
];

export function Logo() {
  return (
    <Link href="/dashboard" className="logo">
      <span className="logo-mark">
        <Orbit size={23} strokeWidth={1.7} />
      </span>
      orbit<span className="logo-period">.</span>
    </Link>
  );
}

export interface AppSidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  unread?: number;
  open?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export function AppSidebar({
  user,
  unread = 0,
  open = false,
  onClose,
  onLogout,
  isLoggingOut = false,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      onClose?.();
    }
  };

  return (
    <aside className={cn("sidebar", open && "sidebar-open")}>
      <div className="sidebar-brand">
        <Logo />
      </div>

      {/* Workspace Switcher with Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="workspace-switch w-full text-left cursor-pointer border transition-colors hover:bg-subtle/50"
            aria-label="Switch workspace"
          >
            <span className="workspace-letter">O</span>
            <div className="flex-1 min-w-0">
              <strong className="block truncate">Orbit Studio</strong>
              <small className="block truncate">Team workspace</small>
            </div>
            <span className="workspace-plan">DEMO</span>
            <ChevronDown size={14} className="ml-1 text-muted shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Workspaces
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer">
            <Building2 className="mr-2 h-4 w-4 text-primary" />
            <span className="font-medium flex-1">Orbit Studio</span>
            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
              ACTIVE
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-muted-foreground">
            <Building2 className="mr-2 h-4 w-4" />
            <span>Product Ops</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>+ Add workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="sidebar-scroll-area">
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {navLinks
            .filter((l) => routeAllowed(l.href, user.role))
            .map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn("nav-item", active && "active")}
                  aria-current={active ? "page" : undefined}
                  onClick={handleNavClick}
                >
                  {active && (
                    <motion.span
                      className="nav-active-bg"
                      layoutId="nav-highlight"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <l.icon size={19} />
                  <span>
                    {l.href === "/tasks" && user.role === "EMPLOYEE"
                      ? "My tasks"
                      : l.title}
                  </span>
                  {l.href === "/board" && <span className="nav-new">NEW</span>}
                </Link>
              );
            })}
        </nav>

        <p className="nav-label mt-7">PERSONAL</p>
        <Link
          className={cn("nav-item", pathname === "/notifications" && "active")}
          href="/notifications"
          onClick={handleNavClick}
        >
          <Bell size={19} />
          <span>Notifications</span>
          {!!unread && <span className="nav-count">{unread}</span>}
        </Link>
        <Link
          className={cn("nav-item", pathname === "/profile" && "active")}
          href="/profile"
          onClick={handleNavClick}
        >
          <Users size={19} />
          <span>My profile</span>
        </Link>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="note-stars">✦</span>
          <strong>A little focus. A lot of progress.</strong>
          <p>Great work starts with a clear view of what’s next.</p>
          <Link href="/board" onClick={handleNavClick}>
            Find your focus <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* User Account with Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="sidebar-user w-full text-left cursor-pointer border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-colors"
              aria-label="User menu"
            >
              <Avatar name={user.name} />
              <span className="flex-1 min-w-0">
                <strong className="block truncate">{user.name}</strong>
                <small className="block truncate">{label(user.role)}</small>
              </span>
              <ChevronDown size={15} className="shrink-0 text-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
            <DropdownMenuLabel className="font-normal px-2 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {label(user.role)}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex items-center w-full cursor-pointer"
                onClick={handleNavClick}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>My profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/notifications"
                className="flex items-center w-full cursor-pointer"
                onClick={handleNavClick}
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                {!!unread && (
                  <span className="ml-auto text-xs font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setTheme("system")}
                >
                  <Orbit className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {onLogout && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={onLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {onLogout && (
          <button
            className="sign-out"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={15} />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
