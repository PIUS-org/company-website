# 포트폴리오 콘텐츠 구조서 (개발자용)

PIUS 홈페이지 포트폴리오는 **파일 기반 콘텐츠 + 공통 렌더러** 구조입니다.
프로젝트 하나 = JSON 파일 하나 + 이미지 폴더 하나. 페이지·컴포넌트를 프로젝트마다 만들지 않습니다.

```
content/portfolio/
  _template/project.json       새 프로젝트 틀 (npm run portfolio:new -- <slug>)
  <slug>/project.json          콘텐츠 원본 (한·영·일)
  <slug>/images/*.webp         화면 이미지 원본 (공개 여부와 무관하게 여기에만 둠)
lib/portfolio/
  types.ts                     데이터 타입 (렌더러 기준)
  index.ts                     getProjects / getProject / getNextProject / getPrintable
  text.ts                      tx(다국어), srcOf(언어별 이미지), accentVars
  print.ts                     paginate(): 블록 → PDF 페이지
components/Portfolio/
  PortfolioList.tsx · PortfolioCard.tsx     목록
  ProjectView.tsx + blocks/*.tsx           상세 (블록 렌더러)
  media/Screen.tsx                         화면 틀 (폰·브라우저·태블릿·일반) — 웹·PDF 공용
  print/PrintDoc.tsx                       PDF 레이아웃
components/SubPage.tsx         서브페이지 셸 (헤더·분위기·푸터·언어, 메인 부팅 로직 없음)
scripts/portfolio.mjs          검증 · 동기화 · 신규 생성 (의존성 없음)
scripts/portfolio-export.mjs   PDF·PNG 출력 (Playwright)
app/portfolio/page.tsx                       /portfolio
app/portfolio/[slug]/page.tsx                /portfolio/<slug>
app/portfolio/[slug]/print/[lang]/page.tsx   /portfolio/<slug>/print/<ko|en|ja> (출력 빌드에서만 생성)
```

## 1. 데이터 흐름

```
content/portfolio/*/project.json + images/
        │  node scripts/portfolio.mjs sync   (predev · prebuild · pretypecheck 에서 자동 실행)
        │   1) 전 프로젝트 검증 — 오류가 있으면 빌드 중단
        │   2) 단계(stage)에 해당하는 프로젝트만 선택
        │   3) 그 프로젝트의 이미지만 public/portfolio/<slug>/ 로 복사 (폴더를 비우고 다시 복사)
        │   4) 이미지 크기를 읽어 넣고 .portfolio/manifest.json 생성
        ▼
lib/portfolio/index.ts (manifest import) → 목록 · 상세 · PDF
```

`public/portfolio/`와 `.portfolio/`는 **생성물**이라 git에 넣지 않습니다(.gitignore).

## 2. 공개 정책 (stage × status)

| status | 의미 | public (운영) | review (미리보기·검토) | all (로컬 PDF 전용) |
|---|---|---|---|---|
| `draft` | 초안 | ✕ | ✕ | ○ |
| `review` | 공개 검토 | ✕ | ○ | ○ |
| `approved` | 공개 승인 | ○ | ○ | ○ |
| `private` | 비공개 | ✕ | ✕ | ○ |

- `visible: false`면 approved라도 목록·상세에서 빠집니다(임시 내림).
- 단계 결정: `--stage` > 환경변수 `PORTFOLIO_STAGE` > 기본값 `public`. 운영 서버는 아무 설정 없이 `npm run build` → public.
- 단계에 없는 프로젝트는 **데이터도 이미지도 빌드에 들어가지 않습니다.** 화면에서 숨기는 방식이 아니라 복사 자체를 하지 않습니다.
- public 단계에서는 `reviewNotes`(내부 메모)도 manifest에서 제거됩니다.
- 상세 페이지는 `dynamicParams = false` → 단계에 없는 slug와 잘못된 slug는 모두 404.
- 검토 단계 페이지와 승인 전 프로젝트에는 `noindex`.
- **외부 링크 금지**: 콘텐츠 문자열에 `http(s)://`, `www.`, `github.com`, `figma.com` 등이 있으면 검증 오류. 렌더러에도 외부 링크 출력 경로가 없습니다(서비스 URL·배포 주소·GitHub·Figma·테스트 서버·관리자 주소·QR 모두 해당).
- 링크 제거만으로 비공개 정보가 보호되지 않습니다. 화면 이미지 안의 개인정보·실데이터는 **이미지 단계에서** 지우거나 더미로 바꿔야 합니다(운영 가이드 2장).

## 3. 프로젝트 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ● | 고유 ID. CMS로 옮길 때 키. 중복 시 오류 |
| `slug` | string | ● | URL. 영문 소문자·숫자·하이픈. **폴더 이름과 같아야 함** |
| `status` | draft·review·approved·private | ● | 공개 상태 |
| `visible` | boolean | ● | false면 목록·상세에서 제외 |
| `featured` | boolean | ● | '전체' 탭의 대표 카드(2칸 너비 가로형, 업무 흐름 단계 표시). 한 프로젝트만 권장 |
| `order` | number | ● | 정렬. 작을수록 앞 (10, 20, 30… 간격 권장) |
| `includeInPdf` | boolean | ● | PDF 출력 대상 여부 |
| `title` `subtitle` `summary` `overview` | L | ● | 프로젝트명 · 부제 · 한 줄 설명(카드) · 개요 |
| `industry` | L | | 산업 분야 |
| `categories` | erp·platform·mobile·web·commerce·integration [] | ● | 복수 가능. 목록 필터 |
| `platforms` | `{ type: app·web·admin·desktop·api, label?: L }[]` | ● | 카드에는 App · Web · Admin으로 표시 |
| `projectState` | inDevelopment·launched·operating·completed·maintenance | | **모르면 넣지 않음** |
| `year` | number | | 모르면 넣지 않음 |
| `period` | string | | `"2025.01 – 2025.12"` 형식. 있으면 연도 대신 표시 |
| `stack` | string[] | 화면 없을 때 ● | 기술 이름(번역 안 함). 개요 표에 표시. **화면 이미지가 하나도 없는 프로젝트는 필수** — 카드·표지가 기술 스택 타이포그래피로 대체됨 |
| `scope` | `{ key, label?: L, pending?: true }[]` | ● | 수행 범위. key: planning·ux·ui·frontend·app·backend·api·admin·infra·operation. `pending`은 미확인 — 화면·PDF에 표시하지 않음(승인 상태에서는 금지) |
| `theme` | `{ accent: #hex, accentInk: #hex, cover: light·dark, layout?: split·stage·editorial·rail }` | ● | 프로젝트 강조색(포트폴리오 콘텐츠 영역 안에서만 쓰임). `layout`은 상세 페이지 변형(웹 전용, PDF는 한 가지) — 생략하면 split |
| `thumbnail` | 이미지 id [] | ● | 목록 카드 이미지 (폰 1~3장, 또는 데스크톱 1장 + 폰 1장, 또는 사진 1장). 화면이 없는 프로젝트는 `[]` |
| `images` | ImageEntry[] | ● | 이미지 목록 (아래) |
| `blocks` | Block[] | ● | 상세 콘텐츠 (아래). cover는 정확히 1개 |
| `reviewNotes` | string[] | | 공개 전 확인할 내부 메모. 화면에는 표시하지 않음(데이터에만 남김) |

**거래처 금지어**: `content/portfolio/_clients.txt`(한 줄에 이름 하나, `#` 주석)에 있는 이름이 project.json의 어떤 문자열(id·slug·파일 이름 포함)에라도 있으면 오류. `client`·`clientName` 필드는 두지 않는다. 이 파일은 공개 빌드에 복사되지 않는다.

`L` = `{ "ko": "…", "en": "…", "ja": "…" }`. ko 필수. **approved에서는 en·ja가 비면 오류**, 그 외 상태에서는 경고.

### ImageEntry

```json
{ "id": "app-home", "file": "app-home.webp", "kind": "mobile",
  "alt": { "ko": "…", "en": "…", "ja": "…" },
  "caption": { "ko": "…" },
  "fileByLang": { "en": "app-home-en.webp" },
  "placeholder": { "ko": "고객 앱 · 홈" },
  "presentation": { "tier": "core", "external": true } }
```

- `kind`: `mobile`(폰 틀) · `desktop`(브라우저 틀, 주소창 없음) · `tablet` · `photo` · `graphic`(틀 없음)
- `file`: images/ 안의 파일. 형식 webp·png·jpg·avif·gif·svg. **크기(width/height)는 sync가 자동으로 읽음**
- `fileByLang`: 언어별 스크린샷이 있을 때
- `file: null` = 아직 받지 않은 화면. 같은 비율의 "화면 준비 중" 틀로 표시(draft·review만 허용, approved면 오류). 실제 없는 UI를 그려 넣지 않기 위한 장치
- `presentation`(선택): 화면 노출 정책. 없으면 예전과 같이 동작.
  - `tier: "core"` 핵심 — 표지·카드·주요 블록(textImage·screenShowcase·userFlow)
  - `tier: "support"` 보조 — 보조 블록(featureGrid 카드·imageGallery)에만. 표지·카드·주요 블록에 넣으면 오류
  - `tier: "hidden"` 숨김 — 원본 파일과 메타데이터는 그대로 두고 **어디에도 연결하지 않음**(연결하면 오류). 웹·PDF·카드에 나오지 않고 public/으로 복사되지도 않음. "안 쓰는 이미지" 경고 대상 아님
  - `external: true` — External PDF 우선 화면(core만 가능). 한 프로젝트에 하나라도 있으면 External PDF는 이 화면들만 쓰고(보조·숨김·나머지 core 제외), 표지 화면은 뒤 페이지에서 반복하지 않음
- 검증: 파일 존재, 중복 id, 해상도(긴 변 900px 미만 경고), 용량(1.5MB 초과 경고), 블록에서 안 쓰는 이미지·목록에 없는 파일 경고, presentation 규칙

## 4. 블록

모든 블록 공통: `section?: { index?: "03", label: "CUSTOMER EXPERIENCE" }`, `pdf?: { skip: true }`.

| type | 필수 | 선택 | 화면 |
|---|---|---|---|
| `cover` | headline, images | eyebrow, sub | 01 히어로. 프로젝트 색 배경 + 대표 화면 (폰 1~3 또는 데스크톱+폰) |
| `overview` | lead | heading, body, goals[{title, body}] | 개요 + 사실 정보(산업·분류·플랫폼·상태·연도, 없는 항목 생략) + 핵심 과제 |
| `services` | heading, columns[{platform, title, audience, items[]}] | intro, core, note | 서비스 구조: 플랫폼 코어 → 역할별 열 |
| `userFlow` | heading, steps[{title, body?, image?}] | intro | 번호가 이어지는 단계 + 단계별 화면. 모바일은 가로 스크롤 |
| `textImage` | layout, heading, images | body, bullets[], surface | layout: `imageLeft`(A) · `imageRight`(B) · `full`(C) · `desktopPhones`(E) · `focus`(F) |
| `screenShowcase` | layout, images | heading, body, surface | `phones`(D, 2~4장) · `tablets`(태블릿 1~2장, 넓게) · `desktop` · `desktopPhones` · `focus` |
| `imageGallery` | images | heading, columns(2·3) | 비율 유지 메이슨리 |
| `featureGrid` | heading, items[{title, body, image?}] | intro | G. 기능 카드 비교 |
| `scope` | | heading, note | 프로젝트 `scope` 중 확인된 항목만 번호 목록으로. 확인된 항목이 없으면 블록 자체를 숨김 |
| `results` | heading, items[{value, label, source}] | | 성과 수치. **source(출처) 필수**, 화면에는 나오지 않음 |
| `statement` | text | sub | 마무리 문장 + PIUS 마크 |

`surface`: `light`(프로젝트 색을 옅게 섞은 밝은 배경 — 스크린샷 색 보존) · `dark`(그래파이트) · `accent`(프로젝트 색).
같은 surface·layout을 연달아 쓰지 않는 것이 원칙입니다(시각적 리듬).

## 5. 다국어

- 문구 원본은 ko. en·ja는 같은 객체 안에 둡니다. 화면은 `tx(L, lang)` → 없으면 ko로 대체.
- UI 고정 문구(필터, 항목명, 상태명, 수행 범위명)는 `lib/i18n.ts`의 `pf.*` 키 (3개 언어).
- 언어 전환은 메인과 같은 `LangProvider`(localStorage `pius-lang`)를 씁니다. 메인↔포트폴리오 사이에서 언어가 유지됩니다.
- 언어별 이미지: `fileByLang`.
- PDF는 언어별 라우트(`/print/ko|en|ja`)라서 서버 렌더 단계부터 해당 언어로 그려집니다.

## 6. 화면 처리 원칙

- 이미지는 자르지 않습니다(`aspect-ratio` = 원본 비율). 틀은 종류별로 다르고 얇게: 폰 베젤·브라우저 바 두께는 틀 너비에 비례(`cqw`).
- 목록 카드의 미디어 영역은 고정 비율 안에서 틀을 배치하므로, 비율이 제각각인 이미지가 들어와도 카드 정렬이 유지됩니다.
- `<img width height loading=lazy decoding=async>`. 첫 화면·PDF는 eager.
- 배경은 중립색(검정·그래파이트·밝은 회색)입니다. 프로젝트 색(`--pf-accent`, `--pf-ink`)은 밝은 면의 작은 표식·제목 글자색과 아주 옅은 틴트(3~9%)에만 쓰고, 어두운 면의 표식은 PIUS 아이스블루입니다. 헤더·푸터·전역 토큰은 건드리지 않습니다.
- 큰 제목은 단어 중간에서 줄이 바뀌지 않습니다: 목록의 "Portfolio"는 한 줄 고정 + 화면 폭에 맞춘 크기, 상세 표지의 프로젝트명은 가장 긴 단어 길이(`--len`)로 크기 상한을 계산합니다.

## 7. 메인 페이지 Works 섹션

- 공개 프로젝트가 1건 이상이면 메인의 Process와 Contact 사이에 `components/Works/Works.tsx`("Built to Work.")가 나옵니다. **결과물 카드는 메인에 싣지 않습니다.** 분류별 프로젝트 수를 타일로 보여 주고, 타일을 누르면 그 분류로 필터된 `/portfolio#<category>`로 이동합니다(앱 타일 → 모바일 앱 필터). 전체 보기는 제목 옆의 작은 텍스트 링크 하나뿐입니다.
- 숫자는 `worksTiles()`가 공개 데이터의 `categories`에서 자동 계산합니다(직접 입력 없음). 순서: 모바일 앱 · 웹 · 플랫폼 · ERP · 커머스 · 시스템 연동, 0인 분류는 숨김. 그래서 **앱이 있는 프로젝트는 `mobile` 분류를 꼭 넣어야** 앱 숫자에 잡힙니다.
- 화면에 들어오면 타일이 차례로 올라오고, 선 아이콘이 그려지고, 숫자가 00부터 카운트업됩니다. 마우스를 따라 타일 안에 은은한 빛이 움직입니다.
- 이때 메인 헤더의 Portfolio는 `#works`로 스크롤하고, 그 구간에서 활성 표시가 켜집니다. 공개 프로젝트가 0건이면 섹션이 없고 Portfolio는 `/portfolio`로 이동합니다.
- 그 위 섹션(히어로~Process)의 위치·크기는 바뀌지 않습니다(Contact·푸터만 섹션 높이만큼 아래로).

## 7-2. 여러 프로젝트 배치

- 목록(`PortfolioList.tsx` `spanOf`): 3열(태블릿 2열·모바일 1열). 각 탭의 첫 카드는 **대표 카드**로 2칸 너비 가로형('전체' 탭은 `featured`). 마지막 줄에 빈칸이 생기면 마지막 카드가 남은 칸만큼 넓어짐(가로형). 첫 화면 11장(대표 카드 포함 4줄), 이후 '더 보기' 12장씩.
- 화면 이미지가 아직 없는 프로젝트(`file: null`)는 빈 브라우저 틀 대신 **업무 흐름 카드**(userFlow 단계)를 보여 준다. 상세 `layout`에 따라 3가지 배치(split=번호 목록, stage·rail=단계 문장, editorial=단계 수+처음→끝). 상세 표지와 PDF 표지도 같은 흐름 패널. 실제 파일이 들어오면 자동으로 화면으로 바뀐다.
- (이전 문서의 `layoutSpans()`는 코드에 없었음 — 2026-11 정리)
- 카드 이미지: 기기(폰·태블릿·브라우저 틀)는 카드 밖으로 잘리지 않습니다. 카드 비율과 이미지 비율로 크기를 계산해 항상 통째로 보입니다(`PortfolioCard.tsx` fitK). 폰·태블릿 1장이면 같은 화면을 크게 흐리게 깔아 배경을 채우고, 데스크톱+폰이면 폰을 카드 안쪽 모서리에 겹칩니다. 사진·그래픽은 카드를 꽉 채웁니다.
- 순서는 `order`(작을수록 앞). 대표로 크게 보일 프로젝트만 `featured: true`.

## 7-3. 페이지 이동 (lib/nav.ts)

- 사이트 안 다른 페이지로 가는 링크는 모두 일반 `<a>`이고, `bindPageLeave()`가 가로챕니다: 본문만 페이드(`html.is-leaving`) → 헤더 pill 위치를 sessionStorage에 저장 → 이동.
- 도착 페이지: `<head>`의 인라인 스크립트가 첫 페인트 전에 `html.is-return`을 붙여 헤더를 즉시 보이게 하고 스플래시 마크업을 숨깁니다. pill은 이전 위치에서 현재 메뉴로 미끄러지고, 본문은 페이드인(`is-arriving`).
- 스플래시는 방문(세션)당 한 번. 사이트 안에서 메인으로 돌아오면 `Splash.skip()` → 바로 인트로.
- 모든 페이지는 열릴 때 맨 위에서 시작(`#해시`가 있을 때만 예외).
- sessionStorage를 쓸 수 없는 환경에서는 기존 동작(매번 스플래시, 헤더 슬라이드)으로 돌아갑니다.

## 7-1. 서브페이지와 헤더

- `components/SubPage.tsx`: LangProvider + Atmosphere + Header + Footer + 프레임 엔진만. 스플래시·3D 스테이지·히어로 셰이더·섹션 컨트롤러·강제 최상단 이동은 실행하지 않습니다.
- `Header route="home|portfolio|page"`
  - home: 기존 동작 그대로 (#about … 스크롤 연동 활성 표시, 인트로 후 등장). Contact 메뉴 자리에 Portfolio(#works). contact 섹션에서는 활성 표시가 사라짐(문의하기 CTA가 담당)
  - portfolio: 섹션 메뉴·CTA·로고 → 메인(`/#about`, `/#contact`, `/`), Portfolio 활성 고정, 즉시 등장, 스크롤 상태·진행 막대 유지
- 메인 `Site.tsx`: 주소에 `#섹션`이 있으면 기존처럼 최상단·스플래시·인트로를 거친 뒤 그 섹션으로 부드럽게 이동(`#contact`면 이름 칸 포커스).

## 8. PDF 출력

- `paginate(project)`가 블록을 페이지로 변환: 표지 → 개요 → 서비스 구조 → 흐름(균등 분할: 화면 없는 흐름 6단계까지 한 쪽, 7단계 → 4+3) → 기능(텍스트+대표 화면, 나머지 화면은 다음 쪽) → 화면 모음(폰 4장 / 혼합 3장 / 데스크톱 1장씩) → 기능 카드(6개씩, 화면이 붙은 카드는 화면+설명 3개씩) → 성과 → 마무리(수행 범위 + 문장 + PIUS 로고, 어두운 쪽).
- **판본 2종**: Full(기본, 위 전체 — hidden 화면은 쓰지 않음) · External(`?mode=external`, `paginateExternal`) — 외주 플랫폼 제출용. 화면에 `presentation`이 있는 프로젝트는 `externalView()`로 `external` 화면만 남긴 뒤(표지 화면 반복 제외, 화면이 빠진 블록 제외) 화면이 있는 쪽을 우선해 7쪽 이내로 고르고, 흐름은 통째로 넣거나 통째로 뺌. 그 밖의 프로젝트는 아래 규칙. 표지·개요·흐름 전체·대표 기능 2쪽·보조 화면 1쪽·기능 카드 1쪽·마무리 중 중요도 순으로 최대 7쪽. 내용이 적으면 늘리지 않음. 두 판본 모두 같은 출력 페이지에 렌더되고 `data-mode`로 하나만 보임.
- 형식: A4 가로(297×210mm) 기본, `?format=169` = 16:9(338.67×190.5mm). 화면 크기는 페이지 높이 기준으로 맞춰서(`--scrH` 등) 넘치지 않음.
- 모든 쪽에 PIUS 로고·프로젝트명·섹션명·쪽 번호. 링크·내비게이션·애니메이션 없음. 검토용 표시 없음(화면만).
- `npm run portfolio:export` (운영 가이드 6장). 출력 후 잘림 검사(페이지 밖으로 나간 요소)·쪽수·파일 크기·외부 제출 준비 여부를 보고하고 `exports/report.json`을 남깁니다(쪽별로 들어간 화면 id 포함).
- 화면 이미지는 PDF 안에서만 JPEG(긴 변 2000px 이하)로 넣습니다(Chromium이 WebP·PNG를 무손실 비트맵으로 넣어 12쪽이 16MB가 되던 문제 → 약 3MB). 원본 파일은 바뀌지 않습니다. `--raw`로 끌 수 있음.
- 출력용 라우트는 `PORTFOLIO_PRINT=1`일 때만 생성되므로 **운영 사이트에서는 404**입니다.

## 9. 빌드 모드

| 모드 | 명령 | 포트폴리오 단계 | 출력용 화면 |
|---|---|---|---|
| 운영 | `npm run build` | public | 없음 |
| 개발 | `npm run dev` (`PORTFOLIO_STAGE=review npm run dev` 가능) | public | 없음 (`PORTFOLIO_PRINT=1` 시 생성) |
| PDF 출력 | `npm run portfolio:export` | review(기본) | 있음, `.export-build/` |
| Claude 미리보기 | `node scripts/preview-build.mjs` | review | 있음, 평탄화된 정적 파일 |

`next.config.ts`의 운영 설정은 바뀌지 않았습니다. `PIUS_PREVIEW`, `PIUS_EXPORT`가 있을 때만 정적 export 설정이 붙습니다.

## 10. CMS·관리자 웹으로 옮길 때

- `project.json` 스키마를 그대로 테이블/문서 모델로 옮기면 됩니다(블록은 JSON 컬럼 또는 블록 테이블).
- `scripts/portfolio.mjs`의 검증 규칙이 관리자 입력 검증의 기준입니다.
- `lib/portfolio/index.ts`의 manifest import만 API 호출로 바꾸면 렌더러는 그대로 씁니다.
- 이미지 저장소는 공개/비공개 버킷을 분리하고, 공개 승인 시점에 공개 버킷으로 복사하는 현재 방식을 유지하세요.
