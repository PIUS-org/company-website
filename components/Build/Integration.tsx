'use client';
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { initIntegration } from './integration.controller';
import s from './Integration.module.css';

export default function Integration() {
  const c = cxm(s);
  useEffect(() => initIntegration(document.body, s), []);
  return (
    <div className={c('intg')} id="intg" aria-hidden="true"></div>
  );
}
