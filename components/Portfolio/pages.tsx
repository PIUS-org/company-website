'use client';
/* Client entry points for the portfolio routes (server pages pass plain data in). */
import type { Project } from '@/lib/portfolio/types';
import { tx } from '@/lib/portfolio/text';
import { paths } from '@/lib/paths';
import SubPage from '../SubPage';
import { useLang } from '../LangProvider';
import PortfolioList from './PortfolioList';
import ProjectView from './ProjectView';
import { NavLink } from './shared';
import s from './List.module.css';

export function PortfolioIndexPage({ projects }: { projects: Project[] }) {
  return (
    <SubPage route="portfolio" meta={t => ({ title: t('pf.meta.title'), desc: t('pf.meta.desc') })}>
      <PortfolioList projects={projects} />
    </SubPage>
  );
}

export function ProjectPage({ p, next }: { p: Project; next: Project | null }) {
  return (
    <SubPage route="portfolio" meta={(_, lang) => ({ title: `${tx(p.title, lang)} — ${tx(p.subtitle, lang)} | PIUS`, desc: tx(p.summary, lang) })}>
      <ProjectView p={p} next={next} />
    </SubPage>
  );
}

function NotFoundBody() {
  const { t } = useLang();
  return (
    <div className={s.page}>
      <section className={`${s.intro} wrap`} id="top">
        <p className="sec-idx">404</p>
        <h1 className={`${s.intro__title} disp`}>{t('pf.nf.title')}</h1>
        <p className={s.intro__lead}>{t('pf.nf.lead')}</p>
        <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a className="btn btn--solid" href={paths.home()}><span>{t('pf.nf.home')}</span></a>
          <NavLink className="btn btn--glass" href={paths.portfolio()}><span>{t('pf.title')}</span></NavLink>
        </p>
      </section>
    </div>
  );
}
export function NotFoundPage() {
  return <SubPage route="page" meta={t => ({ title: `${t('pf.nf.title')} | PIUS` })}><NotFoundBody /></SubPage>;
}
