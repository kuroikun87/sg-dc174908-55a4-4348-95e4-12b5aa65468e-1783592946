import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BookPageProps {
  children: React.ReactNode;
  className?: string;
  pageKey?: string;
}

export function BookPage({ children, className, pageKey }: BookPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey || "default"}
        initial={{ opacity: 0, rotateY: -8, x: -20 }}
        animate={{ opacity: 1, rotateY: 0, x: 0 }}
        exit={{ opacity: 0, rotateY: 8, x: 20 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "min-h-[calc(100vh-2rem)] mx-auto max-w-5xl",
          "bg-card parchment-texture",
          "gold-border rounded-sm",
          "p-6 md:p-10 lg:p-12",
          "relative overflow-hidden",
          className
        )}
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Marginalia decorativa */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/20" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-gold/20" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-gold/20" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/20" />

        {/* Línea central sutil */}
        <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-border to-transparent opacity-30" />

        <div className="relative z-10">{children}</div>
      </motion.div>
    </AnimatePresence>
  );
}