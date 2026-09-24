"use client";

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { gsap } from "./gsap";
import { useInputCapability } from "./use-input-capability";

type MagneticLinkProps = {
  children: ReactNode;
  as?: "a" | "button";
  strength?: number;
  radius?: number;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"a"> & ComponentPropsWithoutRef<"button">, "ref">;

export function MagneticLink({
  children,
  as = "a",
  strength = 0.4,
  radius = 80,
  className = "",
  ...rest
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const { reducedMotion, isTouch } = useInputCapability();

  useEffect(() => {
    if (reducedMotion || isTouch) return;
    const el = ref.current;
    if (!el) return;

    const moveTo = gsap.quickTo(el, "x", { duration: 0.25, ease: "expo.out" });
    const moveToY = gsap.quickTo(el, "y", { duration: 0.25, ease: "expo.out" });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.hypot(dx, dy) < radius) {
        moveTo(dx * strength);
        moveToY(dy * strength);
      }
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "expo.out" });
    };

    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, isTouch, strength, radius]);

  const Tag = as;
  return (
    <Tag ref={ref} className={`inline-block ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
