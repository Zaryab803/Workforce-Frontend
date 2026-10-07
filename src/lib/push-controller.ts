export interface PushSDK {
  init(options: Record<string, unknown>): Promise<void>;
  login(id: string): Promise<void>;
  logout(): Promise<void>;
  Notifications: {
    permission: boolean;
    permissionNative: string;
    requestPermission(): Promise<void>;
    addEventListener(event: string, callback: () => void): void;
  };
  User: {
    PushSubscription: {
      optedIn: boolean;
      optIn(): Promise<void>;
      optOut(): Promise<void>;
      addEventListener?(event: string, callback: () => void): void;
    };
  };
}
export type PushConfig =
  | { enabled: false }
  | { enabled: true; appId: string; externalId: string; preference: boolean };
export type PushState =
  | "idle"
  | "loading"
  | "disabled"
  | "unsupported"
  | "ready"
  | "enabled"
  | "denied"
  | "error";

// Dependency injection keeps identity races and permission behavior testable without real subscriptions.
export function createPushController(deps: {
  appId: string | undefined;
  supported(): boolean;
  config(): Promise<PushConfig>;
  preference(enabled: boolean): Promise<unknown>;
  sdk(appId: string): Promise<PushSDK>;
}) {
  let state: PushState = "idle",
    user: string | null = null,
    version = 0;
  let sdk: PushSDK | undefined, config: PushConfig | undefined;
  let identityTimedOut = false;
  let queue: Promise<void> = Promise.resolve();
  let cancelPermission: (() => void) | undefined;
  const bounded = async (operation: Promise<void>) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            // A timed-out SDK promise cannot be cancelled. Stop remapping until reload,
            // and detach again if the old operation eventually settles.
            identityTimedOut = true;
            const oldSDK = sdk;
            void operation
              .catch(() => {})
              .then(async () => {
                try {
                  await oldSDK?.User.PushSubscription.optOut();
                } finally {
                  await oldSDK?.logout();
                }
              })
              .catch(() => {});
            reject(new Error("Push operation timed out"));
          }, 15000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
  const listeners = new Set<() => void>();
  const update = (next: PushState) => {
    state = next;
    listeners.forEach((fn) => fn());
  };
  const refresh = () =>
    update(
      identityTimedOut
        ? "error"
        : !user
          ? "idle"
          : sdk?.Notifications.permissionNative === "denied"
            ? "denied"
            : config?.enabled &&
                config.preference &&
                sdk?.User.PushSubscription.optedIn
              ? "enabled"
              : "ready",
    );
  const run = (fn: () => Promise<void>) => {
    queue = queue.then(fn).catch(() => update("error"));
    return queue;
  };
  return {
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    snapshot: () => state,
    setUser(id: string | null) {
      if (id === user && state !== "error" && (!id || state !== "idle"))
        return queue;
      cancelPermission?.();
      user = id;
      const revision = ++version;
      config = undefined;
      update(id ? "loading" : "idle");
      return run(async () => {
        if (identityTimedOut) throw new Error("Reload after push timeout");
        // Always detach the previous account before binding another, including after a page reload.
        if (sdk) {
          try {
            await bounded(sdk.User.PushSubscription.optOut());
          } finally {
            await bounded(sdk.logout());
          }
        }
        if (revision !== version || !id) return;
        if (!deps.supported()) {
          update("unsupported");
          return;
        }
        const next = await deps.config();
        if (revision !== version) return;
        config = next;
        if (!next.enabled || !deps.appId) {
          update("disabled");
          return;
        }
        if (next.appId !== deps.appId) throw new Error("Push App ID mismatch");
        if (!sdk) {
          sdk = await deps.sdk(next.appId);
          sdk.Notifications.addEventListener("permissionChange", () => {
            if (state !== "loading") refresh();
          });
          sdk.User.PushSubscription.addEventListener?.("change", () => {
            if (state !== "loading") refresh();
          });
          await bounded(sdk.User.PushSubscription.optOut());
          await bounded(sdk.logout());
        }
        if (revision !== version) return;
        await bounded(sdk.login(next.externalId));
        if (revision !== version) return;
        if (next.preference && sdk.Notifications.permission)
          await bounded(sdk.User.PushSubscription.optIn());
        if (revision === version) refresh();
      });
    },
    enable() {
      if (identityTimedOut) return Promise.resolve();
      if (
        !sdk ||
        !user ||
        !config?.enabled ||
        !["ready", "enabled"].includes(state)
      )
        return Promise.resolve();
      const revision = version;
      const activeSDK = sdk;
      // Invoke directly in the click handler, before any network request or queue wait.
      let permission: Promise<void>;
      try {
        permission = activeSDK.Notifications.permission
          ? Promise.resolve()
          : activeSDK.Notifications.requestPermission();
      } catch {
        update("error");
        return Promise.resolve();
      }
      // Observe rejection immediately, even while an earlier queued identity operation finishes.
      const result = permission.then(
        () => ({ failed: false }),
        () => ({ failed: true }),
      );
      const cancelled = new Promise<{ failed: boolean }>((resolve) => {
        cancelPermission = () => resolve({ failed: false });
      });
      update("loading");
      return run(async () => {
        const outcome = await Promise.race([result, cancelled]);
        if (revision === version) cancelPermission = undefined;
        if (revision === version && outcome.failed)
          throw new Error("Push permission failed");
        if (revision !== version) return;
        if (!activeSDK.Notifications.permission) {
          refresh();
          return;
        }
        await deps.preference(true);
        if (revision !== version) return;
        if (config?.enabled) config.preference = true;
        await bounded(activeSDK.User.PushSubscription.optIn());
        if (revision === version) refresh();
      });
    },
    disable() {
      const revision = version;
      update("loading");
      return run(async () => {
        if (revision !== version || !sdk || !user) return;
        await deps.preference(false);
        if (revision !== version) return;
        if (config?.enabled) config.preference = false;
        await bounded(sdk.User.PushSubscription.optOut());
        if (revision === version) refresh();
      });
    },
  };
}
