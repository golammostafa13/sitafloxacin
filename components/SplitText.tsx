"use client";

import { motion } from "motion/react";
import clsx from "clsx";
import { Fragment } from "react";

/**
 * Heading reveal: each word rises out of a mask with a stagger,
 * the way flshfrm.com brings in its titles.
 */
export default function SplitText({
  text, className, wordClassName, delay = 0, stagger = 0.07, as: Tag = "span",
}: { text: string; className?: string; wordClassName?: string; delay?: number; stagger?: number; as?: "span" | "h1" | "h2" }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.4 }}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {words.map((w, i) => (
          <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.12em] pr-[0.08em] -mb-[0.12em] align-bottom">
            <motion.span
              className={clsx("inline-block", wordClassName)}
              variants={{
                hidden: { y: "110%", rotate: 6, opacity: 0 },
                shown: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
