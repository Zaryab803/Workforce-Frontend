"use client";
import { ErrorState } from "@/components/common";
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="p-8">
      <ErrorState error={error} retry={reset} />
    </main>
  );
}
