"use client";

import {
  useEffect,
  useRef,
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import { gsap } from "./gsap";
import { useInputCapability } from "./use-input-capability";

type Variant = "fade-up" | "line" | "chars";

type TagProps = {
  ref?: Ref<HTMLElement>;
  className?: string;
  children?: ReactNode;
};

export function Reveal({
  children,
  as = "div",
  variant = "fade-up",
  delay = 0,
  stagger = 0.03,
  className = "",
  once = false,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  stagger?: number;
  className?: string;
  /** Play the reveal once on enter and never reverse it — use inside pinned
   * sections, where "bottom top" would otherwise fire as raw scrollY
   * advances even though the element never visually leaves the viewport. */
  once?: boolean;
}) {
  const Tag = as as unknown as ComponentType<TagProps>;
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion } = useInputCapability();

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const trigger = once
        ? { trigger: el, start: "top 85%" as const, toggleActions: "play none none none" }
        : {
            trigger: el,
            start: "top 85%" as const,
            end: "bottom top" as const,
            toggleActions: "play reverse play reverse",
          };

      if (variant === "fade-up") {
        gsap.from(el, { opacity: 0, y: 24, duration: 0.8, delay, ease: "expo.out", scrollTrigger: trigger });
        return;
      }

      const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
      if (variant === "line") {
        gsap.from(items, { yPercent: 110, duration: 1.2, delay, ease: "expo.out", stagger: 0.12, scrollTrigger: trigger });
      } else {
        gsap.from(items, { opacity: 0, yPercent: 60, duration: 0.6, delay, ease: "quart.out", stagger, scrollTrigger: trigger });
      }
    }, el);

    return () => ctx.revert();
  }, [reducedMotion, variant, delay, stagger, once]);

  if (variant === "fade-up") {
    return (
      <Tag ref={ref} className={className}>
        {children}
      </Tag>
    );
  }

  const text = typeof children === "string" ? children : "";
  const lines = text.split("\n");

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {lines.map((line, li) => (
        <span key={li} aria-hidden="true" className="block overflow-hidden">
          {variant === "line" ? (
            <span data-reveal-item className="inline-block will-change-transform">
              {line}
            </span>
          ) : (
            line.split(" ").map((word, wi) => (
              <span key={wi}>
                {wi > 0 ? " " : null}
                <span className="inline-block whitespace-nowrap">
                  {Array.from(word).map((char, ci) => (
                    <span
                      key={ci}
                      data-reveal-item
                      className="inline-block will-change-transform"
                    >
                  {char === " " ? " " : char}
                    </span>
                  ))}
                </span>
              </span>
            ))
          )}
        </span>
      ))}
    </Tag>
  );
}
