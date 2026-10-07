import { apiClient, setAccessToken, getAccessToken } from "./client";
import { getSocket } from "../realtime";
import { syncPushUser } from "../push";
import type { Employee } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

let identityRevision = 0;
export const authApi = {
  me: async (): Promise<Employee> => {
    const revision = identityRevision;
    const res = await apiClient.get<Employee>("/auth/me");
    if (revision === identityRevision && getAccessToken())
      void syncPushUser(res.data.id);
    return res.data;
  },

  login: async (data: LoginPayload): Promise<Employee> => {
    const revision = ++identityRevision;
    void syncPushUser(null);
    const res = await apiClient.post<any>("/auth/login", data);
    const payload = res.data;
    const token = payload?.accessToken || payload?.data?.accessToken;
    if (token) {
      setAccessToken(token);
    }
    const user = payload?.user || payload?.data?.user || payload;
    if (revision === identityRevision && token) void syncPushUser(user.id);
    return user as Employee;
  },

  logout: async (): Promise<{ success: boolean }> => {
    ++identityRevision;
    void syncPushUser(null);
    try {
      const res = await apiClient.post<{ success: boolean }>("/auth/logout");
      setAccessToken(null);
      getSocket()?.disconnect();

      return res.data;
    } catch {
      setAccessToken(null);
      getSocket()?.disconnect();
      return { success: true };
    }
  },
};
