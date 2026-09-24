"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "./gsap";
import { useInputCapability } from "./use-input-capability";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const { reducedMotion, isTouch } = useInputCapability();

  useEffect(() => {
    if (reducedMotion || isTouch) return;
    const dot = dotRef.current;
    if (!dot) return;

    document.body.classList.add("cursor-none");
    const moveX = gsap.quickTo(dot, "x", { duration: 0.35, ease: "expo.out" });
    const moveY = gsap.quickTo(dot, "y", { duration: 0.35, ease: "expo.out" });

    const onMove = (e: PointerEvent) => {
      moveX(e.clientX);
      moveY(e.clientY);
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-cursor-text]");
      if (target) {
        setLabel(target.dataset.cursorText ?? "");
        setActive(true);
      } else {
        setActive(false);
      }
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.body.classList.remove("cursor-none");
    };
  }, [reducedMotion, isTouch]);

  if (reducedMotion || isTouch) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className={`flex items-center justify-center rounded-full bg-primary text-on-primary transition-all duration-250 ease-out ${
          active ? "h-16 w-16" : "h-3 w-3"
        }`}
      >
        {active && (
          <span className="px-2 text-center text-[10px] font-medium uppercase tracking-wide">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
