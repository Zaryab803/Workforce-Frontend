"use client";
import { motion } from "motion/react";
import {
  Inbox,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
} from "react";
import Image from "next/image";
import type { ReactNode, HTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn, initials, label } from "@/lib/utils";
import { useDebouncedSearch } from "@/hooks/use-filters";
export function Avatar({
  name,
  src = "",
  size = "md",
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn("avatar", "avatar-" + size)}
      style={{
        background: `hsl(${(name.charCodeAt(0) * 13) % 360} 65% 90%)`,
        color: `hsl(${(name.charCodeAt(0) * 13) % 360} 40% 35%)`,
      }}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={name}
          fill
          unoptimized
          sizes="48px"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
export function Badge({ value }: { value: string }) {
  return (
    <span className={cn("badge", "badge-" + value.toLowerCase())}>
      <span className="badge-dot" />
      {label(value)}
    </span>
  );
}
export function PageHeader({
  eyebrow = "YOUR WORKSPACE",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          {title}
          <span className="heading-dot">.</span>
        </h1>
        <p className="muted mt-2">{description}</p>
      </div>
      <div className="header-actions">{actions}</div>
    </div>
  );
}
export function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useDebouncedSearch(value, onChange);
  return (
    <div className="search-field">
      <Search size={17} />
      <input
        aria-label={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
      />
      {text && (
        <button aria-label="Clear search" onClick={() => setText("")}>
          ×
        </button>
      )}
    </div>
  );
}
export function Filter({
  label: title,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className="input filter"
      aria-label={title}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{title}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
export function Field({
  label: title,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  const labelId = useId();
  const errorId = `${labelId}-error`;
  return (
    <label className={cn("field", className)}>
      <span id={labelId}>{title}</span>
      {Children.map(children, (child) => {
        if (
          isValidElement<HTMLAttributes<HTMLElement>>(child) &&
          typeof child.type === "string" &&
          ["input", "select", "textarea"].includes(child.type)
        ) {
          return cloneElement(child, {
            "aria-labelledby": labelId,
            "aria-invalid": !!error,
            "aria-describedby": error ? errorId : undefined,
          });
        }
        return child;
      })}
      {error && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
    </label>
  );
}
export function Empty({
  title = "Nothing here yet",
  description = "Try adjusting your filters.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Inbox size={25} />
      </div>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <div className="skeleton h-16 w-2/5" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
      <div className="skeleton h-80" />
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div className="empty">
      <AlertCircle size={30} />
      <h3>We couldn’t load this view</h3>
      <p className="muted">{error.message}</p>
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
export function Pagination({
  page,
  pages,
  total,
  limit,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}) {
  useEffect(() => {
    if (page > pages) onChange(pages);
  }, [page, pages, onChange]);
  return (
    <div className="pagination">
      <span className="muted text-sm">
        {total
          ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} results`
          : "No results"}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm">
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
export function PanelTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-title">
      <div>
        <h2>{title}</h2>
        {description && <p className="muted text-sm mt-1">{description}</p>}
      </div>
      {action || <ArrowUpRight size={18} className="muted" />}
    </div>
  );
}
