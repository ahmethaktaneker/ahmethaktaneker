# Ahmet Haktan Eker — Design System

Date: 2026-07-08
Companion to: `2026-07-08-personal-blog-design.md` (product spec) and `PRODUCT.md`

## Sourcing note

Synthesized from `PRODUCT.md`, the design spec, and the installed `design-taste-frontend`, `high-end-visual-design`, `web-design-guidelines`, and `web-design-engineer` skills. Also checked the connected MCP registries for anything usable:

- **Magic UI registry** (`mcp__magic`): a shadcn-style catalog of SaaS/marketing components (gradient text, shiny text, aurora text, animated beams, bento grids). Explicitly **not** used — its entire visual language (gradient text, glow/shine, decorative motion) is exactly what `PRODUCT.md`'s anti-references section bans. The one technique worth borrowing in spirit — `text-reveal` (fade-in-on-scroll) — is reimplemented from scratch below as a plain opacity/translate fade, with no gradient or shine, and scoped only to non-essay, non-hero sections.
- **Context7**: confirmed React Three Fiber (`/pmndrs/react-three-fiber`) and GSAP (`/greensock/gsap`) are current, high-reputation, actively documented libraries — validates the spec's hero stack choice. Pull exact `ScrollTrigger` + R3F integration snippets from Context7 at implementation time rather than from memory.
- **industrial-brutalist-ui**, **gpt-taste**, **minimalist-ui**'s bento/pastel system, **stitch-design-taste**, **brandkit**, **imagegen-frontend-web**, **image-to-code**, **beautiful-article**: reviewed, not applied — each is a coherent system for a different medium or register (CRT/brutalist telemetry, Awwwards maximalism, Notion-style SaaS, Google Stitch's own generator, brand-kit image deliverables, image-generation-first marketing builds, single-file article export). Applying them wholesale would fight the "credible restrained editorial, one signature 3D moment" brief. Cross-cutting anti-slop rules they share (no Inter, no pure black, no AI purple/neon, no gradient text) are already folded in below.

## 1. Visual Theme & Atmosphere

Density: 3/10 (airy, reading-first). Variance: 3/10 (a calm, symmetric editorial grid — asymmetry is spent entirely on the homepage hero, not the system). Motion: 2/10 site-wide, 8/10 in the single hero moment only.

The register is quiet authority: a broadsheet op-ed page rebuilt for the web, not a startup landing page. Confidence comes from typographic rhythm and restraint, not from decoration.

## 2. Color Palette & Roles

| Name | Value | Role |
|---|---|---|
| Paper | `oklch(98% 0.004 90)` (~`#F9F8F6`) | Page background — warm off-white, not pure white |
| Ink | `oklch(18% 0.01 260)` (~`#17181C`) | Body text, headlines — near-black, never pure `#000` |
| Ink Muted | `oklch(45% 0.01 260)` (~`#5A5C63`) | Metadata, timestamps, secondary captions — still passes 4.5:1 on Paper |
| Hairline | `oklch(90% 0.005 90)` (~`#E4E2DD`) | Dividers, borders — 1px only, never a shadow |
| Signal Red | `oklch(38% 0.16 25)` (~`#9E2B25`) | The one accent: links, tags, hero element, active states. Used sparingly (≤10% of any viewport) |

Derivation: Ink Muted and Hairline are OKLCH lightness steps off Ink/Paper, not separately invented grays — keeps the neutral ramp coherent. Signal Red is deliberately darker and less saturated than a "hazard red" (rejects the industrial-brutalist `#E61919` and any Coca-Cola/AI-purple defaults) — it should read as an editorial red (closer to a masthead rule or an oxblood pull-quote mark) than an alert.

Dark mode: invert to a graphite/charcoal base (`oklch(20% 0.01 260)` background, `oklch(94% 0.005 90)` text), same Signal Red accent, same hairline logic at lower opacity. Out of scope for v1 unless requested — flag before building.

## 3. Typography Rules

- **Display/headline**: a high-contrast editorial serif (`Fraunces` or `Editorial New` — distinctive, not a generic serif default like Georgia/Times/Garamond). Used for H1/H2, essay titles, the hero statement. Tight-ish tracking, weight does the hierarchy work, not size alone.
- **Body**: a comfortable humanist sans (`Inter` is banned by every design-taste skill in this stack for exactly this reason — it's the default AI/SaaS tell; use `Söhne`-adjacent alternative such as `Public Sans` or `Source Sans 3`) at 18–20px, line-height 1.6–1.7, measure 65–75ch.
- **Mono**: none needed site-wide — this isn't a dashboard. Reserve a mono face only if the podcast/video metadata ever needs timestamps (`IBM Plex Mono`, small, sparingly).
- Turkish diacritics (ş, ğ, ı, İ, ö, ü, ç) must render correctly in both faces at all weights used — verify before locking font choice.

## 4. Component Stylings

- **Links (in body copy)**: Signal Red, underline always visible (not hover-only — this is a reading site, discoverability over cleanliness).
- **Tags/category labels**: small caps or uppercase, Ink Muted, no pill/badge chrome (rejects the "SaaS tag chip" default).
- **Buttons (newsletter submit, nav CTA)**: flat rectangle or minimally rounded (2–4px, not the "generously rounded 2.5rem" SaaS default), Ink fill / Paper text or outline — no gradients, no glow, tactile 1px translate on `:active` only.
- **Cards**: avoid where possible. The essay index is a list (title/date/excerpt), not a card grid — cards read as "blog template." If a container is needed (video/podcast strip), use a hairline top-border, not a shadowed box.
- **Newsletter form**: label above input, single accent-colored submit, inline success/error text — no toast, no confetti.
- **Nav**: text-only wordmark + 4–5 text links, no icons, no hamburger-as-decoration on desktop.

## 5. Layout Principles

- CSS Grid for page structure; Flexbox for inline component alignment. No `calc()` percentage hacks.
- Content max-width ~720px for essay body (65–75ch), ~1100px for index/grid pages.
- Spacing scale: 4px base, editorial multiples (4/8/16/24/32/48/64/96) — generous vertical rhythm between sections, tight rhythm within a paragraph block.
- Mobile-first collapse below 768px, single column, no horizontal scroll anywhere.
- `min-h-[100dvh]` for the hero section, never `h-screen` (iOS Safari jump).

## 6. Motion & Interaction

Two completely separate motion budgets, per `PRODUCT.md`'s core principle:

**Everywhere except the homepage hero** — near-zero motion:
- Link/button state changes: color/underline transition, 120–150ms, ease-out. That's it.
- Optional: a single subtle fade-up (12px translate + opacity, 400ms, ease-out, `IntersectionObserver`-triggered, no stagger-cascade, no shine/gradient sweep) for the homepage's "recent videos/podcast" strip only — this is the one idea worth keeping from Magic UI's `text-reveal`, reimplemented plainly. Essay reader pages get **zero** motion, per spec.
- Respect `prefers-reduced-motion` globally — this rule isn't hero-specific.

**Homepage hero only** — the one signature moment:
- React Three Fiber scene, camera/object state driven by scroll position via GSAP `ScrollTrigger` (scrub, not autoplay) — confirmed current APIs via Context7 at build time.
- One motif tied to the site's subject (not decorative noise) — to be chosen when the hero is designed (v0 checkpoint), not invented here.
- Static image/poster-frame fallback for `prefers-reduced-motion: reduce`.
- Lazy-loaded off the critical rendering path; no other route loads WebGL at all (hard constraint from `PRODUCT.md`'s Accessibility section).

## 7. Anti-Patterns (explicit bans)

- No gradient text, no glow/shine sweep, no aurora/shimmer effects (bans the Magic UI text components directly).
- No pure black `#000000` / pure white `#FFFFFF`.
- No `Inter`, no generic serif default (Times/Georgia/Garamond) for the display face.
- No card-soup feature grids, no bento grid, no 3-equal-column feature row.
- No uppercase tracked "eyebrows" above every section, no decorative `01/02/03` numbering.
- No hero-metric blocks, no fake stats.
- No emojis in UI copy.
- No WebGL/3D outside the homepage hero — no exceptions.
- No light-gray body text "for elegance" — 4.5:1 minimum, always.

## Open decision before build

Signal Red's exact hex (`#9E2B25` above) is my proposed value, not yet visually confirmed against the serif/sans pairing — flag for a quick visual check once the v0 draft is up, per `web-design-engineer`'s Checkpoint 2.
