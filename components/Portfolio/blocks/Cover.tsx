/* 01 · Cover — project name, key message, type and the hero screens. */
import { T } from '@/lib/i18n';
import type { CoverBlock } from '@/lib/portfolio/types';
import { flowOf, imagesOf, platformNames, tx, whenOf } from '@/lib/portfolio/text';
import Screen from '../media/Screen';
import { type BlockProps, Lines, jaBreakable, jaWords } from './common';
import s from '../Project.module.css';

export default function Cover({ b, p, lang }: BlockProps<CoverBlock>) {
  const all = imagesOf(p, b.images);
  /* screens still pending (file: null) are not drawn as empty frames on the cover: the work flow is shown in words */
  const live = all.filter(i => !!i.src);
  const flow = !live.length && all.length ? flowOf(p) : undefined;
  const imgs = flow ? [] : live.length ? live : all;
  const desk = imgs.find(i => i.kind === 'desktop');
  const phones = imgs.filter(i => i.kind === 'mobile').slice(0, 3);
  return (
    <section className={`${s.cover} ${p.theme.cover === 'dark' ? s['cover--dark'] : ''}`} id="top" aria-labelledby="pfName">
      <div className={`${s.cover__in} wrap`}>
        <div className={s.cover__txt}>
          <ul className={s.cover__tags}>
            {b.eyebrow && <li>{tx(b.eyebrow, lang)}</li>}
            {p.categories.map(c => <li key={c}>{T(`pf.cat.${c}`, lang)}</li>)}
          </ul>
          <h1 className={s.cover__name} id="pfName" data-cjk={/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(tx(p.title, lang)) ? '' : undefined} lang={lang} data-long={tx(p.title, lang).length > 24 ? 'l' : tx(p.title, lang).length > 16 ? 'm' : undefined} style={{ ['--len' as string]: Math.max(4, ...(lang === 'ja' ? jaWords(tx(p.title, lang)) : tx(p.title, lang).split(/[ \t\n]+/)).map(w => w.length)) }}>{lang === 'ja' ? jaBreakable(tx(p.title, lang)) : tx(p.title, lang)}</h1>
          <p className={s.cover__sub}>{tx(p.subtitle, lang)}</p>
          <p className={s.cover__msg}><Lines text={tx(b.headline, lang)} /></p>
          {b.sub && <p className={s.cover__lead}>{tx(b.sub, lang)}</p>}
        </div>
        {flow ? (
          <div className={s.plan} data-reveal="">
            <p className={s.plan__t}><span>{tx(flow.heading, lang)}</span><span>{platformNames(p, lang).join(' · ')}</span></p>
            <ol>
              {flow.steps.slice(0, 6).map((st, i) => (
                <li key={i} style={{ ['--i' as string]: i }}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <b>{tx(st.title, lang)}</b>
                  {st.body && <small>{tx(st.body, lang)}</small>}
                </li>
              ))}
            </ol>
            <p className={s.plan__f}>{T('pf.plan.note', lang)}</p>
          </div>
        ) : imgs.length ? (
          <div className={`${s.cover__vis} ${desk ? s['cover__vis--desk'] : ''}`} data-n={phones.length}>
            {desk && <Screen img={desk} lang={lang} eager className={s.cover__desk} />}
            {phones.map(im => <Screen key={im.id} img={im} lang={lang} eager className={s.cover__phone} sizes="(max-width: 899px) 40vw, 18vw" />)}
          </div>
        ) : (
          /* no screens: the stack takes the visual side */
          <div className={s.cover__stack}>
            <p className={s.cover__stackT}><span>{T('pf.f.stack', lang)}</span>{whenOf(p) && <span>{whenOf(p)}</span>}</p>
            <ol>{(p.stack || []).map((x, i) => <li key={x} style={{ ['--i' as string]: i }}><span>{String(i + 1).padStart(2, '0')}</span>{x}</li>)}</ol>
          </div>
        )}
      </div>
    </section>
  );
}
