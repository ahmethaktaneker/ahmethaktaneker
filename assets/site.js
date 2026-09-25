(() => {
  'use strict';
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  // The monogram is always usable; a supplied photo replaces it after loading.
  document.querySelectorAll('[data-portrait]').forEach(frame => {
    const img = frame.querySelector('img');
    img.addEventListener('load', () => { img.hidden = false; frame.classList.add('has-photo'); }, { once: true });
    img.addEventListener('error', () => { img.removeAttribute('src'); }, { once: true });
    img.src = img.dataset.src;
  });
  const copy = document.querySelector('.copy-email');
  if (copy && navigator.clipboard && window.isSecureContext) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.querySelector('.copy-status');
      try { await navigator.clipboard.writeText('ahmethaktaneker@gmail.com'); status.textContent = 'E-posta adresi kopyalandı.'; }
      catch { status.textContent = 'Kopyalanamadı. Yukarıdaki adresi seçip kopyalayabilirsin.'; }
    });
  }
  const journey = document.querySelector('.hero-journey');
  if (!journey) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const heading = journey.querySelector('.hero-heading');
  const folio = journey.querySelector('.folio');
  const cover = journey.querySelector('.folio-cover');
  const track = journey.querySelector('.journey-track span');
  const page = journey.querySelector('.folio-page');
  const pageLink = journey.querySelector('.folio-page a');
  let pending = false;
  const clamp = (v, lo=0, hi=1) => Math.min(hi, Math.max(lo, v));
  function paint() {
    pending = false;
    const enabled = !reduce.matches && innerHeight >= 650;
    document.documentElement.classList.toggle('motion-ready', enabled);
    if (!enabled) {
      [heading, folio, cover, track].forEach(el => el.removeAttribute('style'));
      pageLink.tabIndex = -1;
      page.inert = true;
      page.setAttribute('aria-hidden', 'true');
      return;
    }
    const rect = journey.getBoundingClientRect();
    const stageHeight = journey.querySelector('.hero-stage').offsetHeight;
    const progress = clamp(-rect.top / Math.max(1, rect.height - stageHeight));
    const open = clamp((progress - .12) / .76);
    const eased = open * open * (3 - 2 * open);
    const mobile = innerWidth <= 700;
    heading.style.opacity = String(1 - progress * .92);
    heading.style.transform = `translateY(${-progress * (mobile ? 22 : 45)}px) scale(${1-progress*.07})`;
    folio.style.transform = `translateX(${progress * (mobile ? 7 : 9)}%) rotate(${9-progress*9}deg)`;
    cover.style.transform = `rotateY(${-eased*148}deg)`;
    track.style.transform = `scaleX(${progress})`;
    pageLink.tabIndex = progress > .65 ? 0 : -1;
    page.inert = progress <= .65;
    page.setAttribute('aria-hidden', String(progress <= .65));
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  reduce.addEventListener('change', schedule);
  paint();
})();
