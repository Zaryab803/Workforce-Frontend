"use client";
import { useState } from "react";
import { PushSettings } from "./push-settings";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { CheckCheck, Bell, ArrowUpRight, Check } from "lucide-react";
import { notificationsApi } from "@/lib/api/notification.api";
import { useAction } from "@/hooks/use-data";
import {
  AnimatedPage,
  PageHeader,
  Empty,
  Loading,
  ErrorState,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { date, cn } from "@/lib/utils";
export function Notifications() {
  const [tab, setTab] = useState("all");
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
  });
  const read = useAction(
    (id: string) => notificationsApi.read(id),
    "Marked as read",
  );
  const noticeList = Array.isArray(q.data)
    ? q.data
    : Array.isArray((q.data as any)?.items)
      ? (q.data as any).items
      : [];
  const unread = noticeList.filter((n: any) => !n.read).length || 0;
  const items: any[] =
    noticeList.filter((n: any) => tab === "all" || !n.read) || [];
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="STAY IN THE LOOP"
        title="Your little updates"
        description="The moments, milestones, and messages worth a look."
        actions={
          <Button
            variant="outline"
            disabled={!unread || read.isPending}
            onClick={() => read.mutate("all")}
          >
            <CheckCheck size={16} />
            Mark all as read
          </Button>
        }
      />
      <PushSettings />
      <div className="panel no-padding">
        <div className="tabs">
          {["all", "unread"].map((t) => (
            <button
              key={t}
              className={cn(tab === t && "selected")}
              onClick={() => setTab(t)}
            >
              {t === "all" ? "All updates" : `Unread (${unread})`}
              {tab === t && <motion.span layoutId="notification-tab" />}
            </button>
          ))}
        </div>
        {q.isPending ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : q.error ? (
          <ErrorState error={q.error} retry={() => void q.refetch()} />
        ) : (
          <AnimatePresence initial={false}>
            {items.map((n) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                key={n.id}
                className={cn("notification-row", !n.read && "unread")}
              >
                <span className="notification-icon">
                  <Bell size={19} />
                </span>
                <div className="notification-copy">
                  <strong>
                    {n.title}
                    {!n.read && <span className="tiny-dot violet" />}
                  </strong>
                  <p>{n.body}</p>
                  <small>{date(n.createdAt)}</small>
                </div>
                <div className="flex items-center gap-1">
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={"Mark notification as read: " + n.title}
                      disabled={read.isPending}
                      onClick={() => read.mutate(n.id)}
                    >
                      <Check size={17} />
                    </Button>
                  )}
                  {n.taskId && (
                    <Link
                      className="button button-ghost button-icon"
                      aria-label="View notification task"
                      href={"/tasks/" + n.taskId}
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!q.isPending && !q.error && !items.length && (
          <Empty
            title="You’re all caught up"
            description="A clear inbox. A little more room to focus."
          />
        )}
      </div>
    </AnimatedPage>
  );
}
