# PDF 캡처용 이미지 선별 가이드 (E실) — 2026-11-10

PDF는 직접 캡처·제작하는 것을 전제로, 현재 홈페이지의 원본 이미지 중 **크게 써도 되는 핵심 화면**과 **보조 화면**을 정리했다. 이번 단계에서는 데이터·이미지를 바꾸지 않았다(현재 선택으로 역할 설명이 충분한 경우 추가하지 않는다는 원칙).

- 모든 데스크톱 원본은 2880×1800(일부 2880×1463~1472), 모바일 1179×2556 계열, 태블릿 2048×2732 또는 2732×2048 → A4 한 쪽 전체 폭으로 써도 해상도 부족 없음. (v27에서 통근버스 `shuttle-dashboard` 2880×1800·`shuttle-driver-app` 1179×2556 재구성본으로 교체 — 이전 저해상도 예외 없음.)
- 해상도 기준: 데스크톱 1920×1200 이상(권장 2880×1800), 모바일 1080×2340 이상(권장 1179×2556). 작은 원본을 키운 이미지는 불합격.
- **재구성 UI 표기**: 통근버스 `shuttle-dashboard`·`shuttle-driver-app`, 전세버스 `dispatch-calendar`는 운영정보·개인정보 보호를 위해 실제 업무 흐름을 바탕으로 재구성한 UI다. PDF에 쓸 때는 해당 쪽에 "재구성 UI" 문구(홈페이지 개요 문단과 같은 뜻)를 함께 둔다. 실제 수행 범위 표기는 그대로 유지한다.
- 데스크톱: 한 쪽에 한 화면을 크게. 여러 장을 축소 나열하지 않는다.
- 세로 모바일·태블릿: 원본 비율 그대로(폰 2~3장 나란히, 태블릿 1~2장). 데스크톱 틀로 확대·크롭 금지.
- 숨김(hidden) 이미지는 PDF에도 쓰지 않는다.
- 표의 E = 홈페이지 External PDF 대표 장면으로 이미 지정된 화면.

| 프로젝트 | 상태 | 대표(표지) | PDF 핵심 화면(권장 순서) | 보조(작게·묶음) | 숨김 | 메모 |
|---|---|---|---|---|---|---|
| FITY | approved | expert-dashboard(썸네일) / app-home | app-home·app-consult·app-result(폰 3장) → expert-dashboard → expert-orders → admin-consult | app-search·app-photos·app-consults·app-review·admin-sales | app-fitnote·app-fit·app-fitnew·app-post·app-my·expert-profile | 디자인 평가 제외, 연결만 확인 |
| 통근버스 | approved | shuttle-dashboard | shuttle-dashboard → shuttle-route-version → shuttle-live-monitoring | shuttle-driver-app(재구성 UI, 1179×2556) | — | 대시보드·기사 앱 모두 재구성 UI(v27 사용자 결정) — PDF에 재구성 표기 |
| 전세버스 배차 | approved | dispatch-calendar | dispatch-calendar(월 배차) → vehicle-driver-assignment(차량·기사 배정) | trip-detail·history | — | 캘린더=계획, 배정=당일 운영으로 역할 구분. dispatch-calendar는 재구성 UI — PDF에 재구성 표기 |
| 농수산 커머스 | approved | commerce-app | commerce-app(고객 앱) → admin-orders(주문 관리 WEB) | admin-catalog·order-detail·payments | — | 앱과 WEB을 각각 한 쪽씩 |
| 메타버스 라이브 | approved | metaverse-app | live-room·avatar-interaction·live-event(폰 3장, 라이브→상호작용→이벤트) | — | — | |
| 운송 ERP | approved | erp-dashboard | erp-dashboard → erp-monitoring | — | — | 신규 배차 3장은 교체본 대기 후 재선별 |
| BULKBRIDGE | review | bulk-order-builder E | bulk-order-builder → quotation-review E → **purchase-approval** | wholesale-catalog·purchase-order-detail | — | 승인 화면 보강 권장(결재 이력이 업무 차별점) |
| IMPRINT LAB | review | editor-workspace E | editor-workspace → print-preflight E | product-configurator·photo-library·checkout-preview | — | 현 선택 유지 권장. **데모 사진 속 실존 인물 사진은 권리 확인 전까지 공개 전 교체/확인 필요** |
| HIRELOOM | review | candidate-pipeline E | candidate-pipeline → interview-scorecard E → **offer-approval** | candidate-review, candidate-interview-mobile(폰 1장) | — | 오퍼 승인 또는 지원자 모바일 중 하나 보강 |
| TAVORA OS | review | table-floorplan E | table-floorplan → pos-order E → kitchen-kds E(태블릿) | floor-runner-tablet·settlement-checkout | — | 테이블→POS→주방 순서 유지 |
| HELIO DESK | review | shared-inbox E | shared-inbox → sla-operations E(수정 차트) | ticket-conversation·escalation-resolution | — | A실 SLA 수정본 반영 확인 |
| NODERA FLOW | review | visual-builder E | visual-builder → request-intake E | — | approval-inbox·run-history | 숨긴 2장은 이전 사례(₩480,000) — WF-014·₩2,800,000 기준 교체본이 오면 run-history를 보조로 |
| FIELDNEST | review | work-order-board | work-order-board → work-order-detail + technician-inspection-mobile(데스크톱+폰) | asset-maintenance-history | — | 작업보드→현장 점검 흐름 |
| CONTRACTA | review | contract-workspace | contract-workspace → clause-version-diff → **inline-review-comments** | approval-renewal | — | 검토 의견 화면 보강 권장 |
| LEASEGRID | review | unit-occupancy | unit-occupancy → lease-contract-detail → **monthly-billing-ledger** | renewal-workbench | — | 청구 원장 보강 권장 |
| SUBSCRIPTA | review | subscription-overview | subscription-overview → seat-change-preview → **invoice-details** | billing-operations | — | 청구서 상세 보강 권장. billing-operations는 v28에서 상단 탭 셸로 재렌더링(다른 3장과 같은 틀) |
| PENOVA CLASS | review | p01 E | p01 강의 편집 → p02 퀴즈 E → p03 채점 E | **p04 학생 모바일(폰 1장)** | — | 학습자 화면 1장 추가 권장 |
| CIVICDESK | review | c01 E | c01 접수함 → c02 상세 E → c03 배정 보드 E → **c04 회신 검토** | — | — | 회신 검토 보강 권장 |
| SITELOG | review | s01 E | s01 공정 → s02 도면 이슈 E → s03 현장일지(태블릿) E → **s04 RFI** | — | — | RFI 보강 권장 |
| STAYPORT PMS | review | h01 E | h01 캘린더 → h02 예약 E → h03 체크인 E | **h04 하우스키핑(태블릿)** | — | 하우스키핑 1장 추가 권장 |
| CIVERA TWIN | review | command-center E | command-center → scenario-comparison E → response-center E → mobile-inspection·response(폰) | layer-explorer, flood-timeline, incident-report | impact-analysis·sensor-network | 같은 3D 지도 반복을 피하려면 지도 화면은 표지·시나리오 2장까지. layer-explorer는 디자인 계열이 달라 보조 권장 |
| MORROW SELECT | review | storefront E | storefront → product-detail E → checkout E → mobile-product(폰) E | discovery·shopping-bag·order-management·mobile-checkout | lookbook·mobile-discovery | 스토어·상품·모바일 구분 |
| NOCTAVE FEST | review | landing E | timetable E → tickets E → mobile-schedule·mobile-ticket(폰) | lineup·artist-detail·venue-map | mobile-home·mobile-map | 타임테이블·티켓 강조 |
| REELSHIFT STUDIO | review | editing-workspace E | editing-workspace(타임라인) → motion-editor E → review-annotation E → version-comparison E | color-grading·subtitle-editor·mobile-review·mobile-approval | project-library·export-workspace | 편집 타임라인 중심 |
| ROAMFRAME | review | trip-overview E | map-itinerary E → daily-timeline E → collaboration E → mobile-today(폰) E | budget·place-discovery·mobile-route | reservations·mobile-wallet | 지도·일정·모바일 구분 |
| SECONDLOOP | review | marketplace E | product-condition E → make-offer·checkout·transaction-tracking(폰 3장) E | listing-studio·advanced-search·mobile-detail·sell-item | mobile-discover | A실 거래 추적 수정본 반영 확인 |
| 스마트팩토리 MES | review | mes-dashboard E | work-orders E → shopfloor-terminal·quality-inspection(태블릿) E → lot-trace E | production-plan·production-analytics·process-flow | — | KPI 대시보드보다 작업지시·현장 단말 우선 |
| STACKFLOW WMS | review | wms-dashboard | inbound E → outbound-wave E → packing-shipping E → pda-picking·pda-cycle-count(폰) E | location-map·pda-inbound·pda-putaway·workflow | — | WEB 관리와 PDA 업무를 쪽 단위로 구분. inbound·location-map은 v28에서 남색 사이드바 셸로 재렌더링 |
| THREADFORM STUDIO | review | design-workspace E | material-editor E → tech-pack E → sample-review E → mobile-review(폰) E | collection-board·colorway-editor·mobile-approval | pattern-editor·size-grading | 패턴 편집은 숨김(STEP 0 결정) — 쓰려면 숨김 해제 승인 필요 |
| VELORA SPACE | review | landing | floorplan E → room-viewer E → configurator E → comparison E | my-space, mobile-configurator E | collection·mobile-landing·mobile-viewer | 공간 편집·배치 UI 중심 |

**굵게** 표시한 화면 = 이번 E실 요청에서 "보강 검토" 대상으로, PDF에 한 쪽을 더 쓰기를 권장하는 화면.
