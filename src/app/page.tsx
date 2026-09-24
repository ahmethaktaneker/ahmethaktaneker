import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EditorialHero } from "@/components/editorial-hero";
import { getEssays, formatDate, readingMinutes } from "@/lib/content";

export default function HomePage() {
  const essays = getEssays();
  const [featured, ...recent] = essays;
  return <>
    <EditorialHero />
    <section id="yazilar" className="editorial-section">
      <div className="section-heading"><p className="eyebrow">01 / Yazılar</p><Link href="/yazilar" className="text-link">Arşive git <ArrowUpRight size={16} /></Link></div>
      {featured ? <Link href={`/yazilar/${featured.slug}`} className="featured-essay group">
        <div><p className="eyebrow">Öne çıkan / {featured.tags.join(" · ")}</p><h2>{featured.title}</h2><p className="essay-description">{featured.excerpt}</p><span className="text-link">Okumaya başla <ArrowUpRight size={20} /></span></div>
        <div className="essay-art" aria-hidden="true"><span>01</span><i /><i /><i /></div>
        <p className="essay-meta"><time dateTime={featured.date}>{formatDate(featured.date)}</time> · {readingMinutes(featured.content)} dk okuma</p>
      </Link> : <div className="empty-editorial"><span aria-hidden="true" className="empty-number">01</span><div><h2>Yeni bir sayfa.</h2><p>Yazılarımı burada bir araya getiriyorum. İlk metinler yakında.</p><Link href="/hakkimda" className="text-link">Hakkımda <ArrowUpRight size={18} /></Link></div></div>}
      {recent.slice(0, 3).map((essay, i) => <Link key={essay.slug} href={`/yazilar/${essay.slug}`} className="essay-row"><span className="essay-index">{String(i + 2).padStart(2, "0")}</span><div><p className="essay-meta">{formatDate(essay.date)} · {readingMinutes(essay.content)} dk</p><h3>{essay.title}</h3><p className="essay-description">{essay.excerpt}</p></div><ArrowUpRight aria-hidden size={24} /></Link>)}
    </section>
    <section className="about-strip"><div className="editorial-section"><p className="eyebrow">02 / Kısaca</p><div className="about-grid"><h2>Okumak, sormak,<br /><em>yazmak.</em></h2><div><p>Ben Ahmet Haktan Eker. Koç Üniversitesi Hukuk Fakültesi öğrencisiyim. Bu sayfa, ilgimi çeken konular üzerine düşüncelerimi ve yazılarımı paylaştığım kişisel alanım.</p><Link href="/hakkimda" className="text-link">Beni tanıyın <ArrowUpRight size={18} /></Link></div></div></div></section>
  </>;
}
