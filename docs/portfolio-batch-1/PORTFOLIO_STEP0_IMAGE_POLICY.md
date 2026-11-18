# STEP 0 — 이미지 노출 정책 이행표 (11개 프로젝트 · 117장)

기준: 2026-11-10 사용자 승인 C/S/H/E. 정책의 단일 원본은 각 `project.json`의 `images[].presentation`(`tier`·`external`). 이 표는 실제 `project.json`과 PDF 출력 기록(`exports/report.json`의 쪽별 화면 id)에서 생성했다.

- C 핵심 = 표지·주요 블록(textImage·screenShowcase·userFlow) · S 보조 = 보조 블록(featureGrid 화면 카드) · H 숨김 = 연결 0, 원본·메타데이터 보존 · E = External PDF 우선(C 중)
- Full PDF = C 전부 + S 전부(화면+설명 카드 쪽), H 0 · External PDF = E만, 표지 화면은 뒤에서 반복하지 않음

| 합계 | C | S | H | E |
|---|---|---|---|---|
| 117 | 67 | 27 | 23 | 55 |

## FITY (`fity`) — C 8 / S 5 / H 6 / E 6

Full 11쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `app-home` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `app-expert` | C | 표지 | 1쪽 | — | External 후보 아님 |
| `app-product` | C | 표지 | 1쪽 | — | External 후보 아님 |
| `app-consult` | C·E | textImage/imageRight [CONSULTATION] | 5쪽 | 3쪽 |  |
| `app-result` | C·E | textImage/imageRight [CONSULTATION] | 5쪽 | 3쪽 |  |
| `expert-dashboard` | C·E | 카드 · textImage/full [EXPERT WORKSPACE] | 6쪽 | 4쪽 |  |
| `expert-orders` | C·E | textImage/full [EXPERT WORKSPACE] | 7쪽 | 5쪽 |  |
| `admin-consult` | C·E | textImage/imageLeft [PLATFORM MANAGEMENT] | 8쪽 | 6쪽 |  |
| `app-search` | S | featureGrid [MORE SCREENS](보조) | 9쪽 | — | 보조 — External 제외 |
| `app-photos` | S | featureGrid [MORE SCREENS](보조) | 9쪽 | — | 보조 — External 제외 |
| `app-consults` | S | featureGrid [MORE SCREENS](보조) | 9쪽 | — | 보조 — External 제외 |
| `app-review` | S | featureGrid [MORE SCREENS](보조) | 10쪽 | — | 보조 — External 제외 |
| `admin-sales` | S | featureGrid [MORE SCREENS](보조) | 10쪽 | — | 보조 — External 제외 |
| `app-fitnote` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `app-fit` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `app-fitnew` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `app-post` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `app-my` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `expert-profile` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 6/6 포함 · 빠진 E 없음

## 스마트팩토리 MES (`smart-factory-mes`) — C 6 / S 2 / H 0 / E 5

Full 9쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `mes-dashboard` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `mes-production-plan` | C | textImage/imageRight [PRODUCTION PLANNING] | 4쪽 | — | External 후보 아님 |
| `mes-work-orders` | C·E | textImage/imageLeft [WORK ORDERS] | 5쪽 | 4쪽 |  |
| `mes-shopfloor-terminal` | C·E | screenShowcase/tablets [SHOP FLOOR & QUALITY] | 6쪽 | 5쪽 |  |
| `mes-quality-inspection` | C·E | screenShowcase/tablets [SHOP FLOOR & QUALITY] | 6쪽 | 5쪽 |  |
| `mes-lot-trace` | C·E | textImage/full [LOT TRACEABILITY] | 7쪽 | 6쪽 |  |
| `mes-production-analytics` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `mes-process-flow` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |

External: E 5/5 포함 · 빠진 E 없음

## STACKFLOW WMS (`stackflow-wms`) — C 6 / S 4 / H 0 / E 5

Full 10쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `wms-dashboard` | C | 카드 · 표지 | 1쪽 | — | External 후보 아님 |
| `wms-inbound` | C·E | textImage/imageRight [INBOUND] | 4쪽 | 1쪽 |  |
| `wms-outbound-wave` | C·E | textImage/full [OUTBOUND WAVES] | 5쪽 | 4쪽 |  |
| `wms-packing-shipping` | C·E | textImage/imageRight [PACKING & SHIPPING] | 6쪽 | 5쪽 |  |
| `wms-pda-picking` | C·E | screenShowcase/phones [WAREHOUSE PDA] | 7쪽 | 6쪽 |  |
| `wms-pda-cycle-count` | C·E | screenShowcase/phones [WAREHOUSE PDA] | 7쪽 | 6쪽 |  |
| `wms-location-map` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `wms-pda-inbound` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `wms-pda-putaway` | S | featureGrid [MORE SCREENS](보조) | 9쪽 | — | 보조 — External 제외 |
| `wms-workflow` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |

External: E 5/5 포함 · 빠진 E 없음

## VELORA SPACE (`velora-space`) — C 6 / S 1 / H 3 / E 5

Full 10쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `velora-landing` | C | 카드 · 표지 | 1쪽 | — | External 후보 아님 |
| `velora-floorplan` | C·E | textImage/imageLeft [FLOOR PLAN] | 4쪽 | 1쪽 |  |
| `velora-room-viewer` | C·E | textImage/full [ROOM VIEWER] | 5쪽 | 3쪽 |  |
| `velora-configurator` | C·E | textImage/imageRight [MATERIALS] | 6쪽 | 4쪽 |  |
| `velora-comparison` | C·E | textImage/full [COMPARISON] | 7쪽 | 5쪽 |  |
| `velora-mobile-configurator` | C·E | textImage/imageRight [MOBILE] | 8쪽 | 6쪽 |  |
| `velora-my-space` | S | featureGrid [MORE SCREENS](보조) | 9쪽 | — | 보조 — External 제외 |
| `velora-collection` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `velora-mobile-landing` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `velora-mobile-viewer` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 5/5 포함 · 빠진 E 없음

## CIVERA TWIN (`civera-twin`) — C 5 / S 2 / H 3 / E 4

Full 8쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `civera-command-center` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `civera-scenario-comparison` | C·E | textImage/imageLeft [SCENARIO COMPARISON] | 4쪽 | 4쪽 |  |
| `civera-response-center` | C·E | textImage/imageLeft [RESPONSE OPERATIONS] | 5쪽 | 5쪽 |  |
| `civera-mobile-inspection` | C·E | screenShowcase/phones [FIELD MOBILE] | 7쪽 | 6쪽 |  |
| `civera-mobile-response` | C | screenShowcase/phones [FIELD MOBILE] | 7쪽 | — | External 후보 아님 |
| `civera-flood-timeline` | S | featureGrid [MORE SCREENS](보조) | 6쪽 | — | 보조 — External 제외 |
| `civera-incident-report` | S | featureGrid [MORE SCREENS](보조) | 6쪽 | — | 보조 — External 제외 |
| `civera-layer-explorer` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `civera-impact-analysis` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `civera-sensor-network` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 4/4 포함 · 빠진 E 없음

## NOCTAVE FEST (`noctave-fest`) — C 6 / S 2 / H 2 / E 5

Full 9쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `noctave-landing` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `noctave-lineup` | C·E | textImage/imageRight [ARTIST LINEUP] | 4쪽 | 3쪽 |  |
| `noctave-timetable` | C·E | textImage/full [STAGE TIMETABLE] | 5쪽 | 4쪽 |  |
| `noctave-tickets` | C·E | textImage/imageLeft [TICKET EXPERIENCE] | 7쪽 | 5쪽 |  |
| `noctave-mobile-schedule` | C·E | screenShowcase/phones [MOBILE EXPERIENCE] | 8쪽 | 6쪽 |  |
| `noctave-mobile-ticket` | C | screenShowcase/phones [MOBILE EXPERIENCE] | 8쪽 | — | External 후보 아님 |
| `noctave-artist-detail` | S | featureGrid [MORE SCREENS](보조) | 6쪽 | — | 보조 — External 제외 |
| `noctave-venue-map` | S | featureGrid [MORE SCREENS](보조) | 6쪽 | — | 보조 — External 제외 |
| `noctave-mobile-home` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `noctave-mobile-map` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 5/5 포함 · 빠진 E 없음

## REELSHIFT STUDIO (`reelshift-studio`) — C 6 / S 2 / H 2 / E 5

Full 10쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `reelshift-editing-workspace` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `reelshift-motion-editor` | C·E | textImage/imageLeft [EDIT] | 4쪽 | 3쪽 |  |
| `reelshift-color-grading` | C | textImage/full [EDIT] | 5쪽 | — | External 후보 아님 |
| `reelshift-review-annotation` | C·E | textImage/imageLeft [REVIEW] | 6쪽 | 4쪽 |  |
| `reelshift-version-comparison` | C·E | textImage/full [REVIEW] | 7쪽 | 5쪽 |  |
| `reelshift-mobile-review` | C·E | screenShowcase/phones [MOBILE REVIEW & APPROVAL] | 9쪽 | 6쪽 |  |
| `reelshift-subtitle-editor` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `reelshift-mobile-approval` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `reelshift-project-library` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `reelshift-export-workspace` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 5/5 포함 · 빠진 E 없음

## THREADFORM STUDIO (`threadform-studio`) — C 6 / S 2 / H 2 / E 5

Full 10쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `threadform-design-workspace` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `threadform-collection-board` | C | textImage/imageRight [COLLECTION BOARD] | 4쪽 | — | External 후보 아님 |
| `threadform-material-editor` | C·E | textImage/imageLeft [MATERIAL EDITOR] | 6쪽 | 3쪽 |  |
| `threadform-tech-pack` | C·E | textImage/full [TECH PACK] | 7쪽 | 4쪽 |  |
| `threadform-sample-review` | C·E | textImage/imageRight [SAMPLE REVIEW] | 8쪽 | 5쪽 |  |
| `threadform-mobile-review` | C·E | screenShowcase/phones [MOBILE REVIEW] | 9쪽 | 6쪽 |  |
| `threadform-colorway-editor` | S | featureGrid [DESIGN TOOLS](보조) | 5쪽 | — | 보조 — External 제외 |
| `threadform-mobile-approval` | S | featureGrid [DESIGN TOOLS](보조) | 5쪽 | — | 보조 — External 제외 |
| `threadform-pattern-editor` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `threadform-size-grading` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 5/5 포함 · 빠진 E 없음

## ROAMFRAME (`roamframe-travel`) — C 6 / S 2 / H 2 / E 5

Full 10쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `roamframe-trip-overview` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `roamframe-map-itinerary` | C·E | textImage/imageRight [MAP & ITINERARY] | 4쪽 | 3쪽 |  |
| `roamframe-daily-timeline` | C·E | textImage/imageLeft [DAILY TIMELINE] | 5쪽 | 4쪽 |  |
| `roamframe-collaboration` | C·E | textImage/imageRight [COLLABORATIVE PLANNING] | 6쪽 | 5쪽 |  |
| `roamframe-budget` | C | textImage/imageLeft [BUDGET & EXPENSE SPLIT] | 7쪽 | — | External 후보 아님 |
| `roamframe-mobile-today` | C·E | screenShowcase/phones [MOBILE TRAVEL MODE] | 9쪽 | 6쪽 |  |
| `roamframe-place-discovery` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `roamframe-mobile-route` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `roamframe-reservations` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `roamframe-mobile-wallet` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 5/5 포함 · 빠진 E 없음

## MORROW SELECT (`morrow-select`) — C 6 / S 2 / H 2 / E 5

Full 10쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `morrow-storefront` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `morrow-discovery` | C·E | textImage/imageRight [PRODUCT DISCOVERY] | 4쪽 | 3쪽 |  |
| `morrow-product-detail` | C·E | textImage/imageLeft [PRODUCT DETAIL] | 5쪽 | 4쪽 |  |
| `morrow-shopping-bag` | C | textImage/imageRight [SHOPPING BAG] | 6쪽 | — | External 후보 아님 |
| `morrow-checkout` | C·E | textImage/imageLeft [CHECKOUT REVIEW] | 7쪽 | 5쪽 |  |
| `morrow-mobile-product` | C·E | textImage/imageRight [MOBILE] | 8쪽 | 6쪽 |  |
| `morrow-order-management` | S | featureGrid [MORE SCREENS](보조) | 9쪽 | — | 보조 — External 제외 |
| `morrow-mobile-checkout` | S | featureGrid [MORE SCREENS](보조) | 9쪽 | — | 보조 — External 제외 |
| `morrow-lookbook` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |
| `morrow-mobile-discovery` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 5/5 포함 · 빠진 E 없음

## SECONDLOOP (`secondloop`) — C 6 / S 3 / H 1 / E 5

Full 9쪽 · External 7쪽 (ko·en·ja 동일, A4)

| 이미지 ID | 분류 | 웹 블록 | Full PDF | External PDF | 비고 |
|---|---|---|---|---|---|
| `secondloop-marketplace` | C·E | 카드 · 표지 | 1쪽 | 1쪽 |  |
| `secondloop-product-condition` | C·E | textImage/imageLeft [CONDITION DETAIL] | 6쪽 | 6쪽 |  |
| `secondloop-listing-studio` | C | textImage/imageRight [SELLER LISTING] | 7쪽 | — | External 후보 아님 |
| `secondloop-make-offer` | C·E | screenShowcase/phones [OFFER · CHECKOUT · TRACKING] | 5쪽 | 5쪽 |  |
| `secondloop-checkout` | C·E | screenShowcase/phones [OFFER · CHECKOUT · TRACKING] | 5쪽 | 5쪽 |  |
| `secondloop-transaction-tracking` | C·E | screenShowcase/phones [OFFER · CHECKOUT · TRACKING] | 5쪽 | 5쪽 |  |
| `secondloop-advanced-search` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `secondloop-mobile-detail` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `secondloop-sell-item` | S | featureGrid [MORE SCREENS](보조) | 8쪽 | — | 보조 — External 제외 |
| `secondloop-mobile-discover` | H | — | — | — | 노출 제외(원본·메타데이터 보존, public 복사 안 함) |

External: E 5/5 포함 · 빠진 E 없음
