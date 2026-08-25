import React from "react";
import clsx from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "oxblood" | "spruce" | "amber" | "navy" | "mono" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-parchment-muted text-ink-light border border-parchment-border",
    oxblood: "bg-rose-900/10 text-archival-oxblood border border-rose-900/20 font-medium",
    spruce: "bg-emerald-900/10 text-archival-spruce border border-emerald-900/20 font-medium",
    amber: "bg-amber-700/10 text-archival-amber border border-amber-700/20 font-medium",
    navy: "bg-slate-900/10 text-archival-navy border border-slate-900/20 font-medium",
    mono: "bg-stone-900 text-stone-100 font-mono text-xs border border-stone-800 tracking-wider",
    outline: "bg-transparent text-ink-muted border border-parchment-border hover:border-ink-muted",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs rounded",
    md: "px-2.5 py-1 text-xs sm:text-sm rounded-md",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
