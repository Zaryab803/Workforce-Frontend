import { describe, it, expect, vi } from "vitest";
import { createPushController, type PushSDK } from "../src/lib/push-controller";

function setup({
  permission = false,
  denied = false,
  enabled = true,
  preference = false,
  supported = true,
} = {}) {
  const sdk: PushSDK = {
    init: vi.fn(async () => {}),
    login: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
    Notifications: {
      permission,
      permissionNative: denied ? "denied" : permission ? "granted" : "default",
      requestPermission: vi.fn(async () => {}),
      addEventListener: vi.fn(),
    },
    User: {
      PushSubscription: {
        optedIn: false,
        optIn: vi.fn(async () => {
          sdk.User.PushSubscription.optedIn = true;
        }),
        optOut: vi.fn(async () => {
          sdk.User.PushSubscription.optedIn = false;
        }),
      },
    },
  };
  const deps = {
    appId: "test-app",
    supported: () => supported,
    config: vi.fn(async () =>
      enabled
        ? {
            enabled: true as const,
            appId: "test-app",
            externalId: "opaque-user-a",
            preference,
          }
        : { enabled: false as const },
    ),
    preference: vi.fn(async () => {}),
    sdk: vi.fn(async () => sdk),
  };
  return { controller: createPushController(deps), sdk, deps };
}

describe("push identity and permission lifecycle", () => {
  it("does not initialize or prompt without a confirmed session", async () => {
    const { controller, deps, sdk } = setup();
    await controller.setUser(null);
    expect(deps.sdk).not.toHaveBeenCalled();
    await controller.setUser("a");
    await controller.setUser("a");
    expect(deps.sdk).toHaveBeenCalledTimes(1);
    expect(sdk.login).toHaveBeenCalledWith("opaque-user-a");
    expect(sdk.Notifications.requestPermission).not.toHaveBeenCalled();
  });
  it("subscribes only from the user action and saves a backend preference", async () => {
    const { controller, sdk, deps } = setup();
    await controller.setUser("a");
    vi.mocked(sdk.Notifications.requestPermission).mockImplementation(
      async () => {
        sdk.Notifications.permission = true;
      },
    );
    const enable = controller.enable();
    expect(sdk.Notifications.requestPermission).toHaveBeenCalledTimes(1);
    await enable;
    expect(deps.preference).toHaveBeenCalledWith(true);
    expect(controller.snapshot()).toBe("enabled");
    await controller.disable();
    expect(deps.preference).toHaveBeenLastCalledWith(false);
    expect(controller.snapshot()).toBe("ready");
  });
  it("handles denied permission without subscribing", async () => {
    const { controller, sdk, deps } = setup();
    await controller.setUser("a");
    vi.mocked(sdk.Notifications.requestPermission).mockImplementation(
      async () => {
        sdk.Notifications.permissionNative = "denied";
      },
    );
    await controller.enable();
    expect(controller.snapshot()).toBe("denied");
    expect(sdk.User.PushSubscription.optIn).not.toHaveBeenCalled();
    expect(deps.preference).not.toHaveBeenCalled();
  });
  it("detaches the old account and maps the next account in order", async () => {
    const { controller, sdk, deps } = setup({
      permission: true,
      preference: true,
    });
    await controller.setUser("a");
    await controller.setUser(null);
    expect(sdk.User.PushSubscription.optedIn).toBe(false);
    deps.config.mockResolvedValue({
      enabled: true,
      appId: "test-app",
      externalId: "opaque-user-b",
      preference: false,
    });
    await controller.setUser("b");
    expect(vi.mocked(sdk.login).mock.calls.map((args) => args[0])).toEqual([
      "opaque-user-a",
      "opaque-user-b",
    ]);
    expect(sdk.logout).toHaveBeenCalledTimes(3);
    expect(sdk.User.PushSubscription.optedIn).toBe(false);
    expect(deps.sdk).toHaveBeenCalledTimes(1);
  });
  it("ignores stale configuration when logout races SDK setup", async () => {
    const { controller, sdk, deps } = setup();
    let resolve!: (config: Awaited<ReturnType<typeof deps.config>>) => void;
    deps.config.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const login = controller.setUser("a");
    await Promise.resolve();
    const logout = controller.setUser(null);
    resolve({
      enabled: true,
      appId: "test-app",
      externalId: "stale",
      preference: true,
    });
    await Promise.all([login, logout]);
    expect(sdk.login).not.toHaveBeenCalled();
    expect(controller.snapshot()).toBe("idle");
  });
  it.each(["unsupported", "disabled", "error"] as const)(
    "handles %s without breaking authentication",
    async (state) => {
      const { controller, deps, sdk } = setup({
        supported: state !== "unsupported",
        enabled: state !== "disabled",
      });
      if (state === "error")
        deps.sdk.mockRejectedValue(new Error("blocked CDN"));
      await controller.setUser("a");
      expect(controller.snapshot()).toBe(state);
      expect(sdk.login).not.toHaveBeenCalled();
    },
  );
  it("cleans up when account changes while login is in flight", async () => {
    const { controller, sdk } = setup({ permission: true, preference: true });
    let finish!: () => void;
    vi.mocked(sdk.login).mockImplementationOnce(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    );
    const first = controller.setUser("a");
    await vi.waitFor(() => expect(finish).toBeDefined());
    const logout = controller.setUser(null);
    finish();
    await Promise.all([first, logout]);
    expect(sdk.User.PushSubscription.optIn).not.toHaveBeenCalled();
    expect(sdk.logout).toHaveBeenCalledTimes(2);
  });
});

it("logout cancels a pending permission prompt without saving preference for a stale user", async () => {
  const { controller, sdk, deps } = setup();
  await controller.setUser("a");
  vi.mocked(sdk.Notifications.requestPermission).mockImplementation(
    () => new Promise(() => {}),
  );
  const permission = controller.enable();
  await Promise.resolve();
  await controller.setUser(null);
  await permission;
  expect(deps.preference).not.toHaveBeenCalled();
  expect(sdk.logout).toHaveBeenCalledTimes(2);
});

it("does not remap another account after a timed-out SDK login and cleans up late completion", async () => {
  vi.useFakeTimers();
  try {
    const { controller, sdk } = setup({ permission: true, preference: true });
    let finish!: () => void;
    vi.mocked(sdk.login).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const first = controller.setUser("a");
    await vi.advanceTimersByTimeAsync(15000);
    await first;
    expect(controller.snapshot()).toBe("error");
    await controller.setUser("b");
    expect(sdk.login).toHaveBeenCalledTimes(1);
    finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(sdk.logout).toHaveBeenCalledTimes(2);
    expect(sdk.User.PushSubscription.optIn).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
