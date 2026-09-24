# Personal Blog (Ahmet Haktan Eker) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Turkish-language personal blog described in `docs/superpowers/specs/2026-07-08-personal-blog-design.md` — essay-first, with secondary video/podcast sections, a homepage-only 3D scroll hero, and a Buttondown newsletter — as a static Next.js site on Vercel.

**Architecture:** Next.js App Router site with zero database/CMS. Content is `.mdx` files with frontmatter, parsed by `gray-matter` + validated by `zod`, rendered via `next-mdx-remote/rsc`. All pages are statically generated at build time except a single API route that forwards newsletter signups to Buttondown. A homepage-only client component renders a scroll-scrubbed 3D cube (React Three Fiber + GSAP ScrollTrigger) with a static fallback for `prefers-reduced-motion`; no other route loads Three.js/GSAP.

**Tech Stack:** Next.js 15 (App Router, TypeScript, `src/` dir), Tailwind CSS v4, `gray-matter`, `next-mdx-remote`, `zod`, `gsap`, `three`, `@react-three/fiber`, Vitest (unit tests), `@playwright/test` (e2e/smoke tests).

## Global Constraints

- Turkish only — no i18n, all UI copy and content in Turkish.
- No CMS, no database, no admin UI — content is `.mdx` files committed to git; publishing = commit + push to `main`.
- 3D/WebGL motion is confined to the homepage hero only. Every other route must render zero `<canvas>` elements.
- The 3D hero must respect `prefers-reduced-motion: reduce` with a static fallback.
- Newsletter signups go through Buttondown; the API key is read from `process.env.BUTTONDOWN_API_KEY`, never hardcoded.
- Out of scope for v1 (do not build): comments system, English/i18n version, CMS/admin UI, multi-author support, analytics.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `public/` (from `create-next-app`)
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Modify: `.gitignore` (merge Next.js ignores with existing entries)
- Delete: `agents/code-reviewer.md`, `agents/devops.md`, `agents/frontend-engineer.md`, `agents/motion-designer.md`, `agents/productdesigner.md`, `agents/qa-engineer.md`, `agents/ux-reviewer.md`, `agents/visual-director.md` (empty stubs, unrelated to this project)

**Interfaces:**
- Produces: an npm project with `dev`, `build`, `start`, `lint`, `test:unit`, `test:e2e` scripts; alias `@/*` → `src/*`.

- [ ] **Step 1: Remove the empty stub agent files**

```bash
git rm agents/code-reviewer.md agents/devops.md agents/frontend-engineer.md agents/motion-designer.md agents/productdesigner.md agents/qa-engineer.md agents/ux-reviewer.md agents/visual-director.md
rmdir agents
```

- [ ] **Step 2: Scaffold the Next.js app in place**

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes --disable-git
```

Expected: `package.json`, `src/app/`, `next.config.ts`, `tsconfig.json` are created; no error about conflicting files (the existing `.git`, `.gitignore`, `docs/`, `.claude*`, `.tokensave` do not conflict with Next.js scaffold files).

- [ ] **Step 3: Reconcile `.gitignore`**

Open `.gitignore` and confirm it contains both the pre-existing entry and the Next.js entries `create-next-app` adds (`/node_modules`, `/.next/`, `.env*.local`, etc.) plus a line for Playwright's report output:

```
.tokensave
/node_modules
/.next/
.env*.local
/test-results/
/playwright-report/
```

- [ ] **Step 4: Remove `AGENTS.md` if `create-next-app` generated one**

```bash
rm -f AGENTS.md
```

(This project already has `CLAUDE.md` for agent instructions; no need for a duplicate.)

- [ ] **Step 5: Install test tooling**

```bash
npm install --save-dev vitest @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 6: Add Vitest config**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 7: Add Playwright config**

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

- [ ] **Step 8: Add test scripts to `package.json`**

Add to the `"scripts"` block (keep existing `dev`/`build`/`start`/`lint`):

```json
"test:unit": "vitest run",
"test:e2e": "playwright test"
```

- [ ] **Step 9: Verify the scaffold builds**

```bash
npm run build
```

Expected: build completes successfully with the default Next.js starter page.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js app, remove unused agent stubs, wire up Vitest/Playwright"
```

---

### Task 2: Content loader + fixture content

**Files:**
- Create: `src/lib/content.ts`
- Create: `content/essays/ilk-yazi.mdx`, `content/essays/ikinci-yazi.mdx`
- Create: `content/videos/ornek-video.mdx`
- Create: `content/podcast/ornek-bolum.mdx`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Produces: `getEssays(): ContentEntry<EssayMeta>[]`, `getEssayBySlug(slug: string): ContentEntry<EssayMeta> | undefined`, `getVideos(): ContentEntry<EmbedMeta>[]`, `getPodcastEpisodes(): ContentEntry<EmbedMeta>[]`, types `EssayMeta`, `EmbedMeta`, `ContentEntry<T>`. These are consumed by Tasks 5, 6, and 8.

- [ ] **Step 1: Install content dependencies**

```bash
npm install gray-matter next-mdx-remote zod
```

- [ ] **Step 2: Create fixture content files**

```mdx
<!-- content/essays/ilk-yazi.mdx -->
---
title: "İlk Yazı"
slug: "ilk-yazi"
date: "2026-01-10"
excerpt: "Bu sitenin ilk denemesi."
tags: ["giriş"]
---

Bu, sitenin ilk yazısıdır. İçerik buraya gelecek.
```

```mdx
<!-- content/essays/ikinci-yazi.mdx -->
---
title: "İkinci Yazı"
slug: "ikinci-yazi"
date: "2026-02-15"
excerpt: "İkinci deneme yazısı."
tags: ["siyaset"]
---

Bu, ikinci yazı örneğidir.
```

```mdx
<!-- content/videos/ornek-video.mdx -->
---
title: "Örnek Video"
slug: "ornek-video"
date: "2026-03-01"
excerpt: "YouTube video örneği."
tags: []
platform: "youtube"
embedId: "dQw4w9WgXcQ"
---

Video açıklaması.
```

```mdx
<!-- content/podcast/ornek-bolum.mdx -->
---
title: "Örnek Bölüm"
slug: "ornek-bolum"
date: "2026-03-05"
excerpt: "Podcast bölüm örneği."
tags: []
platform: "spotify"
embedId: "4rOoJ6Egrf8K2IrywzwOMk"
---

Bölüm notları.
```

- [ ] **Step 3: Write the failing test**

```ts
// tests/unit/content.test.ts
import { describe, expect, it } from "vitest";
import { getEssayBySlug, getEssays, getPodcastEpisodes, getVideos } from "@/lib/content";

describe("content loader", () => {
  it("loads essays sorted by date, newest first", () => {
    const essays = getEssays();
    expect(essays.length).toBeGreaterThanOrEqual(2);
    expect(essays[0].meta.date >= essays[1].meta.date).toBe(true);
  });

  it("finds an essay by slug", () => {
    const entry = getEssayBySlug("ilk-yazi");
    expect(entry?.meta.title).toBe("İlk Yazı");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getEssayBySlug("olmayan-slug")).toBeUndefined();
  });

  it("loads videos with platform metadata", () => {
    const videos = getVideos();
    expect(videos[0].meta.platform).toBe("youtube");
  });

  it("loads podcast episodes with platform metadata", () => {
    const episodes = getPodcastEpisodes();
    expect(episodes.length).toBeGreaterThanOrEqual(1);
    expect(["youtube", "spotify"]).toContain(episodes[0].meta.platform);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module '@/lib/content'`

- [ ] **Step 5: Implement the content loader**

```ts
// src/lib/content.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const contentRoot = path.join(process.cwd(), "content");

const baseFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.string(),
  excerpt: z.string(),
  tags: z.array(z.string()).default([]),
});

const embedFrontmatterSchema = baseFrontmatterSchema.extend({
  platform: z.enum(["youtube", "spotify"]),
  embedId: z.string(),
});

export type EssayMeta = z.infer<typeof baseFrontmatterSchema>;
export type EmbedMeta = z.infer<typeof embedFrontmatterSchema>;

export type ContentEntry<T> = {
  meta: T;
  content: string;
};

function readMdxFilenames(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((filename) => filename.endsWith(".mdx"));
}

function loadEntries<T extends { date: string }>(
  section: "essays" | "videos" | "podcast",
  schema: z.ZodType<T>
): ContentEntry<T>[] {
  const dir = path.join(contentRoot, section);

  const entries = readMdxFilenames(dir).map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), "utf8");
    const { data, content } = matter(raw);
    return { meta: schema.parse(data), content };
  });

  return entries.sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}

export function getEssays(): ContentEntry<EssayMeta>[] {
  return loadEntries("essays", baseFrontmatterSchema);
}

export function getEssayBySlug(slug: string): ContentEntry<EssayMeta> | undefined {
  return getEssays().find((entry) => entry.meta.slug === slug);
}

export function getVideos(): ContentEntry<EmbedMeta>[] {
  return loadEntries("videos", embedFrontmatterSchema);
}

export function getPodcastEpisodes(): ContentEntry<EmbedMeta>[] {
  return loadEntries("podcast", embedFrontmatterSchema);
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test:unit`
Expected: PASS (5 tests)

- [ ] **Step 7: Commit**

```bash
git add src/lib/content.ts content/ tests/unit/content.test.ts
git commit -m "Add content loader with fixture essays, video, and podcast entries"
```

---

### Task 3: Newsletter component + Buttondown API route

**Files:**
- Create: `src/lib/buttondown.ts`
- Create: `src/app/api/newsletter/route.ts`
- Create: `src/components/newsletter-form.tsx`
- Create: `.env.example`
- Test: `tests/unit/buttondown.test.ts`

**Interfaces:**
- Produces: `subscribeToButtondown(email: string): Promise<{ ok: true } | { ok: false; error: string }>` (consumed by the API route), `NewsletterForm` React component (consumed by Task 4's `SiteFooter` and Task 5's essay page).
- Consumes: `process.env.BUTTONDOWN_API_KEY`.

- [ ] **Step 1: Write the failing test for the Buttondown client**

```ts
// tests/unit/buttondown.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeToButtondown } from "@/lib/buttondown";

describe("subscribeToButtondown", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("returns an error when BUTTONDOWN_API_KEY is missing", async () => {
    vi.stubEnv("BUTTONDOWN_API_KEY", "");
    const result = await subscribeToButtondown("test@example.com");
    expect(result).toEqual({ ok: false, error: "BUTTONDOWN_API_KEY is not configured" });
  });

  it("returns ok on a successful subscription", async () => {
    vi.stubEnv("BUTTONDOWN_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    );
    const result = await subscribeToButtondown("test@example.com");
    expect(result).toEqual({ ok: true });
  });

  it("returns the API error message on failure", async () => {
    vi.stubEnv("BUTTONDOWN_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ email: ["Bu e-posta zaten kayıtlı."] }),
      })
    );
    const result = await subscribeToButtondown("test@example.com");
    expect(result).toEqual({ ok: false, error: "Bu e-posta zaten kayıtlı." });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module '@/lib/buttondown'`

- [ ] **Step 3: Implement the Buttondown client**

```ts
// src/lib/buttondown.ts
export type SubscribeResult = { ok: true } | { ok: false; error: string };

export async function subscribeToButtondown(email: string): Promise<SubscribeResult> {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "BUTTONDOWN_API_KEY is not configured" };
  }

  const response = await fetch("https://api.buttondown.email/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    return { ok: true };
  }

  const body = await response.json().catch(() => ({}));
  const message = Array.isArray(body?.email) ? body.email[0] : undefined;
  return { ok: false, error: message ?? "Abonelik başarısız oldu" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit`
Expected: PASS (3 tests)

- [ ] **Step 5: Add the API route**

```ts
// src/app/api/newsletter/route.ts
import { NextResponse } from "next/server";
import { subscribeToButtondown } from "@/lib/buttondown";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { ok: false, error: "Geçerli bir e-posta adresi girin" },
      { status: 400 }
    );
  }

  const result = await subscribeToButtondown(email);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
```

- [ ] **Step 6: Add the newsletter form component**

```tsx
// src/components/newsletter-form.tsx
"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Bir şeyler ters gitti");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Bağlantı hatası, tekrar deneyin");
    }
  }

  if (status === "success") {
    return <p data-testid="newsletter-success">Teşekkürler, abone oldunuz.</p>;
  }

  return (
    <form onSubmit={handleSubmit} data-testid="newsletter-form">
      <label htmlFor="newsletter-email">E-posta bülteni</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="ornek@eposta.com"
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Gönderiliyor..." : "Abone ol"}
      </button>
      {status === "error" && <p role="alert">{errorMessage}</p>}
    </form>
  );
}
```

- [ ] **Step 7: Add `.env.example`**

```
BUTTONDOWN_API_KEY=
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/buttondown.ts src/app/api/newsletter/route.ts src/components/newsletter-form.tsx tests/unit/buttondown.test.ts .env.example
git commit -m "Add Buttondown newsletter API route and form component"
```

---

### Task 4: Design system & shared layout

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/site-header.tsx`
- Create: `src/components/site-footer.tsx`
- Test: `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes: `NewsletterForm` from Task 3.
- Produces: `SiteHeader`, `SiteFooter` components rendered by the root layout on every route (consumed implicitly by all later page tasks).

- [ ] **Step 1: Write the failing e2e test**

```ts
// tests/e2e/layout.spec.ts
import { test, expect } from "@playwright/test";

test("every page shows the site nav and the footer newsletter form", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Yazılar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Videolar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Podcast" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Hakkımda" })).toBeVisible();
  await expect(page.getByRole("link", { name: "İletişim" })).toBeVisible();
  await expect(page.getByTestId("newsletter-form")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — nav links not found (default `create-next-app` starter page has no nav)

- [ ] **Step 3: Add editorial fonts and base styles**

```css
/* src/app/globals.css — replace the generated starter content with: */
@import "tailwindcss";

:root {
  --color-paper: #fafaf8;
  --color-ink: #1a1a1a;
  --color-accent: #8a2d2d;
}

body {
  background-color: var(--color-paper);
  color: var(--color-ink);
}

.font-editorial {
  font-family: var(--font-serif), Georgia, serif;
}

.font-reading {
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

- [ ] **Step 4: Add the header component**

```tsx
// src/components/site-header.tsx
import Link from "next/link";

const navItems = [
  { href: "/yazilar", label: "Yazılar" },
  { href: "/videolar", label: "Videolar" },
  { href: "/podcast", label: "Podcast" },
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 px-6 py-4">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="font-editorial text-lg">
          Ahmet Haktan Eker
        </Link>
        <ul className="flex gap-6 text-sm">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 5: Add the footer component**

```tsx
// src/components/site-footer.tsx
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <NewsletterForm />
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Wire fonts and layout together**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Ahmet Haktan Eker",
  description: "Siyaset üzerine yazılar, videolar ve podcast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${sans.variable} ${serif.variable} font-reading antialiased`}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/components/site-header.tsx src/components/site-footer.tsx tests/e2e/layout.spec.ts
git commit -m "Add editorial fonts, site header/nav, and footer with newsletter form"
```

---

### Task 5: Essay pages (index + reader)

**Files:**
- Create: `src/app/yazilar/page.tsx`
- Create: `src/app/yazilar/[slug]/page.tsx`
- Test: `tests/e2e/yazilar.spec.ts`

**Interfaces:**
- Consumes: `getEssays`, `getEssayBySlug` from Task 2; `NewsletterForm` from Task 3.

- [ ] **Step 1: Write the failing e2e test**

```ts
// tests/e2e/yazilar.spec.ts
import { test, expect } from "@playwright/test";

test("essay index lists essays and links to the reader page", async ({ page }) => {
  await page.goto("/yazilar");
  await expect(page.getByRole("heading", { name: "Yazılar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "İlk Yazı" })).toBeVisible();
});

test("essay reader page renders content and a newsletter prompt", async ({ page }) => {
  await page.goto("/yazilar/ilk-yazi");
  await expect(page.getByRole("heading", { name: "İlk Yazı" })).toBeVisible();
  await expect(page.getByText("Bu, sitenin ilk yazısıdır.")).toBeVisible();
  await expect(page.getByTestId("newsletter-form")).toBeVisible();
});

test("unknown slug returns a 404", async ({ page }) => {
  const response = await page.goto("/yazilar/olmayan-slug");
  expect(response?.status()).toBe(404);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `/yazilar` returns 404 (route doesn't exist yet)

- [ ] **Step 3: Add the essay index page**

```tsx
// src/app/yazilar/page.tsx
import Link from "next/link";
import { getEssays } from "@/lib/content";

export default function EssaysIndexPage() {
  const essays = getEssays();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-editorial text-3xl">Yazılar</h1>
      <ul className="mt-8 space-y-8">
        {essays.map((entry) => (
          <li key={entry.meta.slug}>
            <Link
              href={`/yazilar/${entry.meta.slug}`}
              className="text-xl font-medium hover:underline"
            >
              {entry.meta.title}
            </Link>
            <p className="mt-1 text-sm text-neutral-500">{entry.meta.date}</p>
            <p className="mt-2 text-neutral-700">{entry.meta.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Add the essay reader page**

```tsx
// src/app/yazilar/[slug]/page.tsx
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { NewsletterForm } from "@/components/newsletter-form";
import { getEssayBySlug, getEssays } from "@/lib/content";

export function generateStaticParams() {
  return getEssays().map((entry) => ({ slug: entry.meta.slug }));
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEssayBySlug(slug);

  if (!entry) {
    notFound();
  }

  const { content } = await compileMDX({ source: entry.content });

  return (
    <article className="mx-auto max-w-[70ch] px-6 py-16">
      <h1 className="font-editorial text-4xl">{entry.meta.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">{entry.meta.date}</p>
      <div className="prose prose-neutral mt-8 max-w-none">{content}</div>
      <div className="mt-16 border-t border-neutral-200 pt-8">
        <NewsletterForm />
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/app/yazilar tests/e2e/yazilar.spec.ts
git commit -m "Add essay index and reader pages"
```

---

### Task 6: Video & podcast pages

**Files:**
- Create: `src/components/youtube-embed.tsx`
- Create: `src/components/spotify-embed.tsx`
- Create: `src/app/videolar/page.tsx`
- Create: `src/app/podcast/page.tsx`
- Test: `tests/e2e/videolar-podcast.spec.ts`

**Interfaces:**
- Consumes: `getVideos`, `getPodcastEpisodes` from Task 2.
- Produces: `YoutubeEmbed({ embedId, title })`, `SpotifyEmbed({ embedId, title })`.

- [ ] **Step 1: Write the failing e2e test**

```ts
// tests/e2e/videolar-podcast.spec.ts
import { test, expect } from "@playwright/test";

test("videolar page embeds a YouTube iframe", async ({ page }) => {
  await page.goto("/videolar");
  await expect(page.getByRole("heading", { name: "Videolar" })).toBeVisible();
  const frame = page.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]');
  await expect(frame).toHaveCount(1);
});

test("podcast page embeds a Spotify iframe for a spotify episode", async ({ page }) => {
  await page.goto("/podcast");
  await expect(page.getByRole("heading", { name: "Podcast" })).toBeVisible();
  const frame = page.locator('iframe[src*="open.spotify.com/embed/episode/"]');
  await expect(frame).toHaveCount(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `/videolar` and `/podcast` return 404

- [ ] **Step 3: Add the embed components**

```tsx
// src/components/youtube-embed.tsx
export function YoutubeEmbed({ embedId, title }: { embedId: string; title: string }) {
  return (
    <div className="aspect-video w-full">
      <iframe
        src={`https://www.youtube.com/embed/${embedId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
```

```tsx
// src/components/spotify-embed.tsx
export function SpotifyEmbed({ embedId, title }: { embedId: string; title: string }) {
  return (
    <iframe
      src={`https://open.spotify.com/embed/episode/${embedId}`}
      title={title}
      loading="lazy"
      allow="encrypted-media"
      className="h-[152px] w-full rounded-xl"
    />
  );
}
```

- [ ] **Step 4: Add the videolar page**

```tsx
// src/app/videolar/page.tsx
import { getVideos } from "@/lib/content";
import { YoutubeEmbed } from "@/components/youtube-embed";

export default function VideolarPage() {
  const videos = getVideos();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-medium text-neutral-700">Videolar</h1>
      <ul className="mt-8 space-y-10">
        {videos.map((entry) => (
          <li key={entry.meta.slug}>
            <YoutubeEmbed embedId={entry.meta.embedId} title={entry.meta.title} />
            <p className="mt-3 font-medium">{entry.meta.title}</p>
            <p className="text-sm text-neutral-500">{entry.meta.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Add the podcast page**

```tsx
// src/app/podcast/page.tsx
import { getPodcastEpisodes } from "@/lib/content";
import { SpotifyEmbed } from "@/components/spotify-embed";
import { YoutubeEmbed } from "@/components/youtube-embed";

export default function PodcastPage() {
  const episodes = getPodcastEpisodes();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-medium text-neutral-700">Podcast</h1>
      <ul className="mt-8 space-y-10">
        {episodes.map((entry) => (
          <li key={entry.meta.slug}>
            {entry.meta.platform === "spotify" ? (
              <SpotifyEmbed embedId={entry.meta.embedId} title={entry.meta.title} />
            ) : (
              <YoutubeEmbed embedId={entry.meta.embedId} title={entry.meta.title} />
            )}
            <p className="mt-3 font-medium">{entry.meta.title}</p>
            <p className="text-sm text-neutral-500">{entry.meta.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add src/components/youtube-embed.tsx src/components/spotify-embed.tsx src/app/videolar src/app/podcast tests/e2e/videolar-podcast.spec.ts
git commit -m "Add videolar and podcast pages with YouTube/Spotify embeds"
```

---

### Task 7: About & Contact pages

**Files:**
- Create: `src/app/hakkimda/page.tsx`
- Create: `src/app/iletisim/page.tsx`
- Test: `tests/e2e/static-pages.spec.ts`

- [ ] **Step 1: Write the failing e2e test**

```ts
// tests/e2e/static-pages.spec.ts
import { test, expect } from "@playwright/test";

test("hakkimda page renders", async ({ page }) => {
  await page.goto("/hakkimda");
  await expect(page.getByRole("heading", { name: "Hakkımda" })).toBeVisible();
});

test("iletisim page renders a contact email link", async ({ page }) => {
  await page.goto("/iletisim");
  await expect(page.getByRole("heading", { name: "İletişim" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^merhaba@/ })).toHaveAttribute(
    "href",
    /^mailto:/
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — both routes 404

- [ ] **Step 3: Add the about page**

```tsx
// src/app/hakkimda/page.tsx
export default function HakkimdaPage() {
  return (
    <div className="mx-auto max-w-[70ch] px-6 py-16">
      <h1 className="font-editorial text-3xl">Hakkımda</h1>
      <p className="mt-6 text-neutral-700">
        Bu site, siyaset üzerine yazılarımı, video ve podcast içeriklerimi bir
        araya getirdiğim kişisel bir alan.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Add the contact page**

```tsx
// src/app/iletisim/page.tsx
export default function IletisimPage() {
  return (
    <div className="mx-auto max-w-[70ch] px-6 py-16">
      <h1 className="font-editorial text-3xl">İletişim</h1>
      <p className="mt-6 text-neutral-700">
        Sorularınız ve geri bildirimleriniz için:{" "}
        <a href="mailto:merhaba@ahmethaktaneker.com" className="underline">
          merhaba@ahmethaktaneker.com
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/app/hakkimda src/app/iletisim tests/e2e/static-pages.spec.ts
git commit -m "Add hakkimda and iletisim static pages"
```

---

### Task 8: Homepage composition

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/e2e/homepage.spec.ts`

**Interfaces:**
- Consumes: `getEssays`, `getVideos`, `getPodcastEpisodes` from Task 2.

- [ ] **Step 1: Write the failing e2e test**

```ts
// tests/e2e/homepage.spec.ts
import { test, expect } from "@playwright/test";

test("homepage shows featured essays and a video/podcast strip", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Son yazılar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "İkinci Yazı" })).toBeVisible();
  await expect(page.getByText("Örnek Video")).toBeVisible();
  await expect(page.getByText("Örnek Bölüm")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — homepage still shows the `create-next-app` starter content

- [ ] **Step 3: Replace the homepage**

```tsx
// src/app/page.tsx
import Link from "next/link";
import { getEssays, getPodcastEpisodes, getVideos } from "@/lib/content";

export default function HomePage() {
  const featuredEssays = getEssays().slice(0, 3);
  const recentHighlights = [...getVideos(), ...getPodcastEpisodes()].slice(0, 4);

  return (
    <>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-editorial text-2xl">Son yazılar</h2>
        <ul className="mt-6 space-y-6">
          {featuredEssays.map((entry) => (
            <li key={entry.meta.slug}>
              <Link
                href={`/yazilar/${entry.meta.slug}`}
                className="text-lg font-medium hover:underline"
              >
                {entry.meta.title}
              </Link>
              <p className="mt-1 text-sm text-neutral-500">{entry.meta.date}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-8 text-sm text-neutral-500">
        <h2 className="font-medium text-neutral-700">Videolar & Podcast</h2>
        <ul className="mt-4 space-y-2">
          {recentHighlights.map((entry) => (
            <li key={entry.meta.slug}>{entry.meta.title}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx tests/e2e/homepage.spec.ts
git commit -m "Compose homepage from featured essays and recent video/podcast entries"
```

---

### Task 9: 3D scroll hero (homepage only)

**Files:**
- Create: `src/components/hero-scene-canvas.tsx`
- Create: `src/components/hero-scene.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/e2e/hero-motion.spec.ts`

**Interfaces:**
- Produces: `HeroScene` (client component, no props) — consumed only by the homepage.

- [ ] **Step 1: Install 3D/motion dependencies**

```bash
npm install three @react-three/fiber gsap
npm install --save-dev @types/three
```

- [ ] **Step 2: Write the failing e2e test**

```ts
// tests/e2e/hero-motion.spec.ts
import { test, expect } from "@playwright/test";

test.describe("homepage hero motion", () => {
  test("shows a 3D canvas when motion is not reduced", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(page.getByTestId("hero-3d")).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("shows a static fallback when motion is reduced", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByTestId("hero-static-fallback")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("essay pages never load the 3D canvas", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/yazilar");
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — no `hero-3d`/`hero-static-fallback` test ids exist yet

- [ ] **Step 4: Implement the R3F scene**

```tsx
// src/components/hero-scene-canvas.tsx
"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Mesh } from "three";

gsap.registerPlugin(ScrollTrigger);

function ScrollCube() {
  const meshRef = useRef<Mesh>(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        rotationRef.current = self.progress * Math.PI * 4;
      },
    });

    return () => trigger.kill();
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotationRef.current;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}

export function HeroSceneCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      <ScrollCube />
    </Canvas>
  );
}
```

- [ ] **Step 5: Implement the reduced-motion-aware wrapper**

```tsx
// src/components/hero-scene.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroSceneCanvas = dynamic(
  () => import("./hero-scene-canvas").then((mod) => mod.HeroSceneCanvas),
  { ssr: false }
);

export function HeroScene() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);
    const listener = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div
        data-testid="hero-static-fallback"
        className="flex h-[70vh] items-center justify-center bg-neutral-100"
      >
        <h1 className="font-editorial text-4xl">Ahmet Haktan Eker</h1>
      </div>
    );
  }

  return (
    <div data-testid="hero-3d" className="h-[150vh]">
      <HeroSceneCanvas />
    </div>
  );
}
```

- [ ] **Step 6: Wire the hero into the homepage**

```tsx
// src/app/page.tsx — add the import and render it first in the fragment
import { HeroScene } from "@/components/hero-scene";
// ...
  return (
    <>
      <HeroScene />
      <section className="mx-auto max-w-3xl px-6 py-16">
      {/* ...unchanged... */}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS (3 tests)

- [ ] **Step 8: Commit**

```bash
git add src/components/hero-scene-canvas.tsx src/components/hero-scene.tsx src/app/page.tsx tests/e2e/hero-motion.spec.ts package.json package-lock.json
git commit -m "Add homepage-only scroll-scrubbed 3D hero with reduced-motion fallback"
```

---

### Task 10: Full verification pass + deployment config

**Files:**
- Create: `README.md`
- Modify: `.env.example` (confirm complete)
- No new app code — this task runs the full suite and fixes anything broken by integration.

- [ ] **Step 1: Run the full unit suite**

```bash
npm run test:unit
```

Expected: all unit tests pass (content loader + buttondown client).

- [ ] **Step 2: Run the full e2e suite**

```bash
npm run test:e2e
```

Expected: all e2e specs pass (layout, yazilar, videolar-podcast, static-pages, homepage, hero-motion).

- [ ] **Step 3: Run typecheck and lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: both exit 0.

- [ ] **Step 4: Add a minimal README**

```markdown
# ahmethaktaneker

Personal blog — political essays, videos, and podcast episodes.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Adding content

Add a new `.mdx` file with frontmatter to `content/essays/`, `content/videos/`,
or `content/podcast/`, then commit and push to `main`.

## Environment variables

Copy `.env.example` to `.env.local` and set `BUTTONDOWN_API_KEY`.

## Testing

\`\`\`bash
npm run test:unit
npm run test:e2e
\`\`\`
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Add project README with dev, content, and testing instructions"
```

## Self-Review Notes

- **Spec coverage:** architecture (Task 1-2), IA/all routes (Tasks 5-8), content data flow (Task 2), visual design direction (Task 4), newsletter (Task 3), 3D hero scoped to homepage (Task 9), testing/verification (Task 10, plus a test in every task). Out-of-scope items (comments, i18n, CMS, multi-author, analytics) are intentionally absent from every task.
- **Type consistency:** `ContentEntry<T>`, `EssayMeta`, `EmbedMeta` from Task 2 are the only types referenced by Tasks 5, 6, and 8; `SubscribeResult` from Task 3 is used only inside `buttondown.ts` and the API route. No signature drift between tasks.
- Deployment to Vercel itself (connecting the repo, setting `BUTTONDOWN_API_KEY` in the Vercel dashboard) is a manual one-time action outside this repo and is intentionally left to the user rather than scripted.
