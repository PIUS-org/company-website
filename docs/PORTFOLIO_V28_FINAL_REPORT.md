# v28 최종 일괄 수정·검증 보고 — 2026-11-11

기준: v26 결함 + 사용자 확정 3장 교체 결정(v27 반영분). 운영 서버 미접촉. PDF 생성 안 함.

## 1. 변경 표

| # | slug | 경로 | 이전 → 이후 | 이유 | 상태 |
|---|---|---|---|---|---|
| 1 | commute-shuttle-platform | images/shuttle-dashboard.webp | 1440×1139 실제 캡처(가림) → 2880×1800 재구성 UI | 사용자 확정(v27) | 수정 완료(v27, 유지) |
| 2 | commute-shuttle-platform | images/shuttle-driver-app.webp | 375×812 → 1179×2556 재구성 UI | 사용자 확정(v27) | 수정 완료(v27, 유지) |
| 3 | charter-bus-dispatch | images/dispatch-calendar.webp | 실제 캡처(가림) → 2880×1800 재구성 UI | 사용자 확정(v27) | 수정 완료(v27, 유지) |
| 4 | stackflow-wms | images/wms-inbound.webp | 흰 사이드바(C실 셸) → 남색 사이드바 셸 재렌더링, 2880×1800 | 같은 프로젝트 대시보드·출고·패킹과 셸 불일치 | 수정 완료 |
| 5 | stackflow-wms | images/wms-location-map.webp | 〃 | 〃 | 수정 완료 |
| 6 | subscripta | images/subscripta-billing-operations.webp | 사이드바 셸 → 상단 탭 셸 재렌더링, 2880×1800 | 다른 3장(상단 탭)과 셸 불일치 | 수정 완료 |
| 7 | civera-twin | project.json caption(layer-explorer) | 2D/3D 구분 문장 추가(한·영·일) | 3D 상황판과 역할 구분 | 수정 완료 |
| 8 | subscripta·stackflow-wms·civera-twin·imprint-lab | project.json reviewNotes | 낡은 메모 삭제/정리, v28 기록 추가 | 메모 최신화 | 수정 완료 |
| 9 | — | docs/PORTFOLIO_PDF_CAPTURE_GUIDE.md | 저해상도 예외 삭제, 해상도 기준·재구성 UI 표기·셸 재렌더링·IMPRINT 권리 메모 | 가이드 최신화 | 수정 완료 |

- WebP 교체: 이번 v28 **3장**(WMS 2, SUBSCRIPTA 1) / v27 포함 누적 **6장**.
- 프로젝트 30건(review 24 · approved 6), 이미지 196장(노출 172 · 숨김 24). 해상도 기준 미달 데스크톱·모바일 0장.

### 셸 재렌더링 방법
작업 영역은 기존 화면 그대로 쓰고(축소만, 확대 없음), 바깥 틀만 HTML/CSS/SVG로 다시 만들어 Playwright로 2880×1800(2배) 렌더링.
- WMS: 남색 사이드바(STACKFLOW · WAREHOUSE MANAGEMENT, 메뉴 8개, ACTIVE WAREHOUSE 카드), 상단 바(운영 시스템 / 메뉴 / 화면, 2026.11.06 금요일, 운영 관리자). 활성 메뉴: 입고 관리 / 로케이션 관리. 작업 영역 수치 유지: ASN-261106-008 200/198/차이 2, A-02-03 198/240·82.5%.
- SUBSCRIPTA: 상단 탭(구독 현황·좌석 변경·청구서·**청구 운영**·결제 수단), 검색, 아바타. 작업 영역 유지: ORBIT WORKSPACE 6→8석, ₩158,400, 미청구·결제 미실행 문구.

## 2. 확정 3장 근거

| 이미지 | 크기 | 연결 | 문구 | 범위 |
|---|---|---|---|---|
| shuttle-dashboard | 2880×1800 | 표지(cover) + 썸네일 | alt·caption 한·영·일 "재구성"; 개요 본문에 재구성 UI 안내 | scope backend·api 그대로 |
| shuttle-driver-app | 1179×2556 | textImage + 썸네일 | 〃, 본문 정류장 진행·다음 정류장·도착 처리 | 〃 |
| dispatch-calendar | 2880×1800 | 표지(cover) + 썸네일 | 〃, 개요 본문 재구성 안내 | scope frontend·backend·admin 그대로 |

이전 실제 캡처는 공개 자산에 남기지 않음(public/portfolio에는 현재 파일만). 이전 파일은 git 이력(커밋 1865c19)에 있고, 외부 전달본에는 넣지 않음.

## 3. 항목별 판정

| 항목 | 판정 | 내용 |
|---|---|---|
| 운송 ERP 신규 3장 | 안전상 보류 | 화면 안 서비스 표기에 공개 금지 목록의 이름이 있음. 완전한 비식별화를 검증할 수 없어 미등록. 기존 2장·approved 유지 |
| NODERA approval-inbox·run-history | 안전상 보류 / 사용자 후속 필요 | 이전 사례(₩480,000) 화면이라 숨김 유지. 공개 자산에 복사되지 않음 확인. WF-014·REQ-092 ₩2,800,000·기준 ₩3,000,000·최종 승인 대기와 맞춘 재디자인본이 오면 연결 |
| CIVERA 2장(command-center·flood-timeline) | 기존 정상 유지 | B실 교체본은 사건 기준(2027-07-15, T+00 24·T+30 71·T+60 126동)과 달라 미반영. layer-explorer caption에 2D/3D 구분 추가 |
| WMS 2장 | 수정 완료 | 남색 사이드바 셸 재렌더링 |
| SUBSCRIPTA 1장 | 수정 완료 | 상단 탭 셸 재렌더링 |
| 기타 C실 이미지(2-C) | 기존 정상 유지 | civicdesk c04·sitelog s02·farm 상품·재고: 같은 흰 사이드바 계열, 브랜드 블록·아이콘 등 세부 차이만 있음(눈에 띄는 충돌 아님). MES 3·VELORA 2·메타버스 2: 같은 계열 |
| 표지 크롭(45개 조합) | 기존 정상 유지(수정 불필요) | stage 표지 5건(통근버스·NODERA·REELSHIFT·SUBSCRIPTA·VELORA) 위아래 각 1.7~2.0%만 잘림(1180×707 틀, 원본 16:10). 로고·탭·CTA·제목 모두 보임 — 스크린샷 첨부 |
| 이미지 권리(IMPRINT LAB) | 사용자 후속 필요 | 데모 화면 속 실존 인물로 보이는 사진: 권리 미확인 → 공개 전 교체/확인 필요. review 유지 |

## 4. 검증(실제 실행, 종료 코드)

| 순서 | 명령 | 종료 코드 | 결과 |
|---|---|---|---|
| 1 | npm ci | 0 | |
| 2 | npm run portfolio:check | 0 | 30건 통과 · review 24 · approved 6, 경고 없음 |
| 3 | node scripts/portfolio.mjs sync --stage review | 0 | 포함 30건 |
| 4 | npm run typecheck | 0 | |
| 5 | PORTFOLIO_STAGE=review npm run build | 0 | |
| 6 | node scripts/portfolio.mjs sync --stage public | 0 | 포함 6건 · 제외 24건 |
| 7 | npm run build | 0 | 상세 페이지 6개만 생성 |

웹 검사(review 미리보기 빌드, Chromium):
- 메인·목록 2페이지 × 6폭 × 3언어 = 36: 정상 36.
- 상세 30건 × 6폭(1920/1440/1024/768/430/390) × 3언어 = 540: 정상 495, 주의 45(표지 크롭, 위 판정대로 수정 불필요), 오류 0.
- 검사 항목: 이미지 깨짐, 확대(업스케일), 숨김 이미지 노출, 가로 스크롤, 글자 넘침, 화면 밖 요소(스크롤 레일 제외 재검사 0), html lang, JS 오류.
- 목록 필터·더보기 검사 통과.
- 로그·`web-matrix.csv`·스크린샷은 QA zip에 포함.

## 5. 미검증
Safari·Firefox·실기기·접근성(스크린리더·명도 대비)·성능(Lighthouse 등) — 실행하지 않음. PDF 생성 안 함.

## 6. 남은 P0/P1
- P0: 없음.
- P1: NODERA 2장 재디자인본 없음(숨김으로 노출 위험은 없음), 운송 ERP 3장 비식별 교체본 없음(미등록), IMPRINT LAB 사진 권리 미확인(review 상태라 공개되지 않음).
