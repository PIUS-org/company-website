/* User flow — numbered steps along a line, each with its screen. Scrolls sideways on small screens. */
import type { UserFlowBlock } from '@/lib/portfolio/types';
import { imageOf, tx } from '@/lib/portfolio/text';
import Screen from '../media/Screen';
import { type BlockProps, SecHead } from './common';
import s from '../Project.module.css';

export default function UserFlow({ b, p, lang }: BlockProps<UserFlowBlock>) {
  return (
    <section className={`${s.sec} ${s.flow}`}>
      <div className="wrap">
        <SecHead b={b} heading={b.heading} intro={b.intro} lang={lang} />
      </div>
      <div className={s.flow__rail}>
        <ol className={`${s.flow__list} wrap`} style={{ ['--n' as string]: b.steps.length }}>
          {b.steps.map((st, i) => {
            const img = imageOf(p, st.image);
            return (
              <li key={i} className={s.flow__step} data-reveal="" style={{ transitionDelay: `${i * 70}ms` }}>
                {img && <Screen img={img} lang={lang} className={s.flow__screen} sizes="(max-width: 899px) 62vw, 18vw" />}
                <p className={s.flow__n}><span>{String(i + 1).padStart(2, '0')}</span></p>
                <h3>{tx(st.title, lang)}</h3>
                {st.body && <p className={s.flow__b}>{tx(st.body, lang)}</p>}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
