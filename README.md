# Ahmet Haktan Eker — personal website

Next.js App Router, React and Tailwind. The editorial redesign keeps a dark olive/charcoal and gold identity with scroll-linked geometry. The homepage uses a passive scroll listener and CSS transforms instead of loading the existing WebGL scene. Reduced motion uses a static, unpinned layout.

## Development

```sh
npm ci
npm run dev
npm run lint
npm run build
```

## Publish a written piece

Add a trusted `.mdx` file in `content/essays/`:

```md
---
title: "Yazı başlığı"
slug: "yazi-basligi"
date: "2026-09-24"
excerpt: "Kısa açıklama."
tags: ["Deneme"]
draft: true
---

Yazının metni.
```

Set `draft: false` when ready. Drafts are excluded from listings, detail routes and sitemap. The newest published essay is featured automatically. Example content remains in the repository as drafts. Never accept untrusted MDX: it is compiled as code.

## Later additions

Video and podcast routes are retained, but not promoted in navigation. Their sample entries are drafts. The newsletter form is shown only when `BUTTONDOWN_API_KEY` is configured in the hosting environment. Do not commit that key.

## Review and deployment

Work branch: `feature/premium-editorial-redesign`, based on `feature/personal-blog-site`. Review a preview before merging into the Vercel production branch. SEO metadata assumes the final canonical domain is `https://www.ahmethaktaneker.com`; confirm the production domain before launch.
