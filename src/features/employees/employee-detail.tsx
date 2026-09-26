"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Pencil, Mail, Phone, Calendar, Shapes } from "lucide-react";
import { employeeApi } from "@/lib/api/employee.api";
import { useUser, useLookups } from "@/hooks/use-data";
import {
  AnimatedPage,
  PageHeader,
  Avatar,
  Badge,
  PanelTitle,
  Loading,
  ErrorState,
  Empty,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { date, label } from "@/lib/utils";
import { EmployeeForm } from "./employee-form";
export function EmployeeDetail({ id }: { id: string }) {
  const q = useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeeApi.detail(id),
  });
  const { data: user } = useUser();
  const { data: lookups } = useLookups();
  const [edit, setEdit] = useState(false);
  if (q.isPending) return <Loading />;
  if (q.error)
    return <ErrorState error={q.error} retry={() => void q.refetch()} />;
  if (!q.data) return null;
  const u = q.data.employee;
  const tasks = q.data.tasks || [];
  const activity = q.data.activity || [];
  if (!u) return null;
  return (
    <AnimatedPage>
      <Link href="/employees" className="back-link">
        <ArrowLeft size={16} />
        Back to people
      </Link>
      <PageHeader
        eyebrow="THE PEOPLE BEHIND THE PROGRESS"
        title={u.name}
        description={`${u.position} · ${label(u.role)}`}
        actions={
          user?.role === "ADMIN" && (
            <Button onClick={() => setEdit(true)}>
              <Pencil size={16} />
              Edit employee
            </Button>
          )
        }
      />
      <div className="detail-layout">
        <div className="space-y-6">
          <div className="panel">
            <PanelTitle title="Assigned tasks" />
            {tasks.length ? (
              tasks.map((t) => (
                <Link
                  href={"/tasks/" + t.id}
                  key={t.id}
                  className="detail-task"
                >
                  <span>
                    <small>{t.id}</small>
                    <strong>{t.title}</strong>
                  </span>
                  <Badge value={t.status} />
                </Link>
              ))
            ) : (
              <Empty
                title="Room for something new"
                description="No tasks are assigned to this person yet."
              />
            )}
          </div>
          <div className="panel">
            <PanelTitle title="Recent activity" />
            {activity.map((a) => (
              <div className="simple-activity" key={a.id}>
                <span>{a.description}</span>
                <small>{date(a.createdAt)}</small>
              </div>
            ))}
            {!activity.length && <p className="muted">No activity yet.</p>}
          </div>
        </div>
        <div className="panel profile-card">
          <Avatar name={u.name} src={u.avatar} size="lg" />
          <h2>{u.name}</h2>
          <p className="muted">{u.position}</p>
          <Badge value={u.active ? "ACTIVE" : "INACTIVE"} />
          <dl className="details-list">
            <div>
              <dt>Employee ID</dt>
              <dd>{u.id}</dd>
            </div>
            <div>
              <dt>
                <Mail size={14} />
                Email
              </dt>
              <dd>{u.email}</dd>
            </div>
            <div>
              <dt>
                <Phone size={14} />
                Phone
              </dt>
              <dd>{u.phone || "—"}</dd>
            </div>
            <div>
              <dt>
                <Shapes size={14} />
                Team
              </dt>
              <dd>
                {lookups?.teams.find((t) => t.id === u.teamId)?.name ||
                  "Unassigned"}
              </dd>
            </div>
            <div>
              <dt>Manager</dt>
              <dd>
                {lookups?.employees.find((m) => m.id === u.managerId)?.name ||
                  "—"}
              </dd>
            </div>
            <div>
              <dt>
                <Calendar size={14} />
                Joined
              </dt>
              <dd>
                {date(u.joined)}, {u.joined.slice(0, 4)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <EmployeeForm open={edit} onOpenChange={setEdit} employee={u} />
    </AnimatedPage>
  );
}
