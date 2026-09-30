# PIUS 웹사이트 — Next.js (App Router · TypeScript · CSS Modules)

기존 단일 HTML 사이트를 **화면과 동작이 동일하도록** Next.js로 옮긴 프로젝트입니다.

- 확인용 원본 게시본: https://claude.ai/artifact/2Tqac8VgnqznfaCRUtFr1e
- 지원 언어: 한국어(기본) · English · 日本語

---

## 1. 시작하기

```bash
npm install
cp .env.example .env.local     # 값 채우기 (아래 2장)
npm run dev                    # http://localhost:3000
npm run build && npm start     # 운영 빌드
npm run typecheck              # 타입 검사
```

권장 버전은 Node 20 이상, Next 15, React 19입니다.

## 2. 환경변수 (`.env.local`)

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 실제 사이트 주소입니다. OG 이미지 같은 공유 미리보기의 절대경로에 쓰입니다. |
| `NEXT_PUBLIC_FORM_ENDPOINT` | 문의 폼 접수 API입니다. 비워두면 전송을 흉내만 냅니다(UI 미리보기). |

폼은 `POST` + `application/json`으로 아래 값을 보냅니다.
- 보내는 필드: `name, company, phone, email, message, agree, lang, sentAt`
- 응답이 `2xx`면 완료 화면을 띄우고, 실패하면 3개 언어로 재시도 안내를 보여줍니다.
- 서버 쪽에서 해주셔야 할 것: 입력값 재검증, 스팸 방지, CORS 허용, 알림 발송

---

## 3. 구조

```
app/
  layout.tsx          메타데이터(canonical·OG·트위터), 구조화 데이터(JSON-LD), 뷰포트, 폰트, globals.css
  page.tsx            <Site />
  icon.png            파비콘 (512×512, Next가 <link rel="icon"> 자동 생성)
  apple-icon.png      iOS 홈 화면 아이콘
  robots.ts           /robots.txt
  sitemap.ts          /sitemap.xml
  globals.css         디자인 토큰 · 리셋 · 공용 유틸(.wrap .btn .disp .sec-idx .pin …)
components/
  Site.tsx            페이지 구성 + 부팅 순서(최상단 시작 → 3D 준비 → 스플래시 → 인트로)
  LangProvider.tsx    언어 Context (ko/en/ja, localStorage 'pius-lang')
  Logo.tsx            로고 SVG 조각
  Splash/ Header/ Hero/ About/ Understand/ Build/ Process/ Contact/ Footer/ Atmosphere/
     ├─ 컴포넌트.tsx          마크업 + 초기화
     ├─ 컴포넌트.module.css   해당 컴포넌트 스타일
     └─ *.controller.ts      섹션 애니메이션·인터랙션 (DOM/Canvas/SVG 직접 제어)
lib/
  core.ts             공용 런타임: 스크롤·프레임 엔진, 포인터, 스크램블, 부드러운 스크롤, 이벤트, CSS Modules 헬퍼
  i18n.ts             한/영/일 문구 사전
  logo.ts             로고 벡터(원본 .ai 추출)
  stage.ts            히어로~About 3D 로고플레이 안무 (P·I·U·S)
  heroBg.ts           히어로 배경 셰이더
  glass/              3D 유리 렌더러 (WebGL2 레이마칭) — index.ts가 타입이 붙은 공개 API
  site.ts             사이트 주소(SITE_URL). 환경변수가 없으면 https://pius.co.kr
public/
  og/og-image.png     OG 이미지 1200×630
  logo/               로고 SVG (흰색/검정)
  google4fcd0ab38f628a81.html   구글 서치 콘솔 소유 확인 파일 (삭제 금지)
```

### 동작 방식

- **React가 맡는 것**: 마크업, 문구(다국어), 상태(언어, 메뉴, 토스트)입니다.
- **controller / lib가 맡는 것**: 매 프레임 계산(스크롤·마우스), WebGL, 요소 직접 조정입니다. 각 컴포넌트가 `useEffect`에서 초기화하고, 해제될 때 정리 함수로 풀어줍니다.
  - 매 프레임 작업은 React 리렌더링 없이 돌아가므로 원본과 같은 성능과 결과를 냅니다.
- **프레임 루프는 하나**입니다(`Engine`). 각 섹션은 필요한 장면만 등록합니다.
  - `pin`: 스크롤 고정 구간(`[data-pin]` 자식 기준)
  - `pass`: 화면 통과 구간
- **컴포넌트 간 통신**은 window 이벤트로 합니다.
  - `pius:resize`: 레이아웃 재측정
  - `pius:lang`: 언어 변경. JS로 그리는 화면이 다시 그려집니다.
  - `pius:intro`: 스플래시 종료
  - `pius:toast`: 토스트 표시
  - `pius:navigate`: 앵커 이동. 모바일 메뉴가 닫힙니다.

### CSS Modules 규칙

- **구조 클래스는 모듈 범위(해시)입니다.** JSX에서 `cxm(styles)('hero__title disp')`처럼 씁니다. 모듈에 없는 이름(전역 유틸)은 그대로 통과합니다.
- **상태 클래스는 `:global()`입니다.** 대상은 `is-on`, `is-in`, `on`, `done`, `invalid` 등이며, controller가 이름 그대로 켜고 끕니다.
- **문자열로 만드는 마크업**(ERP·웹·앱 목업 화면 등)은 `innerHTML` 직후 `adopt(el)`로 클래스명을 모듈 이름으로 변환합니다. 선택자는 `sel('.x')`로 변환해서 찾습니다.
- **동적 요소는 id로 찾습니다.** 예: `#erpMain`, `#indGraph`. 해시 클래스명에 의존하지 않기 위해서입니다.

---

## 4. 알아두실 점

- **`reactStrictMode: false`**
  - controller가 DOM을 직접 만들기 때문에, 개발 모드의 이중 마운트에서 요소가 중복될 수 있어 꺼두었습니다.
  - 운영 빌드에는 영향이 없습니다.
- **`*.controller.ts`와 `lib/glass/renderer.ts`는 `// @ts-nocheck`입니다.**
  - 원본에서 검증된 애니메이션 로직을 결과물이 바뀌지 않도록 그대로 옮겼기 때문입니다.
  - 외부에 노출되는 함수(`init…(host, styles)`, `createGlass`)는 타입이 붙어 있습니다.
  - 내부는 점진적 타입화 대상입니다.
  - 그 외 컴포넌트와 `lib/*.ts`는 strict 모드로 작성했습니다.
- **폰트는 Google Fonts `<link>`로 불러옵니다.**
  - 사용 서체: Unbounded(가변 200–900), IBM Plex Sans KR / JP
  - `next/font`로 바꾸려면 생성되는 font-family 이름을 `globals.css`의 `--f-disp`, `--f-body` 변수에 연결해 주세요.
  - Unbounded는 가변 굵기 축(`wght`)이 필요합니다. 히어로 제목 렌즈 효과가 이 축을 씁니다.
- **3D 유리 로고는 WebGL2가 필요합니다.** 없으면 SVG 로고로 대체되고, 히어로 배경은 WebGL1로 그립니다.
- **디버그 파라미터**: `?glq=0.3`을 붙이면 3D 해상도를 강제로 낮춥니다. 저사양 시험용입니다.

---

## 5. 이전 과정에서 한 검증

작업 환경에서 Next.js를 설치할 수 없어서, 같은 컴포넌트를 esbuild로 묶어 브라우저에서 원본과 비교했습니다. 이때 CSS Modules는 로컬 스코프로 처리했습니다.

| 항목 | 결과 |
|---|---|
| 문서 전체 높이 (1440px / 390px) | 원본과 동일 (20,634px / 19,374px) |
| 주요 요소 29개 위치·크기 | 원본과 동일 |
| 섹션별 화면 비교 (히어로 ~ 푸터) | 동일 (애니메이션 시점 차이만 있음) |
| 언어 전환 EN/JP/KO · 새로고침 후 유지 | 정상 |
| 문의 폼 검증 · 환경변수 API로 JSON 전송 | 정상 (가짜 서버로 수신 확인) |
| 모바일 메뉴 열기 · 이동 · 닫기 | 정상 |
| ERP 메뉴 7개 전환 중 왼쪽 글 위치 | 고정 |
| TypeScript strict 검사 (lib · 컴포넌트) | 통과 (임시 React 타입 정의로 확인) |

**설치 후 한 번 확인해 주세요**
- `npm run build`: 실제 Next.js 빌드와 `@types/react` 기준 타입 검사입니다.
- 실기기 성능: 특히 iOS Safari와 저사양 안드로이드에서 3D를 확인해 주세요.

## 6. 배포와 SEO

- **배포**: Vercel(Framework Preset: Next.js, Root Directory: 저장소 루트). main에 머지하면 운영에 자동 배포됩니다.
- **도메인**: 대표 주소는 `https://pius.co.kr`입니다. `www.pius.co.kr`은 Vercel에서 대표 주소로 리다이렉트합니다. 대표 도메인을 바꾸면 `NEXT_PUBLIC_SITE_URL`도 같이 바꿔 주세요.
- **환경변수**(Vercel → Settings → Environment Variables): `NEXT_PUBLIC_SITE_URL=https://pius.co.kr`, `NEXT_PUBLIC_FORM_ENDPOINT`
- **검색엔진 등록**
  - 구글: `public/google4fcd0ab38f628a81.html` 파일로 소유 확인합니다. 지우면 확인이 풀립니다.
  - 네이버: 서치어드바이저에서 "HTML 태그" 코드를 받아 `app/layout.tsx`의 `verification` 주석을 풀고 값을 넣어 주세요.
  - 두 곳 모두 `https://pius.co.kr/sitemap.xml`을 제출합니다.
- **구조화 데이터**(JSON-LD)는 `app/layout.tsx`에 있습니다. 대표자·주소가 바뀌면 푸터 문구(`lib/i18n.ts`)와 함께 수정해 주세요.
- 영어·일본어는 브라우저 안에서만 전환되어 검색엔진에는 한국어만 색인됩니다.
- OG 이미지를 바꾼 뒤에는 카카오·페이스북 공유 디버거에서 캐시를 초기화해 주세요.

## 7. 운영 전 체크리스트

- [ ] Vercel 환경변수 `NEXT_PUBLIC_SITE_URL` 설정 (`NEXT_PUBLIC_FORM_ENDPOINT`는 문의 폼 백엔드 준비 후)
- [ ] 대표자 영문·일문 표기 확인: 현재 "Si-on Choi" / 「チェ・シオン（최시온）」(`lib/i18n.ts`)
- [ ] 영문·일문 주소 확인
- [ ] 영어·일본어 번역 원어민 검수: `lib/i18n.ts`와 각 controller 안의 목업 문구
- [ ] 개인정보 수집·이용 동의 전문 또는 처리방침 링크 추가
- [x] 파비콘·OG 이미지·robots·sitemap·구조화 데이터
- [ ] 네이버 서치어드바이저 소유 확인 코드 추가
- [x] `package-lock.json` 생성·커밋, 로컬 `npm run build` 통과
