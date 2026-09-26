"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, ArrowUpRight, RotateCcw } from "lucide-react";
import { employeeApi } from "@/lib/api/employee.api";
import { useFilters } from "@/hooks/use-filters";
import { useLookups, useUser } from "@/hooks/use-data";
import type { Employee } from "@/types";
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
import { label, date } from "@/lib/utils";
import { EmployeeForm } from "./employee-form";
export function Employees() {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Employee>();
  const f = useFilters();
  const { data: user } = useUser();
  const { data: lookups } = useLookups();
  const q = useQuery({
    queryKey: ["employees", f.query],
    queryFn: () => employeeApi.list(f.query),
    placeholderData: keepPreviousData,
  });
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Team member",
      cell: ({ row: { original: u } }) => (
        <Link href={"/employees/" + u.id} className="person-cell">
          <Avatar name={u.name} src={u.avatar} />
          <span>
            <strong>{u.name}</strong>
            <small>{u.email}</small>
          </span>
        </Link>
      ),
    },
    {
      id: "team",
      header: "Team",
      cell: ({ row }) => (
        <span className="text-sm">
          {lookups?.teams.find((t) => t.id === row.original.teamId)?.name ||
            "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="role-chip">{label(row.original.role)}</span>
      ),
    },
    {
      id: "manager",
      header: "Manager",
      cell: ({ row }) => (
        <span className="text-sm muted">
          {lookups?.employees.find((u) => u.id === row.original.managerId)
            ?.name || "—"}
        </span>
      ),
    },
    {
      id: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge value={row.original.active ? "ACTIVE" : "INACTIVE"} />
      ),
    },
    {
      accessorKey: "joined",
      header: "Joined",
      cell: ({ row }) => (
        <span className="muted text-sm">{date(row.original.joined)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        user?.role === "ADMIN" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={"Edit " + row.original.name}
            onClick={() => {
              setEdit(row.original);
              setOpen(true);
            }}
          >
            <Pencil size={15} />
          </Button>
        ) : (
          <Link
            href={"/employees/" + row.original.id}
            aria-label="View employee"
          >
            <ArrowUpRight size={16} />
          </Link>
        ),
    },
  ];
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="GREAT WORK STARTS WITH PEOPLE"
        title="Your people"
        description="A few different talents. One shared direction."
        actions={
          user?.role === "ADMIN" && (
            <Button
              onClick={() => {
                setEdit(undefined);
                setOpen(true);
              }}
            >
              <Plus size={17} />
              Add employee
            </Button>
          )
        }
      />
      <div className="people-banner">
        <div className="avatar-stack">
          {[
            "Sarah Chen",
            "Noah Williams",
            "Olivia Bennett",
            "James Wilson",
          ].map((n) => (
            <Avatar key={n} name={n} />
          ))}
        </div>
        <p>
          <strong>Better, together.</strong>
          <span> A connected team makes all the difference.</span>
        </p>
        <span className="people-banner-star">✦</span>
      </div>
      <div className="panel no-padding">
        <div className="filters-row">
          <SearchInput
            value={f.params.get("search") || ""}
            onChange={(v) => f.set("search", v)}
            placeholder="Search people..."
          />
          <Filter
            label="All roles"
            value={f.params.get("role") || ""}
            onChange={(v) => f.set("role", v)}
            options={["ADMIN", "MANAGER", "EMPLOYEE"].map((v) => ({
              value: v,
              label: label(v),
            }))}
          />
          <Filter
            label="All teams"
            value={f.params.get("teamId") || ""}
            onChange={(v) => f.set("teamId", v)}
            options={
              lookups?.teams.map((t) => ({ value: t.id, label: t.name })) || []
            }
          />
          <Filter
            label="All statuses"
            value={f.params.get("active") || ""}
            onChange={(v) => f.set("active", v)}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
          />
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
        {q.isPending ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : q.error ? (
          <ErrorState error={q.error} retry={() => void q.refetch()} />
        ) : (
          q.data && (
            <div aria-busy={q.isFetching}>
              <DataTable
                data={q.data?.items || []}
                columns={columns}
                sortBy={f.params.get("sortBy") || "name"}
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
      <EmployeeForm open={open} onOpenChange={setOpen} employee={edit} />
    </AnimatedPage>
  );
}
