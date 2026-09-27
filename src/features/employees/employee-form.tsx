"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/common";
import { employeeSchema, type EmployeeInput } from "@/schemas";
import { type Employee } from "@/types";
import { label, today } from "@/lib/utils";
import { useAction, useLookups } from "@/hooks/use-data";
import { employeeApi } from "@/lib/api/employee.api";
const blank: EmployeeInput = {
  name: "",
  email: "",
  phone: "",
  role: "EMPLOYEE",
  teamId: "",
  managerId: "",
  joined: today(),
  active: true,
  avatar: "",
  position: "",
  password: "",
};
export function EmployeeForm({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee?: Employee;
}) {
  const { data } = useLookups();
  const form = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: blank,
  });
  useEffect(() => {
    if (open) form.reset(employee ? { ...employee, password: "" } : blank);
  }, [open, employee, form]);
  const save = useAction(
    (values: EmployeeInput) => employeeApi.save(values, employee?.id),
    employee ? "Employee updated" : "Welcome to the team",
    () => onOpenChange(false),
  );
  const e = form.formState.errors;
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={employee ? "Edit teammate" : "Make room for someone great"}
      description="Bring your people and their work into one shared space."
    >
      <form onSubmit={form.handleSubmit((v) => save.mutate(v))}>
        <div className="dialog-body form-grid">
          <Field label="Full name" error={e.name?.message}>
            <input className="input" {...form.register("name")} />
          </Field>
          <Field label="Email address" error={e.email?.message}>
            <input className="input" type="email" {...form.register("email")} />
          </Field>
          <Field label="Job title" error={e.position?.message}>
            <input className="input" {...form.register("position")} />
          </Field>
          <Field label="Phone number" error={e.phone?.message}>
            <input className="input" type="tel" {...form.register("phone")} />
          </Field>
          <Field label="Role" error={e.role?.message}>
            <select className="input" {...form.register("role")}>
              {["ADMIN", "MANAGER", "EMPLOYEE"].map((r) => (
                <option key={r} value={r}>
                  {label(r)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Team" error={e.teamId?.message}>
            <select className="input" {...form.register("teamId")}>
              <option value="">Choose a team</option>
              {data?.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reports to" error={e.managerId?.message}>
            <select className="input" {...form.register("managerId")}>
              <option value="">No manager</option>
              {data?.employees
                .filter((u) => u.role !== "EMPLOYEE" && u.id !== employee?.id)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Joining date" error={e.joined?.message}>
            <input className="input" type="date" {...form.register("joined")} />
          </Field>
          <Field
            label={employee ? "New password (optional)" : "Initial password (optional, min 10 chars)"}
            error={e.password?.message}
          >
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder={employee ? "Leave blank to keep current" : "Leave blank for default (Demo123!)"}
              {...form.register("password")}
            />
          </Field>
          <Field label="Avatar URL (optional)" error={e.avatar?.message}>
            <input
              className="input"
              type="url"
              placeholder="https://..."
              {...form.register("avatar")}
            />
          </Field>
          <label className="checkbox-label">
            <input type="checkbox" {...form.register("active")} />
            Active workspace member
          </label>
          {save.error && (
            <p className="form-error col-span-full" role="alert">
              {save.error.message}
            </p>
          )}
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
              : employee
                ? "Save changes"
                : "Add employee"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
