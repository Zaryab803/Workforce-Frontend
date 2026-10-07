import { apiClient } from "./api/client";
import {
  createPushController,
  type PushConfig,
  type PushSDK,
} from "./push-controller";

type Runtime = {
  controller?: ReturnType<typeof createPushController>;
  initialized?: Promise<PushSDK>;
};
declare global {
  interface Window {
    workforcePush?: Runtime;
    OneSignalDeferred?: Array<(sdk: PushSDK) => void>;
  }
}

function loadSDK(appId: string): Promise<PushSDK> {
  const runtime = window.workforcePush!;
  // Lives on window so navigation, Strict Mode and development module reloads cannot initialize twice.
  return (runtime.initialized ??= new Promise<PushSDK>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error("Push SDK timed out")),
      20000,
    );
    window.OneSignalDeferred ??= [];
    window.OneSignalDeferred.push((sdk) => {
      void sdk
        .init({
          appId,
          allowLocalhostAsSecureOrigin:
            process.env.NEXT_PUBLIC_ONESIGNAL_ALLOW_LOCALHOST === "true" &&
            ["localhost", "127.0.0.1"].includes(window.location.hostname),
          autoResubscribe: false,
          serviceWorkerPath: "onesignal/OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/onesignal/" },
          notifyButton: { enable: false },
          promptOptions: {
            slidedown: { prompts: [{ type: "push", autoPrompt: false }] },
          },
        })
        .then(
          () => {
            clearTimeout(timer);
            resolve(sdk);
          },
          () => {
            clearTimeout(timer);
            reject(new Error("Push SDK failed"));
          },
        );
    });
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Push SDK unavailable"));
    };
    document.head.appendChild(script);
  }));
}

export function getPushController() {
  if (typeof window === "undefined") return undefined;
  const runtime = (window.workforcePush ??= {});
  return (runtime.controller ??= createPushController({
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
    supported: () =>
      window.isSecureContext &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window,
    config: async () =>
      (
        await apiClient.get<PushConfig>("/notifications/push-config", {
          timeout: 15000,
        })
      ).data,
    preference: async (enabled) =>
      apiClient.patch(
        "/notifications/push-preference",
        { enabled },
        { timeout: 15000 },
      ),
    sdk: loadSDK,
  }));
}

export function syncPushUser(id: string | null) {
  return getPushController()?.setUser(id) ?? Promise.resolve();
}
