# PIUS 3차 포트폴리오 30건 통합 보고서

- 작업일: 2026-11-13
- 입력: `PIUS_R3_A-E_CLAUDE_MASTER_HANDOFF_20261113.zip`
  - `00-START-HERE-CLAUDE.md`, A~E `claude-integration-prompt.txt` 5개, `QA/R3-CONSOLIDATED-REVIEW.md`, MANIFEST, 작업실별 handoff-report·qa.csv를 모두 읽었습니다.
- 기준 홈페이지: 직전 납품본 `pius-homepage-v32-r2-quality-review.zip`과 같은 소스(작업 원본 v33, 커밋 `ecf9583`)
  - 이번 메시지에는 홈페이지 zip이 따로 첨부되지 않았습니다. 그래서 가장 최근에 납품한 소스를 기준으로 썼습니다.
- 결과 커밋: `b357ad8`(등록), `ecd50bc`(일본어 제목 보완), 문서 커밋

## 1. 판정

| 구분 | 판정 | 근거 |
|---|---|---|
| 파일 등록 | **통과** | 30/30 slug, 150/150 WebP(Desktop 72·Mobile 78), SHA-256 MANIFEST 일치, 3개 언어 누락 0, 30/30 `review` |
| 기존 보존 | **통과** | 1·2차 content 파일 371개 SHA-256 동일. 공통 코드 변경은 일본어 제목 줄바꿈 함수 1줄뿐(운영 빌드 영향 범위는 일본어 표지 제목). 그 외 미리보기 전용 스크립트 1개 |
| 빌드·공개 정책 | **통과** | check·typecheck·review 빌드(89쪽)·public 빌드(11쪽) 모두 exit 0. 공개 빌드에 3차 slug 0회 |
| 반응형·다국어 | **통과(자동)** | 6폭 × 3언어 × 32쪽 = 576쪽: 가로 넘침 0, 화면 밖 요소 0, 깨진 이미지 0, 언어 불일치 0 |
| PDF | **통과(자동) + 일부 육안** | 90개(30 × 3언어) 630쪽: 이미지 5장 포함 90/90, 잘림 의심 0, 빈 쪽 0. 육안 확인은 5개 PDF 전체 쪽 |
| 디자인 품질 | **조건부** | 원본 이미지에서 온 주의점이 남아 있습니다(6장). 공개 여부는 사용자가 결정합니다 |

## 2. 개수

| | 이전 | 이후 |
|---|---|---|
| 프로젝트 | 54 (approved 6 · review 48) | **84** (approved 6 · review 78) |
| 묶음 | batch-1 닫힘 30, batch-2 열림 24 | batch-1 닫힘 30, **batch-2 닫힘 24**, **batch-3 열림 30** |
| 공개(public) 빌드 | 6건 | 6건 (변화 없음) |

작업실별 이미지 구성:

| 작업실 | 이미지 | 프로젝트 6건 |
|---|---|---|
| A | D 24 · M 6 | boutique-hotel-booking, wellness-retreat-program, premium-interior-studio, skincare-brand-experience, art-fair-ticketing, design-conference-portal |
| B | D 24 · M 6 | private-clinic-brand-site, luxury-real-estate-showcase, fintech-product-landing, creator-membership-platform, nonprofit-donation-platform, custom-furniture-configurator |
| C | M 30 | dog-walking-booking-app, local-fitness-class-app, home-cooking-subscription-app, travel-itinerary-companion, used-fashion-market-app, parenting-care-record-app |
| D | M 30 | language-speaking-challenge-app, second-home-cleaning-app, beauty-appointment-app, neighborhood-community-app, mindful-journal-app, concert-fan-companion-app |
| E | D 24 · M 6 | creator-collab-workspace, social-campaign-builder, podcast-production-hub, online-course-studio, wedding-planning-portal, architecture-client-portal |

## 3. 등록 방식(실제 스키마 매핑)

원문 항목 이름을 JSON 키로 그대로 쓰지 않고, `docs/PORTFOLIO_SCHEMA.md`와 `scripts/portfolio.mjs`가 허용하는 필드·블록만 썼습니다.

**공통 필드**
- `title`: A·C는 projectName(브랜드·서비스명). A 원문의 'title'은 태그라인이라 `subtitle`로 옮겼습니다. B·D·E는 원문 title입니다.
- `summary`: cardSummary
- `overview`: overview
- 표지 `headline`: 카드 요약
  - 예외 A: 원문 subtitle
  - 예외 E: 원문에서 부제와 카드 요약이 같아 표지 문구로 개요를 씀
- 개요 블록 `lead`: problem
  - 예외 C: problemAndSolution
  - 예외 E: 핵심 기능 목록. E는 원문의 개요와 해결 과제가 같은 문장이라, 같은 문장이 연달아 두 번 나오지 않게 했습니다.
- `industry`: 원문 ko에 en·ja를 번역해 붙였습니다(원문에는 ko만 있음). C는 원문이 6건 모두 같은 업종이어서 서비스별로 구체화했습니다.
- `categories`·`platforms`:
  - Desktop + Mobile Web(A·B·E)는 `[main, web]`, platform `web`
  - 모바일 앱(C·D)은 `[main, mobile]`, platform `app`
  - `mainCategory`는 작업실 권장값을 그대로 썼습니다.
- `scope`: `ui` + `frontend`("정적 프론트엔드 화면"). 원문 scope 문장은 scope 블록 `note`에 넣었습니다.
- `projectState`·`results`·`fileByLang`는 쓰지 않았습니다.

**블록 구성**
- 표지 화면(01)은 본문에서 다시 쓰지 않았습니다. 같은 화면을 두 번 보여 개수를 부풀리지 않기 위해서입니다(E 원문 지시와 같음).

| 작업실 | 블록 순서 |
|---|---|
| A | cover(01) → overview → 주요 화면(02) → 대표 기능 textImage(03, keyFeatures) → 이어지는 화면(04) → 모바일 화면(05) → userFlow → scope → statement |
| B | cover(01) → overview → 대표 기능 textImage(02, features) → userFlow → 주요 화면(03·04) → 모바일 화면(05) → scope → statement |
| C | cover(01) → overview → userFlow → 주요 화면 phones(02~05) → scope → statement |
| D | cover(01) → overview → 대표 기능 textImage(02, features) → userFlow → 주요 화면 phones(03~05) → scope → statement |
| E | cover(01) → overview → userFlow → 주요 화면(02·03·04) → 모바일 화면(05) → scope → statement |

**원문 권장 블록과 다른 점**
- `services`: 열마다 platform·audience·items가 필수인데 원문에 그 정보가 없어 쓰지 않았습니다.
- `featureGrid`: 기능마다 설명(body)이 필수라 쓰지 않았습니다.
- 대신 기능 목록은 textImage bullets로 넣었습니다(2차와 같은 방식).
- `imageGallery`: 150장 모두 핵심 화면이라 쓰지 않았습니다.
- 데스크톱+폰 겹침 배치(`desktopPhones`)는 시험해 보니 폰이 1440에서 약 204px로 작아졌습니다. 그래서 모바일 화면은 별도 블록(phones)으로 두었고, 수정 후 1440에서 최소 252px입니다.

**테마**
- accent: A는 원문 브랜드색을 썼고, 나머지는 각 화면의 버튼·로고색에서 골랐습니다.
- 상세 레이아웃: split·editorial·rail을 섞었습니다. stage는 단일 폰 표지가 첫 화면 아래로 잘리는 문제가 2차에서 확인돼 쓰지 않았습니다.
- 표지: concert-fan-companion-app만 dark입니다(어두운 앱 UI).

**순서(order 450~740)**
- A·C·B·D·E를 번갈아 놓아 데스크톱 카드와 폰 카드가 섞이게 했습니다.

## 4. 원문을 고친 곳(129곳, 전후 대조: `R3-VALIDATION-LOGS/14-text-fixes-before-after.csv`)

1. **영문·일문 안의 한국어 조각 120곳**
   - A 영문 alt·caption 60곳: "Desktop 호텔 예약 experience", "showing 가든 스위트" 같은 템플릿 잔여 → 영어로 번역
   - E 영문·일문 alt 60곳: 화면 속 가상 프로젝트명 → 영어·일본어로 번역
2. **B 국문 caption 6곳**: "접수 확인. 단계의"처럼 잘못 들어간 마침표 제거
3. **거래처 금지어 1곳**: art-fair-ticketing 국문 부제의 한 단어가 거래처 금지어 검사(`_clients.txt`)에 걸려, 같은 뜻의 "동시대 미술"로 바꿨습니다. 해당 단어는 기록하지 않습니다.
4. **일본어 제목 2곳**: 긴 가타카나 합성어가 표지에서 단어 중간에 끊겨 「・」를 넣었습니다(ソーシャル・キャンペーン・ビルダー, 地域フィットネス・クラスアプリ).
5. **영문 목록·흐름 첫 글자 대문자화**: 쉼표로 나눈 기능·흐름 항목

## 5. 변경 파일

자세한 내용은 `R3-CHANGELOG.csv`에 있습니다.

- **신규**
  - `content/portfolio/<30 slug>/project.json`
  - `content/portfolio/<30 slug>/images/*.webp` 150장(원본 그대로)
- **수정**
  - `content/portfolio/_batches.json`: batch-2 닫음, batch-3 추가
  - `components/Portfolio/blocks/common.tsx`(1줄): 일본어 제목에서 조사를 앞 단어에 붙이는 조건을 조사 목록으로 바꿈
    - 이유: "still. 気持ち / の記録"처럼 줄이 조사로 시작했습니다.
    - 영향: 일본어 표지 제목 줄바꿈뿐입니다. 85건 × 6폭에서 1·2차 변화는 stayport-pms 1건이고, 개선 방향입니다.
  - `scripts/preview-build.mjs`(미리보기 전용, 운영 빌드와 무관)
    - 이유: 84건이 되면 미리보기 파일이 561개로 아티팩트 상한 512개를 넘습니다.
    - 처리: 한 페이지에서만 그려지는 이미지 71장을 그 페이지 HTML 안에 data URI로 넣었습니다.
  - `CHANGELOG.md`
- **문서**
  - `docs/portfolio-batch-3/`: 이 보고서, CSV, 검증 로그, 증빙, 생성 스크립트 `parse.py`·`build.py`

## 6. 실제 실행한 명령(로그: `R3-VALIDATION-LOGS/`)

| 명령 | 결과 |
|---|---|
| `npm run portfolio:check` | exit 0 — 84건 통과, review 78, approved 6 |
| `npm run typecheck` | exit 0 |
| `node scripts/portfolio.mjs sync --stage review` | exit 0 — 84건 포함 |
| `PORTFOLIO_STAGE=review npm run build` | exit 0 — 정적 페이지 89개 |
| `node scripts/portfolio.mjs sync --stage public` | exit 0 — 6건 포함, 78건 제외 |
| `npm run build` | exit 0 — 정적 페이지 11개 |
| 공개 빌드 산출물 검사 | 3차 slug 검출 0회, `public/portfolio`에는 approved 6건만 |
| `npm run portfolio:export -- --slug <30개> --lang all --png` | 30회 모두 exit 0, PDF 90개, 잘림 의심 0. 일본어 제목을 고친 3건은 다시 실행했고 역시 exit 0 |

- 로그 파일 `04-build-review.log` 첫 줄에 오타 환경변수(`PORTFORTFOLIO=1`)가 남아 있습니다. 쓰이지 않는 변수라 결과에는 영향이 없습니다.

## 7. 검수 결과

| 항목 | 방법 | 결과 | 구분 |
|---|---|---|---|
| 150장 연결 | 상세 1440·390에서 figure별 로드·표시 비율 측정 | 150/150 로드, 비율 왜곡 0 | 자동 |
| 표시 크기 | 같은 측정 | 1440: 데스크톱 641~1290px, 폰 252~324px. 390: 데스크톱 313~366px, 폰 135~324px(4대 2열) | 자동 |
| PC·Tablet·Mobile × 한·영·일 | 메인·목록·3차 상세 30쪽 × 1920·1440·1024·768·430·390 × KO·EN·JP | 576쪽 이상 0 | 자동 |
| 일본어 표지 제목 | 85건 × 6폭 줄 분석 | 금지 문자·조사로 시작하는 줄 0, 넘침 0 | 자동 |
| 목록 카드 | 1440 '전체' 탭 전체 캡처 | 3차 30장 표시, 데스크톱·폰 카드 교차 | 눈 확인 |
| 상세 | 1440 전체 페이지 6건(작업실별), 390 EN 3건, 768 JP 2건, 폰 묶음 390·1440 | 레이아웃 붕괴·크롭 없음 | 눈 확인 |
| 이미지 150장 | 작업실 컨택트시트 5장(축소), 원본 확대 1장(E 로고) | 원본 결함 미발견(축소 수준) | 눈 확인(제한적) |
| PDF | export 보고서(쪽별 이미지 id) + PNG 빈 쪽 검사 | 90/90 이미지 5장, 빈 쪽 0, 쪽수 5·6·8 | 자동 |
| PDF 육안 | A hotel(ko)·B clinic(en)·C dog(en)·D beauty(ja)·E podcast(ja) 전체 쪽 | 비율·쪽 나눔 정상 | 눈 확인 |
| 기존 보존 | 1·2차 content SHA-256 371개, 코드 diff | 동일, 공통 코드 변경 1줄 | 자동 |

## 8. 남은 문제·미검증(원본 이미지 결함과 배치·콘텐츠 문제 분리)

**원본 이미지(수정하지 않음)**
1. dog-walking-booking-app 02·03: 워커 사진이 흐리고 실내 운동복 차림입니다(C실 보고서도 같은 지적).
2. design-conference-portal 02: 연사 사진의 원본 해상도가 낮습니다(A실 보고서).
3. E 6건: 사이드바·우측 패널 구조가 비슷하고, 같은 키비주얼을 여러 화면에 재사용합니다(통합 QA 지적).
4. 브랜드 이름 중복: home-cooking-subscription-app 화면의 브랜드가 'morrow'입니다. 1차 MORROW SELECT, 2차 서비스 예약·멤버십에 이어 네 번째로 같은 이름이 나옵니다(2차 검수 보고서 7-1과 같은 문제).

**배치·콘텐츠**
5. 카드 이미지: 작업실 지시대로 모두 01번 1장입니다. 2차 검수 결과처럼 모바일 앱 카드는 폰 2~3대로 보여 주면 더 잘 구분됩니다. 원하시면 바꾸겠습니다.
6. D 6건의 마무리 문장(statement): 원문대로 "이 사례는 자체 UI 콘셉트이며…"라는 고지문입니다. 마무리 메시지로는 딱딱해서, 고지문은 제작 범위에 이미 있으니 문장을 바꾸는 것을 제안합니다.
7. 메인 화면 타일(review 단계): 분류 표준편차가 3.96에서 6.27로 커졌습니다(platform·web 각 21, integration 3). 작업실 권장 분류를 그대로 따랐습니다. 공개 6건의 타일은 변하지 않았습니다.
8. 1차 5건(civicdesk, sitelog, stayport-pms, penova-class, nodera-flow): 개요 lead와 overview가 같은 문장이라 같은 문장이 두 번 보입니다. 이번 작업 중 발견했고, 1차는 수정 금지라 그대로 두었습니다.

**검증하지 않은 것**
9. 150장 전수를 원본 크기로 눈으로 본 것은 아닙니다(컨택트시트 수준).
10. 90개 PDF 중 육안 확인은 5개입니다. 나머지 85개는 자동 검사만 했습니다.
11. 상세 30쪽 중 1440 전체 페이지를 눈으로 본 것은 6쪽입니다.
12. 한·영·일 문장의 자연스러움을 원어민 수준으로 감수하지 않았습니다. 확인한 것은 누락 0, 한글 섞임 0, 일본어 마침표 0입니다.

**공개 승인**
13. 30건 모두 `review`입니다. 공개 여부는 사용자 결정 후 별도로 진행합니다.
