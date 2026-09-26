import { apiClient } from "./client";
import type { Notification, PageResult } from "@/types";

export const notificationApi = {
  list: async (): Promise<Notification[]> => {
    const res = await apiClient.get<Notification[] | PageResult<Notification>>("/notifications");
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if (res.data && Array.isArray((res.data as PageResult<Notification>).items)) {
      return (res.data as PageResult<Notification>).items;
    }
    return [];
  },

  read: async (id = "all"): Promise<{ success: boolean }> => {
    const res = await apiClient.patch<{ success: boolean }>(`/notifications/${id}`);
    return res.data;
  },
};

// Alias for backward compatibility
export const notificationsApi = notificationApi;
