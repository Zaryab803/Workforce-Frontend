"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import {
  Plus,
  ArrowUpRight,
  Users,
  CheckSquare2,
  Shapes,
  Pencil,
  ArrowLeft,
  UserMinus,
} from "lucide-react";
import { teamsApi } from "@/lib/api/team.api";
import { useUser, useLookups, useAction } from "@/hooks/use-data";
import { teamSchema, type TeamInput } from "@/schemas";
import type { Team } from "@/types";
import {
  AnimatedPage,
  PageHeader,
  Avatar,
  PanelTitle,
  Badge,
  Field,
  Reveal,
  Loading,
  ErrorState,
  Empty,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
export function TeamForm({
  open,
  onOpenChange,
  team,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  team?: Team;
}) {
  const { data } = useLookups();
  const form = useForm<TeamInput>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
      managerId: "",
      color: "#8b5cf6",
    },
  });
  useEffect(() => {
    if (open)
      form.reset(
        team || { name: "", description: "", managerId: "", color: "#8b5cf6" },
      );
  }, [open, team, form]);
  const save = useAction(
    (v: TeamInput) => teamsApi.save(v, team?.id),
    team ? "Team updated" : "A new team, a new chapter",
    () => onOpenChange(false),
  );
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={team ? "Edit team" : "Bring good people together"}
      description="Give your team a home for the work ahead."
    >
      <form onSubmit={form.handleSubmit((v) => save.mutate(v))}>
        <div className="dialog-body space-y-4">
          <Field label="Team name" error={form.formState.errors.name?.message}>
            <input className="input" {...form.register("name")} />
          </Field>
          <Field
            label="Description"
            error={form.formState.errors.description?.message}
          >
            <textarea
              className="input"
              rows={3}
              {...form.register("description")}
            />
          </Field>
          <Field
            label="Team manager"
            error={form.formState.errors.managerId?.message}
          >
            <select className="input" {...form.register("managerId")}>
              <option value="">Choose a manager</option>
              {data?.employees
                .filter((u) => u.role !== "EMPLOYEE")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field
            label="Team color"
            error={form.formState.errors.color?.message}
          >
            <input
              className="input h-12"
              type="color"
              {...form.register("color")}
            />
          </Field>
        </div>
        <div className="dialog-footer">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending
              ? "Saving..."
              : team
                ? "Save changes"
                : "Create team"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
export function Teams() {
  const q = useQuery({ queryKey: ["teams"], queryFn: teamsApi.list });
  const { data: user } = useUser();
  const { data: lookups } = useLookups();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Team>();

  const teamsList: any[] = Array.isArray(q.data)
    ? q.data
    : Array.isArray((q.data as any)?.items)
      ? (q.data as any).items
      : [];

  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="DIFFERENT TALENTS. SHARED AMBITION."
        title="Better together"
        description="Meet the teams turning good ideas into great work."
        actions={
          user?.role === "ADMIN" && (
            <Button
              onClick={() => {
                setEdit(undefined);
                setOpen(true);
              }}
            >
              <Plus size={16} />
              Create team
            </Button>
          )
        }
      />
      {q.isPending ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => void q.refetch()} />
      ) : (
        <div className="team-grid">
          {teamsList.map((team: any, i: number) => {
            const manager = lookups?.employees.find(
              (u) => u.id === team.managerId,
            );
            const members =
              lookups?.employees.filter((u) => u.teamId === team.id) || [];
            return (
              <Reveal key={team.id} delay={i * 0.08}>
                <motion.div className="team-card" whileHover={{ y: -5 }}>
                  <div className="team-card-top">
                    <span
                      className="team-symbol"
                      style={{
                        background: team.color + "1a",
                        color: team.color,
                      }}
                    >
                      <Shapes size={25} />
                    </span>
                    {user?.role === "ADMIN" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={"Edit " + team.name}
                        onClick={() => {
                          setEdit(team);
                          setOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </Button>
                    )}
                  </div>
                  <Link href={"/teams/" + team.id}>
                    <h2>{team.name}</h2>
                  </Link>
                  <p className="muted team-description">{team.description}</p>
                  <div className="team-stats">
                    <span>
                      <Users size={15} />
                      {team.members} people
                    </span>
                    <span>
                      <CheckSquare2 size={15} />
                      {team.activeTasks} open tasks
                    </span>
                  </div>
                  <div className="team-manager">
                    <Avatar name={manager?.name || "Manager"} size="sm" />
                    <span>
                      <small>Led by</small>
                      <strong>{manager?.name}</strong>
                    </span>
                  </div>
                  <div className="team-card-footer">
                    <div className="avatar-stack">
                      {members.slice(0, 4).map((u) => (
                        <Avatar key={u.id} name={u.name} size="sm" />
                      ))}
                    </div>
                    <Link href={"/teams/" + team.id} className="text-link">
                      Meet the team <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
          {user?.role === "ADMIN" && (
            <button
              className="create-team-card"
              onClick={() => {
                setEdit(undefined);
                setOpen(true);
              }}
            >
              <span>
                <Plus size={26} />
              </span>
              <strong>Room for one more</strong>
              <p>Bring a new team into your orbit.</p>
            </button>
          )}
        </div>
      )}
      <TeamForm open={open} onOpenChange={setOpen} team={edit} />
    </AnimatedPage>
  );
}
export function TeamDetail({ id }: { id: string }) {
  const q = useQuery({
    queryKey: ["team", id],
    queryFn: () => teamsApi.detail(id),
  });
  const { data: user } = useUser();
  const { data: lookups } = useLookups();
  const [edit, setEdit] = useState(false);
  const [add, setAdd] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [removeId, setRemoveId] = useState("");
  const update = useAction(
    ({ userId, remove }: { userId: string; remove: boolean }) =>
      teamsApi.member(id, userId, remove),
    "Team membership updated",
    () => {
      setAdd(false);
      setRemoveId("");
      setMemberId("");
    },
  );
  if (q.isPending) return <Loading />;
  if (q.error)
    return <ErrorState error={q.error} retry={() => void q.refetch()} />;
  if (!q.data) return null;
  const team = q.data.team;
  const members = q.data.members || [];
  const tasks = q.data.tasks || [];
  if (!team) return null;
  return (
    <AnimatedPage>
      <Link href="/teams" className="back-link">
        <ArrowLeft size={15} />
        Back to teams
      </Link>
      <PageHeader
        eyebrow="YOUR PEOPLE, IN SYNC"
        title={team.name}
        description={team.description}
        actions={
          user?.role === "ADMIN" && (
            <>
              <Button variant="outline" onClick={() => setEdit(true)}>
                <Pencil size={15} />
                Edit team
              </Button>
              <Button onClick={() => setAdd(true)}>
                <Plus size={16} />
                Add member
              </Button>
            </>
          )
        }
      />
      <div className="detail-layout">
        <div className="panel">
          <PanelTitle title={`Team members (${members.length})`} />
          {members.map((u) => (
            <div className="member-row" key={u.id}>
              <Link className="person-cell" href={"/employees/" + u.id}>
                <Avatar name={u.name} />
                <span>
                  <strong>{u.name}</strong>
                  <small>{u.position}</small>
                </span>
              </Link>
              <Badge value={u.role} />
              {user?.role === "ADMIN" && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={"Remove " + u.name}
                  onClick={() => setRemoveId(u.id)}
                >
                  <UserMinus size={16} />
                </Button>
              )}
            </div>
          ))}
          {!members.length && (
            <Empty
              title="The start of something good"
              description="Add teammates to get started."
            />
          )}
        </div>
        <div className="panel">
          <PanelTitle
            title="Team workload"
            description={`${tasks.length} tasks in motion`}
          />
          {tasks.slice(0, 8).map((t) => (
            <Link className="detail-task" href={"/tasks/" + t.id} key={t.id}>
              <span>
                <small>{t.id}</small>
                <strong>{t.title}</strong>
              </span>
              <Badge value={t.status} />
            </Link>
          ))}
          <Link href={"/tasks?teamId=" + id} className="text-link mt-5">
            View all team tasks <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <TeamForm open={edit} onOpenChange={setEdit} team={team} />
      <Dialog
        open={add}
        onOpenChange={setAdd}
        title="Add a teammate"
        description="Moving a person here updates their team and reporting manager. Existing tasks retain their original team."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({ userId: memberId, remove: false });
          }}
        >
          <div className="dialog-body">
            <Field label="Employee">
              <select
                className="input"
                required
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              >
                <option value="">Choose a person</option>
                {lookups?.employees
                  .filter((u) => u.teamId !== id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          <div className="dialog-footer">
            <Button
              variant="outline"
              type="button"
              onClick={() => setAdd(false)}
            >
              Cancel
            </Button>
            <Button disabled={!memberId || update.isPending}>Add member</Button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={!!removeId}
        onOpenChange={(v) => !v && setRemoveId("")}
        title="Remove this teammate?"
        description="They will become unassigned. Their account and existing tasks will stay available."
      >
        <div className="dialog-footer">
          <Button variant="outline" onClick={() => setRemoveId("")}>
            Keep member
          </Button>
          <Button
            variant="danger"
            disabled={update.isPending}
            onClick={() => update.mutate({ userId: removeId, remove: true })}
          >
            Remove member
          </Button>
        </div>
      </Dialog>
    </AnimatedPage>
  );
}
