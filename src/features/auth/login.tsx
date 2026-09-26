"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Orbit,
  LoaderCircle,
} from "lucide-react";
import { loginSchema } from "@/schemas";
import type { z } from "zod";
import { authApi } from "@/lib/api/auth.api";
import { useAction } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Field, Avatar } from "@/components/common";
import { ThemeToggle } from "@/components/layout/app-shell";

type LoginInput = z.infer<typeof loginSchema>;

export function Login() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const client = useQueryClient();
  const reduced = useReducedMotion();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });
  const login = useAction(authApi.login, "Welcome back", (u) => {
    client.clear();
    client.setQueryData(["current-user"], u);
    router.replace("/dashboard");
  });
  return (
    <div className="login-page">
      <section className="login-art">
        <a href="/" className="logo">
          <span className="logo-mark">
            <Orbit size={24} />
          </span>
          orbit.
        </a>
        <div className="login-pitch">
          <p className="eyebrow">LESS FRICTION. MORE FLOW.</p>
          <h1>
            Great people.
            <br />
            Meaningful work.
            <br />
            <span>One shared orbit.</span>
          </h1>
          <p>
            A calmer space for your team to plan, collaborate,
            <br className="hidden lg:block" /> and move good ideas forward.
          </p>
          <div className="orbit-illustration">
            <motion.div
              className="orbit-ring orbit-ring-one"
              animate={reduced ? {} : { rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            >
              <span />
            </motion.div>
            <motion.div
              className="orbit-ring orbit-ring-two"
              animate={reduced ? {} : { rotate: -360 }}
              transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            >
              <span />
            </motion.div>
            <div className="orbit-core">
              <Orbit size={42} />
            </div>
            <motion.div
              className="floating-task"
              animate={reduced ? {} : { y: [0, -10, 0], rotate: [-3, -1, -3] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <span className="check-bubble">
                <Check size={18} />
              </span>
              <div>
                <strong>Good things, shipped.</strong>
                <small>Another milestone together ✦</small>
              </div>
              <Avatar name="Sarah Chen" size="sm" />
            </motion.div>
          </div>
        </div>
        <p className="login-art-footer">
          A little structure. A lot of possibility.{" "}
          <span>© {new Date().getFullYear()} Orbit Studio</span>
        </p>
      </section>
      <section className="login-form-section">
        <div className="login-theme">
          <ThemeToggle />
        </div>
        <motion.div
          className="login-form"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="welcome-icon">✦</div>
          <p className="eyebrow">YOUR WORK, CONNECTED</p>
          <h2>Welcome back.</h2>
          <p className="muted mt-3 mb-8">
            Let’s pick up where the good work left off.
          </p>
          <form
            onSubmit={form.handleSubmit((v) => login.mutate(v))}
            className="space-y-5"
          >
            <Field
              label="Email address"
              error={form.formState.errors.email?.message}
            >
              <input
                className="input"
                type="email"
                autoComplete="username"
                {...form.register("email")}
              />
            </Field>
            <Field
              label="Password"
              error={form.formState.errors.password?.message}
            >
              <span className="password-field">
                <input
                  className="input"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </Field>
            <label className="checkbox-label">
              <input type="checkbox" {...form.register("remember")} /> Keep me
              signed in
            </label>
            {login.error && (
              <p role="alert" className="form-error">
                {login.error.message}
              </p>
            )}
            <Button className="w-full" type="submit" disabled={login.isPending}>
              {login.isPending ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <>
                  Sign in to your workspace <ArrowRight size={17} />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
