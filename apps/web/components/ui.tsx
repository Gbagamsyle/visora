import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  loading?: boolean;
}) {
  return (
    <button
      className={`button button-${variant}${loading ? " button-loading" : ""} ${className}`.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "success" | "warning" | "danger" | "information";
}) {
  return <span className={`badge${tone === "brand" ? "" : ` badge-${tone}`}`}>{children}</span>;
}

export function Alert({
  children,
  tone = "information",
  title,
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "information";
  title?: string;
}) {
  return (
    <div className={`alert alert-${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <div>
        {title ? <strong style={{ display: "block", marginBottom: 2 }}>{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ width = "100%", height = 16 }: { width?: number | string; height?: number }) {
  return <span className="skeleton" style={{ width, height }} aria-hidden="true" />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="empty-state">
      <div>
        <span className="empty-state-icon" aria-hidden="true">V</span>
        <h2>{title}</h2>
        <p>{description}</p>
        {action}
      </div>
    </section>
  );
}
