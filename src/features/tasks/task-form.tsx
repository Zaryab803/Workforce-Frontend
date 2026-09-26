"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, ArrowRight } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/common";
import { taskSchema, type TaskInput } from "@/schemas";
import { priorities, type Task } from "@/types";
import { label, today } from "@/lib/utils";
import { useAction, useLookups } from "@/hooks/use-data";
import { taskApi } from "@/lib/api/task.api";
export function TaskForm({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task;
}) {
  const { data: lookups } = useLookups();
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      project: "Orbit Workspace",
      assigneeId: "",
      priority: "MEDIUM",
      dueDate: today(),
      estimatedHours: 4,
    },
  });
  useEffect(() => {
    if (open)
      form.reset(
        task
          ? {
              title: task.title,
              description: task.description,
              project: task.project,
              assigneeId: task.assigneeId,
              priority: task.priority,
              dueDate: task.dueDate,
              estimatedHours: task.estimatedHours,
            }
          : {
              title: "",
              description: "",
              project: "Orbit Workspace",
              assigneeId: "",
              priority: "MEDIUM",
              dueDate: today(),
              estimatedHours: 4,
            },
      );
  }, [open, task, form]);
  const action = useAction(
    (values: TaskInput) => taskApi.save(values, task?.id),
    task ? "Task updated" : "A new task is ready to go",
    () => onOpenChange(false),
  );
  const e = form.formState.errors;
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Edit task" : "A little progress starts here"}
      description={
        task
          ? "Keep the details clear and your team in sync."
          : "Give your next great idea a name and a plan."
      }
    >
      <form onSubmit={form.handleSubmit((v) => action.mutate(v))}>
        <div className="dialog-body space-y-5">
          <Field label="Task title" error={e.title?.message}>
            <input
              className="input"
              placeholder="What needs to happen?"
              {...form.register("title")}
            />
          </Field>
          <Field label="Description" error={e.description?.message}>
            <textarea
              className="input"
              rows={3}
              placeholder="A little context goes a long way..."
              {...form.register("description")}
            />
          </Field>
          <div className="form-grid">
            <Field label="Project" error={e.project?.message}>
              <input
                className="input"
                list="task-projects"
                {...form.register("project")}
              />
              <datalist id="task-projects">
                {lookups?.projects.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>
            <Field label="Assign to" error={e.assigneeId?.message}>
              <select className="input" {...form.register("assigneeId")}>
                <option value="">Choose a teammate</option>
                {lookups?.employees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority" error={e.priority?.message}>
              <select className="input" {...form.register("priority")}>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {label(p)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date" error={e.dueDate?.message}>
              <input
                className="input"
                type="date"
                {...form.register("dueDate")}
              />
            </Field>
            <Field label="Estimated hours" error={e.estimatedHours?.message}>
              <input
                className="input"
                type="number"
                min="0.5"
                step="0.5"
                max="1000"
                {...form.register("estimatedHours", { valueAsNumber: true })}
              />
            </Field>
          </div>
          {action.error && (
            <p className="form-error" role="alert">
              {action.error.message}
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
          <Button type="submit" disabled={action.isPending}>
            {action.isPending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}{" "}
            {task ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
