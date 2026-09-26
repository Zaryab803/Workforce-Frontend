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
} from "lucide-react";
import { useUser, useAction } from "@/hooks/use-data";
import { useUI } from "@/store/use-ui";
import { authApi } from "@/lib/api/auth.api";
import { notificationsApi } from "@/lib/api/notification.api";
import { label, routeAllowed, cn } from "@/lib/utils";
import { Avatar, Loading, Empty, ErrorState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/features/tasks/task-form";
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
  useEffect(() => setSidebarOpen(false), [pathname, setSidebarOpen]);
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
    <div className="workspace">
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
      <aside className={cn("sidebar", sidebarOpen && "sidebar-open")}>
        <div className="sidebar-brand">
          <Logo />
          <button
            className="mobile-only button button-ghost button-icon"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-letter">O</span>
          <div>
            <strong>Orbit Studio</strong>
            <small>Team workspace</small>
          </div>
          <span className="workspace-plan">DEMO</span>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {links
            .filter((l) => routeAllowed(l.href, user.role))
            .map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn("nav-item", active && "active")}
                  aria-current={active ? "page" : undefined}
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
        >
          <Bell size={19} />
          <span>Notifications</span>
          {!!unread && <span className="nav-count">{unread}</span>}
        </Link>
        <Link
          className={cn("nav-item", pathname === "/profile" && "active")}
          href="/profile"
        >
          <Users size={19} />
          <span>My profile</span>
        </Link>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-stars">✦</span>
            <strong>A little focus. A lot of progress.</strong>
            <p>Great work starts with a clear view of what’s next.</p>
            <Link href="/board">
              Find your focus <ArrowUpRight size={16} />
            </Link>
          </div>
          <Link href="/profile" className="sidebar-user">
            <Avatar name={user.name} />
            <span>
              <strong>{user.name}</strong>
              <small>{label(user.role)}</small>
            </span>
            <ChevronDown size={15} />
          </Link>
          <button
            className="sign-out"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <Button
              className="mobile-only"
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
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
            <Link href="/profile" aria-label="Open your profile">
              <Avatar name={user.name} size="sm" />
            </Link>
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
