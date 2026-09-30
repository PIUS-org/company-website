'use client';
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { useLang } from '../LangProvider';
import { initPlatform } from './platform.controller';
import s from './Platform.module.css';

export default function Platform() {
  const c = cxm(s);
  const { t } = useLang();
  useEffect(() => initPlatform(document.body, s), []);
  return (
    <div className={c('plat')} id="plat" aria-hidden="true">
        <svg className={c('plat__beams')} id="platSvg"></svg>
        <div className={c('plat__core')}><div><b>Platform</b><span>{t('plat.core')}</span></div></div>
      </div>
  );
}
