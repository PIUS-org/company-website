# 승인 프로젝트 UI 이미지 추가 — batch01 보고 (2026-11-10)

기준: v21(STEP 0 반영본, c7059d4). STEP 0의 11개 프로젝트 선별은 건드리지 않았다.
입력: `pius-batch01-15-ui-images-approved.zip` (WebP 15장 · Desktop 12장 2880×1800 · Mobile 3장 1179×2556)

## 결과 요약
| 프로젝트 | 반영 | 추가 블록 | 섹션 |
|---|---|---|---|
| farm-commerce-backend | 4/4 | screenShowcase desktop(orders, light) · imageGallery 2열(catalog·order-detail·payments) | 03 ADMIN DEMO · 04 OPERATIONS SCREENS |
| commute-shuttle-platform | 2/2 | screenShowcase desktop(route-version, dark) · screenShowcase desktop(live-monitoring, light) | 03 ROUTE VERSIONS · 04 LIVE MONITORING |
| charter-bus-dispatch | 3/3 | screenShowcase desktop(vehicle-driver-assignment, light) · imageGallery 2열(trip-detail·history) | 03 VEHICLE & DRIVER · 04 TRIP RECORDS |
| metaverse-live-app | 3/3 | screenShowcase phones(live-room·avatar-interaction·live-event, accent) | 02 LIVE EXPERIENCE |
| transport-erp-monitoring | **0/3 보류** | — | — |

- 위치: 구조도·드라이버 앱(textImage) 바로 뒤, 기능 소개(featureGrid) 앞. metaverse는 개요 뒤.
- `images` 항목은 전달본 entries 그대로(id·file·kind·alt·caption 한·영·일). `fileByLang`·`presentation`·`pdf.skip`·`results` 추가 없음. 수행 범위 문구 변경 없음.
- 섹션 라벨(영문)과 surface는 기존 프로젝트 관례에 맞춰 붙였다(같은 surface·layout 연속 회피).

## 보류: transport-erp-monitoring 3장
OCR(한·영) 금지어 검사에서 `transport-dispatch-board`, `transport-order-detail`, `transport-trip-history` 세 장 모두 화면 안 서비스 표기에 **공개 금지 거래처 목록(`content/portfolio/_clients.txt`)의 이름**이 보였다. 이미지 수정 금지 원칙에 따라 가리거나 자르지 않고 반영하지 않았다. 해당 표기를 일반 이름으로 바꾼 교체본을 받으면 전달본 계획(screenShowcase 1 + imageGallery 2)대로 그대로 붙이면 된다.

## 보존 확인
- 기존 이미지 126장 SHA256 전부 동일, 신규 12장은 업로드 원본과 동일 → 총 138장
- 변경 파일: 위 4개 `project.json` + 신규 이미지 12장 + CHANGELOG + 이 문서. 다른 26개 프로젝트 무변경
- 4개 프로젝트: 이미지·블록 이외 필드(상태 approved·slug·id·order·카테고리 등) 무변경, 기존 이미지·블록 보존, 표지 그대로

## 검증
- `portfolio:check` 30건 통과(경고는 기존 대기 항목·기존 저해상도 1건), `typecheck` 0, `build` 0, 운영 빌드에 review 프로젝트 흔적 0
- PDF(ko·en·ja): farm Full 9쪽/External 6쪽, commute 7/6, charter 8/6, metaverse 5/5, transport External 5(변경 없음). report.json 기준 신규 화면 Full 전부 포함, External은 주요 화면(showcase)만 포함 — 갤러리는 기존 External 규칙대로 제외
- 웹: 목록 + 5개 상세 × 1440/1920/768/1024/390/430 × ko/en/ja = 108개 화면에서 깨진 이미지 0, 가로 스크롤 0. 줄바꿈 검사 45개 화면 문제 0

## 대표 이미지(표지·썸네일) 후보 — 변경하지 않음
- farm-commerce-backend: 현재 모바일 앱. 백엔드 API 프로젝트 성격상 `farm-commerce-admin-orders`가 후보이나, 시연 UI를 대표로 쓰면 납품 화면으로 오해될 수 있어 유지 권장
- commute-shuttle-platform: `shuttle-live-monitoring` 후보(현재 대시보드 유지 가능)
- charter-bus-dispatch: `charter-vehicle-driver-assignment` 후보
- metaverse-live-app: `metaverse-live-room` 후보

## 다음 이미지 묶음 반영 방법(재사용)
1. 업로드 zip을 따로 풀고 해상도·중복 id·SHA 기준선 기록
2. OCR로 PIUS·미확정 브랜드·`_clients.txt` 금지어 검사 → 걸리면 반영 보류
3. entries를 `images`에 추가, 계획 블록을 구조도 뒤·기능 소개 앞에 넣고 섹션 번호 재정렬
4. check → typecheck → build → export(Full/External) → 미리보기 → 보존 검증

## 후속 변경(같은 날): 도식 툴 구조도 제거
사용자 요청으로 Mermaid류 구조도 2장(`commerce-architecture`, `dispatch-architecture`)과 해당 ARCHITECTURE 섹션(제목·설명 한·영·일)을 삭제했다. 두 프로젝트 섹션은 01 개요 → 02 신규 화면 → 03 갤러리 → 04 주요 기능 → 05 기술 → 06 수행 범위. PDF: farm Full 8쪽/External 5쪽, charter Full 7쪽/External 5쪽. 총 이미지 136장. 위 표의 섹션 번호와 '구조도 바로 뒤' 위치 설명은 이 변경 전 기준이다.
