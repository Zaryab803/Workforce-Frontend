import { apiClient, setAccessToken } from "./client";
import { getSocket } from "../realtime";
import type { Employee } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export const authApi = {
  me: async (): Promise<Employee> => {
    const res = await apiClient.get<Employee>("/auth/me");
    return res.data;
  },

  login: async (data: LoginPayload): Promise<Employee> => {
    const res = await apiClient.post<any>("/auth/login", data);
    const payload = res.data;
    const token = payload?.accessToken || payload?.data?.accessToken;
    if (token) {
      setAccessToken(token);
      try {
        const socket = getSocket();
        if (socket) {
          socket.disconnect().connect();
        }
      } catch {
        // Socket connection optional
      }
    }
    const user = payload?.user || payload?.data?.user || payload;
    return user as Employee;
  },

  logout: async (): Promise<{ success: boolean }> => {
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
