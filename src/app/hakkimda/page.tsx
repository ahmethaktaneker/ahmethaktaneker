import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { MagneticLink } from "@/components/motion/magnetic-link";
import { AmbientGlow } from "@/components/motion/ambient-glow";

export const metadata = { title: "Hakkımda — Ahmet Haktan Eker" };

export default function AboutPage() {
  return (
    <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden px-6 py-24 sm:px-16 sm:py-32">
      <AmbientGlow />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-8 -z-10 select-none font-display text-[26vw] leading-none text-on-surface/[0.03] sm:text-[16vw]"
      >
        AHE
      </span>
      <div className="grid grid-cols-1 gap-14 sm:grid-cols-[1.15fr_0.85fr] sm:gap-20 lg:gap-28">
        <div>
          <Reveal as="p" className="text-xs uppercase tracking-[0.2em] text-primary">
            Hakkımda
          </Reveal>
          <Reveal
            as="h1"
            variant="chars"
            stagger={0.02}
            delay={0.1}
            className="mt-5 font-display text-5xl leading-[0.95] tracking-tight text-on-surface sm:text-7xl"
          >
            Ahmet Haktan Eker
          </Reveal>
          <Reveal
            variant="fade-up"
            delay={0.35}
            className="prose-essay mt-10 max-w-[480px] text-lg leading-relaxed text-on-surface-variant"
          >
            <p>
              Ben Ahmet Haktan Eker. Kabataş Erkek Lisesi mezunuyum ve Koç Üniversitesi Hukuk Fakültesinde öğrenim görüyorum. Hukuk, tarih ve toplumsal meselelerle ilgileniyorum.
            </p>
            <p>Bu sitede okuduklarım, merak ettiklerim ve üzerine düşündüğüm konular hakkında yazıyorum. Bazen bir meseleyi ayrıntılarıyla ele alıyor, bazen gündelik hayattan bir sorunun peşinden gidiyorum.</p>
          </Reveal>
        </div>

        <Reveal
          variant="fade-up"
          delay={0.45}
          className="flex flex-col items-start sm:mt-[7.5rem] sm:border-l sm:border-outline-variant/15 sm:pl-12"
        >
          <span className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant">İletişim</span>
          <MagneticLink
            as="a"
            href="mailto:ahmethaktaneker@gmail.com"
            strength={0.25}
            radius={100}
            className="group mt-5 flex items-center gap-3 rounded-sm border border-outline-variant/25 bg-surface px-6 py-4 font-display text-lg text-on-surface transition-colors duration-250 hover:border-primary/50"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
            <span className="truncate">ahmethaktaneker@gmail.com</span>
          </MagneticLink>
          <Link
            href="/iletisim"
            className="group mt-6 inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors duration-250 hover:text-primary"
          >
            Tüm iletişim seçenekleri
            <ArrowRight
              className="h-4 w-4 transition-transform duration-250 group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
