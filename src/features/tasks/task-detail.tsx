"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  Send,
  Clock3,
  MessageSquare,
  History,
} from "lucide-react";
import { taskApi } from "@/lib/api/task.api";
import { useAction, useUser } from "@/hooks/use-data";
import { statuses } from "@/types";
import { subscribeToTask, unsubscribeFromTask } from "@/lib/realtime";
import {
  AnimatedPage,
  PageHeader,
  Avatar,
  Badge,
  Loading,
  ErrorState,
  PanelTitle,
  Field,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { date, label } from "@/lib/utils";
import { TaskForm } from "./task-form";
export function TaskDetail({ id }: { id: string }) {
  useEffect(() => {
    if (id) {
      subscribeToTask(id);
      return () => {
        unsubscribeFromTask(id);
      };
    }
  }, [id]);

  const q = useQuery({
    queryKey: ["task", id],
    queryFn: () => taskApi.detail(id),
  });
  const { data: user } = useUser();
  const [edit, setEdit] = useState(false);
  const [comment, setComment] = useState("");
  const [hours, setHours] = useState("1");
  const status = useAction(
    (v: (typeof statuses)[number]) => taskApi.status(id, v),
    "Status updated",
  );
  const addComment = useAction(
    (v: string) => taskApi.comment(id, v),
    "Comment added",
    () => setComment(""),
  );
  const logTime = useAction(
    (v: number) => taskApi.hours(id, v),
    "Time logged",
  );
  if (q.isPending) return <Loading />;
  if (q.error)
    return <ErrorState error={q.error} retry={() => void q.refetch()} />;
  if (!q.data) return null;
  const task = q.data.task;
  const comments = q.data.comments || [];
  const activity = q.data.activity || [];
  const people = q.data.people || [];
  if (!task) return null;
  const assignee = people.find((u) => u.id === task.assigneeId);
  const creator = people.find((u) => u.id === task.creatorId);
  return (
    <AnimatedPage>
      <Link className="back-link" href="/tasks">
        <ArrowLeft size={16} />
        Back to tasks
      </Link>
      <PageHeader
        eyebrow={`${task.id} / ${task.project}`}
        title={task.title}
        description={`Created ${date(task.createdAt)} · Updated ${date(task.updatedAt)}`}
        actions={
          user?.role !== "EMPLOYEE" && (
            <Button variant="outline" onClick={() => setEdit(true)}>
              <Pencil size={15} />
              Edit task
            </Button>
          )
        }
      />
      <div className="detail-layout">
        <div className="space-y-6">
          <div className="panel">
            <PanelTitle title="The details" />
            <p className="task-description">
              {task.description || "No description added yet."}
            </p>
            <div className="task-tags">
              <Badge value={task.status} />
              <Badge value={task.priority} />
              <span className="project-chip">{task.project}</span>
            </div>
          </div>
          <div className="panel">
            <PanelTitle
              title={`Conversation (${comments.length})`}
              action={<MessageSquare size={19} className="muted" />}
            />
            <div className="comments">
              {comments.length ? (
                comments.map((c) => {
                  const author = people.find((u) => u.id === c.authorId);
                  return (
                    <div className="comment" key={c.id}>
                      <Avatar name={author?.name || "Teammate"} />
                      <div>
                        <strong>{author?.name || "Teammate"}</strong>
                        <time>{date(c.createdAt)}</time>
                        <p>{c.body}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="muted mb-6">
                  Start the conversation. A little context helps everyone.
                </p>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim()) addComment.mutate(comment);
              }}
              className="comment-form"
            >
              <Field label="Add a comment">
                <textarea
                  className="input"
                  rows={3}
                  maxLength={3000}
                  placeholder="Share an update, ask a question..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Field>
              <Button
                type="submit"
                disabled={!comment.trim() || addComment.isPending}
              >
                <Send size={15} />
                Post comment
              </Button>
            </form>
          </div>
          <div className="panel">
            <PanelTitle
              title="The story so far"
              action={<History size={19} className="muted" />}
            />
            <div className="activity-list">
              {activity.map((a) => (
                <div key={a.id} className="activity-item">
                  <span className="activity-icon">
                    <History size={13} />
                  </span>
                  <div>
                    <p>{a.description}</p>
                    <small>
                      {date(a.createdAt)} ·{" "}
                      {new Date(a.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="panel">
            <PanelTitle title="At a glance" />
            <Field label="Status">
              <select
                className="input"
                value={task.status}
                disabled={status.isPending}
                onChange={(e) =>
                  status.mutate(e.target.value as (typeof statuses)[number])
                }
              >
                {statuses.map((v) => (
                  <option key={v} value={v}>
                    {label(v)}
                  </option>
                ))}
              </select>
            </Field>
            <dl className="details-list">
              <div>
                <dt>Assignee</dt>
                <dd>
                  <Avatar name={assignee?.name || "Teammate"} size="sm" />
                  {assignee?.name}
                </dd>
              </div>
              <div>
                <dt>Created by</dt>
                <dd>{creator?.name || "Teammate"}</dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{date(task.dueDate)}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>
                  <Badge value={task.priority} />
                </dd>
              </div>
              <div>
                <dt>Estimated time</dt>
                <dd>{task.estimatedHours}h</dd>
              </div>
              <div>
                <dt>Logged time</dt>
                <dd>{task.actualHours}h</dd>
              </div>
            </dl>
          </div>
          <div className="panel">
            <PanelTitle
              title="Make time count"
              action={<Clock3 size={19} className="muted" />}
            />
            <p className="muted text-sm mb-4">
              Log the time you’ve spent moving this task forward.
            </p>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                logTime.mutate(Number(hours));
              }}
            >
              <Field label="Hours worked">
                <input
                  className="input"
                  type="number"
                  min="0.1"
                  max="24"
                  step="0.1"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </Field>
              <Button
                className="w-full"
                type="submit"
                variant="outline"
                disabled={logTime.isPending}
              >
                Log time
              </Button>
            </form>
          </div>
        </aside>
      </div>
      <TaskForm open={edit} onOpenChange={setEdit} task={task} />
    </AnimatedPage>
  );
}
