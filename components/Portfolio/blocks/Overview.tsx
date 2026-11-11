/* 02 · Overview — purpose, challenges and the project facts. Facts that are unknown are simply left out. */
import { T } from '@/lib/i18n';
import type { OverviewBlock } from '@/lib/portfolio/types';
import { tx, whenOf } from '@/lib/portfolio/text';
import { type BlockProps, SecHead } from './common';
import s from '../Project.module.css';

export default function Overview({ b, p, lang }: BlockProps<OverviewBlock>) {
  const facts: [string, string][] = [];
  if (p.industry) facts.push([T('pf.f.industry', lang), tx(p.industry, lang)]);
  facts.push([T('pf.f.category', lang), p.categories.map(c => T(`pf.cat.${c}`, lang)).join(', ')]);
  facts.push([T('pf.f.platforms', lang), p.platforms.map(x => tx(x.label, lang) || ({ app: 'App', web: 'Web', admin: 'Admin', desktop: 'Desktop', api: 'API' } as Record<string, string>)[x.type]).join(', ')]);
  if (p.projectState) facts.push([T('pf.f.state', lang), T(`pf.state.${p.projectState}`, lang)]);
  if (p.period) facts.push([T('pf.f.period', lang), p.period]);
  else if (p.year) facts.push([T('pf.f.year', lang), String(p.year)]);
  if (p.stack?.length) facts.push([T('pf.f.stack', lang), p.stack.join(', ')]);
  return (
    <section className={`${s.sec} ${s.ov}`}>
      <div className="wrap">
        <SecHead b={b} heading={b.heading} lang={lang} />
        <div className={s.ov__grid}>
          <div className={s.ov__txt} data-reveal="">
            <p className={s.ov__lead}>{tx(b.lead, lang)}</p>
            {b.body && <p className={s.ov__body}>{tx(b.body, lang)}</p>}
            <p className={s.ov__body}>{tx(p.overview, lang)}</p>
          </div>
          <dl className={s.facts} data-reveal="">
            {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
        {!!b.goals?.length && (
          <div className={s.goals}>
            <p className={s.goals__t} data-reveal="">{T('pf.goals', lang)}</p>
            <ol className={s.goals__list}>
              {b.goals.map((g, i) => (
                <li key={i} data-reveal="">
                  <span className={s.goals__n}>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{tx(g.title, lang)}</h3>
                  <p>{tx(g.body, lang)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
