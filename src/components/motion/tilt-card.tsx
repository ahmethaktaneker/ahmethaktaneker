"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "./gsap";
import { useInputCapability } from "./use-input-capability";

export function TiltCard({
  children,
  maxTilt = 8,
  glow = true,
  className = "",
}: {
  children: ReactNode;
  maxTilt?: number;
  glow?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion, isTouch } = useInputCapability();

  useEffect(() => {
    if (reducedMotion || isTouch) return;
    const el = ref.current;
    if (!el) return;

    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "expo.out" });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "expo.out" });
    const scale = gsap.quickTo(el, "scale", { duration: 0.4, ease: "expo.out" });

    const onEnter = () => scale(1.02);

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rotY(gsap.utils.clamp(-maxTilt, maxTilt, (px - 0.5) * maxTilt * 2));
      rotX(gsap.utils.clamp(-maxTilt, maxTilt, -(py - 0.5) * maxTilt * 2));
      el.style.setProperty("--x", `${px * 100}%`);
      el.style.setProperty("--y", `${py * 100}%`);
    };

    const onLeave = () => {
      rotX(0);
      rotY(0);
      scale(1);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, isTouch, maxTilt]);

  const interactive = !reducedMotion && !isTouch;

  return (
    <div
      ref={ref}
      className={`group relative [transform-style:preserve-3d] ${className}`}
      style={interactive ? { willChange: "transform" } : undefined}
    >
      {glow && interactive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 [background:radial-gradient(240px_circle_at_var(--x,_50%)_var(--y,_50%),_rgba(233,193,118,0.12),_transparent_70%)] group-hover:opacity-100"
        />
      )}
      {children}
    </div>
  );
}
