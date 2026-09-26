import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Loading } from "@/components/common";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
