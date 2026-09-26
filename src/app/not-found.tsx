import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty min-h-screen">
      <p className="eyebrow">404 · OFF THE MAP</p>
      <h1>Let’s get you back.</h1>
      <p className="muted">This page doesn’t exist in your workspace.</p>
      <Link className="button button-primary" href="/dashboard">
        Go to dashboard
      </Link>
    </main>
  );
}
