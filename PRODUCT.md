# Product

## Register

brand

## Users

Primarily cold visitors arriving via search results or a shared link, landing on a single essay — not existing followers browsing a familiar site. They need to trust the writer and the writing within seconds, with no prior context. Secondary audience: returning readers checking for new essays, videos, or podcast episodes. All content is in Turkish.

## Product Purpose

A durable personal platform for Ahmet Haktan Eker's political writing, with YouTube video and podcast content as secondary, lower-emphasis material (largely the same content shared on other platforms). Not a job-hunting portfolio — a general professional/public presence. Success looks like: a stranger reads a full essay, understands the site is serious rather than a template blog, and optionally subscribes to the newsletter or shares the piece.

## Brand Personality

Credible, restrained, incisive. Voice and visual language both read as serious journalism (NYT Opinion / The Atlantic register) — confident through clarity and restraint, not through decoration. One deliberate exception: a single scroll-scrubbed 3D signature moment on the homepage hero establishes the site isn't a generic template, but it does not extend into the reading experience.

## Anti-references

- Generic SaaS/blog templates: hero-metric blocks, card-soup feature grids, tiny uppercase tracked eyebrows above every section, numbered section markers (01/02/03) used as decoration rather than real sequence.
- Gradient text, glassmorphism-as-default, unearned glow/blur.
- A full "creative agency reel" treatment (WebGL/3D applied page-wide) — this undercuts reading trust for a cold visitor arriving to read about politics, and is explicitly scoped out of every page except the homepage hero.
- Light-gray body text "for elegance" — this is a reading-first site; body copy contrast is non-negotiable.

## Design Principles

- Reading trust over decoration: essay pages are pure editorial typography, zero motion/3D, fast to first paint.
- One deliberate signature moment, not many: the 3D hero is the site's single "this isn't a template" statement; everywhere else stays quiet.
- Typography does the work: hierarchy and credibility come from type choices and rhythm, not from added visual elements.
- Secondary content stays secondary: video/podcast sections are visually quieter than essays, matching their lower content priority.
- Five-second credibility test: a first-time visitor from a search result must be able to tell this is a serious, intentional site before reading a single word of body copy.

## Accessibility & Inclusion

WCAG 2.1 AA baseline. Body text must meet ≥4.5:1 contrast (no light-gray-for-elegance body copy). The homepage 3D hero must respect `prefers-reduced-motion: reduce` with a static fallback, and no other route may load WebGL/3D at all.
