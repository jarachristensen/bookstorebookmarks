import React from "react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "oxblood" | "spruce";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      "bg-ink text-parchment-light hover:bg-ink-light shadow-sm active:translate-y-0.5 border border-ink",
    secondary:
      "bg-parchment-muted text-ink hover:bg-parchment-dark border border-parchment-border shadow-sm active:translate-y-0.5",
    outline:
      "bg-white/80 backdrop-blur-sm text-ink border border-parchment-border hover:bg-parchment-muted hover:border-ink-muted shadow-sm",
    ghost: "bg-transparent text-ink hover:bg-parchment-muted",
    oxblood:
      "bg-archival-oxblood text-white hover:bg-rose-950 border border-archival-oxblood shadow-sm active:translate-y-0.5",
    spruce:
      "bg-archival-spruce text-white hover:bg-emerald-950 border border-archival-spruce shadow-sm active:translate-y-0.5",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs rounded font-medium",
    md: "px-4 py-2 text-sm rounded-md font-medium",
    lg: "px-6 py-3 text-base rounded-md font-medium",
    icon: "p-2 rounded-md",
  };

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-700/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
