import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  token: null as string | null,
  listeners: new Set<(token: string | null) => void>(),
  socket: {
    connected: false,
    disconnected: true,
    on: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
  },
}));
vi.mock("socket.io-client", () => ({ io: vi.fn(() => state.socket) }));
vi.mock("../src/lib/api/client", () => ({
  getAccessToken: () => state.token,
  restoreSession: vi.fn(async () => state.token),
  subscribeToAccessToken: (listener: (token: string | null) => void) => {
    state.listeners.add(listener);
    listener(state.token);
    return () => state.listeners.delete(listener);
  },
}));
vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));

import { io } from "socket.io-client";
import { initRealtime } from "../src/lib/realtime";
import type { QueryClient } from "@tanstack/react-query";

let cleanup: (() => void) | undefined;
function publish(token: string | null) {
  state.token = token;
  for (const listener of state.listeners) listener(token);
}
const client = { invalidateQueries: vi.fn() } as unknown as QueryClient;
beforeEach(() => {
  vi.clearAllMocks();
  state.token = null;
});
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe("authenticated realtime lifecycle", () => {
  it("does not open an anonymous connection and connects after login", () => {
    cleanup = initRealtime(client);
    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ autoConnect: false }),
    );
    expect(state.socket.connect).not.toHaveBeenCalled();
    publish("confirmed-token");
    expect(state.socket.connect).toHaveBeenCalledTimes(1);
    publish(null);
    expect(state.socket.disconnect).toHaveBeenCalledTimes(2);
    expect(state.socket.connect).toHaveBeenCalledTimes(1);
  });

  it("connects a restored session and reconnects only when its token changes", () => {
    state.token = "restored-token";
    cleanup = initRealtime(client);
    expect(state.socket.connect).toHaveBeenCalledTimes(1);
    publish("restored-token");
    expect(state.socket.connect).toHaveBeenCalledTimes(1);
    publish("refreshed-token");
    expect(state.socket.connect).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes on unmount so late token changes cannot reconnect", () => {
    cleanup = initRealtime(client);
    cleanup();
    cleanup = undefined;
    publish("late-token");
    expect(state.listeners.size).toBe(0);
    expect(state.socket.connect).not.toHaveBeenCalled();
  });
});
