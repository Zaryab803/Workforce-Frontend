"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ShieldCheck, Mail, Shapes } from "lucide-react";
import { useUser, useLookups } from "@/hooks/use-data";
import {
  AnimatedPage,
  PageHeader,
  Avatar,
  Badge,
  PanelTitle,
  Loading,
} from "@/components/common";
import { cn, label, date } from "@/lib/utils";
export function Profile() {
  const { data: user } = useUser();
  const { data } = useLookups();
  const { theme, setTheme } = useTheme();
  if (!user) return <Loading />;
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="YOUR CORNER OF THE WORKSPACE"
        title="Make yourself at home"
        description="Your profile, your preferences, your own little orbit."
      />
      <div className="detail-layout">
        <div className="space-y-6">
          <div className="panel">
            <PanelTitle title="The basics" />
            <div className="profile-intro">
              <Avatar name={user.name} src={user.avatar} size="lg" />
              <div>
                <h2>{user.name}</h2>
                <p className="muted mt-1">{user.position}</p>
                <div className="mt-3">
                  <Badge value={user.role} />
                </div>
              </div>
            </div>
            <dl className="profile-fields">
              <div>
                <dt>Email address</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Phone number</dt>
                <dd>{user.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt>Team</dt>
                <dd>
                  {data?.teams.find((t) => t.id === user.teamId)?.name ||
                    "Unassigned"}
                </dd>
              </div>
              <div>
                <dt>Part of the team since</dt>
                <dd>
                  {user.joined ? `${date(user.joined)}, ${user.joined.slice(0, 4)}` : "Recently joined"}
                </dd>
              </div>
            </dl>
            <p className="muted text-sm mt-6">
              Need to update your details? Your workspace administrator can
              help.
            </p>
          </div>
          <div className="panel">
            <PanelTitle
              title="A view that feels like you"
              description="Choose the atmosphere for your workspace."
            />
            <div className="theme-options">
              {[
                { value: "light", name: "Daylight", icon: Sun },
                { value: "dark", name: "After hours", icon: Moon },
                { value: "system", name: "Follow device", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.value}
                  className={cn(
                    "theme-option",
                    theme === t.value && "selected",
                  )}
                  onClick={() => setTheme(t.value)}
                >
                  <span className={"theme-preview theme-preview-" + t.value}>
                    <i />
                    <b />
                    <em />
                  </span>
                  <span>
                    <t.icon size={16} />
                    {t.name}
                  </span>
                  {theme === t.value && <span className="theme-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="panel self-start">
          <span className="metric-icon purple mb-5">
            <ShieldCheck size={21} />
          </span>
          <h2>Your workspace access</h2>
          <p className="muted text-sm mt-3 leading-relaxed">
            You’re signed in as an {label(user.role).toLowerCase()}. Your
            navigation and workspace data reflect the access assigned to you.
          </p>
          <div className="profile-access">
            <span>
              <Mail size={16} />
              Demo account
            </span>
            <span>
              <Shapes size={16} />
              Orbit Studio
            </span>
            <Badge value={user.active ? "ACTIVE" : "INACTIVE"} />
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
