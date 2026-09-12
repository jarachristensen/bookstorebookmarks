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
    default: "bg-white text-stone-700 border border-[#E8E2D5] shadow-2xs",
    oxblood: "bg-[#F43F7A]/10 text-[#F43F7A] border border-[#F43F7A]/25 font-medium",
    spruce: "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 font-medium",
    amber: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25 font-medium",
    navy: "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/25 font-medium",
    mono: "bg-stone-900 text-stone-100 font-mono text-xs border border-stone-800 tracking-wider",
    outline: "bg-transparent text-stone-600 border border-[#E8E2D5] hover:border-stone-400",
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
