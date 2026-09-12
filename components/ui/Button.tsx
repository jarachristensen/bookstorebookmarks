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
      "bg-stone-900 text-white hover:bg-stone-800 shadow-xs active:translate-y-0.5 border border-stone-900",
    secondary:
      "bg-white text-stone-800 hover:bg-[#FAF8F5] border border-[#E8E2D5] shadow-xs active:translate-y-0.5",
    outline:
      "bg-white text-stone-700 border border-[#E8E2D5] hover:border-[#2563EB] hover:text-[#2563EB] shadow-xs",
    ghost: "bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900",
    oxblood:
      "bg-[#F43F7A] text-white hover:bg-[#E11D48] border border-[#F43F7A] shadow-xs active:translate-y-0.5",
    spruce:
      "bg-[#10B981] text-white hover:bg-[#059669] border border-[#10B981] shadow-xs active:translate-y-0.5",
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
