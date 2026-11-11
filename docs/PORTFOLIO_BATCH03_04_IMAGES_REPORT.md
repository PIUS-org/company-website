# 자체 데모 UI 이미지 3차(20장)·4차(16장) 보고 — 2026-11-10

기준: batch02 반영본(19ecd7e). 이전 작업(STEP 0·1차·2차·도식 구조도 제거) 그대로 유지.
결과: 30개 프로젝트 모두 실제 화면 연결 완료(파일 없는 자리표시자 0). 이미지 160 → 196장.

## 3차 — nodera-flow · fieldnest · contracta · leasegrid · subscripta (각 4장, 모두 review 유지)
| 프로젝트 | 표지·썸네일 | 새 블록 |
|---|---|---|
| nodera-flow | visual-builder | 03 request-intake(screenShowcase desktop) · 04 approval-inbox + run-history(imageGallery 2열) |
| fieldnest | work-order-board | 03 work-order-detail + technician 모바일(screenShowcase desktopPhones) · 04 asset-history(screenShowcase desktop) |
| contracta | contract-workspace | 03 clause-version-diff(screenShowcase) · 04 review-comments + approval-renewal(imageGallery) |
| leasegrid | unit-occupancy | 03 lease-contract-detail(screenShowcase) · 04 billing-ledger + renewal(imageGallery) |
| subscripta | subscription-overview | 03 seat-change-preview(screenShowcase) · 04 billing-operations + invoice-details(imageGallery) |
- alt·caption 한국어는 전달문 기준, 영어·일본어는 같은 뜻으로 작성. 새 블록 제목·본문은 화면에 보이는 사실(REQ-092, WO-261109-034, HVAC-GL-04-021, 402호, 6석→8석 ₩158,400 등)만 사용.
- 전달문과 다르게 쓴 2건(화면과 불일치):
  - `subscripta-invoice-details`: 전달문은 "결제 실패" 화면이었으나 실제 화면은 결제 완료(Paid) 11월 청구서 → "11월 청구서 상세", 캡션도 결제 완료 기준으로 작성.
  - `nodera-flow-run-history`: 전달문 "실패 이력" → 화면에는 실패 항목이 없어 "실행 단계별 결과와 처리 시간"으로 작성.
- 기존 문구 수정 1건: subscripta 개요의 `6석×₩18,000=₩108,000`이 1024px에서 중간에 끊겨 기호 앞뒤에 띄어쓰기만 추가.

## 4차 — penova-class · civicdesk · sitelog · stayport-pms (각 4장, 모두 review 유지)
- 전달 원문으로 title·subtitle·summary(cardSummary)·overview·개요 블록(lead=overview, body=problem)·기능 4개(featureGrid)·흐름 4단계(userFlow)·statement 교체(한·영·일). 표지 headline은 cardSummary.
- 기존 문구는 새 화면과 다른 사례(예: STAYPORT 503호·김민서)를 다뤄 서비스 구조·목표·인트로 블록을 정리. id·slug·status·visible·featured·order·includeInPdf·theme·industry 그대로.
- platforms를 새 화면 구성에 맞게 갱신(태블릿·모바일 표기), civicdesk 카테고리 `erp, web`(모바일 화면 없음).
- scope: 원문 범위 문단을 scope 블록 note에 넣고, 블록이 표시되도록 `scope` 항목 2개(UI 디자인, 정적 프론트엔드 화면) 지정.
- 화면 블록: 04 screenShowcase(대표 화면) · 05~07 textImage(imageLeft·imageRight·full) · penova/stayport 07은 imageGallery(세로 모바일·태블릿 비율 유지). sitelog 현장일지(태블릿)는 연결 순서 지시대로 textImage.
- 대표 화면이 표지와 첫 화면 섹션에 함께 쓰여 External PDF에서 반복되던 문제 → `presentation.external`로 대표 장면 3개 지정(표지 반복 없음). 갤러리 전용 세로 화면은 tier support.

## 공통 렌더러 변경 1건
- PDF 마무리 쪽 수행 범위에 scope 블록 note가 빠져 있었음(웹은 표시) → `PrintDoc.tsx`·`Print.module.css`에 한 줄 추가. 영향: note가 있는 scope 블록(4차 4개 + smart-factory-mes)의 PDF.

## 검증
- portfolio:check 30건 통과(경고: 기존 저해상도 1건만), typecheck 0, build 0, 운영 빌드에 review 프로젝트 흔적 0
- PDF(ko·en·ja, A4·16:9, Full·External): 9개 프로젝트 모두 생성, 잘림 0. Full 8~9쪽, External 7쪽(준비 판정 ready)
- 웹: 9개 상세+목록 × 6폭 × 3언어 = 180개 화면 깨진 이미지·가로 스크롤 0. 줄바꿈 검사 120개 화면(+subscripta 18) — 남은 1건은 기존 subscripta 마무리 문장 430px 영어 마지막 단어 한 줄(기존 문구)
- 보존: 기존 160장 git 해시 동일, 프로젝트별 4장, 다른 21개 프로젝트 무변경
- 이미지 글자 검사: PIUS·공개 금지 거래처 없음(contracta '승인 제4조'의 부분 일치 오탐 1건 확인)

## 확인이 필요한 점
- nodera-flow: 기존 소개 문구는 '마케팅 콘텐츠 게시 승인' 사례인데, 새 화면은 같은 REQ-092를 '시설 유지보수 예산 승인(강남 지점 공조기)'으로 보여 준다. 문구는 그대로 두었다 — 화면 기준으로 문구를 바꿀지, 화면을 교체할지 결정 필요. (기존 문구는 FIELDNEST와 겹치지 않게 일부러 콘텐츠 게시로 정한 것이었고, 새 화면은 FIELDNEST와 같은 공조기 사례다.)
