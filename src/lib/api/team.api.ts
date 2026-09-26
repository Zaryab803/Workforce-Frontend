import { apiClient } from "./client";
import type { Team, Employee, Task } from "@/types";
import type { TeamInput } from "@/schemas";

export type TeamWithMeta = Team & { members: number; activeTasks: number };

export interface TeamDetailResponse {
  team: Team;
  members: Employee[];
  tasks: Task[];
}

export const teamApi = {
  list: async (): Promise<TeamWithMeta[]> => {
    const res = await apiClient.get<any>("/teams");
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    return [];
  },

  detail: async (id: string): Promise<TeamDetailResponse> => {
    const res = await apiClient.get<TeamDetailResponse>(`/teams/${id}`);
    return res.data;
  },

  create: async (data: TeamInput): Promise<Team> => {
    const res = await apiClient.post<Team>("/teams", data);
    return res.data;
  },

  update: async (id: string, data: TeamInput): Promise<Team> => {
    const res = await apiClient.patch<Team>(`/teams/${id}`, data);
    return res.data;
  },

  save: async (data: TeamInput, id?: string): Promise<Team> => {
    return id ? teamApi.update(id, data) : teamApi.create(data);
  },

  member: async (id: string, userId: string, remove = false): Promise<Team> => {
    const res = await apiClient.patch<Team>(`/teams/${id}/members`, {
      userId,
      remove,
    });
    return res.data;
  },
};

// Alias for backward compatibility
export const teamsApi = teamApi;
