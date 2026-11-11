/* =========================================================
   PDF layout of a project (/portfolio/[slug]/print/[lang]).
   Fixed-size pages built by paginate() from the same project data as the web page.
   No navigation, no links, no animation. Page numbers and the PIUS mark on every page.
   ========================================================= */
import type { Lang } from '@/lib/i18n';
import { jaBreakable, jaWords, latinEm } from '../blocks/common';
import { T } from '@/lib/i18n';
import { LOCKUP_VB } from '@/lib/logo';
import type { ImageAsset, Project } from '@/lib/portfolio/types';
import { PRINT_MODES, pagesFor, type PrintMode, type PrintPage } from '@/lib/portfolio/print';
import { accentVars, flowOf, imageOf, imagesOf, platformNames, tx, whenOf } from '@/lib/portfolio/text';
import { LockupPaths } from '../../Logo';
import Screen from '../media/Screen';
import { Lines } from '../blocks/common';
import PrintFormat from './PrintFormat';
import s from './Print.module.css';

const TAG = { app: 'APP', web: 'WEB', admin: 'ADMIN', desktop: 'DESKTOP', api: 'API' } as const;

/** screen sized by the page height so that it never overflows (keeps its ratio) */
function Fit({ img, lang, h = 'var(--scrH)' }: { img: ImageAsset; lang: Lang; h?: string }) {
  const r = img.width / img.height;
  return <div className={s.fit} style={{ width: `min(100%, calc(${h} * ${r.toFixed(4)}))` }}><Screen img={img} lang={lang} eager /></div>;
}

function Idx({ label, index }: { label?: string; index?: string }) {
  if (!label) return null;
  return <p className={s.idx}>{index && <span>{index}</span>}{label}</p>;
}

function Body({ pg, p, lang }: { pg: PrintPage; p: Project; lang: Lang }) {
  switch (pg.kind) {
    case 'cover': {
      const all = imagesOf(p, pg.b.images);
      /* screens not delivered yet: the cover shows the work flow in words instead of an empty frame */
      const live = all.filter(i => !!i.src);
      const flow = !live.length && all.length ? flowOf(p) : undefined;
      const phones = flow ? [] : live.length ? live : all;
      return (
        <div className={s.cover}>
          <div className={s.cover__txt}>
            <p className={s.cover__tags}>{[pg.b.eyebrow && tx(pg.b.eyebrow, lang), ...p.categories.map(c => T(`pf.cat.${c}`, lang))].filter(Boolean).join('  ·  ')}</p>
            <h1 className={s.cover__name} lang={lang} data-cjk={/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(tx(p.title, lang)) ? '' : undefined}
              data-len={/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(tx(p.title, lang)) ? undefined : tx(p.title, lang).length > 34 ? 'l' : tx(p.title, lang).length > 20 ? 'm' : undefined}
              style={{ ['--len' as string]: Math.max(4, ...(lang === 'ja' ? jaWords(tx(p.title, lang)) : tx(p.title, lang).split(/[ \t\n]+/)).map(w => latinEm(w))).toFixed(2) }}>{lang === 'ja' ? jaBreakable(tx(p.title, lang)) : tx(p.title, lang)}</h1>
            <p className={s.cover__sub}>{tx(p.subtitle, lang)}</p>
            <p className={s.cover__msg}><Lines text={tx(pg.b.headline, lang)} /></p>
            {pg.b.sub && <p className={s.cover__lead}>{tx(pg.b.sub, lang)}</p>}
          </div>
          {flow
            ? <div className={s.plan}>
                <p className={s.plan__t}><span>{tx(flow.heading, lang)}</span><span>{platformNames(p, lang).join(' · ')}</span></p>
                <ol>{flow.steps.slice(0, 6).map((st, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><b>{tx(st.title, lang)}</b></li>)}</ol>
                <p className={s.plan__f}>{T('pf.plan.note', lang)}</p>
              </div>
            : phones.length
            ? <div className={s.cover__vis} data-n={phones.length}>{phones.map(im => <Fit key={im.id} img={im} lang={lang} h={im.kind === 'mobile' ? 'var(--coverH)' : 'var(--scrH)'} />)}</div>
            : <div className={s.cover__stack}>
                <p className={s.cover__stackT}>{T('pf.f.stack', lang)}{whenOf(p) && <span>{whenOf(p)}</span>}</p>
                <ol>{(p.stack || []).map((x, i) => <li key={x}><span>{String(i + 1).padStart(2, '0')}</span>{x}</li>)}</ol>
              </div>}
        </div>
      );
    }
    case 'overview': {
      const facts: [string, string][] = [];
      if (p.industry) facts.push([T('pf.f.industry', lang), tx(p.industry, lang)]);
      facts.push([T('pf.f.platforms', lang), p.platforms.map(x => tx(x.label, lang) || ({ app: 'App', web: 'Web', admin: 'Admin', desktop: 'Desktop', api: 'API' } as Record<string, string>)[x.type]).join(', ')]);
      if (p.projectState) facts.push([T('pf.f.state', lang), T(`pf.state.${p.projectState}`, lang)]);
      if (p.period) facts.push([T('pf.f.period', lang), p.period]);
      else if (p.year) facts.push([T('pf.f.year', lang), String(p.year)]);
      if (p.stack?.length) facts.push([T('pf.f.stack', lang), p.stack.join(', ')]);
      const sc = p.scope.filter(x => !x.pending);
      if (sc.length) facts.push([T('pf.f.scope', lang), sc.map(x => (x.label ? tx(x.label, lang) : T(`pf.scope.${x.key}`, lang))).join(', ')]);
      return (
        <div className={s.ov}>
          <div className={s.ov__top}>
            <div>
              <Idx {...pg.b.section} />
              {pg.b.heading && <h2 className={s.h2}>{tx(pg.b.heading, lang)}</h2>}
              <p className={s.lead}>{tx(pg.b.lead, lang)}</p>
              <p className={s.txt}>{tx(p.overview, lang)}</p>
            </div>
            <div>
              <dl className={s.facts}>{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            </div>
          </div>
          {!!pg.b.goals?.length && (
            <ol className={s.goals} data-n={pg.b.goals.length}>
              {pg.b.goals.map((g, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><h3>{tx(g.title, lang)}</h3><p>{tx(g.body, lang)}</p></li>)}
            </ol>
          )}
        </div>
      );
    }
    case 'services':
      return (
        <div className={s.svc}>
          <Idx {...pg.b.section} />
          <h2 className={s.h2}>{tx(pg.b.heading, lang)}</h2>
          {pg.b.intro && <p className={s.txt}>{tx(pg.b.intro, lang)}</p>}
          <div className={s.svc__cols} data-n={pg.b.columns.length}>
            {pg.b.columns.map((c, i) => (
              <article key={i}>
                <p className={s.svc__tag}><span>{String(i + 1).padStart(2, '0')}</span>{TAG[c.platform]}</p>
                <h3>{tx(c.title, lang)}</h3>
                <p className={s.svc__aud}>{tx(c.audience, lang)}</p>
                <ul>{c.items.map((it, j) => <li key={j}>{tx(it, lang)}</li>)}</ul>
              </article>
            ))}
          </div>
          {pg.b.note && <p className={s.note}>{tx(pg.b.note, lang)}</p>}
        </div>
      );
    case 'flow':
      return (
        <div className={s.flow}>
          <div className={s.row}>
            <div><Idx {...pg.b.section} /><h2 className={s.h2}>{tx(pg.b.heading, lang)}</h2></div>
            {pg.b.intro && pg.part === 0 && <p className={s.txt}>{tx(pg.b.intro, lang)}</p>}
          </div>
          <ol className={s.flow__list} style={{ ['--n' as string]: pg.steps.length }}>
            {pg.steps.map((st, i) => (
              <li key={i}>
                {imageOf(p, st.image) && <Fit img={imageOf(p, st.image)!} lang={lang} h="var(--flowH)" />}
                <p className={s.flow__n}><span>{String(pg.part * pg.per + i + 1).padStart(2, '0')}</span></p>
                <h3>{tx(st.title, lang)}</h3>
                {st.body && <p>{tx(st.body, lang)}</p>}
              </li>
            ))}
          </ol>
        </div>
      );
    case 'feature':
      return (
        <div className={s.feat} data-kind={pg.images[0]?.kind}>
          <div className={s.feat__txt}>
            <Idx {...pg.b.section} />
            <h2 className={s.h2}>{tx(pg.b.heading, lang)}</h2>
            {pg.b.body && <p className={s.txt}>{tx(pg.b.body, lang)}</p>}
            {!!pg.b.bullets?.length && <ul className={s.bul}>{pg.b.bullets.map((x, i) => <li key={i}>{tx(x, lang)}</li>)}</ul>}
          </div>
          <div className={s.feat__media}>{pg.images.map(im => <Fit key={im.id} img={im} lang={lang} />)}</div>
        </div>
      );
    case 'screens':
      return (
        <div className={s.scr}>
          <div className={s.scr__head}>
            <Idx {...pg.b.section} />
            {pg.title && <h2 className={s.h3}>{tx(pg.title, lang)}</h2>}
            {/* the showcase description (web shows it under the heading) — first page of the block only */}
            {pg.part === 0 && pg.b.type === 'screenShowcase' && pg.b.body && <p className={s.scr__txt}>{tx(pg.b.body, lang)}</p>}
          </div>
          <div className={s.scr__row} data-n={pg.images.length}>{pg.images.map(im => <Fit key={im.id} img={im} lang={lang} />)}</div>
        </div>
      );
    case 'grid':
      return (
        <div className={s.svc}>
          <Idx {...pg.b.section} />
          <h2 className={s.h2}>{tx(pg.b.heading, lang)}</h2>
          {pg.b.intro && pg.part === 0 && <p className={s.txt}>{tx(pg.b.intro, lang)}</p>}
          {pg.items.some(it => imageOf(p, it.image)?.src)
            /* screens grouped as supporting features: the screen and its text stay in one card */
            ? <ol className={s.gal} data-n={pg.items.length}>
                {pg.items.map((it, i) => (
                  <li key={i}>
                    {imageOf(p, it.image) && <Fit img={imageOf(p, it.image)!} lang={lang} h="var(--galH)" />}
                    <h3><span>{String(pg.part * pg.per + i + 1).padStart(2, '0')}</span>{tx(it.title, lang)}</h3>
                    <p>{tx(it.body, lang)}</p>
                  </li>
                ))}
              </ol>
            : <ol className={s.goals} data-n={Math.min(pg.more ? 4 : 3, pg.items.length)}>
                {pg.items.map((it, i) => <li key={i}><span>{String(pg.part * pg.per + i + 1).padStart(2, '0')}</span><h3>{tx(it.title, lang)}</h3><p>{tx(it.body, lang)}</p></li>)}
              </ol>}
          {pg.more?.map((m, k) => (
            <div key={k} className={s.more}>
              <Idx {...m.section} />
              <h2 className={s.h2}>{tx(m.heading, lang)}</h2>
              <ol className={s.goals} data-n={Math.min(4, m.items.length)}>
                {m.items.map((it, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><h3>{tx(it.title, lang)}</h3><p>{tx(it.body, lang)}</p></li>)}
              </ol>
            </div>
          ))}
        </div>
      );
    case 'results':
      return (
        <div className={s.svc}>
          <Idx {...pg.b.section} />
          <h2 className={s.h2}>{tx(pg.b.heading, lang)}</h2>
          <dl className={s.res}>{pg.b.items.map((it, i) => <div key={i}><dd>{it.value}</dd><dt>{tx(it.label, lang)}</dt></div>)}</dl>
        </div>
      );
    case 'closing':
      return (
        <div className={s.close}>
          {pg.scope && p.scope.some(x => !x.pending) && (
            <div className={s.close__scope}>
              <Idx {...pg.scope.section} />
              <h2 className={s.h3}>{tx(pg.scope.heading, lang) || T('pf.f.scope', lang)}</h2>
              {pg.scope.note && <p className={s.close__note}>{tx(pg.scope.note, lang)}</p>}
              <ol>{p.scope.filter(x => !x.pending).map((x, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{x.label ? tx(x.label, lang) : T(`pf.scope.${x.key}`, lang)}</li>)}</ol>
            </div>
          )}
          <div className={s.close__end}>
            {pg.statement && <p className={s.close__text}><Lines text={tx(pg.statement.text, lang)} /></p>}
            {pg.statement?.sub && <p className={s.close__sub}>{tx(pg.statement.sub, lang)}</p>}
            <svg className={s.close__logo} viewBox={LOCKUP_VB} aria-label="PIUS"><LockupPaths /></svg>
            <p className={s.close__tag}>PIUS — Build Your Growth</p>
          </div>
        </div>
      );
  }
}

function Pages({ p, lang, mode }: { p: Project; lang: Lang; mode: PrintMode }) {
  const pages = pagesFor(p, mode);
  const total = String(pages.length).padStart(2, '0');
  const sectionOf = (pg: PrintPage) => ('b' in pg && pg.b && 'section' in pg.b ? pg.b.section?.label : undefined) || (pg.kind === 'closing' ? pg.scope?.section?.label : undefined);
  return (
    <div className={s.set} data-set={mode}>
      {pages.map((pg, i) => {
        const dark = pg.kind === 'closing';
        return (
          <section key={i} className={`${s.pg} ${pg.kind === 'cover' ? s['pg--cover'] : ''} ${dark ? s['pg--dark'] : ''}`} data-page={i + 1} data-kind={pg.kind}>
            <header className={s.pg__hd}>
              <svg viewBox={LOCKUP_VB} aria-label="PIUS"><LockupPaths /></svg>
              <span className={s.pg__proj}>{tx(p.title, lang)}<i>{tx(p.subtitle, lang)}</i></span>
              <span className={s.pg__sec}>{pg.kind === 'cover' ? 'PORTFOLIO' : sectionOf(pg)}</span>
            </header>
            <div className={s.pg__body}><Body pg={pg} p={p} lang={lang} /></div>
            <footer className={s.pg__ft}>
              <span>PIUS Portfolio</span>
              <span className={s.pg__no}>{String(i + 1).padStart(2, '0')} <i>/ {total}</i></span>
            </footer>
          </section>
        );
      })}
    </div>
  );
}

/** Both editions are rendered; ?mode=external (read by PrintFormat) shows the short one. Default: full. */
export default function PrintDoc({ p, lang }: { p: Project; lang: Lang }) {
  return (
    <div className={s.doc} style={accentVars(p)} data-format="a4" data-mode="full" id="pfDoc" lang={lang}>
      <PrintFormat lang={lang} />
      {PRINT_MODES.map(m => <Pages key={m} p={p} lang={lang} mode={m} />)}
    </div>
  );
}
