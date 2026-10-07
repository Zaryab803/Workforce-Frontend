"use client";

import { io, Socket } from "socket.io-client";
import {
  getAccessToken,
  restoreSession,
  subscribeToAccessToken,
} from "./api/client";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

let socketInstance: Socket | null = null;
const subscribedTasks = new Set<string>();

export function getSocket(): Socket | null {
  return socketInstance;
}

export function subscribeToTask(taskId: string) {
  if (!taskId) return;
  subscribedTasks.add(taskId);
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit("task:subscribe", { taskId }, () => {});
  }
}

export function unsubscribeFromTask(taskId: string) {
  if (!taskId) return;
  subscribedTasks.delete(taskId);
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit("task:unsubscribe", { taskId }, () => {});
  }
}

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const u = new URL(process.env.NEXT_PUBLIC_API_URL);
      return u.origin;
    } catch {
      // fallback
    }
  }
  return "http://localhost:4000";
}

export function initRealtime(queryClient: QueryClient): () => void {
  const socketUrl = getSocketUrl();

  if (socketInstance) {
    return () => {};
  }

  const socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: false,
    auth: (cb) => {
      cb({ token: getAccessToken() });
    },
  });

  socketInstance = socket;

  socket.on("connect", () => {
    // Re-subscribe to any active tasks
    for (const taskId of subscribedTasks) {
      socket.emit("task:subscribe", { taskId }, () => {});
    }
  });

  socket.on("comment:created", (event: { taskId: string; comment?: { author?: { name?: string } } }) => {
    void queryClient.invalidateQueries({ queryKey: ["tasks", event.taskId] });
    void queryClient.invalidateQueries({ queryKey: ["task", event.taskId] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    if (event.comment?.author?.name) {
      toast.info(`New comment from ${event.comment.author.name}`);
    }
  });

  socket.on("task:changed", (event: { taskId?: string; action?: string }) => {
    void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    if (event.taskId) {
      void queryClient.invalidateQueries({ queryKey: ["task", event.taskId] });
      void queryClient.invalidateQueries({ queryKey: ["tasks", event.taskId] });
    }
    if (event.action) {
      toast.info(`Task updated: ${event.action.toLowerCase().replace(/_/g, " ")}`);
    }
  });

  socket.on("notification:created", () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    toast.info("You have a new notification");
  });

  socket.on("disconnect", async (reason) => {
    if (reason === "io server disconnect") {
      const newToken = await restoreSession();
      if (newToken) {
        socket.connect();
      }
    }
  });

  socket.on("connect_error", async (error) => {
    if (error.message === "UNAUTHENTICATED") {
      const newToken = await restoreSession();
      if (newToken && socket.disconnected) {
        socket.connect();
      }
    }
  });

  // Connect only once authentication supplies a token; detach immediately on logout.
  let currentToken: string | null = null;
  const unsubscribeToken = subscribeToAccessToken((token) => {
    if (token === currentToken) return;
    currentToken = token;
    socket.disconnect();
    if (token) socket.connect();
  });

  return () => {
    unsubscribeToken();
    socket.disconnect();
    socketInstance = null;
  };
}
