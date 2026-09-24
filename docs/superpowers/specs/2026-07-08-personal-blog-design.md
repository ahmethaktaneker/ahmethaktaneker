# Ahmet Haktan Eker — Personal Blog Design Spec

Date: 2026-07-08

## Purpose

A personal blog/media hub for Ahmet Haktan Eker: political writing (yazılar), YouTube video links, and podcast episodes. Not a job-hunting portfolio — a durable general professional/public presence. Turkish only. Primary audience is new readers arriving via search or shared links, not just existing followers, so the site must establish credibility quickly for a first-time visitor landing on a single article.

Content priority: **Yazılar (essays) is the core/primary content type.** Videolar and Podcast are secondary — they're largely the same material shared on other platforms, so they're presented with lower visual prominence, even though technically embedded in full.

## Tone

Editorial / serious journalism — think NYT Opinion or The Atlantic. Restrained, typographic, credible. Not minimal-diary-quiet, not bold/brutalist-loud.

One deliberate exception: the homepage hero carries a single scroll-scrubbed 3D signature moment (see Visual design system) to avoid reading as a generic blog template — but this is confined to the homepage only and does not extend into the reading experience.

No existing brand assets (no logo, no photo, no locked colors, no domain yet) — a typographic identity is being designed from scratch.

## 1. Architecture & stack

- **Framework**: Next.js (App Router, TypeScript), deployed on Vercel. Push to `main` = production deploy.
- **Content**: Markdown/MDX files committed to the repo under `content/essays/`, `content/videos/`, `content/podcast/`. Each file has frontmatter: `title`, `slug`, `date`, `excerpt`, `tags`; video/podcast entries additionally have `platform: youtube | spotify` and an embed id.
- **Parsing/rendering**: `gray-matter` for frontmatter + `next-mdx-remote` for rendering. No content-layer framework (Velite/Contentlayen) — unnecessary complexity for a solo author at this scale (YAGNI).
- **No CMS, no database, no admin UI.** Publishing a new post means writing an `.mdx` file and pushing to git.
- **Styling**: Tailwind CSS as the utility layer, but the actual type scale, spacing scale, and color tokens are a custom editorial system — not default Tailwind aesthetics. Built during implementation using the already-installed `design-taste-frontend`, `high-end-visual-design`, and `web-design-guidelines` skills, rather than re-deriving design guidance from scratch in this spec.
- **Homepage hero motion**: one signature scroll-scrubbed 3D moment, built with React Three Fiber + GSAP ScrollTrigger, camera/object state driven directly by scroll position. Ships a static/reduced-motion fallback (respects `prefers-reduced-motion`) and lazy-loads off the critical rendering path. Confined to the homepage hero only — every other page (essay reader, video/podcast index, about, contact) is plain, fast HTML/CSS with zero WebGL.
- **Newsletter**: Buttondown. A small Next.js API route accepts the submitted email and forwards it to Buttondown's API — the only server-side logic in the app.

## 2. Site structure / IA

| Route | Purpose | Visual weight |
|---|---|---|
| `/` | Homepage: 3D hero moment, then 1–3 featured essays, a slim strip of recent videos/podcast episodes, newsletter signup in footer | Essays prominent, video/podcast strip is quiet |
| `/yazilar` | Essay index — title, date, excerpt | Primary |
| `/yazilar/[slug]` | Full essay reader — pure editorial typography, comfortable measure, no 3D/motion | Primary |
| `/videolar` | Embedded YouTube grid/list | Secondary |
| `/podcast` | Episode list; each entry embeds a YouTube or Spotify player per its `platform` frontmatter field | Secondary |
| `/hakkimda` | About | — |
| `/iletisim` | Contact — email link, possibly a simple form | — |

Newsletter signup is a reusable component (footer + after essay body), not a standalone page.

## 3. Content data flow

Author writes an `.mdx` file with frontmatter → commits to git → pushes to `main` → Vercel rebuilds → `generateStaticParams` reads the relevant content directory at build time → pages render fully static, no runtime data fetching for content. The only runtime server code is the newsletter API route forwarding to Buttondown.

## 4. Visual design system

- Palette: near-black text on off-white (not pure black/white — softer contrast for long reads), one restrained accent color used sparingly (links, tags, the 3D hero element). No gradients, no glassmorphism, no card-soup feature grids, no generic SaaS patterns.
- Typography: an editorial headline face (serif or high-contrast display) paired with a comfortable reading face for body text; line length ~65–75 characters; generous line-height tuned for long-form Turkish political writing.
- Precise type scale, spacing scale, and color tokens are produced during implementation, not fixed in this spec — direction is fixed, values are not.

### 3D hero reference synthesis (knowledge-based, not live-crawled — WebSearch was rate-limited during this session)

Patterns observed across Awwwards/Godly-caliber 3D-scroll sites (Basement.studio, Active Theory, Lusion, Zajno, Resn, Ueno, Anton & Irene) and Apple's product pages:

- The 3D/WebGL element is confined to a single hero/focal moment, never applied page-wide.
- Motion is scroll-scrubbed (GSAP ScrollTrigger + Three.js/R3F), not autoplaying — reader controls pacing via scroll.
- One deliberate motif tied to the site's subject, not decorative noise.
- Always ships a static/reduced-motion fallback and lazy-loads off critical path for Core Web Vitals.
- Typography and 3D never compete for attention in the same viewport.

Rationale for hero-only scope on this site: a political-essay blog depends on reading trust and speed for cold visitors arriving via search/shares. A full WebGL scroll experience reads as "creative-agency reel" and risks undercutting credibility, plus adds real performance/accessibility risk. Confining it to the homepage hero gets a distinctive, premium signature without compromising the reading experience.

## 5. Testing / verification

- `tsc` and lint must pass.
- Playwright smoke coverage: homepage renders (3D hero + reduced-motion fallback verified), an essay page renders and is readable, video/podcast embeds load, newsletter form submits successfully.
- Use the installed `verify` / `verification-quality` skills before any phase is considered done — behavior must be observed in a real browser, not inferred from passing typecheck/tests alone.

## Out of scope for v1

- No comments system
- No i18n / English version (Turkish only)
- No CMS or admin UI
- No multi-author support
- Analytics: not decided yet — revisit before launch
