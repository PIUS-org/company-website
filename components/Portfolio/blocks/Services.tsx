/* 03 · Service structure — who uses which part of the service. Columns connect to one platform core. */
import type { ServicesBlock } from '@/lib/portfolio/types';
import { tx } from '@/lib/portfolio/text';
import { type BlockProps, SecHead } from './common';
import s from '../Project.module.css';

const TAG = { app: 'APP', web: 'WEB', admin: 'ADMIN', desktop: 'DESKTOP', api: 'API' } as const;

export default function Services({ b, lang }: BlockProps<ServicesBlock>) {
  return (
    <section className={`${s.sec} ${s.svc}`}>
      <div className="wrap">
        <SecHead b={b} heading={b.heading} intro={b.intro} lang={lang} />
        <div className={s.svc__map} data-n={b.columns.length} data-reveal="">
          {b.core && <div className={s.svc__core}><span>{tx(b.core, lang)}</span></div>}
          <div className={s.svc__lines} aria-hidden="true">{b.columns.map((_, i) => <i key={i} />)}</div>
          <div className={s.svc__cols}>
            {b.columns.map((c, i) => (
              <article key={i} className={s.svc__col} data-platform={c.platform}>
                <p className={s.svc__tag}><span>{String(i + 1).padStart(2, '0')}</span>{TAG[c.platform]}</p>
                <h3>{tx(c.title, lang)}</h3>
                <p className={s.svc__aud}>{tx(c.audience, lang)}</p>
                <ul>{c.items.map((it, j) => <li key={j}>{tx(it, lang)}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
        {b.note && <p className={s.note} data-reveal="">{tx(b.note, lang)}</p>}
      </div>
    </section>
  );
}
