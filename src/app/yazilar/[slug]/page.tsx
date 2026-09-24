import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import { ReadingControls } from "@/components/reading-controls";
import { getEssay, getEssays, formatDate, readingMinutes } from "@/lib/content";
export function generateStaticParams() { return getEssays().map((essay) => ({ slug: essay.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const essay = getEssay(slug); if (!essay) return {};
 return { title: `${essay.title} — Ahmet Haktan Eker`, description: essay.excerpt, alternates: { canonical: `/yazilar/${essay.slug}` }, openGraph: { type: "article", title: essay.title, description: essay.excerpt, publishedTime: essay.date, authors: ["Ahmet Haktan Eker"] } };
}
export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const essay = getEssay(slug); if (!essay) notFound();
 return <article id="essay" className="reading-page"><div className="reading-inner"><div className="reading-toolbar"><Link href="/yazilar" className="text-link"><ArrowLeft size={16} />Tüm yazılar</Link><ReadingControls /></div><header className="essay-heading"><p className="eyebrow">{essay.tags.join(" / ")}</p><h1>{essay.title}</h1><p className="essay-description">{essay.excerpt}</p><p className="essay-meta">Ahmet Haktan Eker · <time dateTime={essay.date}>{formatDate(essay.date)}</time> · {readingMinutes(essay.content)} dk okuma</p></header><div className="prose-essay text-lg"><MDXRemote source={essay.content} /></div><div className="essay-end"><span aria-hidden>✦</span><Link href="/yazilar" className="text-link">Diğer yazılar <ArrowLeft size={16} /></Link></div></div></article>;
}
