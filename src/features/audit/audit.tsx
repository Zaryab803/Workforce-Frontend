"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { Activity } from "@/types";
import { useFilters } from "@/hooks/use-filters";
import { useLookups } from "@/hooks/use-data";
import { auditApi } from "@/lib/api/audit.api";
import {
  AnimatedPage,
  PageHeader,
  SearchInput,
  Filter,
  Avatar,
  Badge,
  Pagination,
  Loading,
  ErrorState,
} from "@/components/common";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { label } from "@/lib/utils";
export function Audit() {
  const f = useFilters();
  const query = new URLSearchParams(f.query);
  if (!query.has("sortOrder")) query.set("sortOrder", "desc");
  const q = useQuery({
    queryKey: ["audit", query.toString()],
    queryFn: () => auditApi.list(query.toString()),
    placeholderData: keepPreviousData,
  });
  const { data } = useLookups();
  const columns: ColumnDef<Activity>[] = [
    {
      id: "actor",
      header: "Who",
      cell: ({ row }) => {
        const u = data?.employees.find((u) => u.id === row.original.actorId);
        return (
          <div className="person-cell">
            <Avatar name={u?.name || "Teammate"} size="sm" />
            <span>{u?.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => <Badge value={row.original.action} />,
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => (
        <span>
          {row.original.entity}
          <small className="block muted">{row.original.entityId}</small>
        </span>
      ),
    },
    {
      id: "description",
      header: "What happened",
      cell: ({ row }) => (
        <p className="audit-description">{row.original.description}</p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "When",
      cell: ({ row }) => (
        <span className="muted text-xs whitespace-nowrap">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="A CLEAR RECORD OF THE WORK"
        title="Nothing lost in the shuffle"
        description="A read-only timeline of changes across your workspace."
      />
      <div className="panel no-padding">
        <div className="filters-row">
          <SearchInput
            value={f.params.get("search") || ""}
            onChange={(v) => f.set("search", v)}
            placeholder="Search activity..."
          />
          <Filter
            label="All people"
            value={f.params.get("actorId") || ""}
            onChange={(v) => f.set("actorId", v)}
            options={
              data?.employees.map((u) => ({ value: u.id, label: u.name })) || []
            }
          />
          <Filter
            label="All actions"
            value={f.params.get("action") || ""}
            onChange={(v) => f.set("action", v)}
            options={[
              "CREATED",
              "UPDATED",
              "STATUS_CHANGED",
              "COMMENTED",
              "TIME_LOGGED",
            ].map((v) => ({ value: v, label: label(v) }))}
          />
          <Filter
            label="All entities"
            value={f.params.get("entity") || ""}
            onChange={(v) => f.set("entity", v)}
            options={["Task", "Employee", "Team"].map((v) => ({
              value: v,
              label: v,
            }))}
          />
          <input
            className="input filter"
            aria-label="Filter activity by date"
            type="date"
            value={f.params.get("date") || ""}
            onChange={(e) => f.set("date", e.target.value)}
          />
          {f.query && (
            <Button variant="ghost" size="sm" onClick={f.clear}>
              Clear
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
            <>
              <DataTable data={q.data?.items || []} columns={columns} />
              <Pagination
                {...q.data}
                onChange={(p) => f.set("page", String(p))}
              />
            </>
          )
        )}
      </div>
    </AnimatedPage>
  );
}
