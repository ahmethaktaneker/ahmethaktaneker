import { ArrowUpRight, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { MagneticLink } from "@/components/motion/magnetic-link";
import { AmbientGlow } from "@/components/motion/ambient-glow";

export const metadata = { title: "İletişim — Ahmet Haktan Eker" };

export default function ContactPage() {
  return (
    <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center overflow-hidden px-6 py-24 sm:px-16 sm:py-32">
      <AmbientGlow />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 bottom-0 -z-10 select-none font-display text-[40vw] leading-none text-on-surface/[0.03] sm:text-[24vw]"
      >
        @
      </span>
      <div className="max-w-[640px]">
        <Reveal as="p" className="text-xs uppercase tracking-[0.2em] text-primary">
          İletişim
        </Reveal>
        <Reveal
          as="h1"
          variant="chars"
          stagger={0.02}
          delay={0.1}
          className="mt-5 font-display text-5xl leading-[0.95] tracking-tight text-on-surface sm:text-7xl"
        >
          Konuşalım.
        </Reveal>
        <Reveal
          variant="fade-up"
          delay={0.35}
          className="mt-8 max-w-md text-lg leading-relaxed text-on-surface-variant"
        >
          Sorularınız ve geri bildirimleriniz için doğrudan yazabilirsiniz.
        </Reveal>
        <Reveal variant="fade-up" delay={0.45} className="mt-12">
          <MagneticLink
            as="a"
            href="mailto:ahmethaktaneker@gmail.com"
            strength={0.3}
            radius={120}
            className="group inline-flex items-center gap-3 rounded-sm border border-outline-variant/25 bg-surface max-w-full px-3 sm:px-7 py-4 font-display text-sm sm:text-xl text-on-surface transition-colors duration-250 hover:border-primary/50"
          >
            <Mail className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
            ahmethaktaneker@gmail.com
            <ArrowUpRight
              className="h-4 w-4 text-on-surface-variant transition-transform duration-250 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </MagneticLink>
        </Reveal>
      </div>
    </div>
  );
}
