import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  children: ReactNode;
}

const variants = {
  primary:
    "bg-punch text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#111111] dark:hover:shadow-[3px_3px_0_0_#000000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
  secondary:
    "bg-white text-ink dark:bg-[#131826] dark:text-[#f8fafc] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#111111] dark:hover:shadow-[3px_3px_0_0_#000000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
  success:
    "bg-mint text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#111111] dark:hover:shadow-[3px_3px_0_0_#000000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
  danger:
    "bg-ink text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#1d4ed8] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
  ghost:
    "bg-transparent text-ink dark:text-[#f8fafc] shadow-none hover:bg-white dark:hover:bg-[#131826]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 border-[3px] border-ink px-4 py-2 text-sm font-extrabold uppercase tracking-wide shadow-[5px_5px_0_0_#111111] dark:shadow-[5px_5px_0_0_#000000] transition-[transform,box-shadow,background-color,border-color] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-punch disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:bg-[#e8ebe4] dark:disabled:bg-[#1e2436] disabled:text-ink/40 dark:disabled:text-white/30 disabled:shadow-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
