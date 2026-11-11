/* Image-led blocks: textImage (A/B/C/E/F layouts), screenShowcase (D phones, desktop, mixed) and imageGallery. */
import type { Lang } from '@/lib/i18n';
import type { ImageAsset, ImageGalleryBlock, ScreenShowcaseBlock, TextImageBlock } from '@/lib/portfolio/types';
import { imagesOf, tx } from '@/lib/portfolio/text';
import Screen from '../media/Screen';
import { type BlockProps, SecHead, surfaceClass } from './common';
import s from '../Project.module.css';

/** E · desktop + phones in front */
function DesktopPhones({ imgs, lang }: { imgs: ImageAsset[]; lang: Lang }) {
  const desk = imgs.find(i => i.kind !== 'mobile'), phones = imgs.filter(i => i.kind === 'mobile').slice(0, 3);
  return (
    <div className={s.dp} data-reveal="">
      {desk && <Screen img={desk} lang={lang} className={s.dp__desk} sizes="(max-width: 899px) 100vw, 70vw" />}
      <div className={s.dp__phones} data-n={phones.length}>{phones.map(im => <Screen key={im.id} img={im} lang={lang} className={s.dp__phone} sizes="16vw" />)}</div>
    </div>
  );
}
/** F · one key screen large + supporting screens */
function Focus({ imgs, lang }: { imgs: ImageAsset[]; lang: Lang }) {
  const [main, ...rest] = imgs;
  return (
    <div className={s.focus} data-kind={main?.kind} data-reveal="">
      {main && <Screen img={main} lang={lang} className={s.focus__main} sizes="(max-width: 899px) 100vw, 60vw" />}
      <div className={s.focus__side}>{rest.slice(0, 3).map(im => <Screen key={im.id} img={im} lang={lang} className={s.focus__sub} sizes="24vw" />)}</div>
    </div>
  );
}
/** D · 2–4 phones in a row with a gentle stagger */
function Phones({ imgs, lang }: { imgs: ImageAsset[]; lang: Lang }) {
  return (
    <div className={s.phones} data-n={Math.min(imgs.length, 4)}>
      {imgs.slice(0, 4).map((im, i) => <div key={im.id} className={s.phones__it} data-reveal="" style={{ transitionDelay: `${i * 90}ms` }}><Screen img={im} lang={lang} sizes="(max-width: 899px) 44vw, 20vw" /></div>)}
    </div>
  );
}
/** tablets: 1–2 landscape/portrait slates side by side, wider than phones */
function Tablets({ imgs, lang }: { imgs: ImageAsset[]; lang: Lang }) {
  return (
    <div className={s.tabs} data-n={Math.min(imgs.length, 2)}>
      {imgs.slice(0, 2).map((im, i) => <div key={im.id} className={s.tabs__it} data-reveal="" style={{ transitionDelay: `${i * 90}ms` }}><Screen img={im} lang={lang} sizes="(max-width: 899px) 100vw, 45vw" /></div>)}
    </div>
  );
}
/** C · full width — first screen large, the rest in a row beneath */
function Full({ imgs, lang }: { imgs: ImageAsset[]; lang: Lang }) {
  const [main, ...rest] = imgs;
  return (
    <div className={s.full}>
      {main && <div data-reveal=""><Screen img={main} lang={lang} className={s.full__main} sizes="100vw" /></div>}
      {!!rest.length && <div className={s.full__row} data-n={rest.length}>{rest.map(im => <div key={im.id} data-reveal=""><Screen img={im} lang={lang} sizes="50vw" /></div>)}</div>}
    </div>
  );
}

/** A/B side media: one screen; several phones side by side; several desktop screens layered (main + one in front) */
function SideMedia({ imgs, lang }: { imgs: ImageAsset[]; lang: Lang }) {
  if (imgs.length <= 1) return imgs[0] ? <div data-reveal=""><Screen img={imgs[0]} lang={lang} sizes="(max-width: 899px) 100vw, 58vw" /></div> : null;
  if (imgs.every(i => i.kind === 'mobile' || i.kind === 'tablet')) {
    return <div className={s.pair} data-n={Math.min(imgs.length, 3)}>{imgs.slice(0, 3).map((im, i) => <div key={im.id} data-reveal="" style={{ transitionDelay: `${i * 90}ms` }}><Screen img={im} lang={lang} sizes="(max-width: 899px) 44vw, 22vw" /></div>)}</div>;
  }
  const [main, second] = imgs;
  return (
    <div className={s.layer} data-reveal="">
      <Screen img={main} lang={lang} className={s.layer__main} sizes="(max-width: 899px) 100vw, 55vw" />
      {second && <Screen img={second} lang={lang} className={s.layer__front} sizes="(max-width: 899px) 70vw, 34vw" />}
    </div>
  );
}

function Copy({ b, lang, num }: { b: TextImageBlock; lang: Lang; num?: string }) {
  return (
    <div className={s.ti__copy} data-reveal="">
      {(b.section?.index || num) && <span className={s.ti__num} aria-hidden="true">{b.section?.index || num}</span>}
      {b.section && <p className={s.idx}>{b.section.index && <span>{b.section.index}</span>}{b.section.label}</p>}
      <h2 className={s.h2}>{tx(b.heading, lang)}</h2>
      {b.body && <p className={s.intro}>{tx(b.body, lang)}</p>}
      {!!b.bullets?.length && <ul className={s.bul}>{b.bullets.map((x, i) => <li key={i}>{tx(x, lang)}</li>)}</ul>}
    </div>
  );
}

export function TextImage({ b, p, lang }: BlockProps<TextImageBlock>) {
  const imgs = imagesOf(p, b.images);
  const side = b.layout === 'imageLeft' || b.layout === 'imageRight';
  /* editorial numeral: the section index, or the block's position when no index is set */
  const num = String(p.blocks.indexOf(b)).padStart(2, '0');
  return (
    <section className={`${s.sec} ${s.ti} ${surfaceClass(b.surface)}`} data-layout={b.layout}>
      <div className="wrap">
        {side ? (
          <div className={`${s.split} ${b.layout === 'imageLeft' ? s['split--rev'] : ''}`} data-kind={imgs[0]?.kind} data-multi={imgs.length > 1 ? '' : undefined}>
            <Copy b={b} lang={lang} num={num} />
            <div className={s.split__media}><SideMedia imgs={imgs} lang={lang} /></div>
          </div>
        ) : (
          <>
            <div className={s.ti__top}><Copy b={b} lang={lang} num={num} /></div>
            {b.layout === 'full' && <Full imgs={imgs} lang={lang} />}
            {b.layout === 'desktopPhones' && <DesktopPhones imgs={imgs} lang={lang} />}
            {b.layout === 'focus' && <Focus imgs={imgs} lang={lang} />}
          </>
        )}
      </div>
    </section>
  );
}

export function ScreenShowcase({ b, p, lang }: BlockProps<ScreenShowcaseBlock>) {
  const imgs = imagesOf(p, b.images);
  return (
    <section className={`${s.sec} ${s.sc} ${surfaceClass(b.surface || 'light')}`} data-layout={b.layout}>
      <div className="wrap">
        <SecHead b={b} heading={b.heading} intro={b.body} lang={lang} />
        {b.layout === 'phones' && <Phones imgs={imgs} lang={lang} />}
        {b.layout === 'tablets' && <Tablets imgs={imgs} lang={lang} />}
        {b.layout === 'desktop' && <div className={s.stack}>{imgs.map(im => <div key={im.id} data-reveal=""><Screen img={im} lang={lang} sizes="100vw" /></div>)}</div>}
        {b.layout === 'desktopPhones' && <DesktopPhones imgs={imgs} lang={lang} />}
        {b.layout === 'focus' && <Focus imgs={imgs} lang={lang} />}
      </div>
    </section>
  );
}

export function ImageGallery({ b, p, lang }: BlockProps<ImageGalleryBlock>) {
  const imgs = imagesOf(p, b.images);
  return (
    <section className={`${s.sec} ${s.gal}`}>
      <div className="wrap">
        <SecHead b={b} heading={b.heading} lang={lang} />
        <div className={s.gal__cols} style={{ ['--cols' as string]: b.columns || 3 }}>
          {imgs.map(im => <div key={im.id} className={s.gal__it} data-reveal=""><Screen img={im} lang={lang} showCaption /></div>)}
        </div>
      </div>
    </section>
  );
}
