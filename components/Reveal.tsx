"use client";

import { motion, type Variants } from "motion/react";

export const EASE = [0.16, 1, 0.3, 1] as const;

const group: Variants = {
  hidden: {},
  shown: (stagger: number = 0.09) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

const item: Variants = {
  hidden: { opacity: 0, y: 34 },
  shown: { opacity: 1, y: 0, transition: { duration: 1.05, ease: EASE } },
};

const mask: Variants = {
  hidden: { y: "105%" },
  shown: { y: "0%", transition: { duration: 1.15, ease: EASE } },
};

type Tag = "div" | "ul" | "ol" | "section" | "header" | "footer" | "article" | "li" | "p" | "span";

type RevealProps = {
  as?: Tag;
  className?: string;
  children: React.ReactNode;
  stagger?: number;
  amount?: number;
  id?: string;
};

/** A group whose children (RevealItem / RevealLine) enter one after another when scrolled into view. */
export function Reveal({ as = "div", className, children, stagger = 0.09, amount = 0.25, id }: RevealProps) {
  const Comp = motion[as];
  return (
    <Comp
      id={id}
      className={className}
      variants={group}
      custom={stagger}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount }}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({ as = "div", className, children }: { as?: Tag; className?: string; children: React.ReactNode }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}

/** One line of a headline, rising out of a mask. */
export function RevealLine({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className ?? ""}`}>
      <motion.span className="block" variants={mask}>
        {children}
      </motion.span>
    </span>
  );
}
