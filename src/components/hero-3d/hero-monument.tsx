"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Scene } from "./scene";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useInputCapability } from "@/components/motion/use-input-capability";

export function HeroMonument({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const { reducedMotion, isTouch } = useInputCapability();

  useEffect(() => {
    if (reducedMotion) return;
    const el = sectionRef.current;
    if (!el) return;

    // The hero sits below the sticky site header, so at scrollY=0 its top
    // edge already sits `headerOffset`px below the viewport top — not at 0.
    // Without accounting for that, "top top" only fires once the user has
    // already scrolled the page up by headerOffset px, which reads as the
    // page moving on its own before the pin/3D animation ever engages.
    // Anchoring the start to that natural resting position instead means
    // the section pins immediately, in place, with zero pre-scroll drift.
    const headerOffset = document.querySelector("header")?.getBoundingClientRect().height ?? 0;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: `top top+=${headerOffset}`,
        end: isTouch ? "+=160%" : "+=260%",
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        fastScrollEnd: true,
        onUpdate: (self) => {
          progress.current = self.progress;
          const hint = el.querySelector<HTMLElement>("[data-scroll-hint]");
          if (hint) hint.style.opacity = String(Math.max(0, 1 - self.progress * 6));
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reducedMotion, isTouch]);

  useEffect(() => {
    if (isTouch || reducedMotion) return;
    function handlePointerMove(e: PointerEvent) {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [isTouch, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`relative flex min-h-[92dvh] items-center overflow-hidden px-6 sm:px-16 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Canvas
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          camera={{ position: [0, 0, 9.5], fov: 34 }}
          dpr={[1, isTouch ? 1.5 : 2]}
        >
          <Scene scrollProgress={progress} pointer={pointer} reducedMotion={reducedMotion} isTouch={isTouch} />
        </Canvas>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_50%_50%,_transparent_0%,_transparent_40%,_var(--color-background)_78%)]"
      />
      {children}
    </section>
  );
}
