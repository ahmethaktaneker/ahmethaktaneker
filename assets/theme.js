(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'ahe-theme';
  let theme = 'dark';
  try { if (localStorage.getItem(key) === 'light') theme = 'light'; } catch {}
  const apply = value => {
    root.dataset.theme = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = value === 'light' ? '#ede9e0' : '#111310';
    document.querySelectorAll('.theme-toggle').forEach(button => {
      const label = value === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç';
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  };
  apply(theme);
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem(key, next); } catch {}
      });
    });
  });
  addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue === 'light' ? 'light' : 'dark');
  });
})();
