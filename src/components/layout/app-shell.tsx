"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Shapes,
  CheckSquare2,
  Columns3,
  ChartNoAxesCombined,
  History,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  X,
  Orbit,
  Plus,
  PanelLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUser, useAction } from "@/hooks/use-data";
import { useUI } from "@/store/use-ui";
import { authApi } from "@/lib/api/auth.api";
import { notificationsApi } from "@/lib/api/notification.api";
import { label, routeAllowed, cn } from "@/lib/utils";
import { Avatar, Loading, Empty, ErrorState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/features/tasks/task-form";
import { AppSidebar } from "@/components/app-sidebar";
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
const links = [
  { href: "/dashboard", title: "Overview", icon: LayoutDashboard },
  { href: "/employees", title: "People", icon: Users },
  { href: "/teams", title: "Teams", icon: Shapes },
  { href: "/tasks", title: "All tasks", icon: CheckSquare2 },
  { href: "/board", title: "Task board", icon: Columns3 },
  { href: "/reports", title: "Reports", icon: ChartNoAxesCombined },
  { href: "/audit-logs", title: "Activity log", icon: History },
];
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}
    </Button>
  );
}
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
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const { setTheme } = useTheme();
  const { data: user, isPending, error, refetch } = useUser();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const [newTask, setNewTask] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const notices = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
    enabled: !!user,
  });
  const logout = useAction(authApi.logout, "", () => {
    client.clear();
    router.replace("/login");
  });
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  }, [pathname, setSidebarOpen]);
  useEffect(() => {
    if (!sidebarOpen && !notifications) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setNotifications(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [sidebarOpen, notifications, setSidebarOpen]);
  if (isPending)
    return (
      <div className="p-8">
        <Loading />
      </div>
    );
  if (error) return <ErrorState error={error} retry={() => void refetch()} />;
  if (!user) return null;
  const noticeList = Array.isArray(notices.data)
    ? notices.data
    : Array.isArray((notices.data as any)?.items)
      ? (notices.data as any).items
      : [];
  const unread = noticeList.filter((n: any) => !n.read).length || 0;
  const title = pathname.split("/")[1];
  return (
    <div className={cn("workspace", !sidebarOpen && "sidebar-collapsed")}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AppSidebar
        user={user}
        unread={unread}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      />
      <div className="main-wrap">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer text-muted hover:text-text h-8 w-8"
            >
              <PanelLeft size={18} />
            </Button>
            <Separator orientation="vertical" className="h-4 w-px bg-border" />
            <span className="breadcrumb">
              Workspace <span>/</span>{" "}
              <strong>
                {title === "dashboard"
                  ? "Overview"
                  : label(title || "Overview")}
              </strong>
            </span>
          </div>
          <div className="topbar-actions">
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/tasks?search=" + encodeURIComponent(search));
              }}
            >
              <Search size={16} />
              <input
                aria-label="Search tasks globally"
                placeholder="Search anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
            <ThemeToggle />
            <div className="notification-anchor">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open notifications"
                aria-expanded={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={19} />
                {!!unread && <i className="notification-dot" />}
              </Button>
              <AnimatePresence>
                {notifications && (
                  <>
                    <button
                      className="popover-backdrop"
                      tabIndex={-1}
                      aria-label="Dismiss notifications"
                      onClick={() => setNotifications(false)}
                    />
                    <motion.div
                      className="notification-popover"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <strong>
                        Notifications{" "}
                        <span className="muted">({unread} unread)</span>
                      </strong>
                      {noticeList.slice(0, 3).map((n: any) => (
                        <Link
                          key={n.id}
                          href={"/tasks/" + n.taskId}
                          onClick={() => setNotifications(false)}
                        >
                          <span
                            className={cn("tiny-dot", !n.read && "violet")}
                          />
                          <span>
                            <b>{n.title}</b>
                            <small>{n.body}</small>
                          </span>
                        </Link>
                      ))}
                      {!noticeList.length && (
                        <p className="muted my-4">You’re all caught up.</p>
                      )}
                      <Link
                        href="/notifications"
                        onClick={() => setNotifications(false)}
                      >
                        View all notifications <ArrowUpRight size={14} />
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <span className="topbar-divider" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="avatar-trigger cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                  aria-label="Open user profile menu"
                >
                  <Avatar name={user.name} size="sm" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
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
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>My profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/notifications"
                    className="flex items-center w-full cursor-pointer"
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {routeAllowed(pathname, user.role) ? (
            children
          ) : (
            <Empty
              title="This space needs another role"
              description="Your account does not have access to this page."
              action={
                <Button asChild>
                  <Link href="/dashboard">Back to overview</Link>
                </Button>
              }
            />
          )}
          <footer className="page-footer">
            <span>
              Orbit Studio <span className="footer-dot">·</span> Work, in sync.
            </span>
            <span>
              <i className="online-dot" /> Demo workspace
            </span>
          </footer>
        </main>
      </div>
      {user.role !== "EMPLOYEE" && (
        <>
          <Button
            className="floating-create"
            size="icon"
            aria-label="Quick create task"
            onClick={() => setNewTask(true)}
          >
            <Plus size={24} />
          </Button>
          <TaskForm open={newTask} onOpenChange={setNewTask} />
        </>
      )}
    </div>
  );
}
