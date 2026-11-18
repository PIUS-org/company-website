# PIUS v39 — 포트폴리오 콘텐츠·문의 동선 개선 보고서

## 작업 개요

기준: `pius-work-v38-final-readability-and-5-images.zip`.

84개 포트폴리오의 기존 사실관계·화면·기능 설명을 보존하면서, 프로젝트별 **업무 문제 / 설계 판단**을 보여주는 내용을 한국어·영어·일본어로 개선했습니다. 모든 상세 페이지의 `overview` 콘텐츠를 수정했으며 UI 이미지 및 원본 화면의 alt/caption은 보존했습니다. 기존 포트폴리오의 목적은 이미지 중심의 제작물 소개로 유지합니다.

- 84개 프로젝트: 전부 콘텐츠 변경
- 다국어: ko/en/ja 총 252개 프로젝트·언어 조합 변경
- 전체 화면: WebP 466장 SHA-256 일치, 변경/누락 0
- 공개 상태: approved 6개, review 78개 (변경 없음)
- 이미지 ID·경로·thumbnail·block 순서·scope·실제 수행/데모 상태: 그대로 유지
- 실제 성과, 고객사, 기술 스택, 개발 성과를 새로 만들어 넣지 않았음

## 개별 페이지에 변경된 내용

1. 기존 업무 문제 설명이 충분한 프로젝트는 기존 `overview.lead`를 유지하고, 설계상 고려한 핵심 판단을 `overview.body`에 프로젝트별로 추가했습니다.
2. 기존 `overview.lead`가 짧거나 기능 목록으로만 구성된 프로젝트는 업무 문제와 UI 설계 의도가 구체적으로 보이도록 재작성했습니다.
3. 개요 설명과 동일한 문장이 반복되던 일부 프로젝트에서는 원래 설명을 유지하되 중복된 리드를 제거했습니다.
4. 다른 화면 블록, 이미지 원본, CTA 외 기존 공통 UI, PDF 템플릿은 변경하지 않았습니다.

**작업 특성:** 기존 내용을 전부 삭제하고 새 원고로 교체하는 방식이 아니라, 사실이 확인되는 기존 텍스트를 보존하고 문제·설계 관점을 추가/재구성했습니다. 84개 프로젝트별 차이와 원문 비교는 `V39-CONTENT-CHANGELOG.csv`에 있습니다.

## 웹 전용 포트폴리오 상담 영역

- `components/Portfolio/CaseInquiry.tsx` 신규.
- `components/Portfolio/ProjectView.tsx`: 모든 프로젝트 상세 하단, 다음 프로젝트 영역 위에 삽입.
- `components/Portfolio/Project.module.css`: 기존 BI를 유지하는 절제된 웹 전용 CTA 스타일.
- 화면에 현재 프로젝트의 부제를 넣고, 카테고리별로 요구사항 검토 포인트를 다르게 표시.
- 버튼 클릭 시 `/?portfolio=<slug>&case=<프로젝트명>#contact`로 이동하며 Contact의 문의 내용에 프로젝트 정보를 **편집 가능한 초안**으로 자동 채움.
- `PrintDoc.tsx`에는 추가하지 않아 PDF에는 상담 버튼이 없습니다.
- 허위 접수를 막기 위해 `NEXT_PUBLIC_FORM_ENDPOINT`가 없는 경우 기존 '가상 성공' 대신 전송 실패 처리. **실제 문의 수신은 운영 환경의 엔드포인트 연결과 테스트가 필요합니다.**

## 독립 검증 (실행한 항목)

- `node scripts/portfolio.mjs check`: 84건 검사 통과.
- `node scripts/portfolio.mjs sync --stage review`: 84건 포함.
- `node scripts/portfolio.mjs sync --stage public`: 기존 승인 6건만 포함.
- 전체 이미지 466장 SHA-256 동일 (v38/v39 비교).
- 기존 프로젝트 순서·블록·이미지 메타데이터·scope·status 등 구조 필드 동일.
- Node TypeScript `transpileModule` 기준 신규/수정 TSX·TS 파일 3개의 구문 분석 통과 (타입 검사 또는 빌드 통과를 의미하지 않음).

## 아직 수행하지 못한 항목

- `npm ci`: 실행 시 npm 레지스트리 DNS 요청 `EAI_AGAIN` 및 npm 종료 오류 발생. 의존성 설치 불가.
- `npm run typecheck`, `npm run build`: **미실행**.
- 실제 웹 브라우저 84개 × 3개 언어 시각 검수: **미실행**.
- 84개 × 3개 언어 PDF 252개 출력 및 페이지 넘김 검수: **미실행**.
- 실제 문의 폼 제출과 수신 확인: 서버 엔드포인트가 제공되지 않아 **미검증**.

## 릴리즈 전 필수 확인

1. 로컬/Claude 환경에서 `npm ci` 후 `npm run portfolio:check`, `npm run typecheck` 통과.
2. Review/Public 빌드 각각 실행하고 `review` 공개 정책 유지.
3. 390/430/768/1024/1440/1920px, ko/en/ja에서 실제 콘텐츠 줄바꿈 및 CTA 가독성 검수.
4. PDF 252개를 출력하고 특히 늘어난 Overview 문단의 페이지 넘침·본문 크기를 확인.
5. `NEXT_PUBLIC_FORM_ENDPOINT`를 실제 수신 가능한 주소로 설정하고, 프로젝트 문구가 포함된 문의를 제출·수신 확인. 설정 전에는 실제 문의가 접수되지 않습니다.
6. 결과 ZIP을 독립적으로 압축 해제하여 이미지와 콘텐츠가 포함되는지 확인.

## 변경 파일

- 84 × `content/portfolio/<slug>/project.json` (overview 블록 중심)
- `components/Portfolio/CaseInquiry.tsx` 신규
- `components/Portfolio/ProjectView.tsx`
- `components/Portfolio/Project.module.css`
- `components/Contact/contact.controller.ts`
- `docs/portfolio-v39/` 보고서와 변경 목록
