"use client";
import { useEffect, useSyncExternalStore } from "react";
import { getPushController } from "@/lib/push";
import { authApi } from "@/lib/api/auth.api";
import { restoreSession } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

export function PushProvider() {
  useEffect(() => {
    let active = true;
    void restoreSession()
      .then((token) => {
        if (active && token) return authApi.me();
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return null;
}

const labels = {
  idle: "Sign in to manage push notifications.",
  loading: "Setting up push notifications…",
  disabled: "Push notifications are disabled by the server.",
  unsupported:
    "Push notifications are unavailable in this browser. On iPhone or iPad, open the installed Home Screen app.",
  ready: "Receive generic workspace alerts on this browser.",
  enabled: "Push notifications are enabled.",
  denied:
    "Notifications are blocked. Allow them in your browser’s site settings, then reload.",
  error: "Push setup failed. Reload the page to try again.",
};
export function PushSettings() {
  const controller = getPushController();
  const state = useSyncExternalStore(
    controller?.subscribe ?? (() => () => {}),
    controller?.snapshot ?? (() => "idle" as const),
    () => "idle" as const,
  );
  return (
    <div className="panel mb-4 flex flex-wrap items-center justify-between gap-3">
      <p role="status">{labels[state]}</p>
      <Button
        variant="outline"
        disabled={!controller || !["ready", "enabled"].includes(state)}
        onClick={() => {
          void (state === "enabled"
            ? controller?.disable()
            : controller?.enable());
        }}
      >
        {state === "enabled"
          ? "Disable push notifications"
          : "Enable push notifications"}
      </Button>
    </div>
  );
}
