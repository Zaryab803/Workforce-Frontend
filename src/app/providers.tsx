"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { useState, useEffect, type ReactNode } from "react";
import { ApiError, restoreSession } from "@/lib/api/client";
import { initRealtime } from "@/lib/realtime";

function Toasts() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      closeButton
      position="bottom-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (
              error instanceof ApiError &&
              error.status === 401 &&
              typeof window !== "undefined" &&
              window.location.pathname !== "/login"
            ) {
              window.location.assign("/login");
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            retry: (count, error) =>
              !(
                error instanceof ApiError &&
                [401, 403, 404].includes(error.status)
              ) && count < 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    void restoreSession();
    const cleanupRealtime = initRealtime(client);
    return () => {
      cleanupRealtime();
    };
  }, [client]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <MotionConfig reducedMotion="user">
          {children}
          <Toasts />
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
