import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return <footer className="site-footer"><div className="editorial-section">
    <p className="eyebrow">İletişimde kalalım</p>
    <div className="footer-heading"><Link href="/iletisim">Bir merhaba.<ArrowUpRight aria-hidden /></Link><p>Bir yazı, bir soru<br />ya da yeni bir bakış açısı.</p></div>
    {process.env.BUTTONDOWN_API_KEY && <div className="max-w-md my-12"><h2 className="font-display text-2xl">Yeni yazılardan haberdar olun.</h2><NewsletterForm className="mt-6" /></div>}
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Ahmet Haktan Eker</span><a href="mailto:ahmethaktaneker@gmail.com">E-posta ↗</a><Link href="/yazilar">Yazılar ↗</Link></div>
  </div></footer>;
}
