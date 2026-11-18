# D·E실 통합 수정·검증 보고 — 2026-11-10

기준: v24 이후 통합본(A실 2장·B실 부분 반영 포함, 커밋 db3f9ee) → 이번 변경.

## 0. A·B실 반영 상태 확인
| 항목 | 상태 |
|---|---|
| A · helio-desk-sla-operations | 반영(차트 정상) |
| A · secondloop-transaction-tracking | 반영(View transaction 버튼·₩218,000+₩4,000) |
| A · 운송 ERP 신규 3장 | 미반영 — 화면 안 공개 금지 거래처 표기, 교체본 대기 |
| B · nodera-flow visual-builder·request-intake + 시설 구매 승인 원고 | 반영 |
| B · nodera-flow approval-inbox·run-history | 숨김(이전 사례 ₩480,000·WF-261109-008) — 교체본 필요 |
| B · civera-layer-explorer | 반영 |
| B · civera-command-center | 보존(신규는 날짜 2026.11.10, 기존 시나리오 2027.07.15와 다름. 기존 3D 대표가 나머지 8장과 같은 디자인 계열) |
| B · civera-flood-timeline | 보존(신규 그래프 T+00 0동·T+30 약 55동 ↔ 같은 페이지 사건 리포트 24·71동) |
| B · 통근버스 2장 | 보류 — approved 실제 수행 프로젝트. 신규는 'ILLUSTRATIVE DATA · UI DEMO' 재구성 화면, B 원고는 '정적 시연'으로 기술해 기존 수행 범위(백엔드·API)와 충돌. 사용자 결정 필요 |

## 1. D — caption 26장 보강
- 대상 26장 모두 `caption.ko/en/ja` 추가(기존 alt·id·파일·kind·블록·상태 무변경, JSON 추가 줄만). 템플릿(`_template`) 제외하면 196장 전체가 3개 언어 caption 보유.
- 작성 기준: 화면에 실제로 보이는 기능만. approved 실제 프로젝트(전세버스·통근버스·커머스·메타버스·운송 ERP)는 화면 속 수치를 옮기지 않음. FITY는 메타데이터만.
- 통근버스 2장 caption은 현재(기존) 이미지 기준. 신규 이미지로 바꾸게 되면 B실 caption으로 교체해야 함.

## 2. D — NODERA 도메인 정합성
- B실 최종 UI 도메인: WF-014 V2 시설 구매 승인(금액 조건 3,000,000원, REQ-092 ₩2,800,000, 담당자 지정 경로, 최종 승인 대기).
- 제목·부제·요약·개요(본문=문제)·업무 흐름 5단계·기능 카드 2개·마무리 문장·노출 이미지 2장 alt/caption 한·영·일 일치 확인. 노출 문구에 '콘텐츠 게시·마케팅·₩480,000·WF-261109-008' 없음(남은 `公開準備`는 워크플로 버전 '배포 준비' 의미).
- 숨김 2장(approval-inbox·run-history)은 화면 내용이 이전 사례라 노출 제외. 교체본 필요(B실).

## 3. D — 실행 명령 (로그: `logs/01~08`)
| # | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| 1 | `npm ci` | 0 | 설치 성공 |
| 2 | `npm run portfolio:check` | 0 | 30건 통과(경고: 기존 저해상도 1건) |
| 3 | `node scripts/portfolio.mjs sync --stage review` | 0 | 30건 포함 |
| 4 | `npm run typecheck` | 0 | |
| 5 | `PORTFOLIO_STAGE=review npm run build` | 0 | 상세 30경로 생성 |
| 6 | `node scripts/portfolio.mjs sync --stage public` | 0 | 6건 포함·24건 제외 |
| 7 | `npm run build` (public) | 0 | 상세 6경로, 빌드 산출물에 review 프로젝트 흔적 0 |
| 8 | 미리보기 빌드(`scripts/preview-build.mjs`, review 단계) | 0 | 웹 검사용 |

## 4. D — WEB 반응형·다국어 매트릭스 (review 단계 미리보기, Chromium)
- 상세 30개 × 1920/1440/1024/768/430/390 × ko/en/ja = **540개 모두 실행**: 정상 495 · 주의 45 · 오류 0 (`logs/web-matrix.csv`)
  - 검사: 이미지 로딩·자연 크기(확대 표시 없음)·잘림(object-fit cover 비율 차)·가로 스크롤·글자 넘침·화면 밖 요소·버튼/링크 겹침·언어 전환(html lang)·다음 프로젝트 링크·숨김 이미지 노출·JS 오류
  - 깨진 이미지 0, 가로 스크롤 0, 글자 넘침 0, 버튼 겹침 0, 숨김 이미지 노출 0, 언어 불일치 0, JS 오류 0, 다음 프로젝트 링크 540/540
  - 화면 밖 요소 2,421건 감지 → 전부 사용자 흐름 가로 스크롤 레일 내부(의도된 동작). 레일 밖 실제 넘침 0(768·430·390 × 3언어 × 30개 재검사)
  - **주의 45건**: stage형 표지(통근버스·NODERA·REELSHIFT·SUBSCRIPTA·VELORA) 1920·1440·1024에서 표지 화면 비율 1.60→1.67(통근버스 1.26→1.33)로 위아래 약 4~5% 잘림. 기존 공통 렌더러 동작
- 목록 18개 조합(6폭×3언어): 첫 화면 11장 → 더보기 2회 → 30장, 필터 7종 배지 수 = 실제 카드 수(30·9·21·13·25·6·5), 같은 줄 카드 높이 차 0, 썸네일 깨짐 0, 가로 스크롤 0

## 5. 잔여 오류 우선순위
| 등급 | 내용 | 담당 |
|---|---|---|
| P1 | 통근버스 B실 2장 적용 여부(approved 실제 프로젝트, 재구성 화면·'정적 시연' 원고) | 사용자 결정 → 통합 |
| P1 | NODERA approval-inbox·run-history 교체본(WF-014·₩2,800,000 기준) | B실 |
| P1 | 운송 ERP 신규 3장 교체본(공개 금지 거래처 표기 제거) | A실 |
| P1 | CIVERA flood-timeline 수치(T+00 24·T+30 71·T+60 126 기준)·command-center 날짜 정합 | B실 |
| P2 | stage형 표지 4~5% 잘림(공통 렌더러) | 개발자(승인 시) |
| P2 | CIVERA layer-explorer만 밝은 2D 디자인 계열(나머지 3D 계열) | C실 평가 |
| P2 | IMPRINT LAB 데모 사진 속 실존 인물 사진 출처 확인 | 사용자 |
| P2 | SUBSCRIPTA 마무리 문장 영어 430px에서 마지막 단어 한 줄(기존 문구) | D실 |
| P2 | 통근버스 기사 앱 원본 375×812 저해상도 | v27 해결 — 재구성본(1179×2556)으로 교체 |

## 6. 미실행·확인 불가
- 실제 기기(iOS Safari·Android Chrome)·Firefox·Safari 엔진 렌더링: 미검증(Chromium만)
- 터치 제스처·스크린리더 등 접근성, 성능(LCP 등): 미검증
- 운영 서버 배포 결과: 범위 밖(개발자 반영)
- PDF: 요청대로 생성하지 않음(A·B 반영 확인용으로 helio·secondloop·nodera·civera·통근버스 PDF만 이전 단계에서 생성)
- 검색창: 현재 없는 기능 — 개발하지 않음

---

# C실 확정 재제작 14장 반영 — 2026-11-10

## 적용 13장 (파일 교체 + alt·caption 한·영·일만 갱신, id·kind·tier·external·블록·순서·썸네일 무변경)
1. content/portfolio/civicdesk/images/civicdesk-response-review.webp (c04)
2. content/portfolio/farm-commerce-backend/images/farm-commerce-admin-catalog.webp
3. content/portfolio/metaverse-live-app/images/metaverse-avatar-interaction.webp
4. content/portfolio/metaverse-live-app/images/metaverse-live-event.webp
5. content/portfolio/sitelog/images/sitelog-drawing-issues.webp (s02)
6. content/portfolio/smart-factory-mes/images/mes-lot-trace.webp
7. content/portfolio/smart-factory-mes/images/mes-production-plan.webp
8. content/portfolio/smart-factory-mes/images/mes-work-orders.webp
9. content/portfolio/stackflow-wms/images/wms-inbound.webp
10. content/portfolio/stackflow-wms/images/wms-location-map.webp
11. content/portfolio/subscripta/images/subscripta-billing-operations.webp
12. content/portfolio/velora-space/images/velora-floorplan.webp
13. content/portfolio/velora-space/images/velora-room-viewer.webp

## 보류 1장
- content/portfolio/charter-bus-dispatch/images/dispatch-calendar.webp — approved 실제 수행 프로젝트의 표지·썸네일. 기존 파일은 당시 화면을 익명 처리한 캡처(2880×1463), 신규는 'UI PORTFOLIO · DEMO' 재구성 화면이고 caption도 'UI 데모'로 기술. 공개 중인 실제 프로젝트 대표 화면을 시연 화면으로 바꾸는 일이라 사용자 결정 후 반영(통근버스 B실 2장과 같은 판단).

## 원고 충돌 점검
- 수치·ID 대조: MES(1,200·840·822·18·3,550·WO-261106-014~017), WMS(ASN-261106-008 200/198, A-02-03 198/240·82.5%), SUBSCRIPTA(6→8석 ₩158,400), SITELOG(A-102 Rev.03·SL-021), CIVICDESK(발송 단계), 메타버스(미션·참여) — 기존 원고와 충돌 없음.
- VELORA 신규 평면도는 부엌 16㎡·침실 24㎡·현관(ENTRY)·'05 SPACES' 표기(기존 화면 15㎡·17㎡·OTHER). 원고에 해당 면적 문장이 없어 수정 불필요. 숨김 상태인 velora-collection의 '4개 공간'과 차이가 있으나 노출되지 않음.
- 블록 본문(textImage body)은 기존 문장 유지 — 새 화면과 모순 없음 확인(c04 '발송할 문서와 결재 절차', s02 'SL-021 배관 간섭').

## 디자인 계열(보고만)
- 신규 화면은 공통 'UI PORTFOLIO · DEMO' 사이드바 디자인으로, 같은 프로젝트의 기존 화면과 계열이 다름: CIVICDESK(c01~c03), SITELOG(s01·s03·s04), STACKFLOW(대시보드·출고 등), MES(대시보드·현장 단말 — 기존 'PIUS MES DEMO' 어두운 사이드바), FARM(푸룻 Commerce Operations), SUBSCRIPTA(상단 탭형). C실 평가 대상.
- MES 신규 3장의 사이드바 브랜드는 'PIUS WORKSPACE'(기존 MES 화면도 'PIUS MES DEMO' — 이 프로젝트는 PIUS 자체 데모·PoC로 등록되어 있어 기존 정책과 동일).

## 검증
- portfolio:check 0, typecheck 0, build 0(public, review 흔적 0)
- PDF(검증 목적 내보내기, ko·en·ja A4 Full·External): 8개 프로젝트 모두 생성·오류 0, 13장 Full 포함, 숨김 미노출, 이번 교체로 새로 생긴 중복 없음(CIVICDESK c01·SITELOG s01의 표지+첫 화면 반복은 4차 지시 구조 그대로)
- WEB: 9개 프로젝트 × 6폭 × 3언어 = 162 조합 — 13장 각각 해당 프로젝트 18개 조합 모두 노출, 깨짐·가로 스크롤·언어 오류·JS 오류 0. 잘림 감지 18건은 기존 stage 표지(SUBSCRIPTA·VELORA, C실 화면 아님)
- 미검증: 실제 기기·Safari·Firefox, 접근성, 성능
