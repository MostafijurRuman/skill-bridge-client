"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-muted/50 animate-pulse" aria-hidden="true" />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    // If the browser supports View Transitions API, use it for a smooth page-wide effect!
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full",
        "bg-muted/50 hover:bg-muted transition-colors duration-300",
        "text-muted-foreground hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "overflow-hidden shadow-sm"
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <motion.div
          initial={false}
          animate={{
            y: isDark ? 30 : 0,
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1,
          }}
          transition={{ duration: 0.5, ease: "backInOut" }}
          className="absolute"
        >
          <Sun className="w-5 h-5" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            y: isDark ? 0 : -30,
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5,
          }}
          transition={{ duration: 0.5, ease: "backInOut" }}
          className="absolute"
        >
          <Moon className="w-5 h-5" />
        </motion.div>
      </div>
      
      {/* Subtle hover ring effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-foreground/10"
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    </button>
  );
}
