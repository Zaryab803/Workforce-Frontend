"use client";
import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Plus, List, GripVertical, Clock3, ArrowUpRight } from "lucide-react";
import { taskApi } from "@/lib/api/task.api";
import { useLookups, useUser } from "@/hooks/use-data";
import { useFilters } from "@/hooks/use-filters";
import { type Task, type Status, type PageResult, statuses } from "@/types";
import {
  AnimatedPage,
  PageHeader,
  Badge,
  Avatar,
  Loading,
  ErrorState,
  Pagination,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { cn, label, date } from "@/lib/utils";
import { TaskFilters } from "./task-list";
import { TaskForm } from "./task-form";
function Card({ task, disabled = false }: { task: Task; disabled?: boolean }) {
  const { data } = useLookups();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled });
  const user = data?.employees.find((u) => u.id === task.assigneeId);
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
      className="kanban-card"
    >
      <div className="flex justify-between items-center">
        <span className="task-id">{task.id}</span>
        <button
          className="drag-handle"
          aria-label={"Drag " + task.title}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </div>
      <Link href={"/tasks/" + task.id} className="kanban-title">
        {task.title}
        <ArrowUpRight size={14} />
      </Link>
      <p className="kanban-project">{task.project}</p>
      <Badge value={task.priority} />
      <div className="kanban-card-footer">
        <Avatar name={user?.name || "Teammate"} size="sm" />
        <span>
          <Clock3 size={12} />
          {date(task.dueDate)}
        </span>
      </div>
    </div>
  );
}
function Column({
  status,
  tasks,
  pending,
}: {
  status: Status;
  tasks: Task[];
  pending: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn("kanban-column", isOver && "kanban-over")}
    >
      <div className="kanban-column-title">
        <span className={"status-dot dot-" + status.toLowerCase()} />
        <h2>{label(status)}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={rectSortingStrategy}
      >
        <div className="kanban-stack">
          {tasks.map((t) => (
            <Card key={t.id} task={t} disabled={pending} />
          ))}
          {!tasks.length && (
            <div className="kanban-empty">
              Drop a task here
              <br />
              <span>A little room for what’s next.</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
export function Board() {
  const [create, setCreate] = useState(false);
  const [active, setActive] = useState<Task | null>(null);
  const { data: user } = useUser();
  const f = useFilters();
  const query = new URLSearchParams(f.query);
  query.set("limit", "60");
  const key = ["tasks", "board", query.toString()];
  const q = useQuery({
    queryKey: key,
    queryFn: () => taskApi.list(query.toString()),
  });
  const client = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const change = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      taskApi.status(id, status),
    onMutate: async ({ id, status }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<PageResult<Task>>(key);
      client.setQueryData<PageResult<Task>>(key, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((t) => (t.id === id ? { ...t, status } : t)),
            }
          : old,
      );
      return { previous };
    },
    onError: (e, _v, ctx) => {
      client.setQueryData(key, ctx?.previous);
      toast.error(e.message);
    },
    onSuccess: () => toast.success("Task moved. Progress made."),
    onSettled: () => client.invalidateQueries(),
  });
  const onEnd = (event: DragEndEvent) => {
    setActive(null);
    if (!event.over || change.isPending) return;
    const task = q.data?.items.find((t) => t.id === event.active.id);
    const target = String(event.over.id);
    const status = statuses.includes(target as Status)
      ? (target as Status)
      : q.data?.items.find((t) => t.id === target)?.status;
    if (task && status && task.status !== status)
      change.mutate({ id: task.id, status });
  };
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="A SHARED VIEW OF WHAT’S NEXT"
        title="A little more flow"
        description="Big ideas, small steps. Move your work forward, one card at a time."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/tasks">
                <List size={16} />
                List view
              </Link>
            </Button>
            {user?.role !== "EMPLOYEE" && (
              <Button onClick={() => setCreate(true)}>
                <Plus size={17} />
                Create task
              </Button>
            )}
          </>
        }
      />
      <div className="board-toolbar">
        <TaskFilters />
      </div>
      <div className="board-help">
        <span>
          <i className="online-dot" /> Your team’s work, in motion
        </span>
        <span>Drag cards, or open a task to change its status.</span>
      </div>
      {q.isPending ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          <DndContext
            sensors={sensors}
            onDragStart={(e) =>
              setActive(q.data?.items.find((t) => t.id === e.active.id) || null)
            }
            onDragCancel={() => setActive(null)}
            onDragEnd={onEnd}
          >
            <motion.div
              className="kanban-board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {statuses
                .filter(
                  (s) =>
                    !f.params.get("status") || s === f.params.get("status"),
                )
                .map((status) => (
                  <Column
                    key={status}
                    status={status}
                    pending={change.isPending}
                    tasks={
                      q.data?.items.filter((t) => t.status === status) || []
                    }
                  />
                ))}
            </motion.div>
            <DragOverlay>
              {active && (
                <div className="kanban-card drag-overlay">
                  <strong>{active.title}</strong>
                  <div className="mt-3">
                    <Badge value={active.priority} />
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
          {q.data && (
            <Pagination
              {...q.data}
              onChange={(p) => f.set("page", String(p))}
            />
          )}
        </>
      )}
      <TaskForm open={create} onOpenChange={setCreate} />
    </AnimatedPage>
  );
}
