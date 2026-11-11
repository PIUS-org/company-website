# 포트폴리오 이미지 제작 계획

> 내부 관리 문서. 이미지 10장 고정 규칙은 폐지했다. 화면 수는 서비스 특성과 웹 상세·PDF에 실제로 필요한 화면을 기준으로 정한다.
> 계획에 있는 파일명은 **예정 이름**이다. 파일이 실제로 들어오기 전에는 project.json에 연결하지 않는다(`file: null` 유지).

## 이미지를 넣으면 자동 반영되는 방법

1. 이미지를 `content/portfolio/<slug>/images/`에 넣는다(WebP 권장, 데스크톱 긴 변 1600px 이상, 모바일 1170×2532 이상).
2. `project.json`의 `images`에서 대기 항목(`<slug>-main-pending`)의 `file`을 실제 파일명으로 바꾼다. 추가 화면은 `images`에 항목을 더하고, 아래 표의 "사용 블록"에 id를 넣는다.
3. `npm run portfolio:check` → `npm run portfolio:export -- --slug <slug> --mode both --lang all --png`.
4. 표지·카드는 대기 화면이 하나라도 실제 파일이 되면 자동으로 업무 흐름 패널 대신 화면을 보여준다. External PDF는 대기 화면이 0이 되어야 "외부 제출 준비 완료"로 판정된다.

우선순위: **P1** 표지·외부 제출 PDF에 꼭 필요 · **P2** 상세 보강 · **P3** 있으면 좋음

## A. 이미지가 아직 없는 14개 — 새로 제작

| 프로젝트 | 화면 ID | 기능(데모 데이터) | 디바이스 | 권장 파일명 | 사용 블록 | PDF | 우선순위 |
|---|---|---|---|---|---|---|---|
| BULKBRIDGE | BB-01 | SKU 주문 매트릭스 — 박스 수량·구간 단가·품목 합계 | desktop | `bulkbridge-01.webp` | cover·thumbnail | Full·External | P1 |
| BULKBRIDGE | BB-02 | 견적 검토·내부 승인 요청(₩640,800 / 총 ₩704,880) | desktop | `bulkbridge-02.webp` | textImage | Full·External | P1 |
| BULKBRIDGE | BB-03 | 발주 상태 목록(견적 준비→승인→공급사 접수) | desktop | `bulkbridge-03.webp` | featureGrid 카드 | Full·External | P2 |
| IMPRINT LAB | IL-01 | 2D 편집 캔버스 — 표지·p14–15 양면 배치 | desktop | `imprint-lab-01.webp` | cover·thumbnail | Full·External | P1 |
| IMPRINT LAB | IL-02 | 인쇄 전 검토 — p14 저해상도 경고와 해결 상태 | desktop | `imprint-lab-02.webp` | textImage | Full·External | P1 |
| IMPRINT LAB | IL-03 | 사진 라이브러리 12장·페이지 연결 | desktop | `imprint-lab-03.webp` | featureGrid 카드 | Full·External | P2 |
| IMPRINT LAB | IL-04 | 모바일 주문 확인(₩82,800·제작 대기) | mobile | `imprint-lab-04.webp` | screenShowcase | Full | P3 |
| HIRELOOM | HL-01 | 지원자 칸반(서류5·전화3·실무2·오퍼1·완료1) | desktop | `hireloom-01.webp` | cover·thumbnail | Full·External | P1 |
| HIRELOOM | HL-02 | 면접 평가표 — 면접관 3명·역량 4개(44/48) | desktop | `hireloom-02.webp` | textImage | Full·External | P1 |
| HIRELOOM | HL-03 | 오퍼 검토·내부 승인 요청 | desktop | `hireloom-03.webp` | featureGrid 카드 | Full·External | P2 |
| TAVORA OS | TV-01 | 홀 POS — 테이블 8개 상태·T04 주문 | tablet | `tavora-os-01.webp` | cover·thumbnail | Full·External | P1 |
| TAVORA OS | TV-02 | 주방 KDS — 신규→조리 중→준비 완료 | tablet | `tavora-os-02.webp` | textImage | Full·External | P1 |
| TAVORA OS | TV-03 | 결제·테이블 리셋(₩65,000) | tablet | `tavora-os-03.webp` | featureGrid 카드 | Full·External | P2 |
| TAVORA OS | TV-04 | 직원 모바일 주문 | mobile | `tavora-os-04.webp` | screenShowcase | Full | P3 |
| PENOVA CLASS | PN-01 | 수업 캔버스 — 자료·출석 21/24 | desktop | `penova-class-01.webp` | cover·thumbnail | Full·External | P1 |
| PENOVA CLASS | PN-02 | 퀴즈 결과 — 정답15·오답3·미제출4 | desktop | `penova-class-02.webp` | textImage | Full·External | P1 |
| PENOVA CLASS | PN-03 | 학생 모바일 답안 제출 | mobile | `penova-class-03.webp` | screenShowcase | Full·External | P2 |
| NODERA FLOW | ND-01 | 노드 에디터 — 7개 노드·조건 분기 | desktop | `nodera-flow-01.webp` | cover·thumbnail | Full·External | P1 |
| NODERA FLOW | ND-02 | 실행 이력 — 노드별 시각·결과 | desktop | `nodera-flow-02.webp` | textImage | Full·External | P1 |
| NODERA FLOW | ND-03 | 승인 인박스(REQ-092) | desktop | `nodera-flow-03.webp` | featureGrid 카드 | Full·External | P2 |
| FIELDNEST | FN-01 | 작업지시 보드 — WO-261109-034 배정 | desktop | `fieldnest-01.webp` | cover·thumbnail | Full·External | P1 |
| FIELDNEST | FN-02 | 기술자 모바일 체크리스트(필터 청소·시험 작동) | mobile | `fieldnest-02.webp` | textImage(desktopPhones) | Full·External | P1 |
| FIELDNEST | FN-03 | 관리자 완료 확인(Closed) | desktop | `fieldnest-03.webp` | featureGrid 카드 | Full·External | P2 |
| CONTRACTA | CT-01 | 문서 버전 비교 v1.1→v1.2(제4조·제7조) | desktop | `contracta-01.webp` | cover·thumbnail | Full·External | P1 |
| CONTRACTA | CT-02 | 조항별 의견 3건·내부 승인 대기 | desktop | `contracta-02.webp` | textImage | Full·External | P1 |
| CONTRACTA | CT-03 | 계약 일정·갱신 검토 | desktop | `contracta-03.webp` | featureGrid 카드 | Full | P3 |
| HELIO DESK | HD-01 | 통합 상담 인박스 12건 상태 | desktop | `helio-desk-01.webp` | cover·thumbnail | Full·External | P1 |
| HELIO DESK | HD-02 | 티켓 상세 — 대화·내부 메모·기술팀 이관 | desktop | `helio-desk-02.webp` | textImage | Full·External | P1 |
| HELIO DESK | HD-03 | SLA 현황(첫 응답 12분·해결 2시간) | desktop | `helio-desk-03.webp` | featureGrid 카드 | Full·External | P2 |
| LEASEGRID | LG-01 | 호실 상태 그리드 12호실 | desktop | `leasegrid-01.webp` | cover·thumbnail | Full·External | P1 |
| LEASEGRID | LG-02 | 월별 청구 원장 — 402호 ₩2,750,000 Pending | desktop | `leasegrid-02.webp` | textImage | Full·External | P1 |
| LEASEGRID | LG-03 | 임대계약 상세·갱신 검토 | desktop | `leasegrid-03.webp` | featureGrid 카드 | Full·External | P2 |
| CIVICDESK | CV-01 | 담당자 처리 화면 — 배정·보완 요청 이력 | desktop | `civicdesk-01.webp` | cover·thumbnail | Full·External | P1 |
| CIVICDESK | CV-02 | 주민 모바일 신청·진행 조회 | mobile | `civicdesk-02.webp` | textImage(desktopPhones) | Full·External | P1 |
| CIVICDESK | CV-03 | 회신 검토(회신 전 상태) | desktop | `civicdesk-03.webp` | featureGrid 카드 | Full·External | P2 |
| SUBSCRIPTA | SB-01 | 구독·좌석 관리 — 6석 → 12월 8석 예약 | desktop | `subscripta-01.webp` | cover·thumbnail | Full·External | P1 |
| SUBSCRIPTA | SB-02 | 청구서 목록 — 11월 ₩118,800 Paid | desktop | `subscripta-02.webp` | textImage | Full·External | P1 |
| SUBSCRIPTA | SB-03 | 다음 청구 미리보기 ₩158,400(미청구) | desktop | `subscripta-03.webp` | featureGrid 카드 | Full·External | P2 |
| SITELOG | SG-01 | 2D 공정 간트 — 철거100·칸막이70·전기20% | desktop | `sitelog-01.webp` | cover·thumbnail | Full·External | P1 |
| SITELOG | SG-02 | 도면 이슈 마킹 Rev A/B·RFI-261109-006 | desktop | `sitelog-02.webp` | textImage | Full·External | P1 |
| SITELOG | SG-03 | 현장 모바일 일지(14명) | mobile | `sitelog-03.webp` | screenShowcase | Full·External | P2 |
| STAYPORT PMS | SP-01 | 객실 상태 그리드 18실(15:10 기준) | desktop | `stayport-pms-01.webp` | cover·thumbnail | Full·External | P1 |
| STAYPORT PMS | SP-02 | 예약·체크인 상세 RSV-261109-018 / 503호 | desktop | `stayport-pms-02.webp` | textImage | Full·External | P1 |
| STAYPORT PMS | SP-03 | 하우스키핑 큐(청소 중 3실) | tablet | `stayport-pms-03.webp` | featureGrid 카드 | Full·External | P2 |

| 프로젝트 | 현재 실제 이미지 | 최종 권장 수량 | 비고 |
|---|---|---|---|
| BULKBRIDGE | 0 | 3장 | 유형: 커머스형. P1 2장이 생기면 외부 제출 가능 |
| IMPRINT LAB | 0 | 4장 | 유형: 편집 도구형. P1 2장이 생기면 외부 제출 가능 |
| HIRELOOM | 0 | 3장 | 유형: 업무 처리형. P1 2장이 생기면 외부 제출 가능 |
| TAVORA OS | 0 | 4장 | 유형: 소비자 서비스형. P1 2장이 생기면 외부 제출 가능 |
| PENOVA CLASS | 0 | 3장 | 유형: 편집 도구형. P1 2장이 생기면 외부 제출 가능 |
| NODERA FLOW | 0 | 3장 | 유형: 업무 처리형. P1 2장이 생기면 외부 제출 가능 |
| FIELDNEST | 0 | 3장 | 유형: 업무 처리형. P1 2장이 생기면 외부 제출 가능 |
| CONTRACTA | 0 | 3장 | 유형: 업무 처리형. P1 2장이 생기면 외부 제출 가능 |
| HELIO DESK | 0 | 3장 | 유형: 업무 처리형. P1 2장이 생기면 외부 제출 가능 |
| LEASEGRID | 0 | 3장 | 유형: 데이터 관리형. P1 2장이 생기면 외부 제출 가능 |
| CIVICDESK | 0 | 3장 | 유형: 업무 처리형. P1 2장이 생기면 외부 제출 가능 |
| SUBSCRIPTA | 0 | 3장 | 유형: 데이터 관리형. P1 2장이 생기면 외부 제출 가능 |
| SITELOG | 0 | 3장 | 유형: 데이터 관리형. P1 2장이 생기면 외부 제출 가능 |
| STAYPORT PMS | 0 | 3장 | 유형: 데이터 관리형. P1 2장이 생기면 외부 제출 가능 |

## B. 이미지가 있는 16개 — 유지·교체·추가

### FITY (`fity`, approved)

- 현재 실제 이미지: **19장** · 최종 권장: **15–17장** · 우선순위 P3
- 유지: 17장 · 부분 보완: `app-fitnew.webp`, `app-review.webp`
- 메모: app-fitnew·app-review는 보조로만

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `app-home.webp` | mobile | 1170×2532 | 사용 가능 | cover, 카드 | ○ |
| `app-expert.webp` | mobile | 1170×2532 | 사용 가능 | cover | ○ |
| `app-product.webp` | mobile | 1170×2532 | 사용 가능 | cover | ○ |
| `app-search.webp` | mobile | 1170×2532 | 사용 가능 | userFlow | ○ |
| `app-fitnote.webp` | mobile | 1170×2532 | 사용 가능 | userFlow | ○ |
| `app-photos.webp` | mobile | 1170×2532 | 사용 가능 | userFlow | ○ |
| `app-consult.webp` | mobile | 1170×2532 | 사용 가능 | userFlow | ○ |
| `app-result.webp` | mobile | 1170×2532 | 사용 가능 | userFlow | ○ |
| `app-fit.webp` | mobile | 1170×2532 | 사용 가능 | textImage | ○ |
| `app-fitnew.webp` | mobile | 1170×2532 | 부분 보완 — 빈 입력 양식 위주 — 핵심 화면 아님(보조로만 사용) | textImage | ○ |
| `app-consults.webp` | mobile | 1170×2532 | 사용 가능 | screenShowcase | ○ |
| `app-post.webp` | mobile | 1170×2532 | 사용 가능 | screenShowcase | ○ |
| `app-review.webp` | mobile | 1170×2532 | 부분 보완 — 빈 입력 양식 위주 — 핵심 화면 아님(보조로만 사용) | screenShowcase | ○ |
| `app-my.webp` | mobile | 1170×2532 | 사용 가능 | screenShowcase | ○ |
| `expert-dashboard.webp` | desktop | 2880×1800 | 사용 가능 | textImage, 카드 | ○ |
| `expert-profile.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `expert-orders.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `admin-sales.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `admin-consult.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |

### 스마트팩토리 MES (`smart-factory-mes`, review)

- 현재 실제 이미지: **8장** · 최종 권장: **7–8장** · 우선순위 P3
- 유지: 7장 · 부분 보완: `mes-production-analytics.webp`
- 메모: —

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `mes-dashboard.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `mes-production-plan.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `mes-work-orders.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `mes-shopfloor-terminal.webp` | tablet | 2048×2732 | 사용 가능 | screenShowcase | ○ |
| `mes-quality-inspection.webp` | tablet | 2048×2732 | 사용 가능 | screenShowcase | ○ |
| `mes-lot-trace.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `mes-production-analytics.webp` | desktop | 2880×1800 | 부분 보완 — 대시보드와 구성이 겹침. 표지 대시보드와 중복 설명 주의 | screenShowcase | ○ |
| `mes-process-flow.webp` | graphic | 2400×1600 | 사용 가능 | screenShowcase | ○ |

### STACKFLOW WMS (`stackflow-wms`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **10장** · 우선순위 P3
- 유지: 10장
- 메모: —

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `wms-dashboard.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `wms-inbound.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `wms-location-map.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `wms-outbound-wave.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `wms-packing-shipping.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `wms-pda-inbound.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `wms-pda-putaway.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `wms-pda-picking.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `wms-pda-cycle-count.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `wms-workflow.webp` | graphic | 2400×1350 | 사용 가능 | screenShowcase | ○ |

### VELORA SPACE (`velora-space`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **8–10장** · 우선순위 P3
- 유지: 10장
- 메모: —

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `velora-landing.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `velora-collection.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `velora-floorplan.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `velora-room-viewer.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `velora-configurator.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `velora-comparison.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `velora-my-space.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `velora-mobile-landing.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `velora-mobile-viewer.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `velora-mobile-configurator.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |

### NOCTAVE FEST (`noctave-fest`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **10장** · 우선순위 P3
- 유지: 10장
- 메모: —

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `noctave-landing.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `noctave-lineup.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `noctave-artist-detail.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `noctave-timetable.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `noctave-venue-map.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `noctave-tickets.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `noctave-mobile-home.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `noctave-mobile-schedule.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `noctave-mobile-map.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `noctave-mobile-ticket.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |

### CIVERA TWIN (`civera-twin`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **7–8장** · 우선순위 P2
- 유지: 7장 · 부분 보완: `civera-impact-analysis.webp`, `civera-sensor-network.webp`, `civera-incident-report.webp`
- 메모: 데스크톱 7장이 같은 항공 지도 바탕 — 장수 축소 권장

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `civera-command-center.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `civera-layer-explorer.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `civera-flood-timeline.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `civera-scenario-comparison.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `civera-impact-analysis.webp` | desktop | 2880×1800 | 부분 보완 — 다른 데스크톱 6장과 같은 항공 지도 바탕 — 화면 간 차이가 패널뿐 | featureGrid | ○ |
| `civera-sensor-network.webp` | desktop | 2880×1800 | 부분 보완 — 다른 데스크톱과 같은 지도 바탕(반복) | featureGrid | ○ |
| `civera-response-center.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `civera-incident-report.webp` | desktop | 2880×1800 | 부분 보완 — 다른 데스크톱과 같은 지도 바탕(반복) | featureGrid | ○ |
| `civera-mobile-inspection.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `civera-mobile-response.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |

### REELSHIFT STUDIO (`reelshift-studio`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **8–10장** · 우선순위 P3
- 유지: 8장 · 부분 보완: `reelshift-version-comparison.webp`, `reelshift-export-workspace.webp`
- 메모: —

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `reelshift-editing-workspace.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `reelshift-project-library.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `reelshift-motion-editor.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `reelshift-color-grading.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `reelshift-subtitle-editor.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `reelshift-review-annotation.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `reelshift-version-comparison.webp` | desktop | 2880×1800 | 부분 보완 — 검수·출력 화면과 같은 타이틀 프레임 — 비교 차이가 작게 보임 | textImage | ○ |
| `reelshift-export-workspace.webp` | desktop | 2880×1800 | 부분 보완 — 같은 타이틀 프레임 반복 | featureGrid | ○ |
| `reelshift-mobile-review.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `reelshift-mobile-approval.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |

### 운송 ERP·관제 (`transport-erp-monitoring`, approved)

- 현재 실제 이미지: **2장** · 최종 권장: **3–4장** · 우선순위 P2
- 유지: 1장 · 부분 보완: `erp-dashboard.webp`
- 메모: 실제 시스템 화면 추가 확보 시에만 보강

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `erp-dashboard.webp` | desktop | 2880×1463 | 부분 보완 — 정보 밀도가 낮아 카드·PDF 표지에서 업무가 잘 안 보임. 실제 화면 재캡처 시 교체 후보 | cover, 카드 | ○ |
| `erp-monitoring.webp` | desktop | 2880×1472 | 사용 가능 | textImage | ○ |

### THREADFORM STUDIO (`threadform-studio`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **10장** · 우선순위 P3
- 유지: 10장
- 메모: —

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `threadform-design-workspace.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `threadform-collection-board.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `threadform-colorway-editor.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `threadform-pattern-editor.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `threadform-size-grading.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `threadform-material-editor.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `threadform-tech-pack.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `threadform-sample-review.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `threadform-mobile-review.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `threadform-mobile-approval.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |

### ROAMFRAME (`roamframe-travel`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **10장** · 우선순위 P3
- 유지: 10장
- 메모: —

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `roamframe-trip-overview.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `roamframe-map-itinerary.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `roamframe-daily-timeline.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `roamframe-place-discovery.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `roamframe-collaboration.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `roamframe-budget.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `roamframe-reservations.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `roamframe-mobile-today.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `roamframe-mobile-route.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `roamframe-mobile-wallet.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |

### MORROW SELECT (`morrow-select`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **10장** · 우선순위 P2
- 유지: 8장 · 부분 보완: `morrow-product-discovery.webp`, `morrow-mobile-discovery.webp`
- 메모: 이미지 안 문구 포함 원본 2장

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `morrow-editorial-storefront.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `morrow-product-discovery.webp` | desktop | 2880×1800 | 부분 보완 — 상품 사진에 브랜드 문구가 이미지 안에 박혀 있음(원본 소스 문제) | featureGrid | ○ |
| `morrow-product-detail.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `morrow-style-lookbook.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `morrow-shopping-bag.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `morrow-checkout.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `morrow-order-management.webp` | desktop | 2880×1800 | 사용 가능 | featureGrid | ○ |
| `morrow-mobile-discovery.webp` | mobile | 1179×2556 | 부분 보완 — 상품 사진 안 문구 포함(원본 소스 문제) | screenShowcase | ○ |
| `morrow-mobile-product.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |
| `morrow-mobile-checkout.webp` | mobile | 1179×2556 | 사용 가능 | screenShowcase | ○ |

### SECONDLOOP (`secondloop`, review)

- 현재 실제 이미지: **10장** · 최종 권장: **10장** · 우선순위 P1
- 유지: 9장 · **교체 권장**: `secondloop-transaction-tracking.webp`
- 메모: SL-10 템플릿 코드 노출 화면 교체

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `secondloop-marketplace.webp` | desktop | 2880×1800 | 사용 가능 | cover, 카드 | ○ |
| `secondloop-advanced-search.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `secondloop-product-condition.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `secondloop-listing-studio.webp` | desktop | 2880×1800 | 사용 가능 | textImage | ○ |
| `secondloop-mobile-discover.webp` | mobile | 1179×2556 | 사용 가능 | userFlow | ○ |
| `secondloop-mobile-detail.webp` | mobile | 1179×2556 | 사용 가능 | userFlow | ○ |
| `secondloop-make-offer.webp` | mobile | 1179×2556 | 사용 가능 | userFlow | ○ |
| `secondloop-sell-item.webp` | mobile | 1179×2556 | 사용 가능 | textImage | ○ |
| `secondloop-checkout.webp` | mobile | 1179×2556 | 사용 가능 | userFlow | ○ |
| `secondloop-transaction-tracking.webp` | mobile | 1179×2556 | 교체 권장 — 화면 안에 템플릿 코드 {button("View transaction")} 문자열이 렌더링됨 | userFlow | ○ |

### 통근버스 (`commute-shuttle-platform`, approved)

- 현재 실제 이미지: **2장** · 최종 권장: **3장** · 우선순위 P1
- 유지: 0장 · 부분 보완: `shuttle-dashboard.webp` · **교체 권장**: `shuttle-driver-app.webp`
- 메모: 기사 앱 375×812, 대시보드 1440px — 원본 재캡처

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `shuttle-dashboard.webp` | desktop | 1440×1139 | 부분 보완 — 1440×1139 — 사용은 가능하나 긴 변 1600px 미만. 원본 재캡처 권장 | cover, 카드 | ○ |
| `shuttle-driver-app.webp` | mobile | 375×812 | 교체 권장 — 375×812 — 실제 기사 앱 원본 캡처(1170×2532 이상)로 교체 필요 | textImage, 카드 | ○ |

### 농수산 커머스 (`farm-commerce-backend`, approved)

- 현재 실제 이미지: **2장** · 최종 권장: **2–3장** · 우선순위 P1
- 유지: 1장 · **교체 권장**: `commerce-architecture.webp`
- 메모: 구조도 1073px — 재작성

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `commerce-app.webp` | mobile | 1290×2796 | 사용 가능 | cover, 카드 | ○ |
| `commerce-architecture.webp` | graphic | 1073×863 | 교체 권장 — 1073×863 저해상도 구조도. 같은 내용을 1600px 이상으로 재작성 | textImage | ○ |

### 메타버스 라이브 (`metaverse-live-app`, approved)

- 현재 실제 이미지: **1장** · 최종 권장: **1–3장** · 우선순위 P3
- 유지: 1장
- 메모: 실제 앱 캡처가 있을 때만 추가

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `metaverse-app.webp` | mobile | 1179×2556 | 사용 가능 | cover, 카드 | ○ |

### 전세버스 배차 (`charter-bus-dispatch`, approved)

- 현재 실제 이미지: **2장** · 최종 권장: **2–3장** · 우선순위 P1
- 유지: 1장 · **교체 권장**: `dispatch-architecture.webp`
- 메모: 구조도 1384×723 — 재작성

| 이미지 | 종류 | 크기 | 평가 | 사용 블록 | PDF |
|---|---|---|---|---|---|
| `dispatch-calendar.webp` | desktop | 2880×1463 | 사용 가능 | cover, 카드 | ○ |
| `dispatch-architecture.webp` | graphic | 1384×723 | 교체 권장 — 1384×723 저해상도 구조도. 같은 내용을 1600px 이상으로 다시 그려야 PDF에서 글자가 읽힘 | textImage | ○ |

## 이미지 품질 요약

- 실제 이미지 126장: 사용 가능 110 · 부분 보완 12 · 교체 권장 4
- 저해상도 4장(`dispatch-architecture`, `shuttle-dashboard`, `shuttle-driver-app`, `commerce-architecture`)은 이번 작업에서 확대·재생성하지 않았다.
- 원본 이미지는 하나도 수정·삭제하지 않았다. PDF에는 출력 시점에만 JPEG 사본(긴 변 2000px 이하)을 넣는다.
