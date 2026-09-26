"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Users,
  CheckCheck,
  Clock3,
  CalendarDays,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Layers3,
  Download,
} from "lucide-react";
import { useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { useUser } from "@/hooks/use-data";
import {
  AnimatedPage,
  PageHeader,
  Reveal,
  PanelTitle,
  Badge,
  Avatar,
  Loading,
  ErrorState,
  Empty,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/features/tasks/task-form";
import { date, label } from "@/lib/utils";
const TrendChart = dynamic(() => import("./charts").then((m) => m.TrendChart), {
  ssr: false,
  loading: () => <div className="chart skeleton" />,
});
const PriorityChart = dynamic(
  () => import("./charts").then((m) => m.PriorityChart),
  { ssr: false, loading: () => <div className="chart skeleton" /> },
);
export function DashboardPage({ reports = false }: { reports?: boolean }) {
  const { data: user } = useUser();
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });
  const [create, setCreate] = useState(false);
  if (isPending) return <Loading />;
  if (error) return <ErrorState error={error} retry={() => void refetch()} />;
  if (!data || !user) return null;
  const statusList = Array.isArray(data.status) ? data.status : [];
  const recentList = Array.isArray(data.recent) ? data.recent : [];
  const activityList = Array.isArray(data.activity) ? data.activity : [];
  const workloadList = Array.isArray(data.workload) ? data.workload : [];
  const trendList = Array.isArray(data.trend) ? data.trend : [];
  const priorityList = Array.isArray(data.priority) ? data.priority : [];
  const percent = data.tasks
    ? Math.round((data.completed / data.tasks) * 100)
    : 0;
  const metrics =
    user.role === "ADMIN"
      ? [
          {
            title: "Total people",
            value: data.employees,
            detail: `${data.active} active in your workspace`,
            icon: Users,
            tone: "purple",
          },
          {
            title: "Active teams",
            value: data.teams,
            detail: "Making things happen, together",
            icon: Layers3,
            tone: "blue",
          },
          {
            title: "Tasks completed",
            value: data.completed,
            detail: `${percent}% of all workspace tasks`,
            icon: CheckCheck,
            tone: "green",
          },
          {
            title: "Overdue tasks",
            value: data.overdue,
            detail: "A little attention goes a long way",
            icon: Clock3,
            tone: "orange",
          },
        ]
      : [
          {
            title: user.role === "MANAGER" ? "Team members" : "My tasks",
            value: user.role === "MANAGER" ? data.employees : data.tasks,
            detail: "Your corner of the workspace",
            icon: Users,
            tone: "purple",
          },
          {
            title: "Completed tasks",
            value: data.completed,
            detail: `${percent}% completion rate`,
            icon: CheckCheck,
            tone: "green",
          },
          {
            title: "Due today",
            value: data.dueToday,
            detail: "Let’s make a little progress",
            icon: CalendarDays,
            tone: "blue",
          },
          {
            title: "Overdue tasks",
            value: data.overdue,
            detail: "Keep these on your radar",
            icon: Clock3,
            tone: "orange",
          },
        ];
  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["People", data.employees],
      ["Active people", data.active],
      ["Teams", data.teams],
      ["Tasks", data.tasks],
      ["Completed", data.completed],
      ["Overdue", data.overdue],
      ["Actual hours", data.hours],
      ...statusList.map((s) => [label(s.name), s.value]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orbit-workspace-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow={
          reports
            ? "INSIGHTS & PROGRESS"
            : new Date()
                .toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
                .toUpperCase()
        }
        title={
          reports
            ? "The bigger picture"
            : `Good to see you, ${user.name.split(" ")[0]}`
        }
        description={
          reports
            ? "A clearer view of your people, priorities, and progress."
            : "Here’s what’s happening across your workspace today."
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/board">
                <CalendarDays size={16} />
                Task board
              </Link>
            </Button>
            {reports ? (
              <Button onClick={exportReport}>
                <Download size={16} />
                Export report
              </Button>
            ) : (
              user.role !== "EMPLOYEE" && (
                <Button onClick={() => setCreate(true)}>
                  <Plus size={17} />
                  Create task
                </Button>
              )
            )}
          </>
        }
      />
      {!reports && (
        <Reveal>
          <div className="welcome-banner">
            <div>
              <div className="banner-tag">
                <span className="tiny-dot" /> YOUR TEAM’S NEXT CHAPTER
              </div>
              <h2>Make room for your best work.</h2>
              <p>A clear plan, a connected team, and a little momentum.</p>
              <Link href="/board">
                Let’s make progress <ArrowRight size={15} />
              </Link>
            </div>
            <div className="banner-art" aria-hidden>
              <div className="banner-orbit orbit-a" />
              <div className="banner-orbit orbit-b" />
              <motion.span
                className="banner-star"
                initial={{ rotate: -30, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 1 }}
              >
                ✳
              </motion.span>
              <span className="banner-spark">✦</span>
              <span className="banner-dot" />
            </div>
          </div>
        </Reveal>
      )}
      <div className="metric-grid">
        {metrics.map((m, i) => (
          <Reveal key={m.title} delay={0.06 * i}>
            <motion.div whileHover={{ y: -4 }} className="metric-card">
              <div className="flex justify-between items-center">
                <span className="muted text-sm">{m.title}</span>
                <span className={"metric-icon " + m.tone}>
                  <m.icon size={18} />
                </span>
              </div>
              <div className="metric-value">
                {m.value}
                <span className="metric-mini-bars" aria-hidden>
                  {[9, 15, 12, 22, 18, 30, 26, 36].map((h, i) => (
                    <motion.i
                      key={i}
                      style={{ height: h }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.2 + i * 0.07 }}
                    />
                  ))}
                </span>
              </div>
              <p className="metric-detail">{m.detail}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
      <div className="dashboard-grid">
        <Reveal className="panel" delay={0.15}>
          <PanelTitle
            title="A little more progress"
            description="Completed tasks over the last 7 days"
            action={
              <span className="chart-legend">
                <i />
                Completed
              </span>
            }
          />
          <TrendChart data={trendList} />
        </Reveal>
        <Reveal className="panel" delay={0.2}>
          <PanelTitle
            title="Where things stand"
            description={`${data.tasks} tasks, one shared direction`}
          />
          <div className="status-overview">
            <div
              className="completion-ring"
              style={{
                background: `conic-gradient(var(--primary) ${percent}%, var(--subtle) 0)`,
              }}
            >
              <div>
                <strong>{percent}%</strong>
                <span>completed</span>
              </div>
            </div>
            <div className="status-legend">
              {statusList
                .filter((s) => s.name !== "CANCELLED")
                .map((s) => (
                  <div key={s.name}>
                    <span
                      className={"status-dot dot-" + s.name.toLowerCase()}
                    />
                    <span>{label(s.name)}</span>
                    <b>{s.value}</b>
                  </div>
                ))}
            </div>
          </div>
        </Reveal>
      </div>
      {reports && (
        <div className="dashboard-grid">
          <div className="panel">
            <PanelTitle title="Priorities at a glance" />
            <PriorityChart data={priorityList} />
          </div>
          <div className="panel">
            <PanelTitle title="Workspace summary" />
            <div className="summary-stats">
              <span>
                Logged work hours<strong>{data.hours}h</strong>
              </span>
              <span>
                Active people<strong>{data.active}</strong>
              </span>
              <span>
                Tasks due today<strong>{data.dueToday}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="dashboard-grid">
        <Reveal className="panel no-padding" delay={0.25}>
          <div className="px-6 pt-6">
            <PanelTitle
              title="On your radar"
              description="The next tasks that could use your attention"
              action={
                <Link className="text-link" href="/tasks">
                  View all <ArrowUpRight size={15} />
                </Link>
              }
            />
          </div>
          <div className="radar-list">
            {recentList.map((t, i) => (
              <Link href={"/tasks/" + t.id} key={t.id} className="radar-task">
                <span className="task-check" />
                <span className="radar-title">
                  <strong>{t.title}</strong>
                  <small>
                    {t.project} <span>·</span> {t.id}
                  </small>
                </span>
                <Badge value={t.priority} />
                <span className="muted text-xs whitespace-nowrap">
                  {date(t.dueDate)}
                </span>
              </Link>
            ))}
            {!recentList.length && (
              <Empty
                title="All clear"
                description="There are no open tasks right now."
              />
            )}
          </div>
        </Reveal>
        <Reveal className="panel" delay={0.3}>
          <PanelTitle
            title="Around the workspace"
            description="Small steps. Shared momentum."
          />
          <div className="activity-list">
            {activityList.slice(0, 4).map((a, i) => (
              <motion.div
                className="activity-item"
                key={a.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="activity-icon">
                  <CheckCheck size={14} />
                </span>
                <div>
                  <p>{a.description}</p>
                  <small>
                    {date(a.createdAt)} ·{" "}
                    {new Date(a.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
      {user.role !== "EMPLOYEE" && (
        <Reveal className="panel">
          <PanelTitle
            title="A balanced workload"
            description="Open tasks and estimated hours across your team"
          />
          <div className="workload-grid">
            {workloadList.map((w) => (
              <div key={w.name} className="workload-item">
                <Avatar name={w.name} size="sm" />
                <div>
                  <strong>{w.name}</strong>
                  <small>
                    {w.tasks} open tasks · {w.hours}h estimated
                  </small>
                  <div className="progress-track">
                    <motion.span
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${Math.min(100, (w.tasks / Math.max(1, ...workloadList.map((x) => x.tasks))) * 100)}%`,
                      }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
      <TaskForm open={create} onOpenChange={setCreate} />
    </AnimatedPage>
  );
}
