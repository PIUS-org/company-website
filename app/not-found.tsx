import type { Metadata } from 'next';
import { NotFoundPage } from '@/components/Portfolio/pages';

export const metadata: Metadata = { title: '페이지를 찾을 수 없습니다 | PIUS', robots: { index: false } };

export default function NotFound() {
  return <NotFoundPage />;
}
