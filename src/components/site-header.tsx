"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { gsap } from "@/components/motion/gsap";
import { useInputCapability } from "@/components/motion/use-input-capability";

const NAV_LINKS = [
  { href: "/yazilar", label: "Yazılar" },
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { reducedMotion } = useInputCapability();

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const links = panel?.querySelectorAll<HTMLElement>("[data-menu-item]");
    links?.[0]?.focus();

    if (!reducedMotion && links?.length) {
      gsap.from(links, {
        opacity: 0,
        y: 18,
        duration: 0.4,
        stagger: 0.06,
        ease: "expo.out",
      });
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, reducedMotion]);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6 sm:px-16">
        <Link href="/" className="font-display text-lg tracking-tight text-on-surface">
          Ahmet Haktan Eker
        </Link>

        <nav className="hidden gap-8 text-sm text-on-surface-variant sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-150 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menü"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-mr-1 inline-flex items-center justify-center min-h-11 min-w-11 p-2 text-on-surface transition-colors duration-150 hover:text-primary sm:hidden"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menüsü"
            className="fixed inset-0 z-[120] flex flex-col bg-background sm:hidden"
          >
            <div className="flex items-center justify-between px-6 py-6">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="font-display text-lg tracking-tight text-on-surface"
              >
                Ahmet Haktan Eker
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menüyü kapat"
                className="-mr-1 inline-flex items-center justify-center min-h-11 min-w-11 p-2 text-on-surface transition-colors duration-150 hover:text-primary"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col px-6 pt-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-menu-item
                  onClick={() => setOpen(false)}
                  className="border-b border-outline-variant/15 py-5 font-display text-2xl tracking-tight text-on-surface transition-colors duration-150 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>,
          document.body,
        )}
    </header>
  );
}
