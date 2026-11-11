/* =========================================================
   Moving between pages of the site (main ↔ portfolio) without it feeling like a reload.
   - Leaving: the header and the atmosphere stay; only the content fades out (html.is-leaving),
     the header pill position is remembered, then the next page loads.
   - Arriving: the header is there at once (html.is-return, set by an inline script in <head> before
     paint) and its pill slides on from where it was; the content fades in.
   - The splash plays once per visit. Coming back to the main page from inside the site never replays it.
   sessionStorage only; when storage is unavailable everything falls back to the normal behaviour.
   ========================================================= */
const NAV_KEY = 'pius-nav', INTRO_KEY = 'pius-intro';
export type NavState = { t: number; pill?: { x: number; w: number } | null };

const store = {
  get(k: string) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { sessionStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  del(k: string) { try { sessionStorage.removeItem(k); } catch { /* storage unavailable */ } },
};

/** state left by the previous page (valid for 15 s), read once */
let arrival: NavState | null | undefined;
export function readArrival(): NavState | null {
  if (arrival !== undefined) return arrival;
  arrival = null;
  const raw = store.get(NAV_KEY);
  if (raw) { try { const s = JSON.parse(raw) as NavState; if (Date.now() - s.t < 15000) arrival = s; } catch { /* ignore */ } }
  store.del(NAV_KEY);
  return arrival;
}
export const introSeen = () => store.get(INTRO_KEY) === '1';
export const markIntroSeen = () => store.set(INTRO_KEY, '1');

/** inline script for <head>: marks a return visit before first paint (no header slide, no splash flash) */
export const RETURN_SCRIPT = `try{var n=sessionStorage.getItem('${NAV_KEY}'),r=sessionStorage.getItem('${INTRO_KEY}')==='1';if(n){var s=JSON.parse(n);if(Date.now()-s.t<15000)r=true}if(r)document.documentElement.classList.add('is-return')}catch(e){}`;

function pillRect(): NavState['pill'] {
  const pill = document.querySelector<HTMLElement>('#hdr nav [aria-hidden="true"]');
  if (!pill || pill.style.opacity === '0' || !pill.style.width) return null;
  const m = /translateX\(([-\d.]+)px\)/.exec(pill.style.transform);
  return m ? { x: +m[1], w: parseFloat(pill.style.width) } : null;
}

/** intercept links to other pages of this site: fade the content, remember the header, then go */
export function bindPageLeave(): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const raw = a.getAttribute('href') || '';
    if (!raw || raw.startsWith('#') || /^(mailto|tel):/i.test(raw)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return; /* same page */
    e.preventDefault();
    store.set(NAV_KEY, JSON.stringify({ t: Date.now(), pill: pillRect() } satisfies NavState));
    document.documentElement.classList.add('is-leaving');
    window.dispatchEvent(new CustomEvent('pius:navigate'));
    setTimeout(() => { location.href = url.href; }, 360);
  };
  /* back/forward cache: never come back to a faded page */
  const onShow = (e: PageTransitionEvent) => { if (e.persisted) document.documentElement.classList.remove('is-leaving'); };
  document.addEventListener('click', onClick);
  addEventListener('pageshow', onShow);
  return () => { document.removeEventListener('click', onClick); removeEventListener('pageshow', onShow); };
}
