'use client';
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { initWeb } from './web.controller';
import s from './WebDeck.module.css';

export default function WebDeck() {
  const c = cxm(s);
  useEffect(() => initWeb(document.body, s), []);
  return (
    <div className={c('web')} id="web" aria-hidden="true"></div>
  );
}
