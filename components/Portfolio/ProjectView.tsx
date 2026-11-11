'use client';
/* =========================================================
   Detail page renderer. Every project uses this one component:
   the blocks listed in project.json are rendered in order, each by its block component.
   Adding a project never needs a new page or component.
   ========================================================= */
import { useRef } from 'react';
import type { Block, Project } from '@/lib/portfolio/types';
import { accentVars, imagesOf, tx } from '@/lib/portfolio/text';
import { paths } from '@/lib/paths';
import { useLang } from '../LangProvider';
import { type BlockProps, jaBreakable } from './blocks/common';
import Cover from './blocks/Cover';
import Overview from './blocks/Overview';
import Services from './blocks/Services';
import UserFlow from './blocks/UserFlow';
import { ImageGallery, ScreenShowcase, TextImage } from './blocks/Media';
import { FeatureGrid, Results, Scope, Statement } from './blocks/Text';
import Screen from './media/Screen';
import { Arrow, NavLink, useReveal } from './shared';
import s from './Project.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RENDER: { [K in Block['type']]: (props: BlockProps<any>) => React.ReactNode } = {
  cover: Cover, overview: Overview, services: Services, userFlow: UserFlow,
  textImage: TextImage, screenShowcase: ScreenShowcase, imageGallery: ImageGallery,
  featureGrid: FeatureGrid, scope: Scope, results: Results, statement: Statement,
};

function NextProject({ next }: { next: Project | null }) {
  const { t, lang } = useLang();
  if (!next) {
    return (
      <section className={s.next}>
        <NavLink href={paths.portfolio()} className={`${s.next__link} wrap`}>
          <span className={s.next__lbl}>{t('pf.title')}</span>
          <span className={s.next__name}>{t('pf.all')}</span>
          <span className={s.next__go}><Arrow /></span>
        </NavLink>
      </section>
    );
  }
  /* hover preview only when a real screen exists (no empty frame) */
  const thumb = imagesOf(next, next.thumbnail).find(i => !!i.src);
  return (
    <section className={s.next} style={accentVars(next)}>
      <NavLink href={paths.project(next.slug)} className={`${s.next__link} wrap`}>
        <span className={s.next__lbl}>{t('pf.next')}</span>
        <span className={s.next__name}>{lang === 'ja' ? jaBreakable(tx(next.title, lang)) : tx(next.title, lang)}<small>{tx(next.subtitle, lang)}</small></span>
        {thumb && <span className={s.next__thumb}><Screen img={thumb} lang={lang} /></span>}
        <span className={s.next__go}><Arrow /></span>
      </NavLink>
      <div className="wrap"><NavLink href={paths.portfolio()} className={s.next__all}>{t('pf.all')}</NavLink></div>
    </section>
  );
}

export default function ProjectView({ p, next }: { p: Project; next: Project | null }) {
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root, [lang, p.slug]);
  return (
    <div className={s.page} ref={root} style={accentVars(p)} data-slug={p.slug} data-variant={p.theme.layout || 'split'}>
      {p.blocks.map((b, i) => {
        const R = RENDER[b.type];
        return (
          <div key={b.id || i} className={s.block} data-block={b.type}>
            {R({ b, p, lang })}
          </div>
        );
      })}
      <NextProject next={next} />
    </div>
  );
}
