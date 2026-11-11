'use client';
/* Card on the list page. The media area normalises any mix of screens:
   phones → a row of up to three frames, desktop → a browser frame (+ one phone in front if given),
   photo/graphic → full-bleed image. Images keep their ratio, so cards stay aligned whatever comes in. */
import type { Lang } from '@/lib/i18n';
import { jaBreakable } from './blocks/common';
import { T } from '@/lib/i18n';
import { paths } from '@/lib/paths';
import type { ImageAsset, Project } from '@/lib/portfolio/types';
import { accentVars, flowOf, imagesOf, platformNames, srcOf, tx, whenOf } from '@/lib/portfolio/text';
import Screen from './media/Screen';
import { Arrow, NavLink } from './shared';
import s from './List.module.css';

export const platformLabel = (p: Project) => Array.from(new Set(p.platforms.map(x => ({ app: 'App', web: 'Web', admin: 'Admin', desktop: 'Desktop', api: 'API' })[x.type]))).join(' · ');

/* Fit factor of a framed screen: frame height = width × (1/ratio + bezel), so width = height × k.
   With the media box ratio (--A, set in CSS) the card can size every frame from the height it may use,
   which keeps each device fully inside the card whatever ratio comes in. */
const fitK = (im: ImageAsset) => {
  const r = im.width / im.height;
  const bezel = im.kind === 'mobile' ? 0.046 : im.kind === 'tablet' ? 0.036 : 0.03;
  return 1 / (1 / r + bezel);
};
const fitStyle = (im: ImageAsset, fill: number) => ({ ['--k' as string]: fitK(im).toFixed(4), ['--fill' as string]: fill }) as React.CSSProperties;

function CardMedia({ p, lang, eager }: { p: Project; lang: Lang; eager?: boolean }) {
  const all = imagesOf(p, p.thumbnail);
  const live = all.filter(i => !!i.src);
  const flow = !live.length && all.length ? flowOf(p) : undefined;
  const imgs = live.length ? live : all;
  const first = imgs[0];
  if (flow) {
    /* screens still pending: the card shows how the work runs — real content, no empty browser frame.
       Three typographic arrangements (from the project's page layout) so these cards do not repeat one picture. */
    const steps = flow.steps.map(st => tx(st.title, lang));
    const look = p.theme.layout === 'editorial' ? 'span' : p.theme.layout === 'stage' || p.theme.layout === 'rail' ? 'chain' : 'list';
    return (
      <div className={s.card__plan} data-look={look} aria-hidden="true">
        {look === 'span' ? (
          <div className={s.card__planS}>
            <b>{String(steps.length).padStart(2, '0')}<small>{T('pf.plan.steps', lang)}</small></b>
            <p><span>{steps[0]}</span><i>→</i><span>{steps[steps.length - 1]}</span></p>
          </div>
        ) : look === 'chain' ? (
          <p className={s.card__planC}>{steps.slice(0, 5).map((t, i) => <span key={i}>{i > 0 && <i>→</i>}{t}</span>)}</p>
        ) : (
          <ol className={s.card__planL}>
            {steps.slice(0, 4).map((t, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{t}</li>)}
          </ol>
        )}
        <span className={s.card__planF}>{platformNames(p, lang).join(' · ')}</span>
      </div>
    );
  }
  if (!first) {
    /* text-only project: the tech stack is the picture */
    return (
      <div className={s.card__stack} aria-hidden="true">
        <span className={s.card__stackT}>{tx(p.industry || p.subtitle, lang)}</span>
        <p className={s.card__stackL}>{(p.stack || []).map((x, i) => <span key={x}>{i > 0 && <i>/</i>}{x}</span>)}</p>
        {whenOf(p) && <span className={s.card__stackY}>{whenOf(p)}</span>}
      </div>
    );
  }
  if (first.kind === 'photo' || first.kind === 'graphic') {
    const src = srcOf(first, lang);
    return src ? <img className={s.card__bleed} src={src} alt={tx(first.alt, lang)} width={first.width} height={first.height} loading={eager ? 'eager' : 'lazy'} /> : <Screen img={first} lang={lang} className={s.card__one} />;
  }
  if (first.kind === 'desktop') {
    const phone = imgs.find(i => i.kind === 'mobile' || i.kind === 'tablet');
    return (
      <div className={`${s.fit} ${phone ? s['fit--pair'] : ''}`}>
        <Screen img={first} lang={lang} eager={eager} className={s.fit__desk} style={fitStyle(first, phone ? 0.74 : 0.8)} />
        {phone && <Screen img={phone} lang={lang} eager={eager} className={s.fit__front} style={fitStyle(phone, 0.62)} />}
      </div>
    );
  }
  /* phones / tablets: whole devices, side by side; a lone screen gets a blurred copy of itself behind it */
  const phones = imgs.filter(i => i.kind === 'mobile' || i.kind === 'tablet').slice(0, 3);
  const backdrop = phones.length === 1 ? srcOf(phones[0], lang) : null;
  return (
    <>
      {backdrop && <img className={s.card__backdrop} src={backdrop} alt="" aria-hidden="true" loading={eager ? 'eager' : 'lazy'} />}
      <div className={`${s.fit} ${s['fit--row']}`} data-n={phones.length}>
        {phones.map((im, i) => (
          <Screen key={im.id} img={im} lang={lang} eager={eager} className={s.fit__dev}
            style={fitStyle(im, phones.length === 3 && i !== 1 ? 0.7 : 0.82)} sizes="(max-width: 899px) 40vw, 18vw" />
        ))}
      </div>
    </>
  );
}

/* "BRAND — what it is" → name + descriptor (the descriptor falls back to the subtitle) */
const splitTitle = (t: string) => {
  const m = t.split(/\s+[—–-]\s+/);
  return m.length > 1 ? [m[0], m.slice(1).join(' — ')] as const : [t, ''] as const;
};

/** span: 'lead' = first card of the tab (2 columns, horizontal) · 'fill' = closes a short last row */
export default function PortfolioCard({ p, lang, eager, index, span }: { p: Project; lang: Lang; eager?: boolean; index?: number; span?: 'lead' | 'fill2' | 'fill3' }) {
  const [name, desc] = splitTitle(tx(p.title, lang));
  const cover = p.blocks.find(b => b.type === 'cover') as { eyebrow?: Project['title'] } | undefined;
  const badge = cover?.eyebrow ? tx(cover.eyebrow, lang) : '';
  const facts = [platformLabel(p), p.year, p.projectState && T(`pf.state.${p.projectState}`, lang)].filter(Boolean).join(' · ');
  /* the industry says more than the filter categories; categories are the fallback */
  const kind = p.industry ? tx(p.industry, lang) : p.categories.map(c => T(`pf.cat.${c}`, lang)).join(' · ');
  const pending = !imagesOf(p, p.thumbnail).some(i => !!i.src) && p.thumbnail.length > 0;
  /* wide cards: the flow steps (a pending project already shows them in its media area) */
  const steps = span && !pending ? (flowOf(p)?.steps || []).slice(0, 5).map(st => tx(st.title, lang)) : [];
  return (
    <article className={`${s.card} ${span ? s[`card--${span}`] : ''}`} data-reveal="" style={accentVars(p)} data-span={span}>
      <NavLink href={paths.project(p.slug)} className={s.card__link} aria-label={`${tx(p.title, lang)} — ${T('pf.view', lang)}`}>
        <div className={`${s.card__media} ${p.theme.cover === 'dark' ? s['card__media--dark'] : ''}`}>
          <CardMedia p={p} lang={lang} eager={eager} />
          {badge && <span className={s.card__badge}>{badge}</span>}
          {pending && <span className={s.card__pend}>{T('pf.plan.badge', lang)}</span>}
        </div>
        <div className={s.card__body}>
          <p className={s.card__cats}>
            {index !== undefined && <span className={s.card__no}>{String(index + 1).padStart(2, '0')}</span>}
            <span className={s.card__kind}>{kind}</span>
          </p>
          <h2 className={s.card__title}>{lang === 'ja' ? jaBreakable(name) : name}</h2>
          <p className={s.card__desc}>{lang === 'ja' && desc ? jaBreakable(desc) : (desc || tx(p.subtitle, lang))}</p>
          <p className={s.card__sum}>{tx(p.summary, lang)}</p>
          {/* wide cards have room for the work flow: what the user does, step by step */}
          {span && steps.length > 0 && (
            <ol className={s.card__steps}>{steps.map((t, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{t}</li>)}</ol>
          )}
          <div className={s.card__foot}>
            <span className={s.card__facts}>{facts}</span>
            <span className={s.card__go}><Arrow /></span>
          </div>
        </div>
      </NavLink>
    </article>
  );
}
