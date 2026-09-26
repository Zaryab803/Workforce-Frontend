"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Columns3,
  ListFilter,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import { taskApi } from "@/lib/api/task.api";
import { useFilters } from "@/hooks/use-filters";
import { useLookups, useUser } from "@/hooks/use-data";
import { type Task, statuses, priorities } from "@/types";
import {
  AnimatedPage,
  PageHeader,
  SearchInput,
  Filter,
  Badge,
  Avatar,
  Pagination,
  Loading,
  ErrorState,
} from "@/components/common";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { label, date, overdue, cn } from "@/lib/utils";
import { TaskForm } from "./task-form";
export function TaskFilters() {
  const f = useFilters();
  const { data } = useLookups();
  return (
    <div className="filters-row">
      <SearchInput
        value={f.params.get("search") || ""}
        onChange={(v) => f.set("search", v)}
        placeholder="Search tasks..."
      />
      <Filter
        label="All statuses"
        value={f.params.get("status") || ""}
        onChange={(v) => f.set("status", v)}
        options={statuses.map((v) => ({ value: v, label: label(v) }))}
      />
      <Filter
        label="All priorities"
        value={f.params.get("priority") || ""}
        onChange={(v) => f.set("priority", v)}
        options={priorities.map((v) => ({ value: v, label: label(v) }))}
      />
      <Filter
        label="Assignee"
        value={f.params.get("assigneeId") || ""}
        onChange={(v) => f.set("assigneeId", v)}
        options={
          data?.employees.map((u) => ({ value: u.id, label: u.name })) || []
        }
      />
      <details className="extra-filters">
        <summary className="button button-outline button-sm">
          <ListFilter size={15} />
          More filters
        </summary>
        <div className="extra-filter-popover">
          <Filter
            label="All teams"
            value={f.params.get("teamId") || ""}
            onChange={(v) => f.set("teamId", v)}
            options={
              data?.teams.map((t) => ({ value: t.id, label: t.name })) || []
            }
          />
          <Filter
            label="All projects"
            value={f.params.get("project") || ""}
            onChange={(v) => f.set("project", v)}
            options={data?.projects.map((v) => ({ value: v, label: v })) || []}
          />
          <label className="field">
            Due date
            <input
              className="input"
              type="date"
              value={f.params.get("dueDate") || ""}
              onChange={(e) => f.set("dueDate", e.target.value)}
            />
          </label>
        </div>
      </details>
      {f.query && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Reset filters"
          onClick={f.clear}
        >
          <RotateCcw size={16} />
        </Button>
      )}
    </div>
  );
}
export function TaskList() {
  const [create, setCreate] = useState(false);
  const f = useFilters();
  const { data: user } = useUser();
  const { data: lookups } = useLookups();
  const q = useQuery({
    queryKey: ["tasks", f.query],
    queryFn: () => taskApi.list(f.query),
    placeholderData: keepPreviousData,
  });
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row: { original: t } }) => (
        <Link className="table-task" href={"/tasks/" + t.id}>
          <small>{t.id}</small>
          <strong>{t.title}</strong>
          <span>{t.project}</span>
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge value={row.original.status} />,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => <Badge value={row.original.priority} />,
    },
    {
      id: "assignee",
      header: "Assignee",
      cell: ({ row }) => {
        const u = lookups?.employees.find(
          (u) => u.id === row.original.assigneeId,
        );
        return (
          <div className="person-cell">
            <Avatar name={u?.name || "Teammate"} size="sm" />
            <span>{u?.name?.split(" ")[0]}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due date",
      cell: ({ row }) => (
        <span className={cn("text-sm", overdue(row.original) && "overdue")}>
          {date(row.original.dueDate)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={"/tasks/" + row.original.id}
          className="button button-ghost button-icon"
          aria-label={"Open " + row.original.title}
        >
          <ArrowUpRight size={16} />
        </Link>
      ),
    },
  ];
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="MAKE SPACE FOR PROGRESS"
        title={user?.role === "EMPLOYEE" ? "My tasks" : "All tasks"}
        description="The small steps that move your team’s big ideas forward."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/board">
                <Columns3 size={16} />
                Board view
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
      <div className="panel no-padding">
        <TaskFilters />
        {q.isPending ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : q.error ? (
          <ErrorState error={q.error} retry={() => void q.refetch()} />
        ) : (
          q.data && (
            <div
              aria-busy={q.isFetching}
              className={q.isPlaceholderData ? "opacity-60" : ""}
            >
              <DataTable
                data={q.data?.items || []}
                columns={columns}
                sortBy={f.params.get("sortBy") || "dueDate"}
                sortOrder={f.params.get("sortOrder") || "asc"}
                onSort={(key) => {
                  const next = new URLSearchParams(f.query);
                  next.set("sortBy", key);
                  next.set(
                    "sortOrder",
                    f.params.get("sortBy") === key &&
                      f.params.get("sortOrder") !== "desc"
                      ? "desc"
                      : "asc",
                  );
                  next.delete("page");
                  window.history.replaceState(null, "", "?" + next.toString());
                }}
              />
              <Pagination
                {...q.data}
                onChange={(p) => f.set("page", String(p))}
              />
            </div>
          )
        )}
      </div>
      <TaskForm open={create} onOpenChange={setCreate} />
    </AnimatedPage>
  );
}
