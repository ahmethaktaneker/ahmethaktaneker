import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type EssayFrontmatter = {
  draft?: boolean;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export type MediaFrontmatter = {
  draft?: boolean;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  platform: "youtube" | "spotify";
  embedId: string;
};

export type Essay = EssayFrontmatter & { content: string };
export type Media = MediaFrontmatter & { content: string };

function readCollection<T>(collection: string): (T & { content: string })[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      return { ...(data as T), content };
    })
    .sort((a, b) => {
      const dateA = (a as unknown as { date: string }).date;
      const dateB = (b as unknown as { date: string }).date;
      return dateB.localeCompare(dateA);
    });
}

export function getEssays(): Essay[] {
  return readCollection<EssayFrontmatter>("essays").filter((essay) => !essay.draft);
}

export function getEssay(slug: string): Essay | undefined {
  return getEssays().find((essay) => essay.slug === slug);
}

export function getVideos(): Media[] {
  return readCollection<MediaFrontmatter>("videos").filter((item) => !item.draft);
}

export function getPodcastEpisodes(): Media[] {
  return readCollection<MediaFrontmatter>("podcast").filter((item) => !item.draft);
}

export const formatDate = (date: string) => new Date(date).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export const readingMinutes = (content: string) => Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));
