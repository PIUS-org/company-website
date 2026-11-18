'use client';
/** Web-only portfolio-to-contact bridge. PDF uses PrintDoc and never renders this. */
import type { Project } from '@/lib/portfolio/types';
import { tx } from '@/lib/portfolio/text';
import { paths } from '@/lib/paths';
import { useLang } from '../LangProvider';
import { Arrow, NavLink } from './shared';
import s from './Project.module.css';

const copy = {
  ko: {
    eyebrow: 'PROJECT INQUIRY',
    title: '비슷한 시스템을 고민하고 계신가요?',
    link: '이 프로젝트와 관련해 문의하기',
    note: '소개한 화면과 기능을 참고해, 귀사의 업무 방식에 맞는 구축 범위부터 함께 검토합니다.',
    focus: {
      erp: '내부 업무 규칙, 승인 단계와 데이터 연결이 어떻게 달라야 하는지부터 이야기해 보세요.',
      platform: '이용자 역할, 서비스 운영 정책과 데이터 흐름을 중심으로 요구사항을 검토합니다.',
      mobile: '고객이 실제로 사용하는 핵심 행동과 모바일 운영 조건부터 검토합니다.',
      web: '정보를 전달하는 방식과 고객의 탐색·상담 동선을 중심으로 검토합니다.',
      commerce: '상품 정보, 선택 옵션, 주문·결제 전후 흐름을 중심으로 검토합니다.',
      integration: '현재 운영 중인 시스템, 연동 지점과 데이터 책임 범위부터 검토합니다.',
    },
  },
  en: {
    eyebrow: 'PROJECT INQUIRY',
    title: 'Considering a similar system?',
    link: 'Discuss a project like this',
    note: 'Using this case as a starting point, we can discuss a scope that fits the way your organisation works.',
    focus: {
      erp: 'Let us start with your workflow rules, approvals, and data dependencies.',
      platform: 'We can review user roles, operating policies, and data flows.',
      mobile: 'We can define the key user journeys and mobile operating requirements.',
      web: 'We can discuss content architecture, discovery, and inquiry journeys.',
      commerce: 'We can review product data, options, and ordering or payment flows.',
      integration: 'We can identify your existing systems, integration points, and data ownership.',
    },
  },
  ja: {
    eyebrow: 'PROJECT INQUIRY',
    title: '同様のシステムをご検討ですか？',
    link: 'この事例について相談する',
    note: 'この事例を参考に、貴社の業務に合った開発範囲を一緒に検討できます。',
    focus: {
      erp: '業務ルール、承認フロー、データ連携の整理からご相談いただけます。',
      platform: '利用者の役割、運用方針、データの流れを中心に検討します。',
      mobile: '主要なユーザー行動とモバイル運用条件から検討します。',
      web: '情報設計、コンテンツ探索、問い合わせ導線を中心に検討します。',
      commerce: '商品情報、選択肢、注文・決済の流れを中心に検討します。',
      integration: '既存システム、連携点、データの責任範囲から検討します。',
    },
  },
} as const;

export default function CaseInquiry({ p }: { p: Project }) {
  const { lang } = useLang();
  const c = copy[lang];
  /* the plain title (no display-only joiners from tx/glue) goes into the editable inquiry draft */
  const title = p.title[lang] || p.title.ko;
  const href = `${paths.home()}?portfolio=${encodeURIComponent(p.slug)}&case=${encodeURIComponent(title)}#contact`;
  return (
    <section className={s.caseInquiry} aria-label={c.eyebrow}>
      <div className={`${s.caseInquiry__inner} wrap`} data-reveal="">
        <div className={s.caseInquiry__copy}>
          <p className={s.caseInquiry__eyebrow}>{c.eyebrow}</p>
          <h2 className={s.caseInquiry__title}>{c.title}</h2>
          <p className={s.caseInquiry__case}>{tx(p.subtitle, lang)}</p>
          <p className={s.caseInquiry__desc}>{c.focus[p.mainCategory]} {c.note}</p>
        </div>
        <NavLink href={href} className={s.caseInquiry__link} aria-label={c.link}>
          <span>{c.link}</span><Arrow />
        </NavLink>
      </div>
    </section>
  );
}
