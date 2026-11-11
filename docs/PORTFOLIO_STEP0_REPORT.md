# STEP 0 이미지 노출 정책 적용 — 작업 보고서

기준 입력: `pius-work-v20-portfolio30-structure-20261110` (커밋 5477502). 승인 정책: 11개 프로젝트 117장 C67 / S27 / H23 / E55 (2026-11-10 사용자 승인).
상세 이행표: `docs/PORTFOLIO_STEP0_IMAGE_POLICY.md` (이미지별 웹 블록·Full 쪽·External 쪽·제외 사유).

## 1. 결과 요약

| 항목 | 결과 |
|---|---|
| 프로젝트 / 상태 | 30개 · approved 6 · review 24 — id·status·visible·featured·order·includeInPdf 작업 전후 동일 |
| 원본 이미지 | 126개 SHA256 작업 전후 동일 (생성 0, 삭제 0, 수정 0) |
| C 67 | 전부 표지 또는 주요 블록(textImage·screenShowcase·userFlow)에 노출 |
| S 27 | 전부 보조 블록(featureGrid 화면 카드)에만 노출 · 표지·카드·External 0 |
| H 23 | 웹·Full·External·카드 연결 0회 · 원본과 images[] 메타데이터 보존 · public/ 복사 안 함 · 미리보기 아티팩트에서도 삭제 |
| E 55 | External PDF ko·en·ja 33개 모두 E 55/55 포함, E 아닌 화면 0, 보조·숨김 0 |
| 나머지 19개 | 데이터 변경 없음 (14개 `file: null` 대기 정책 그대로) |

## 2. 구현 방식

External PDF에서 화면 단위 우선순위를 기존 블록만으로는 지정할 수 없어(E가 아닌 C도 같은 블록에 있음), 요청서 3-2항의 선택 메타데이터를 정식 스키마로 추가했다.

- `images[].presentation = { tier: core|support|hidden, external?: true }` — 선택 필드. 없으면 예전 동작(나머지 19개 그대로).
- 검증(`scripts/portfolio.mjs`): hidden 연결 시 오류, support를 표지·카드·주요 블록에 두면 오류, external은 core만, hidden은 "안 쓰는 이미지" 경고 제외, hidden 파일은 public/ 복사 제외, manifest에 tier·external 직렬화.
- 렌더(`lib/portfolio/text.ts` `imagesOf`/`imageOf`): hidden은 어떤 경로로도 반환하지 않음(이중 안전장치).
- External(`lib/portfolio/print.ts` `externalView` + `paginateExternal`): E 화면만 남김 → 표지는 표지 안의 E(없으면 첫 E 화면) → 표지 화면은 뒤에서 반복 안 함 → 화면이 빠진 블록 제외 → E가 있는 쪽 우선, 흐름은 통째로 넣거나 뺌 → 7쪽 이내.
- 출력 기록: 화면 틀에 `data-img`(이미지 id), export가 쪽별 화면 id를 `exports/report.json`에 저장 → 이행표를 실제 PDF에서 생성.
- MES 태블릿: `screenShowcase` 레이아웃 `tablets` 추가(웹 2열 넓게, PDF 한 쪽 2장).
- 공통 레이아웃 결함 수정: 화면이 왼쪽에 오는 textImage(`split--rev`)에서 화면이 좁은 글 칸에 들어가던 문제(에디토리얼 1440px에서 341px). 열 비율을 순서와 함께 뒤집음 → 1440에서 주요 화면 모두 폭 45% 이상.

## 3. 프로젝트별 블록 조정 (요약)

- **FITY**: 흐름(5단계)은 글로, C 상담/결과 화면은 새 'CONSULTATION' 블록으로. 전문가 화면에서 expert-profile(H) 제외, 관리자 화면은 admin-consult만. 핏 요청 블록은 두 화면이 모두 H라 제거(기능 설명은 서비스 구조 블록에 남아 있음). S 5장은 '그 밖의 화면' 카드.
- **MES**: 태블릿 2장 → `tablets`. 흐름도·분석(S)은 보조 카드로.
- **WMS**: PDA 쇼케이스는 피킹·실사(C)만, 입고·적치 PDA·로케이션·흐름도(S)는 보조 카드.
- **VELORA**: 비교(C) 전용 블록 복원, 모바일 소재 설정(C) 단독 블록, 저장 보드(S) 보조, collection·모바일 랜딩/뷰어(H) 제외.
- **CIVERA**: 레이어 탐색(H) 블록 제거, 시간축·리포트(S) 보조 카드, 서비스 구조 문구에서 숨긴 화면 기능과 "아홉 개 화면" 표현 정리(가상 데이터 지도 시안 명시).
- **NOCTAVE**: 모바일 일정·티켓만, 설명에 "실제 QR 발권·입장 기능 아님" 명시.
- **REELSHIFT**: 라이브러리·내보내기(H) 제외, 자막·모바일 승인(S) 보조 카드, "실제 인코딩·실시간 편집 아님".
- **THREADFORM**: 패턴·그레이딩(H) 제외, 컬러웨이·모바일 승인(S) 보조.
- **ROAMFRAME**: 예약 기록·지갑(H) 제외, 장소 탐색·모바일 경로(S) 보조, "실제 GPS·길 안내 아님", 서비스 구조의 "여덟 가지 화면"·예약 항목 정리.
- **MORROW**: 룩북·모바일 탐색(H) 제외, 탐색·장바구니(C) 각자 블록, 모바일 상품 상세 단독, 주문 조회·모바일 결제(S) 보조.
- **SECONDLOOP**: 거래 흐름은 글 5단계 + 제안·결제·추적(C) 3장 쇼케이스, 판매 등록은 데스크톱만, 검색·모바일 상세·모바일 판매 등록(S) 보조, 모바일 탐색(H) 제외.

참고: 요청서가 "현재 미참조"로 적은 일부 화면(MORROW discovery·shopping-bag, SECONDLOOP make-offer·checkout·tracking, VELORA comparison)은 v20에서 이미 연결돼 있었다. 이번에 C/S 위치에 맞게 다시 배치했다.

## 4. PDF 결과 (A4, ko·en·ja 쪽수 동일)

| 프로젝트 | 판본 | 쪽수 | 크기 | 잘림 |
|---|---|---|---|---|
| fity | full | 11쪽 | 최대 2.6MB | 0 |
| fity | external | 7쪽 | 최대 1.4MB | 0 |
| smart-factory-mes | full | 9쪽 | 최대 1.6MB | 0 |
| smart-factory-mes | external | 7쪽 | 최대 1.1MB | 0 |
| stackflow-wms | full | 10쪽 | 최대 2.0MB | 0 |
| stackflow-wms | external | 7쪽 | 최대 1.1MB | 0 |
| velora-space | full | 10쪽 | 최대 1.9MB | 0 |
| velora-space | external | 7쪽 | 최대 1.3MB | 0 |
| civera-twin | full | 8쪽 | 최대 2.4MB | 0 |
| civera-twin | external | 7쪽 | 최대 1.5MB | 0 |
| noctave-fest | full | 9쪽 | 최대 1.6MB | 0 |
| noctave-fest | external | 7쪽 | 최대 1.1MB | 0 |
| reelshift-studio | full | 10쪽 | 최대 1.6MB | 0 |
| reelshift-studio | external | 7쪽 | 최대 1.0MB | 0 |
| threadform-studio | full | 10쪽 | 최대 1.6MB | 0 |
| threadform-studio | external | 7쪽 | 최대 1.1MB | 0 |
| roamframe-travel | full | 10쪽 | 최대 1.8MB | 0 |
| roamframe-travel | external | 7쪽 | 최대 1.1MB | 0 |
| morrow-select | full | 10쪽 | 최대 1.2MB | 0 |
| morrow-select | external | 7쪽 | 최대 0.8MB | 0 |
| secondloop | full | 9쪽 | 최대 1.3MB | 0 |
| secondloop | external | 7쪽 | 최대 0.8MB | 0 |

16:9 샘플: fity-ja-169-external.pdf, secondloop-en-169-external.pdf, secondloop-en-169.pdf — 잘림 0.
전체 출력: 30개 × Full·External × 한·영·일 = 180개 + 16:9 샘플 3개, 잘림 의심 0건. 숨김 화면이 들어간 PDF 0개.

## 5. 실행한 검증

- `npm run portfolio:check` → 30건 통과(approved 6 · review 24). 경고: 이미지 대기 14건(기존 정책), commute 기사 앱 저해상도 1건(기존)
- `npm run typecheck` → 통과 · `npm run build` → 통과, 운영 빌드(.next)에서 review 24개 slug 흔적 0, public manifest 6건
- `portfolio:export` 요청 명령 4개 + VELORA·CIVERA·NOCTAVE·REELSHIFT·THREADFORM·ROAMFRAME·STACKFLOW External(+Full) 실행 → 전부 exit 0, 잘림 0
- 웹 DOM 검사(1440·390, 11개 상세): C·S 전부 렌더, H 0, 가로 스크롤 0, 이미지 로드 실패 0(390의 '다음 프로젝트' 미리보기는 모바일에서 원래 숨김)
- 줄바꿈 검사: 목록 + 11개 상세 × 1920·1440·1024·768·430·390 × 한·영·일 = 216개 화면, 문제 0
- 목록: 1920·1440·1024·768·430·390 캡처, 가로 스크롤 0

## 6. 변경 파일과 사유

| 파일 | 사유 |
|---|---|
| `lib/portfolio/types.ts` | `ImageTier`, ImageAsset `tier`·`external`, ShowcaseLayout `tablets` |
| `scripts/portfolio.mjs` | presentation 검증·직렬화, 역할별 참조 검사, hidden 경고 제외·public 복사 제외, `tablets` 허용 |
| `lib/portfolio/text.ts` | `imagesOf` hidden 제외, `imageOf` 추가 |
| `lib/portfolio/print.ts` | `externalView`, E 우선 `paginateExternal`, 태블릿 2장/쪽 |
| `components/Portfolio/print/PrintDoc.tsx` | hidden-safe 이미지 접근 |
| `components/Portfolio/blocks/Media.tsx` | `tablets` 레이아웃 |
| `components/Portfolio/blocks/Text.tsx`, `UserFlow.tsx` | hidden-safe 이미지 접근, 보조 카드 이미지 sizes |
| `components/Portfolio/media/Screen.tsx` | `data-img`(검수용 id) |
| `components/Portfolio/Project.module.css` | `tablets` 배치, 왼쪽 화면(split--rev) 열 비율 수정 |
| `scripts/portfolio-export.mjs` | 쪽별 화면 id를 report.json에 기록 |
| `content/portfolio/{11개}/project.json` | presentation 지정, 블록 재배치, 숨긴 화면 관련 설명 최소 수정(한·영·일) |
| `docs/PORTFOLIO_SCHEMA.md`, `docs/PORTFOLIO_STEP0_IMAGE_POLICY.md`, `docs/PORTFOLIO_STEP0_REPORT.md`, `CHANGELOG.md` | 문서 |

## 7. 남은 경고·한계·미완료

- `secondloop-transaction-tracking`(C·E): 화면 안에 템플릿 코드 문자열이 보이는 원본 문제(v20 보고). 승인대로 사용 중 — 교체 이미지가 필요함.
- `shuttle-driver-app` 375×812 저해상도 경고(대상 11개 밖, 변경 없음).
- FITY 핏 요청(FIT REQUEST) 섹션은 두 화면이 H라 제거. 이 기능을 화면과 함께 보여 주려면 새 C 화면이 필요.
- FITY 실제 서비스 범위(app-search·app-photos 포함)는 요청서 메모대로 확인 필요 — 보조 카드로만 노출.
- CIVERA command-center 이미지 alt에 '3D 도시 뷰' 표현이 남아 있음(화면 묘사, 구현 주장 아님. 이미지 메타데이터라 변경하지 않음).
- 승인 상태 변경 없음. 신규 이미지 제작 없음.
