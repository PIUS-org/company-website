/* Screen frames shared by the web detail page and the PDF pages.
   The frame follows the image kind; the image keeps its own aspect ratio (never cropped).
   mobile → slim phone frame · desktop → browser frame (no address bar, no URL) · tablet → rounded slate
   photo / graphic → plain rounded image. A screen that is not delivered yet renders an honest
   "screen coming soon" panel with the same ratio — never an invented UI. */
import type { Lang } from '@/lib/i18n';
import { T } from '@/lib/i18n';
import type { ImageAsset } from '@/lib/portfolio/types';
import { srcOf, tx } from '@/lib/portfolio/text';
import s from './Screen.module.css';

type Props = { img: ImageAsset; lang: Lang; eager?: boolean; className?: string; sizes?: string; showCaption?: boolean; style?: React.CSSProperties };

export default function Screen({ img, lang, eager, className, sizes, showCaption, style }: Props) {
  const src = srcOf(img, lang);
  const ratio = `${img.width} / ${img.height}`;
  const inner = src
    ? <img src={src} alt={tx(img.alt, lang)} width={img.width} height={img.height} loading={eager ? 'eager' : 'lazy'} decoding="async" sizes={sizes} />
    : (
      <span className={s.ph} role="img" aria-label={tx(img.alt, lang)}>
        <span className={s.ph__grid} aria-hidden="true" />
        <span className={s.ph__txt}>
          <b>{tx(img.placeholder || img.alt, lang)}</b>
          <small>{T('pf.screen.pending', lang)}</small>
        </span>
      </span>
    );
  const frame = img.kind === 'mobile' ? s.phone : img.kind === 'desktop' ? s.browser : img.kind === 'tablet' ? s.tablet : s.plain;
  return (
    <figure className={`${s.fig} ${frame} ${className || ''}`} style={style} data-kind={img.kind} data-img={img.id} data-empty={src ? undefined : ''}>
      <span className={s.shell}>
        {img.kind === 'desktop' && <span className={s.bar} aria-hidden="true"><i /><i /><i /></span>}
        <span className={s.view} style={{ aspectRatio: ratio }}>{inner}</span>
      </span>
      {showCaption && img.caption && <figcaption className={s.cap}>{tx(img.caption, lang)}</figcaption>}
    </figure>
  );
}
