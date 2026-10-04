"use client";

import { MotionConfig } from "motion/react";
import { ConfiguratorProvider } from "@/lib/configurator";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ConfiguratorProvider>{children}</ConfiguratorProvider>
    </MotionConfig>
  );
}
