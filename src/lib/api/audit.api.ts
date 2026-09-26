import { apiClient } from "./client";
import type { Activity, PageResult } from "@/types";

export const auditApi = {
  list: async (queryString = ""): Promise<PageResult<Activity>> => {
    const url = queryString ? `/audit-logs?${queryString}` : "/audit-logs";
    const res = await apiClient.get<PageResult<Activity>>(url);
    return res.data;
  },
};
