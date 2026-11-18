# PIUS 홈페이지 v32 — 2차 포트폴리오 24건 품질 검수 보고서

- 검수일: 2026-11-13
- 기준 소스: 작업 원본 v31 + 같은 날 반영한 v32 화면 수정(목록 필터 고정·"더 보기"·상세 글자 크기). 첨부된 v31 홈페이지 zip과 같은 커밋(669fd3f)에서 출발했습니다.
- 결과 커밋: `01c347e`(검수 수정), `7a8b139`(일본어 제목 줄바꿈)
- 상태: 2차 24건 모두 `review` 유지. `approved` 변경 없음.

## 1. 최종 판정

**조건부 통과**

- P0 없음.
- P1 6종은 모두 수정했고, 수정 후 다시 검증했습니다.
- 공개 전 사용자 결정이 필요한 항목이 2가지 남았습니다(7장).
  1. MORROW 브랜드명 중복
  2. 분류 제안 2건
- 공개 승인(`review` → `approved`)은 이번 작업 범위가 아닙니다.

| 완료 조건 | 결과 |
|---|---|
| 기존 30건 보존 | content 파일 228개 SHA-256 전후 동일 |
| 신규 24건·이미지 120장 보존 | 120장 SHA-256 전후 동일, 인계본 MANIFEST와 120/120 일치 |
| 신규 이미지 연결 | 상세 페이지에서 120/120장 로드됨, 표시 비율 왜곡 0 (1440·390 측정) |
| BI·기존 구조 | 변경 파일은 `components/Portfolio/*`뿐. 로고·Hero·About·Services·Process·Contact·Header·Footer는 변경 없음 |
| 스키마·타입·빌드 | `portfolio:check` 54건 통과, `typecheck` 통과, review 빌드 59쪽, public 빌드 11쪽 |
| 공개 단계 | approved 6건만 포함, 2차 slug는 공개 빌드 산출물에서 0회 검출 |
| 반응형 | 6폭 × 3언어 × 26쪽 = 468쪽 자동 검사: 가로 넘침 0, 화면 밖 요소 0, 깨진 이미지 0, 언어 불일치 0 |
| PDF | 24건 × 3언어 = 72개 출력. 각 8쪽(총 576쪽), 이미지 5장 모두 포함, 잘림 의심 0, 빈 쪽 0 |

## 2. 검수 범위와 방법

| 항목 | 방법 | 구분 |
|---|---|---|
| 이미지 120장 원본 | 프로젝트별 5장을 한 장에 모은 대조표 12장(이미지·id·tier·caption·alt)을 보고, 3장은 확대해 수치를 대조 | 눈 확인(축소본). 확대 대조는 3장만 |
| 대표 이미지·카드 | 목록 "전체" 탭의 2차 24장을 실제 브라우저 화면으로 캡처해 전후 비교 | 눈 확인 |
| 상세 24쪽 | 1440 전체 페이지 캡처 24장을 모두 봄. 모바일 대표 7건 표지 1440 캡처. 390 일본어 3건 | 눈 확인 |
| 이미지 표시 | 상세 figure의 실제 표시 크기, 비율, 로드 상태를 1440·390에서 측정 | 자동 |
| 문구 | 3개 언어 누락, 위험 표현(구현·운영·성과 등) 검색, 구두점·문자 섞임 검사, 24개 caption 3개 언어 대조 | 자동 + 24개 caption 직접 대조 |
| 반응형 | 1920·1440·1024·768·430·390 × KO·EN·JP. 메인, 목록, 2차 상세 24쪽 | 자동 |
| 일본어 제목 | 54건 × 6폭: 표지 제목의 줄별 글자, 글자 크기, 넘침 | 자동 |
| PDF | export 보고서(쪽별 이미지 id)와 PNG 빈 쪽 검사 | 자동 |
| PDF 시각 확인 | 일본어 표지 24장 전부. cbt(ko)·warranty(en)·home-service(ja)는 8쪽 전체 | 눈 확인 |

명령 실행 기록(모두 실제 실행):

```
npm run portfolio:check
node scripts/portfolio.mjs sync --stage review
npm run typecheck
PORTFOLIO_STAGE=review npm run build
node scripts/portfolio.mjs sync --stage public
npm run build
npm run portfolio:export -- --slug <24개 slug> --lang all --png   # 1회차 72개
npm run portfolio:export -- --slug <24개 slug> --lang ja --png    # 일본어 제목 수정 후 24개 재출력
```

## 3. 문제 현황

| 등급 | 발견 | 수정 | 남음 |
|---|---|---|---|
| P0 | 0 | — | 0 |
| P1 | 6종(25곳) | 6종 | 0 |
| P2 | 7종 | 5종 | 2종(사용자 결정) |

### P1 — 수정 완료

1. **stage 변형에서 '대표 기능' 글 열이 0px로 무너짐**
   - 대상: 공통 CSS. 1차 stage 5건(그중 commute-shuttle-platform은 공개 중)과 2차 stage 3건.
   - 증상: 제목과 본문이 몇 글자 폭의 세로줄로 표시됐습니다. 측정값은 width 0px였습니다.
   - 원인: 글 열이 크기 컨테이너(`container-type:inline-size`)인데 가운데 정렬 그리드 안에 있어 폭이 0으로 계산됐습니다.
   - 수정: `Project.module.css`에 `width:100%` 한 줄을 추가했습니다. 수정 후 780px.
   - 6장(1차 stage 표지 크롭)에서 다룬 문제와는 다른 새 결함입니다. 공개 페이지에도 해당합니다.
   - 증빙: `evidence/02`, `03`

2. **보조 화면이 1장인 갤러리가 2단의 왼쪽 반만 사용**
   - 대상: 공통 렌더러. 2차 6건, 1차 2건(penova-class, stayport-pms).
   - 수정: 열 수를 이미지 수 이하로 제한했습니다. 1장이면 최대 1080px로 표시합니다.
   - 증빙: `evidence/04`

3. **모바일 대표 화면이 첫 화면에서 작고 잘림**
   - 대상: warranty-repair-service, loyalty-points-ops, commerce-returns-ops.
   - 증상: stage 표지에서 폰이 약 248px이고, 1440×900 첫 화면에는 위쪽 1/3만 보였습니다.
   - 수정: 기존 공통 레이아웃으로 바꿨습니다. warranty·commerce는 `split`, loyalty는 `rail`.
   - 결과: 첫 화면에서 폰 전체가 보입니다. 새 렌더러는 추가하지 않았습니다.
   - 증빙: `evidence/05-*`

4. **고객·관리자가 함께 쓰는 서비스인데 카드에 관리자 화면만 보임**
   - 대상 8건: people-attendance-payroll, franchise-network-ops, academy-enrollment-ops, clinic-branch-reception, equipment-rental-ops, employee-learning-compliance, form-survey-builder, corporate-expense-ops.
   - 수정: 카드를 "데스크톱 1장 + 폰 1장"(스키마가 허용하는 조합)으로 바꿨습니다. 각 프로젝트에 이미 있던 core 모바일 화면을 썼습니다.

5. **역할별 모바일 화면이 여러 장인데 카드에 폰 1대만**
   - warranty-repair-service: 고객 접수 + 현장 기사, 폰 2대.
   - home-service-dispatch: 요청 → 견적 비교 → 현장 점검, 폰 3대.

6. **mainCategory가 실제 성격과 다름**
   - 대상 4건이 `mobile`로 분류돼 있었지만, 모바일은 5장 중 1장(보조 화면)이고 표지와 핵심 화면은 관리자 웹입니다.
   - 수정: academy → `erp`, clinic → `platform`, equipment → `erp`, corporate-expense → `erp`. 모두 원래 categories에 있던 값입니다.
   - 2차 분포 변화: erp 5→8, platform 6→7, mobile 6→2, web 6, commerce 1.
   - 영향: review 단계의 메인 타일 표준편차가 3.32에서 3.96으로 커졌습니다. 지시에 따라 숫자 균형보다 실제 성격을 우선했습니다. 공개 6건의 카운트는 변하지 않았습니다.

### P2 — 수정 완료

- **카드 대표 화면 교체(3건)**: 표 화면이 이어지던 데스크톱 전용 카드 3건을 더 특징적인 기존 core 화면으로 바꿨습니다. 상세 표지는 그대로입니다.
  - marketing: 광고 소재 비교
  - donation: 모금 추이 차트
  - cbt: 응시자 문제 풀이 화면
- **2차 목록 순서 재배치**: 데스크톱 / 데스크톱+폰 / 폰 카드가 번갈아 나오게 했습니다. 업종이 겹치는 프로젝트(HR, 예약)는 떨어뜨렸습니다.
  - 이전에는 45~50번에 데스크톱 단독 카드가 6장 연속이었습니다. 지금은 최대 1장씩입니다.
  - 증빙: `evidence/01-*`
- **일본어 표지 제목 줄바꿈**: 원래 3건에서 줄이 「・」로 시작했고, 5곳에서는 단어 중간(従業|員, 学習|塾, 保険|金)에서 끊겼습니다.
  - 공통 함수 `jaSegments`를 고쳐, 구분 기호와 조사는 앞 단어에, 한 글자 한자 접미사는 앞 한자 단어에 붙였습니다.
  - 54건 × 6폭에서 금지 문자로 시작하는 줄 0, 넘침 0입니다.
  - 1차 일부(leasegrid, sitelog, stayport-pms 등)도 줄 위치가 바뀌었습니다. 모두 개선 방향입니다.
  - 증빙: `evidence/06-*`, `07`
- **문구 정리**
  - 일본어 문장 끝 ASCII 마침표 12곳 → 「。」.
  - marketing-04 영문 caption: 국문 '담당자'를 'designer'로 옮긴 부분을 바로잡았습니다.
  - cbt-04 영문 caption: 어색한 문장을 고쳤습니다.
  - service-booking 국문 개요: "실제 운영에 필요한 검토 화면"을 "운영자가 검토하는 화면"으로 바꿨습니다(실운영으로 오해될 수 있음).

## 4. 프로젝트별 결과

| 실 | slug | 수정 | 판정 |
|---|---|---|---|
| A | sales-crm-pipeline | JA 마침표 5 | 통과 |
| A | people-attendance-payroll | 카드 D+P, JA 마침표 6 | 통과 |
| A | project-resource-costing | (JA 제목 줄바꿈, 공통 수정) | 통과 |
| A | revenue-reconciliation | 순서 | 통과 |
| A | supplier-qualification | 순서 | 통과 |
| A | corporate-expense-ops | 카드 D+P, mobile→erp | 통과 |
| B | service-booking-payment | 개요 국문 표현 | 통과 (분류 제안 7-2) |
| B | warranty-repair-service | stage→split, 카드 폰 2대, JA 제목 | 통과 |
| B | franchise-network-ops | 카드 D+P, 단일 갤러리(공통) | 통과 |
| B | equipment-rental-ops | 카드 D+P, mobile→erp | 통과 |
| B | home-service-dispatch | 카드 폰 3대, 단일 갤러리(공통) | 통과 |
| B | residential-facility-booking | JA 마침표 1 | 통과 |
| C | loyalty-points-ops | stage→rail | 조건부 (MORROW 7-1) |
| C | academy-enrollment-ops | 카드 D+P, mobile→erp, 단일 갤러리(공통) | 통과 |
| C | clinic-branch-reception | 카드 D+P, mobile→platform, 단일 갤러리(공통) | 통과 |
| C | commerce-returns-ops | stage→split | 통과 |
| C | donation-donor-crm | 카드 화면 교체 | 통과 |
| C | insurance-claim-operations | 순서 | 통과 (분류 제안 7-2) |
| D | grant-application-review | 순서 | 통과 |
| D | employee-learning-compliance | 카드 D+P, JA 제목 | 통과 |
| D | multi-site-content-cms | 순서 | 통과 |
| D | marketing-campaign-ops | 카드 화면 교체, EN caption | 통과 |
| D | form-survey-builder | 카드 D+P | 통과 |
| D | cbt-exam-center | 카드 화면 교체, EN caption | 통과 |

- service-booking-payment도 MORROW 브랜드 문제(7-1)에 해당합니다.
- 상세 블록 순서(3.3)는 바꾸지 않았습니다.
  - 24건이 같은 블록 순서를 쓰지만, 상세 레이아웃이 split 9 · rail 8 · editorial 7로 나뉘어 화면 리듬은 다릅니다.
  - 혼합 서비스는 표지 바로 다음 '대표 기능'에 모바일 화면이 이미 배치돼 양쪽 역할이 드러납니다.
  - 블록을 바꾸면 그 블록 문구도 3개 언어로 다시 써야 해서, 효과가 분명하지 않은 일괄 변경은 하지 않았습니다.

## 5. 이미지 120장

- 원본 결함(오탈자·왜곡·잘린 UI·숫자 불일치)은 축소 대조표 수준에서 발견하지 못했습니다. 원본 WebP는 수정하지 않았습니다(SHA-256 120/120 동일).
- 확대해 수치를 대조한 것은 3장뿐입니다. 나머지 117장 안의 작은 글자는 판독하지 않았습니다.
  - crm-opportunity-board: 18건, ₩42,000,000, 60%
  - cbt-candidate-session: 14번 문항, 13/40, 32:18
  - returns-intake-mobile: 89,000원
- caption 24개는 3개 언어를 대조했습니다(프로젝트당 1개). 의미 차이 2건을 수정했습니다.
- 홈페이지 배치: 상세에서 120/120장 로드, 표시 비율 왜곡 0, 컨테이너 크롭 0.
  - 1440에서 데스크톱 이미지가 620px보다 작게 표시되는 곳은 0곳입니다('다음 프로젝트' 썸네일 제외).
  - 폰 화면은 phones 블록에서 약 250px로, 일반적인 기기 틀 크기입니다.

## 6. 기존 1차 이슈(stage 표지 상하 1.7~2.0% 크롭)

다시 작업하지 않았습니다. 크롭 비율도 이번에 다시 측정하지 않았습니다.

이번 검수에서는 같은 stage 변형의 다른 결함(P1-1, 글 열 붕괴)을 새로 찾아 수정했습니다. 이 결함은 공개 중인 commute-shuttle-platform에도 있었습니다.

## 7. 남은 항목(사용자 결정)

1. **MORROW 이름 중복**
   - service-booking-payment 화면에는 'morrow.' 헤어·스튜디오, loyalty-points-ops 화면에는 'MORROW MEMBERS'가 나옵니다. 1차 morrow-select('MORROW SELECT' 패션 커머스)와 이름이 같습니다.
   - 서로 다른 가상 브랜드 셋이 같은 이름을 써서, 같은 회사의 연작으로 읽힐 수 있습니다.
   - 이름이 이미지 안에 있어 원본을 고쳐야 하므로 수정하지 않았습니다.
   - 선택지: (a) 그대로 둔다, (b) 두 프로젝트 이미지와 문구의 브랜드명을 교체한다(이미지 재제작 필요).
2. **분류 제안(변경하지 않음)**
   - service-booking-payment: `web` → `mobile`. 고객 모바일 예약이 표지입니다.
   - insurance-claim-operations: `web` → `platform`. 고객 앱과 심사 웹이 함께 있습니다.
   - 근거가 확정적이지 않아 바꾸지 않았습니다.
3. **공개 승인**: 24건 모두 `review`입니다. 공개할 프로젝트를 정해 주시면 `approved`로 바꿉니다.

## 8. 참고

- **PDF에는 caption이 출력되지 않습니다.** 1차와 같은 출력 디자인입니다. 그래서 "PDF caption 일치"는 해당 사항이 없습니다. PDF에서는 쪽별 이미지 id(5장 포함 여부)를 검증했습니다.
- **카드 화면과 상세 표지가 다를 수 있습니다.** marketing·donation·cbt 3건이 그렇습니다. thumbnail은 목록 카드와 '다음 프로젝트' 링크에만 쓰입니다.
- **공통 컴포넌트 변경 영향**
  - stage CSS: stage 변형 프로젝트(1차 5건)의 해당 블록만 바뀝니다.
  - 갤러리: 보조 화면이 1장인 갤러리(8건)만 바뀝니다.
  - 일본어 제목: 일본어 표지와 PDF 제목의 줄 위치만 바뀝니다.
  - 그 밖의 레이아웃, 타이포그래피, 1차 데이터는 변경하지 않았습니다.
- 같은 날 반영한 v32 화면 수정(목록 필터 고정, "더 보기", 상세 글자 크기)도 이 zip에 포함돼 있습니다. 이번 반응형·PDF 검증은 그 수정까지 포함한 상태에서 실행했습니다.

## 9. 첨부

- `R2-CHANGELOG.csv`: 수정 49행(실제 수정한 파일만)
- `evidence/`
  - 01 목록 카드 전후 4장
  - 02 stage 글 열
  - 03 loyalty 대표 기능
  - 04 단일 갤러리
  - 05 모바일 표지 3건
  - 06 일본어 제목 2건
  - 07 PDF 일본어 표지 24장
  - 08 PDF 8쪽 전체 3건
