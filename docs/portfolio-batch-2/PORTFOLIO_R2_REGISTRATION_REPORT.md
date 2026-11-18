# 2차 포트폴리오 24건 등록 보고 (batch-2) — 2026-11-12

입력: `pius-r2-a-to-d-claude-integration-handoff-20261112.zip`(00-START-HERE + A·B·C·D 최종 지시문 4개, 이미지 ZIP 4개, QA CSV, MANIFEST).
기준 소스: 작업 원본 v30(HEAD 4c13bfd, 기존 30건). 지시문이 참고로 든 v28 이후 최신본이다(사용자가 이 대화에서 받은 최신 작업 원본).
운영 서버 미접촉.

## 1. 결과 요약

| 항목 | 결과 |
|---|---|
| 프로젝트 | 기존 30 + 신규 24 = **54** (portfolio:check 54건 통과) |
| 신규 이미지 | **120/120** 등록·연결. 원본 바이트 그대로(SHA-256·크기·해상도 MANIFEST와 전부 일치) |
| 중복 | slug·id·제목(한영일)·이미지 해시 모두 기존과 겹침 **0**, 패키지 안 이미지 중복 0 |
| 원고 | 24건 × 3언어 × 10항목(제목·부제·요약·산업·개요·업무 문제·대표 기능·업무 흐름·제작 범위·마무리) 원문과 **불일치 0** · 이미지 120장 alt·caption 3언어 원문과 일치 |
| 상태 | 신규 24건 전부 `review`, `featured: false`, `visible: true`. approved 변경 없음 |
| 공개 빌드 | public 6건 그대로(신규 0건 포함). review 빌드 54건 |
| 기존 보존 | 기존 30건 project.json·이미지 **변경 0**(git diff). 공통 렌더러·BI·스크립트·스타일 변경 0 |
| 변경 파일 | 신규 24 × (project.json + 이미지 5) = 144, `content/portfolio/_batches.json`(batch-2 목록), `CHANGELOG.md`, 이 보고서 |

## 2. 신규 24건

| 실 | slug | 제목(ko) | order | categories | 메인 카테고리 | platforms | 상세 배치 | 이미지 |
|---|---|---|---|---|---|---|---|---|
| A | `sales-crm-pipeline` | 영업 CRM·파이프라인 관리 | 210 | platform, web | platform | web | split | 5 (3 core·2 support, mobile 0) |
| A | `people-attendance-payroll` | 인사·근태·휴가·급여 ERP | 220 | erp, web, mobile | erp | web, app | editorial | 5 (4 core·1 support, mobile 1) |
| B | `service-booking-payment` | 서비스 예약·선결제 운영 | 230 | platform, mobile, web | web | web, app | rail | 5 (3 core·2 support, mobile 1) |
| B | `warranty-repair-service` | 제품 A/S·보증수리 관리 | 240 | platform, web, mobile | platform | web, app | stage | 5 (4 core·1 support, mobile 2) |
| B | `franchise-network-ops` | 프랜차이즈 본사·가맹점 운영 관리 | 250 | erp, platform, mobile, web | erp | web, app | split | 5 (4 core·1 support, mobile 1) |
| D | `grant-application-review` | 공모·지원사업 신청 및 심사 관리 | 260 | platform, web | web | web | editorial | 5 (3 core·2 support, mobile 0) |
| A | `project-resource-costing` | 기업 프로젝트·인력·원가 관리 | 270 | erp, web | erp | web | rail | 5 (3 core·2 support, mobile 0) |
| C | `loyalty-points-ops` | MORROW 멤버십·포인트 운영 | 280 | platform, mobile, web | platform | web, app | stage | 5 (3 core·2 support, mobile 1) |
| C | `academy-enrollment-ops` | SOMO 학원 수강·출결·수납 관리 | 290 | erp, mobile, web | mobile | web, app | split | 5 (4 core·1 support, mobile 1) |
| C | `clinic-branch-reception` | ORIN 병원 다지점 예약·접수 운영 | 300 | platform, mobile, web | mobile | web, app | editorial | 5 (4 core·1 support, mobile 1) |
| B | `equipment-rental-ops` | 장비·공구 대여 운영 | 310 | erp, mobile, web | mobile | web, app | rail | 5 (3 core·2 support, mobile 1) |
| C | `commerce-returns-ops` | ARNA 이커머스 반품·교환 운영 | 320 | commerce, mobile, web | commerce | web, app | stage | 5 (3 core·2 support, mobile 1) |
| B | `home-service-dispatch` | 방문형 생활서비스 매칭 | 330 | platform, mobile, web | mobile | web, app | split | 5 (4 core·1 support, mobile 3) |
| B | `residential-facility-booking` | 아파트 입주민 커뮤니티·시설 예약 | 340 | platform, mobile, web | mobile | web, app | editorial | 5 (3 core·2 support, mobile 1) |
| A | `revenue-reconciliation` | 기업 매출·입금 대사 시스템 | 350 | erp, web | erp | web | rail | 5 (3 core·2 support, mobile 0) |
| A | `supplier-qualification` | 협력업체 등록·평가 플랫폼 | 360 | platform, web | web | web | split | 5 (3 core·2 support, mobile 0) |
| D | `employee-learning-compliance` | 기업 임직원 교육·이수 관리 | 370 | erp, mobile, web | erp | web, app | split | 5 (3 core·2 support, mobile 1) |
| D | `multi-site-content-cms` | 기업형 멀티사이트 콘텐츠 관리 CMS | 380 | platform, web | web | web | editorial | 5 (3 core·2 support, mobile 0) |
| D | `marketing-campaign-ops` | 마케팅 캠페인 운영·검수 플랫폼 | 390 | platform, web | platform | web | rail | 5 (3 core·2 support, mobile 0) |
| C | `donation-donor-crm` | MORA 비영리단체 후원·기부 운영 | 400 | platform, web | platform | web | editorial | 5 (3 core·2 support, mobile 0) |
| D | `form-survey-builder` | 조건부 온라인 설문·신청서 빌더 | 410 | platform, mobile, web | platform | web, app | split | 5 (3 core·2 support, mobile 1) |
| A | `corporate-expense-ops` | 법인카드·경비 지출 관리 | 420 | erp, mobile, web | mobile | web, app | editorial | 5 (3 core·2 support, mobile 1) |
| C | `insurance-claim-operations` | ARCO 보험 청구·사고 접수 운영 | 430 | platform, mobile, web | web | web, app | rail | 5 (3 core·2 support, mobile 1) |
| D | `cbt-exam-center` | 온라인 자격시험·CBT 운영 관리 | 440 | platform, web | web | web | rail | 5 (3 core·2 support, mobile 0) |

- order: 지시문 제안값 그대로(210~440, 기존 최대 200과 겹치지 않고 신규끼리도 중복 없음).
- 메인 카테고리: `portfolio.mjs balance` 추천(1차 고정). review 54건 분포 erp 11 · platform 12 · mobile 11 · web 11 · commerce 6 · integration 3. public 6건은 1·1·1·1·1·1 그대로.
- 강조색: 각 표지 화면에서 뽑은 색. 표지 배경은 모두 light.

## 3. 스키마 매핑과 차이(원고 의미는 그대로)

| 지시문 | 실제 스키마 | 이유 |
|---|---|---|
| `services` 블록(대표 기능 5개) | `textImage`(imageRight) `bullets` 5개 + 핵심 화면 1장 | services 블록은 열마다 platform·title·audience가 필수인데 원고에 대상 구분이 없어 만들어 넣지 않음 |
| support 화면을 `screenShowcase`·`textImage`에 | `imageGallery`(2열, caption 표시) | 스키마 규칙: support 화면은 보조 블록(featureGrid·imageGallery)에만. tier 값은 원고 그대로 유지 |
| overview + problem | overview 블록 `lead` = 업무 문제, 프로젝트 `overview` = 개요 | 렌더러가 lead 아래에 프로젝트 overview를 함께 표시(웹·PDF 둘 다) |
| scope 문구 | `scope` 블록 note + 수행 범위 `ui`·`frontend(정적 프론트엔드 화면)` | 1차 자체 데모와 같은 방식 |
| 표지 headline | 카드 요약(summary) | 표지에 제목·부제·요약이 모두 나오게 |
| 표지 화면을 본문 screenShowcase에도 | 본문에서는 반복하지 않음(표지·썸네일에 연결) | 지시문 허용 범위(“커버 중복 노출은 기존 정책”) |
| D실 이미지 id `GRANTS-01` 등 | `grants-01` 등 소문자 | 스키마: id는 영문 소문자·숫자·하이픈. 파일 이름은 원본 그대로 |
| `nature`·`sampleDataNotice`·`order_proposal`·`use_block` 등 | 넣지 않음 | 등록 지시용 메타데이터. 의미는 scope·reviewNotes에 반영 |
| `fileByLang`, `results`, `stack`, `period`, `projectState`, 고객사 | 넣지 않음 | 지시문 금지·근거 없음 |
| stage 배치 | 데스크톱 표지 3건(supplier·donation·cbt)은 split·editorial·rail | stage는 1024px 이상에서 표지 상하 약 2%를 잘라 supplier 표지 하단 상태줄 글자가 잘렸음 |

블록 순서: cover → overview → textImage(대표 기능) → userFlow → screenShowcase(핵심 화면, 모바일은 phones) → imageGallery(보조 화면) → scope → statement.

## 4. 검증(실제 실행)

| 순서 | 명령 | 종료 코드 |
|---|---|---|
| 1 | npm ci | 0 |
| 2 | npm run portfolio:check | 0 (54건, 오류·경고 0) |
| 3 | node scripts/portfolio.mjs sync --stage review | 0 (54건) |
| 4 | npm run typecheck | 0 |
| 5 | PORTFOLIO_STAGE=review npm run build | 0 (상세 54) |
| 6 | node scripts/portfolio.mjs sync --stage public | 0 (6건) |
| 7 | npm run build | 0 (상세 6, 신규 0) |
| 8 | npm run portfolio:export -- --slug <신규 24개 각각> --lang all --png | 24회 모두 0 |

- PDF: 72개(24 × ko·en·ja), 각 8쪽, 잘림 의심 0, 쪽마다 들어간 화면을 세어 보니 언어마다 5장 전부 포함. PNG 576장(24 × 3언어 × 8쪽; 증거 zip에는 표본만).
- 웹: 상세 54건 × 6폭(1920·1440·1024·768·430·390) × 3언어 = 972 + 메인·목록 36 = **1,008**. 정상 963 · 주의 45 · 오류 0. 신규 24건 432개 조합 전부 정상.
  - 주의 45 = 1차 stage 표지 5건의 상하 약 2% 크롭(기존 판정 유지, 이번 범위 밖).
  - 첫 실행에서 html lang 불일치 10건 → 언어 전환 클릭이 하이드레이션 전에 실행된 검사 타이밍 문제. 로드 대기 후 재검사 10건 모두 정상.
  - 화면 밖 요소: 가로 스크롤 레일을 빼고 다시 검사해 0.
- 목록: 54건, 첫 화면 11장 → 더 보기 4번에 54장, 필터 수 = 표시 수(ERP 17 · 플랫폼 37 · 모바일 앱 28 · 웹 49 · 커머스 7 · 연동 5), 카드 높이 고르지 않음 0, 3언어.

## 5. 미검증
- Safari·Firefox·실제 기기(iOS/Android)·접근성(스크린리더·대비)·성능(Lighthouse) — 실행 안 함. Chromium만.
- 웹 폰트: 검사 환경에서 fonts.googleapis.com 접속이 막혀 대체 글꼴로 렌더링됨. 실제 웹 폰트에서의 줄바꿈·글자 넘침은 미검증.
- External(외부 제출용) PDF·16:9 PDF — 실행 안 함(Full A4만).
- PDF PNG는 자동 잘림 검사 + 1건(sales-crm-pipeline ja) 눈 확인. 나머지 71개 PDF는 눈으로 모두 보지 않음.

## 6. 남은 문제
- P0·P1: 없음.
- P2: 신규 24건 공개 여부는 사용자 결정 필요(지금 review).
- P2: 1차 stage 표지 5건의 상하 2% 크롭(기존 판정 유지).

## 7. 비교 기준 참고
- 위 “기존 30건 변경 0”은 이번 작업의 시작점인 작업 원본 v30(커밋 4c13bfd) 대비다(`git diff 4c13bfd`: 추가 145 · 수정 2 — `CHANGELOG.md`, `_batches.json`).
- 홈페이지 ZIP의 `CHANGES.md`는 개발자에게 마지막으로 전달한 v2 대비 목록이라, 이번 작업 전에 이미 끝난 두 작업(메인 타일 `mainCategory` 추가로 기존 30건 project.json에 한 줄씩 추가, 안 쓰는 코드·CSS 정리, OG 이미지 무손실 재압축)도 함께 나온다.
- 화면 속 글자에 거래처 이름이 있는지는 텍스트 검사만 했다(외부 ZIP 텍스트 전체에서 금지어 0건). 이미지 안 글자는 OCR로 검사하지 않았다(미검증, 모두 가상 데모 화면).
