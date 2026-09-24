import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getEssays, formatDate, readingMinutes } from "@/lib/content";
export const metadata = { title: "Yazılar — Ahmet Haktan Eker", description: "Hukuk, toplum, kültür ve hayat üzerine yazılar, notlar ve denemeler." };
export default function EssaysIndexPage() {
 const essays = getEssays();
 return <section className="editorial-section archive"><p className="eyebrow">Yazı arşivi</p><h1>Düşüncelerin<br /><em>izinde.</em></h1><p className="archive-intro">Farklı konular, ortak bir merak. Yazılar, notlar ve denemeler.</p>
 <div className="archive-rule"><span>Tüm yazılar</span><span>{String(essays.length).padStart(2, "0")}</span></div>
 {essays.length ? essays.map((essay, i) => <Link key={essay.slug} className="essay-row" href={`/yazilar/${essay.slug}`}><span className="essay-index">{String(i+1).padStart(2,"0")}</span><div><p className="essay-meta">{formatDate(essay.date)} · {readingMinutes(essay.content)} dk okuma</p><h2>{essay.title}</h2><p className="essay-description">{essay.excerpt}</p><p className="essay-tags">{essay.tags.join(" / ")}</p></div><ArrowUpRight aria-hidden size={24} /></Link>) : <div className="archive-empty"><h2>İlk yazılar yakında.</h2><p>Yayımlanan metinlerin tamamını burada bulabilirsiniz.</p></div>}
 </section>;
}
