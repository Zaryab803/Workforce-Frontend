"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth.api";
import { lookupsApi } from "@/lib/api/lookup.api";
export function useUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
}
export function useLookups() {
  return useQuery({
    queryKey: ["lookups"],
    queryFn: lookupsApi.get,
    staleTime: 30_000,
  });
}
export function useAction<T, V>(
  fn: (variables: V) => Promise<T>,
  message: string,
  onSuccess?: (data: T) => void,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      void client.invalidateQueries();
      if (message) toast.success(message);
      onSuccess?.(data);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
