"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";

/** One passive scroll listener, one scheduled paint, no render loop or WebGL. */
export function EditorialHero() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const progress = query.matches ? 0 : Math.max(0, Math.min(1, -box.top / Math.max(1, box.height - window.innerHeight)));
      el.style.setProperty("--journey", String(progress));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    query.addEventListener("change", schedule);
    paint();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      query.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <section ref={root} className="editorial-journey" aria-labelledby="intro-title">
      <div className="editorial-stage">
        <div className="editorial-orbit" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => <span key={i} style={{ transform: `rotate(${i * 20}deg)` }} />)}
          <i className="orbit-core" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Ahmet Haktan Eker / Kişisel yazılar</p>
          <h1 id="intro-title">Biraz durup<br /><em>düşünmek.</em></h1>
          <p className="hero-description">Hukuk, toplum, kültür ve hayat üzerine yazılar.<br className="hidden sm:block" /> Soruların peşinden, farklı bakış açılarına.</p>
          <Link href="/yazilar" className="text-link">Yazıları keşfet <ArrowUpRight size={18} /></Link>
        </div>
        <div className="hero-bottom">
          <span>Fikirler, notlar, denemeler.</span>
          <a href="#yazilar" className="inline-flex items-center gap-3">Keşfetmek için kaydır <ArrowDown size={15} /></a>
        </div>
        <div className="journey-line" aria-hidden="true" />
      </div>
    </section>
  );
}
