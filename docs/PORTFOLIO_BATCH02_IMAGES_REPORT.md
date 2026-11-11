# 자체 데모 UI 이미지 2차 배치(24장) 보고 — 2026-11-10

기준: v23(ba21acf). STEP 0 선별·1차(batch01) 반영·도식 구조도 제거 상태 그대로 유지.
입력: `pius-batch02-24-ui-images-approved.zip` (WebP 24장 · Desktop 21장 2880×1800 · Tablet 2장 2732×2048 · Mobile 1장 1179×2556)

## 반영
| 프로젝트 | 장수 | 표지·썸네일 | 상세 블록(섹션) | External 대표 장면 |
|---|---|---|---|---|
| hireloom | 5 | candidate-pipeline | 03 review(imageLeft) · 04 scorecard(imageRight) · 05 offer(full) · 06 mobile(phones) | 칸반(표지) · 평가표 |
| bulkbridge | 5 | bulk-order-builder | 03 catalog(imageLeft) · 04 quotation(imageRight) · 05 approval(full) · 06 PO(imageRight) | 발주 수량(표지) · 견적 |
| imprint-lab | 5 | editor-workspace | 03 configurator(imageLeft) · 04 library(imageRight) · 05 preflight(full) · 06 checkout(imageLeft) | 편집 캔버스(표지) · 인쇄 검수 |
| tavora-os | 5 | table-floorplan | 03 POS(imageLeft) · 04 KDS(focus, tablet) · 05 floor runner(focus, tablet) · 06 checkout(imageRight) | 좌석맵(표지) · POS · KDS |
| helio-desk | 4 | shared-inbox | 03 conversation(imageLeft) · 04 SLA(full) · 05 resolution(imageRight) | 인박스(표지) · SLA |

- 섹션 흐름: 개요 → 사용자 흐름 → 새 화면 블록 → 서비스 구조 → 기능 → 마무리 문장. 기존 블록 문구는 그대로, 순서만 정리(imprint-lab·tavora-os는 사용자 흐름을 앞으로).
- 이미지 항목은 전달본 그대로(id·file·kind·alt·caption 한·영·일). 블록 제목은 alt에서 '— 자체 UI 시연 화면'을 뺀 것, 본문은 caption.
- 예외 1건: bulkbridge 일본어 제목 `法人向け卸売商品カタログ`는 한 덩어리로 끊기지 않아 1024~1440px에서 글 칸을 넘쳤다 → `法人向けの卸売商品カタログ`로 표기.
- External 대표 장면은 기존 스키마 `presentation.external`로 지정(전체 화면 tier core). 새 PDF 모드 없음.
- 파일 없는 대표 자리표시자(`*-main-pending`)는 5개 프로젝트에서만 제거, reviewNotes의 '대표 UI 이미지 미제작' 문장을 반영 사실로 교체. 상태 review·visible true 유지, scope 빈 배열 유지, results 추가 없음.

## 검증
- portfolio:check 30건 통과(5개 프로젝트 경고 0), typecheck 0, build 0, 운영 빌드에 review 프로젝트 흔적 0
- PDF(ko·en·ja, A4·16:9): Full 9~10쪽, External 7쪽, External 준비 판정 ready(이전엔 미완료). 24장 모두 Full에 포함
- 웹: 목록+5개 상세 × 1920/1440/1024/768/430/390 × ko/en/ja = 108개 화면 — 깨진 이미지 0, 가로 스크롤 0, 줄바꿈·넘침 0(제목 수정 후)
- 보존: 기존 136장 git 해시 동일, 총 160장, 프로젝트별 파일 5·5·5·5·4, 다른 25개 프로젝트 무변경
- 이미지 글자 검사(OCR): PIUS·미확정 브랜드·공개 금지 거래처 없음

## 확인이 필요한 점
- `helio-desk-sla-operations`: '첫 응답 소요시간 추이' 차트 자리에 그래프 대신 `(svg)`라는 글자만 보인다(이미지 원본 문제). 지시대로 등록했지만 공개 승인 전 교체 권장.
- imprint-lab 데모 사진에 실존 인물(우주비행사) 사진이 들어 있다. 출처·사용 가능 여부 확인 권장.
