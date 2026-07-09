import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RitualButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "wine" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
  className?: string;
}

export function RitualButton({
  variant = "gold",
  size = "default",
  children,
  className,
  ...props
}: RitualButtonProps) {
  const baseClasses =
    "font-heading tracking-wider uppercase text-sm transition-all duration-300 relative overflow-hidden";

  const variants = {
    gold: "bg-gold text-charcoal hover:bg-gold-light hover:shadow-[0_0_20px_hsl(43_70%_55%_/_0.3)] active:scale-[0.98]",
    wine: "bg-wine text-parchment hover:bg-wine-light hover:shadow-[0_0_20px_hsl(350_60%_35%_/_0.3)] active:scale-[0.98]",
    ghost: "bg-transparent text-parchment hover:bg-white/5 hover:text-gold active:scale-[0.98]",
    outline:
      "bg-transparent border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold active:scale-[0.98]",
  };

  const sizes = {
    default: "px-6 py-3",
    sm: "px-4 py-2 text-xs",
    lg: "px-8 py-4 text-base",
    icon: "h-10 w-10 flex items-center justify-center",
  };

  return (
    <Button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === "gold" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      )}
    </Button>
  );
}