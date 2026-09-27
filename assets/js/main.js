// Renders the editable content (content/site.js) into the page and starts the
// fly-through. Business content stays in semantic HTML; the canvas only paints.

import content from '../../content/site.js';
import { startFlight, loadManifest, frameUrl } from './flight.js';
import { clamp } from './timeline.js';

const $ = (sel, el = document) => el.querySelector(sel);
const slot = (name) => $(`[data-render="${name}"]`);
const TBC = 'À confirmer';

const params = new URLSearchParams(location.search);
const manifestUrl = params.get('frames') === 'dev' ? content.media.devManifest : content.media.manifest;

function motionMode() {
  if (params.get('motion') === 'static') return 'static';
  if (params.get('motion') === 'full') return 'full';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = navigator.connection;
  const constrained = Boolean(c?.saveData) || /(^|-)2g$/.test(c?.effectiveType || '') || (navigator.deviceMemory && navigator.deviceMemory < 2);
  return reduce || constrained ? 'static' : 'full';
}

// ── Small builders ───────────────────────────────────────────────────────────
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'html') node.innerHTML = v; // trusted: headings from content/site.js
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null) node.append(c);
  return node;
}

function resolveHref(href) {
  if (href?.startsWith('contact.')) return content.contact[href.slice(8)] || null;
  return href;
}

function actionLinks(actions = []) {
  return actions
    .map((a) => ({ ...a, href: resolveHref(a.href) }))
    .filter((a) => a.href)
    .map((a) => el('a', { class: `btn btn--${a.style || 'primary'}`, href: a.href, ...(a.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {}) }, a.label));
}

function contactFacts() {
  const c = content.contact;
  const hours = Array.isArray(c.hours) ? c.hours.map(([d, h]) => `${d} : ${h}`).join(' · ') : c.hours;
  return [
    ['Adresse', c.address ? `${c.address}, ${content.brand.city}` : `${TBC}, ${content.brand.city}`],
    ['Horaires', hours || TBC],
    ['Téléphone', c.phone || TBC],
  ];
}

const price = new Intl.NumberFormat('fr-FR');

// ── Render ───────────────────────────────────────────────────────────────────
function render(manifest) {
  const stillUrl = (seconds) => {
    if (!manifest) return null;
    const base = new URL('.', new URL(manifestUrl, location.href)).href;
    const sources = (manifest.sources?.length ? manifest.sources : [{ dir: '', width: manifest.width }]).slice().sort((a, b) => b.width - a.width);
    const i = clamp(Math.round(seconds * manifest.fps), 0, manifest.count - 1);
    return frameUrl(base, manifest, sources[0], i);
  };

  slot('nav').replaceChildren(...content.nav.map((n) => el('li', {}, el('a', { href: n.href }, n.label))));
  Object.assign(slot('nav-cta'), { href: content.navCta.href, textContent: content.navCta.label });

  // Chapters carried by the flight
  slot('chapters').replaceChildren(
    ...content.chapters.map((ch) => {
      const H = ch.level === 1 ? 'h1' : 'h2';
      const facts = ch.showContact
        ? el('dl', { class: 'facts facts--compact' }, contactFacts().map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', {}, v))))
        : null;
      return el('article', { class: `chapter chapter--${ch.align || 'left'}`, 'data-chapter': ch.id, 'data-scene': ch.scene, 'data-still': ch.still ?? 0, 'aria-label': ch.scene },
        el('div', { class: 'chapter__inner' },
          el('p', { class: 'eyebrow' }, ch.eyebrow),
          el(H, { class: ch.level === 1 ? 'display' : 'h1', html: ch.heading }),
          el('p', { class: 'lead' }, ch.body),
          facts,
          el('div', { class: 'actions' }, actionLinks(ch.actions))));
    }),
  );

  // Menu
  const m = content.menu;
  slot('menu-heading').innerHTML = m.heading;
  slot('menu-intro').textContent = m.intro;
  slot('menu-note').textContent = m.note;
  slot('menu').replaceChildren(
    ...m.categories.map((cat) => el('div', { class: `menu__group menu__group--${cat.id}` },
      el('h3', { class: 'menu__title' }, cat.name),
      el('ul', { class: `menu__list ${cat.id === 'burgers' ? 'menu__list--cards' : ''}` },
        cat.items.map((it) => el('li', { class: cat.id === 'burgers' ? 'card' : 'menu-row' },
          cat.id === 'burgers'
            ? el('div', { class: 'card__media' }, it.image ? el('img', { src: it.image, alt: it.name, loading: 'lazy' }) : el('img', { class: 'card__placeholder', src: 'assets/brand/logo-mark.svg', alt: '', loading: 'lazy' }))
            : null,
          el('div', { class: 'card__body' },
            el('div', { class: 'card__top' },
              el('h4', { class: 'card__name' }, it.name),
              el('span', { class: 'card__price' }, it.price ? `${price.format(it.price)} ${m.currency}` : TBC)),
            el('p', { class: 'card__desc' }, it.desc),
            it.tags?.length ? el('ul', { class: 'tags', 'aria-label': 'Particularités' }, it.tags.map((t) => el('li', { class: `tag tag--${t.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}` }, t))) : null)))))),
  );

  // Craft
  slot('craft-heading').innerHTML = content.craft.heading;
  slot('craft-intro').textContent = content.craft.intro;
  slot('pillars').replaceChildren(
    ...content.craft.pillars.map((p, i) => {
      const src = stillUrl(p.still);
      return el('li', { class: 'pillar' },
        el('div', { class: 'pillar__media' }, src ? el('img', { src, alt: '', loading: 'lazy' }) : el('span', { class: 'pillar__num', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0'))),
        el('h3', { class: 'pillar__title' }, p.title),
        el('p', {}, p.body));
    }),
  );

  // Order
  slot('order-heading').innerHTML = content.order.heading;
  slot('modes').replaceChildren(...content.order.modes.map((mode, i) => el('li', { class: 'mode' }, el('span', { class: 'mode__num', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')), el('h3', { class: 'mode__title' }, mode.title), el('p', {}, mode.body))));
  const c = content.contact;
  const orderActions = [
    c.phone && el('a', { class: 'btn btn--primary', href: `tel:${c.phone.replace(/\s/g, '')}` }, `Appeler le ${c.phone}`),
    c.whatsapp && el('a', { class: 'btn btn--ghost-dark', href: `https://wa.me/${c.whatsapp}`, target: '_blank', rel: 'noopener' }, 'Commander sur WhatsApp'),
    el('a', { class: 'btn btn--ghost-dark', href: '#contact' }, 'Réserver une table'),
  ].filter(Boolean);
  if (!c.phone && !c.whatsapp) orderActions.unshift(el('p', { class: 'fineprint' }, 'Numéro de commande à confirmer.'));
  slot('order-actions').replaceChildren(...orderActions);

  // Visit
  slot('visit-heading').innerHTML = content.visit.heading;
  slot('visit-body').textContent = content.visit.body;
  slot('facts').replaceChildren(...contactFacts().map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', {}, v))));
  slot('visit-actions').replaceChildren(...actionLinks([
    { label: 'Itinéraire', href: 'contact.mapUrl', style: 'primary' },
    { label: 'Réserver', href: '#contact', style: 'ghost' },
  ]));
  const aerial = stillUrl(content.visit.still);
  if (aerial) {
    const fig = slot('visit-media');
    fig.querySelector('.media-placeholder').replaceWith(el('img', { src: aerial, alt: 'Vue aérienne du restaurant Lamah Burger, de son parking et de la route', loading: 'lazy' }));
  }

  // Form
  slot('form-heading').innerHTML = content.form.heading;
  slot('form-intro').textContent = content.form.intro;
  slot('form-submit').textContent = content.form.submitLabel;

  // Footer
  slot('footer-nav').replaceChildren(...content.nav.map((n) => el('li', {}, el('a', { href: n.href }, n.label))));
  slot('footer-note').textContent = content.demo ? content.footer.note : '';
  slot('year').textContent = String(new Date().getFullYear());
}

// ── Behaviour ────────────────────────────────────────────────────────────────
function setupHeader() {
  const header = $('.site-header');
  const surfaces = [...document.querySelectorAll('[data-surface]')];
  const update = () => {
    const y = header.offsetHeight / 2;
    const under = surfaces.find((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    const over = under?.dataset.surface ?? 'dark';
    if (header.dataset.over !== over) header.dataset.over = over;
    header.classList.toggle('is-scrolled', scrollY > 8);
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();

  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('nav-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && header.classList.contains('nav-open')) { setOpen(false); toggle.focus(); } });
}

function setupForm() {
  const form = slot('form');
  const status = form.querySelector('.form__status');
  const date = form.querySelector('#f-date');
  date.min = new Date().toISOString().slice(0, 10);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const { formEndpoint } = content.contact;
    if (!formEndpoint) {
      status.textContent = content.form.demoMessage;
      status.classList.add('is-demo');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(String(res.status));
      status.textContent = content.form.successMessage;
      status.classList.add('is-ok');
      form.reset();
    } catch {
      status.textContent = content.form.errorMessage;
      status.classList.add('is-error');
    } finally {
      btn.disabled = false;
    }
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
(async () => {
  const manifest = await loadManifest(manifestUrl);
  render(manifest);
  setupHeader();
  setupForm();
  const mode = motionMode();
  document.documentElement.dataset.motion = mode;
  startFlight({ root: $('#vol'), flight: content.flight, manifest, manifestUrl, mode });
  document.documentElement.classList.add('is-ready');
})();
