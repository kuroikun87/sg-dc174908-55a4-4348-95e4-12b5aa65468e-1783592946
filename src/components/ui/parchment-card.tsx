import React from "react";
import { cn } from "@/lib/utils";

interface ParchmentCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export function ParchmentCard({ children, className, title, icon }: ParchmentCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card/80 backdrop-blur-sm",
        "gold-border-thin rounded-sm",
        "p-5 md:p-6",
        "transition-all duration-300",
        "hover:border-gold/40 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
          {icon && <span className="text-gold">{icon}</span>}
          {title && (
            <h3 className="font-heading text-lg text-foreground tracking-wide">
              {title}
            </h3>
          )}
        </div>
      )}
      <div className="text-body text-foreground/90 leading-relaxed">{children}</div>
    </div>
  );
}