/* Text-led blocks: featureGrid (G), scope, results, statement. */
import { T } from '@/lib/i18n';
import { MARK_VB } from '@/lib/logo';
import type { FeatureGridBlock, ResultsBlock, ScopeBlock, StatementBlock } from '@/lib/portfolio/types';
import { imageOf, tx } from '@/lib/portfolio/text';
import { MarkPaths } from '../../Logo';
import Screen from '../media/Screen';
import { type BlockProps, Lines, SecHead } from './common';
import s from '../Project.module.css';

export function FeatureGrid({ b, p, lang }: BlockProps<FeatureGridBlock>) {
  return (
    <section className={`${s.sec} ${s.fg}`}>
      <div className="wrap">
        <SecHead b={b} heading={b.heading} intro={b.intro} lang={lang} />
        <div className={s.fg__grid}>
          {b.items.map((it, i) => (
            <article key={i} className={s.fg__card} data-reveal="">
              {imageOf(p, it.image) && <Screen img={imageOf(p, it.image)!} lang={lang} sizes="(max-width: 899px) 100vw, 46vw" />}
              <span className={s.goals__n}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{tx(it.title, lang)}</h3>
              <p>{tx(it.body, lang)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Scope({ b, p, lang }: BlockProps<ScopeBlock>) {
  const items = p.scope.filter(x => !x.pending); /* unconfirmed scope is never shown */
  if (!items.length) return null;
  return (
    <section className={`${s.sec} ${s.scope}`}>
      <div className="wrap">
        <div className={s.scope__grid}>
          <SecHead b={b} heading={b.heading} intro={b.note} lang={lang} />
          <ol className={s.scope__list}>
            {items.map((it, i) => (
              <li key={i} data-reveal="">
                <span className={s.scope__n}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.scope__t}>{it.label ? tx(it.label, lang) : T(`pf.scope.${it.key}`, lang)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Results({ b, lang }: BlockProps<ResultsBlock>) {
  return (
    <section className={`${s.sec} ${s.res}`}>
      <div className="wrap">
        <SecHead b={b} heading={b.heading} lang={lang} />
        <dl className={s.res__grid}>{b.items.map((it, i) => <div key={i} data-reveal=""><dt>{tx(it.label, lang)}</dt><dd>{it.value}</dd></div>)}</dl>
      </div>
    </section>
  );
}

export function Statement({ b, lang }: BlockProps<StatementBlock>) {
  return (
    <section className={`${s.sec} ${s.st}`}>
      <div className={`${s.st__in} wrap`} data-reveal="">
        <svg className={s.st__mark} viewBox={MARK_VB} aria-hidden="true"><MarkPaths /></svg>
        <p className={s.st__text}><Lines text={tx(b.text, lang)} /></p>
        {b.sub && <p className={s.st__sub}>{tx(b.sub, lang)}</p>}
      </div>
    </section>
  );
}
