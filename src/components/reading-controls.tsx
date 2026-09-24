"use client";
import { useEffect, useRef, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ReadingControls() {
  const [light, setLight] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const article = document.getElementById("essay");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!article || !bar.current) return;
      const bounds = article.getBoundingClientRect();
      const range = bounds.height - window.innerHeight;
      const progress = range <= 0 ? 1 : Math.min(1, Math.max(0, -bounds.top / range));
      bar.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    if (article) observer.observe(article);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);
  useEffect(() => {
    const article = document.getElementById("essay");
    article?.classList.toggle("reading-light", light);
    return () => article?.classList.remove("reading-light");
  }, [light]);
  return <><div ref={bar} className="reading-progress" aria-hidden="true" /><button type="button" className="reading-toggle" aria-pressed={light} onClick={() => setLight(!light)}>{light ? <Moon size={16} /> : <Sun size={16} />}{light ? "Koyu sayfa" : "Açık sayfa"}</button></>;
}
