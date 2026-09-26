import { apiClient } from "./client";
import type { Task, TaskDetail, PageResult, Comment } from "@/types";
import type { TaskInput } from "@/schemas";

export const taskApi = {
  list: async (queryString = ""): Promise<PageResult<Task>> => {
    const url = queryString ? `/tasks?${queryString}` : "/tasks";
    const res = await apiClient.get<PageResult<Task>>(url);
    return res.data;
  },

  detail: async (id: string): Promise<TaskDetail> => {
    const res = await apiClient.get<TaskDetail>(`/tasks/${id}`);
    return res.data;
  },

  create: async (data: TaskInput): Promise<Task> => {
    const res = await apiClient.post<Task>("/tasks", data);
    return res.data;
  },

  update: async (id: string, data: TaskInput): Promise<Task> => {
    const res = await apiClient.patch<Task>(`/tasks/${id}`, data);
    return res.data;
  },

  save: async (data: TaskInput, id?: string): Promise<Task> => {
    return id ? taskApi.update(id, data) : taskApi.create(data);
  },

  status: async (id: string, status: Task["status"]): Promise<Task> => {
    const res = await apiClient.patch<Task>(`/tasks/${id}/status`, { status });
    return res.data;
  },

  comment: async (id: string, body: string): Promise<Comment> => {
    const res = await apiClient.post<Comment>(`/tasks/${id}/comments`, { body });
    return res.data;
  },

  hours: async (id: string, hours: number): Promise<Task> => {
    const res = await apiClient.post<Task>(`/tasks/${id}/hours`, { hours });
    return res.data;
  },
};

// Alias for backward compatibility
export const tasksApi = taskApi;
