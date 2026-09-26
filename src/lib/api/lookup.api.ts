import { apiClient } from "./client";
import type { Lookups } from "@/types";

export const lookupApi = {
  get: async (): Promise<Lookups> => {
    const res = await apiClient.get<Lookups>("/lookups");
    return res.data;
  },
};

// Alias for backward compatibility
export const lookupsApi = lookupApi;
