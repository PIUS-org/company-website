#!/usr/bin/env node
// PIUS portfolio — content check & sync (no dependencies).
//
//   node scripts/portfolio.mjs check                 validate every project, change nothing
//   node scripts/portfolio.mjs sync [--stage S]      validate, then publish the visible projects:
//                                                    images → public/portfolio/<slug>/, data → .portfolio/manifest.json
//   node scripts/portfolio.mjs new <slug>            create content/portfolio/<slug>/ from the template
//
// Stage (which projects the build may contain):  --stage > $PORTFOLIO_STAGE > "public"
//   public : status "approved" and visible       ← the real website (npm run build / dev)
//   review : "approved" + "review", visible      ← Claude preview, internal review
//   all    : everything incl. draft and private  ← local PDF export only, never deployed
//
// Anything that is not in the stage is not copied at all, so unapproved screenshots never reach
// public/ or the build output. Errors stop the build (npm "prebuild" runs sync).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(root, 'content', 'portfolio');
const PUBLIC_DIR = path.join(root, 'public', 'portfolio');
const MANIFEST = path.join(root, '.portfolio', 'manifest.json');

const LANGS = ['ko', 'en', 'ja'];
const STATUS = ['draft', 'review', 'approved', 'private'];
const CATEGORIES = ['erp', 'platform', 'mobile', 'web', 'commerce', 'integration'];
const PLATFORMS = ['app', 'web', 'admin', 'desktop', 'api'];
const STATES = ['inDevelopment', 'launched', 'operating', 'completed', 'maintenance'];
const SCOPE = ['planning', 'ux', 'ui', 'frontend', 'app', 'backend', 'api', 'admin', 'infra', 'operation'];
const TIERS = ['core', 'support', 'hidden'];
const KINDS = ['mobile', 'desktop', 'tablet', 'photo', 'graphic'];
const SURFACES = ['light', 'dark', 'accent'];
const EXT = /\.(webp|png|jpe?g|avif|gif|svg)$/i;
const DEFAULT_SIZE = { mobile: [1179, 2556], desktop: [2880, 1800], tablet: [2048, 2732], photo: [1600, 1067], graphic: [1600, 1000] };
const BLOCKS = {
  cover: { req: ['headline'], L: ['eyebrow', 'headline', 'sub'], imgs: ['images'] },
  overview: { req: ['lead'], L: ['heading', 'lead', 'body'] },
  services: { req: ['heading', 'columns'], L: ['heading', 'intro', 'note', 'core'] },
  userFlow: { req: ['heading', 'steps'], L: ['heading', 'intro'] },
  textImage: { req: ['layout', 'heading', 'images'], L: ['heading', 'body'], imgs: ['images'], layouts: ['imageLeft', 'imageRight', 'full', 'desktopPhones', 'focus'] },
  screenShowcase: { req: ['layout', 'images'], L: ['heading', 'body'], imgs: ['images'], layouts: ['phones', 'tablets', 'desktop', 'desktopPhones', 'focus'] },
  imageGallery: { req: ['images'], L: ['heading'], imgs: ['images'] },
  featureGrid: { req: ['heading', 'items'], L: ['heading', 'intro'] },
  scope: { req: [], L: ['heading', 'note'] },
  results: { req: ['heading', 'items'], L: ['heading'] },
  statement: { req: ['text'], L: ['text', 'sub'] },
};
// Client (거래처) names must never appear anywhere in portfolio content. One name per line in
// content/portfolio/_clients.txt (# = comment). The file itself is internal and never published.
const CLIENTS_FILE = path.join(CONTENT, '_clients.txt');
const clientPatterns = () => {
  if (!fs.existsSync(CLIENTS_FILE)) return [];
  return fs.readFileSync(CLIENTS_FILE, 'utf8').split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim()).filter(Boolean).map((name) => {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Latin names match as whole words (case-insensitive); Korean/Japanese names match anywhere
    return { name, re: new RegExp(/^[\x00-\x7f]+$/.test(name) ? `(^|[^a-z0-9])${esc}($|[^a-z0-9])` : esc, 'i') };
  });
};
const CLIENTS = clientPatterns();
// links are not allowed anywhere in portfolio content (service URLs, GitHub, Figma, test servers, QR …)
const LINK = /(https?:\/\/|www\.|github\.com|figma\.com|\.vercel\.app|\.netlify\.app|localhost:\d)/i;

/* ---------------- image size (PNG, JPEG, WebP, GIF, AVIF, SVG) ---------------- */
function imageSize(file) {
  const b = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png' && b.toString('ascii', 12, 16) === 'IHDR') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (ext === '.gif') return [b.readUInt16LE(6), b.readUInt16LE(8)];
  if (ext === '.webp' && b.toString('ascii', 0, 4) === 'RIFF') {
    const t = b.toString('ascii', 12, 16);
    if (t === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (t === 'VP8L') { const n = b.readUInt32LE(21); return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1]; }
    if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (ext === '.avif') { const i = b.indexOf('ispe'); if (i > 0) return [b.readUInt32BE(i + 8), b.readUInt32BE(i + 12)]; }
  if (ext === '.svg') {
    const s = b.toString('utf8', 0, 2000);
    const vb = s.match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
    const w = s.match(/\swidth="([\d.]+)"/), h = s.match(/\sheight="([\d.]+)"/);
    if (w && h) return [+w[1], +h[1]];
    if (vb) return [+vb[1], +vb[2]];
  }
  return null;
}

/* ---------------- validation ---------------- */
function validate(dir) {
  const errors = [], warnings = [];
  const where = (p) => `${dir}${p ? ' › ' + p : ''}`;
  const err = (p, m) => errors.push(`${where(p)}: ${m}`);
  const warn = (p, m) => warnings.push(`${where(p)}: ${m}`);
  const file = path.join(CONTENT, dir, 'project.json');
  let p;
  try { p = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { err('', `project.json을 읽을 수 없습니다 (${e.message})`); return { errors, warnings }; }

  const approved = p.status === 'approved';
  const isL = (v) => v && typeof v === 'object' && typeof v.ko === 'string';
  const checkL = (v, at, required = true) => {
    if (v === undefined || v === null) { if (required) err(at, '필수 문구가 없습니다 ({ "ko": "…" })'); return; }
    if (!isL(v) || !v.ko.trim()) { err(at, '문구는 { "ko": "…", "en": "…", "ja": "…" } 형식이어야 하고 ko가 비어 있으면 안 됩니다'); return; }
    for (const l of ['en', 'ja']) {
      if (!v[l] || !String(v[l]).trim()) (approved ? err : warn)(at, `${l} 번역이 없습니다`);
    }
  };

  /* basics */
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || '')) err('slug', '영문 소문자·숫자·하이픈만 씁니다 (예: "fity", "abc-erp")');
  if (p.slug !== dir) err('slug', `폴더 이름(${dir})과 slug(${p.slug})가 같아야 합니다`);
  if (!p.id || typeof p.id !== 'string') err('id', '고유 ID가 필요합니다');
  if (!STATUS.includes(p.status)) err('status', `${STATUS.join(' | ')} 중 하나여야 합니다`);
  for (const k of ['visible', 'featured', 'includeInPdf']) if (typeof p[k] !== 'boolean') err(k, 'true 또는 false');
  if (typeof p.order !== 'number') err('order', '숫자여야 합니다 (작을수록 앞)');
  for (const k of ['title', 'subtitle', 'summary', 'overview']) checkL(p[k], k);
  if (p.industry !== undefined) checkL(p.industry, 'industry');
  if (!Array.isArray(p.categories) || !p.categories.length) err('categories', '카테고리를 하나 이상 지정하세요');
  else p.categories.forEach((c, i) => { if (!CATEGORIES.includes(c)) err(`categories[${i}]`, `${CATEGORIES.join(' | ')} 중 하나`); });
  if (!Array.isArray(p.platforms) || !p.platforms.length) err('platforms', '플랫폼을 하나 이상 지정하세요');
  else p.platforms.forEach((x, i) => { if (!PLATFORMS.includes(x?.type)) err(`platforms[${i}].type`, `${PLATFORMS.join(' | ')} 중 하나`); if (x?.label) checkL(x.label, `platforms[${i}].label`); });
  if (p.projectState != null && !STATES.includes(p.projectState)) err('projectState', `${STATES.join(' | ')} 중 하나 (모르면 빼 두세요)`);
  if (p.year != null && !(Number.isInteger(p.year) && p.year >= 2000 && p.year <= 2100)) err('year', '연도 숫자 (모르면 빼 두세요)');
  if (!p.theme || !/^#[0-9a-f]{6}$/i.test(p.theme.accent || '') || !/^#[0-9a-f]{6}$/i.test(p.theme.accentInk || '')) err('theme', 'accent, accentInk는 #RRGGBB 색상이어야 합니다');
  if (p.theme && !['light', 'dark'].includes(p.theme.cover)) err('theme.cover', 'light 또는 dark');
  if (p.theme && p.theme.layout !== undefined && !['split', 'stage', 'editorial', 'rail'].includes(p.theme.layout)) err('theme.layout', 'split · stage · editorial · rail 중 하나 (생략하면 split)');
  if (!Array.isArray(p.scope)) err('scope', '수행 범위 배열이 필요합니다');
  else p.scope.forEach((s, i) => {
    if (!SCOPE.includes(s?.key)) err(`scope[${i}]`, `${SCOPE.join(' | ')} 중 하나`);
    if (s?.label) checkL(s.label, `scope[${i}].label`);
    if (s?.pending && approved) err(`scope[${i}]`, '확인되지 않은 수행 범위(pending)는 공개 승인 상태에 둘 수 없습니다');
  });
  if (p.reviewNotes?.length && approved) warn('reviewNotes', '공개 승인 상태인데 검토 메모가 남아 있습니다 (공개 화면에는 나오지 않음)');

  /* images */
  const imgDir = path.join(CONTENT, dir, 'images');
  const images = {}, used = new Set(), waiting = [];
  if (!Array.isArray(p.images)) err('images', '이미지 목록(배열)이 필요합니다');
  for (const [i, im] of (p.images || []).entries()) {
    const at = `images[${i}]${im?.id ? ` (${im.id})` : ''}`;
    if (!im?.id || !/^[a-z0-9-]+$/.test(im.id)) { err(at, 'id는 영문 소문자·숫자·하이픈'); continue; }
    if (images[im.id]) { err(at, '중복된 이미지 id'); continue; }
    if (!KINDS.includes(im.kind)) err(at, `kind는 ${KINDS.join(' | ')} 중 하나`);
    checkL(im.alt, `${at}.alt`);
    if (im.caption) checkL(im.caption, `${at}.caption`);
    const out = { id: im.id, kind: im.kind, alt: im.alt, ...(im.caption ? { caption: im.caption } : {}), src: null, width: 0, height: 0, files: [] };
    /* presentation: { tier: core | support | hidden, external?: true } — optional exposure policy of the screen */
    if (im.presentation !== undefined) {
      const pr = im.presentation;
      if (!pr || !TIERS.includes(pr.tier)) err(`${at}.presentation`, `tier는 ${TIERS.join(' | ')} 중 하나`);
      else {
        out.tier = pr.tier;
        if (pr.external !== undefined) {
          if (typeof pr.external !== 'boolean') err(`${at}.presentation.external`, 'true / false');
          else if (pr.external && pr.tier !== 'core') err(`${at}.presentation.external`, 'External PDF 우선 화면은 core만 지정할 수 있습니다');
          else if (pr.external) out.external = true;
        }
      }
    }
    if (im.file) {
      const abs = path.join(imgDir, im.file);
      if (!EXT.test(im.file)) err(at, '지원 형식: webp, png, jpg, avif, gif, svg');
      else if (!fs.existsSync(abs)) err(at, `파일이 없습니다: content/portfolio/${dir}/images/${im.file}`);
      else {
        const size = imageSize(abs);
        if (!size) err(at, '이미지 크기를 읽을 수 없습니다');
        else { [out.width, out.height] = size; if (Math.max(...size) < 900) warn(at, `해상도가 낮습니다 (${size.join('×')}). 긴 변 1600px 이상 권장`); }
        const mb = fs.statSync(abs).size / 1048576; if (mb > 1.5) warn(at, `파일이 큽니다 (${mb.toFixed(1)}MB). WebP로 줄여 주세요`);
        out.src = `/portfolio/${dir}/${im.file}`; out.files.push(im.file);
      }
      for (const [l, f] of Object.entries(im.fileByLang || {})) {
        if (!LANGS.includes(l)) { err(at, `fileByLang의 언어는 ${LANGS.join(', ')}`); continue; }
        if (!fs.existsSync(path.join(imgDir, f))) err(at, `언어별 파일이 없습니다: ${f}`);
        else { (out.srcByLang ||= {})[l] = `/portfolio/${dir}/${f}`; out.files.push(f); }
      }
    } else {
      if (approved) err(at, '공개 승인된 프로젝트에 이미지 파일이 비어 있습니다 (file)');
      else waiting.push(im.id);
      if (im.placeholder) checkL(im.placeholder, `${at}.placeholder`, false);
      out.placeholder = im.placeholder || im.alt;
    }
    if (!out.width) [out.width, out.height] = [im.width || DEFAULT_SIZE[im.kind]?.[0] || 1600, im.height || DEFAULT_SIZE[im.kind]?.[1] || 1000];
    images[im.id] = out;
  }
  if (waiting.length && !(p.blocks || []).some((b) => b.type === 'userFlow')) warn('images', '화면 이미지 대기 중인데 userFlow 블록이 없습니다. 표지·카드에 빈 화면 틀이 표시됩니다 (userFlow를 추가하면 업무 흐름 패널로 표시)');
  if (waiting.length) warn('images', `화면 이미지 대기 ${waiting.length}건 (표지·카드는 업무 흐름 패널로 표시 · 외부 제출 PDF 미완료): ${waiting.join(', ')}`);
  if (fs.existsSync(imgDir)) {
    const listed = new Set(Object.values(images).flatMap((x) => x.files));
    for (const f of fs.readdirSync(imgDir)) if (EXT.test(f) && !listed.has(f)) warn('images', `목록에 없는 파일 (복사되지 않음): ${f}`);
  }
  /* where a screen is used: cover/thumbnail = hero, textImage/screenShowcase/userFlow = main, featureGrid/imageGallery = support */
  const ref = (id, at, role = 'main') => {
    if (!images[id]) { err(at, `없는 이미지 id: "${id}"`); return; }
    used.add(id);
    const t = images[id].tier;
    if (t === 'hidden') err(at, `숨김(hidden) 이미지 "${id}"는 어디에도 연결할 수 없습니다 (원본·목록은 유지)`);
    else if (t === 'support' && role !== 'support') err(at, `보조(support) 이미지 "${id}"는 보조 블록(featureGrid·imageGallery)에만 둡니다`);
    else if (t === 'core' && role === 'support') warn(at, `핵심(core) 이미지 "${id}"가 보조 블록에만 있습니다`);
  };

  const textOnly = !Object.keys(images).length;
  if (!Array.isArray(p.thumbnail)) err('thumbnail', '목록 카드에 쓸 이미지 id 배열이 필요합니다 (화면이 없으면 [])');
  else if (!p.thumbnail.length && !textOnly) err('thumbnail', '목록 카드에 쓸 이미지 id를 하나 이상 지정하세요');
  else p.thumbnail.forEach((id, i) => ref(id, `thumbnail[${i}]`, 'hero'));
  if (p.stack !== undefined && !(Array.isArray(p.stack) && p.stack.every((x) => typeof x === 'string' && x.trim()))) err('stack', '기술 이름 문자열 배열 (예: ["Django", "React"])');
  if (p.period !== undefined && !(typeof p.period === 'string' && /^\d{4}(\.\d{2})?( – \d{4}(\.\d{2})?)?$/.test(p.period))) err('period', '"2025.01 – 2025.12" 형식');
  if (textOnly) { if (!p.stack?.length) err('stack', '화면 이미지가 없는 프로젝트는 카드·표지에 기술 스택을 보여 줍니다. stack을 채우세요'); else warn('images', '화면 이미지 없이 글과 기술 스택으로만 표시됩니다 (화면을 받으면 추가)'); }

  /* blocks */
  if (!Array.isArray(p.blocks) || !p.blocks.length) err('blocks', '콘텐츠 블록이 없습니다');
  let covers = 0;
  for (const [i, b] of (p.blocks || []).entries()) {
    const at = `blocks[${i}]${b?.type ? ` (${b.type})` : ''}`;
    const spec = BLOCKS[b?.type];
    if (!spec) { err(at, `알 수 없는 블록 종류. 가능: ${Object.keys(BLOCKS).join(', ')}`); continue; }
    if (b.type === 'cover') { covers++; if (i !== 0) warn(at, 'cover는 첫 블록이어야 자연스럽습니다'); }
    for (const k of spec.req) if (b[k] === undefined || (Array.isArray(b[k]) && !b[k].length)) err(at, `"${k}" 항목이 필요합니다`);
    for (const k of spec.L) if (b[k] !== undefined) checkL(b[k], `${at}.${k}`);
    if (spec.layouts && !spec.layouts.includes(b.layout)) err(at, `layout은 ${spec.layouts.join(' | ')} 중 하나`);
    if (b.surface && !SURFACES.includes(b.surface)) err(at, `surface는 ${SURFACES.join(' | ')}`);
    for (const k of spec.imgs || []) (b[k] || []).forEach((id, j) => ref(id, `${at}.${k}[${j}]`, b.type === 'cover' ? 'hero' : b.type === 'imageGallery' ? 'support' : 'main'));
    if (b.section && typeof b.section.label !== 'string') err(`${at}.section`, '{ "index": "03", "label": "CUSTOMER EXPERIENCE" }');
    if (b.type === 'overview') (b.goals || []).forEach((g, j) => { checkL(g.title, `${at}.goals[${j}].title`); checkL(g.body, `${at}.goals[${j}].body`); });
    if (b.type === 'services') (b.columns || []).forEach((c, j) => {
      if (!PLATFORMS.includes(c.platform)) err(`${at}.columns[${j}]`, 'platform 값 확인');
      checkL(c.title, `${at}.columns[${j}].title`); checkL(c.audience, `${at}.columns[${j}].audience`);
      (c.items || []).forEach((x, k) => checkL(x, `${at}.columns[${j}].items[${k}]`));
    });
    if (b.type === 'userFlow') (b.steps || []).forEach((s, j) => { checkL(s.title, `${at}.steps[${j}].title`); if (s.body) checkL(s.body, `${at}.steps[${j}].body`); if (s.image) ref(s.image, `${at}.steps[${j}].image`); });
    if (b.type === 'textImage') (b.bullets || []).forEach((x, j) => checkL(x, `${at}.bullets[${j}]`));
    if (b.type === 'featureGrid') (b.items || []).forEach((x, j) => { checkL(x.title, `${at}.items[${j}].title`); checkL(x.body, `${at}.items[${j}].body`); if (x.image) ref(x.image, `${at}.items[${j}].image`, 'support'); });
    if (b.type === 'results') (b.items || []).forEach((x, j) => {
      checkL(x.label, `${at}.items[${j}].label`);
      if (!x.source || !String(x.source).trim()) err(`${at}.items[${j}]`, '성과 수치에는 출처(source)가 반드시 필요합니다. 확인되지 않은 수치는 넣지 않습니다');
    });
  }
  if (covers !== 1) err('blocks', `cover 블록은 정확히 1개여야 합니다 (현재 ${covers}개)`);
  for (const id of Object.keys(images)) if (!used.has(id) && images[id].tier !== 'hidden') warn(`images (${id})`, '어느 블록에도 쓰이지 않는 이미지');

  /* no links anywhere */
  (function scan(v, at) {
    if (typeof v === 'string') { if (LINK.test(v)) err(at, '포트폴리오 콘텐츠에는 외부 링크·주소를 넣을 수 없습니다'); return; }
    if (Array.isArray(v)) v.forEach((x, i) => scan(x, `${at}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'source') scan(x, at ? `${at}.${k}` : k);
  })(p, '');

  /* no client names anywhere (ids, file names and text included) */
  (function scan(v, at) {
    if (typeof v === 'string') { for (const c of CLIENTS) if (c.re.test(v)) err(at || 'slug', `거래처 이름이 들어 있습니다: "${c.name}" — 거래처는 공개 금지입니다. 업종·성격으로 바꿔 쓰세요`); return; }
    if (Array.isArray(v)) v.forEach((x, i) => scan(x, `${at}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) scan(x, at ? `${at}.${k}` : k);
  })({ ...p, _dir: dir }, '');
  if ('client' in p || 'clientName' in p) err('client', '거래처 항목은 두지 않습니다 (공개 금지)');

  const project = errors.length ? null : { ...p, images: Object.fromEntries(Object.entries(images).map(([k, { files, ...v }]) => [k, v])), _files: Object.values(images).filter((x) => x.tier !== 'hidden').flatMap((x) => x.files) };
  return { errors, warnings, project };
}

function loadAll() {
  if (!fs.existsSync(CONTENT)) return { projects: [], errors: [], warnings: [] };
  const dirs = fs.readdirSync(CONTENT, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name);
  const all = dirs.map(validate);
  const errors = all.flatMap((r) => r.errors), warnings = all.flatMap((r) => r.warnings);
  const projects = all.map((r) => r.project).filter(Boolean);
  const seen = new Map();
  for (const p of projects) { if (seen.has(p.id)) errors.push(`${p.slug}: id "${p.id}"가 ${seen.get(p.id)}와 중복됩니다`); seen.set(p.id, p.slug); }
  return { projects, errors, warnings };
}

const inStage = (p, stage) => stage === 'all' ? true : p.visible && (p.status === 'approved' || (stage === 'review' && p.status === 'review'));

function report({ errors, warnings }) {
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
  for (const e of errors) console.error(`  ✖ ${e}`);
  if (errors.length) { console.error(`\n포트폴리오 콘텐츠 오류 ${errors.length}건 — 고친 뒤 다시 실행하세요.`); process.exit(1); }
}

/* ---------------- commands ---------------- */
const [cmd = 'check', ...rest] = process.argv.slice(2);
const opt = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };

if (cmd === 'check') {
  const r = loadAll(); report(r);
  const byStatus = Object.fromEntries(STATUS.map((s) => [s, r.projects.filter((p) => p.status === s).length]));
  console.log(`포트폴리오 ${r.projects.length}건 검사 통과 · ${STATUS.map((s) => `${s} ${byStatus[s]}`).join(' · ')}`);
} else if (cmd === 'sync') {
  const stage = opt('stage') || process.env.PORTFOLIO_STAGE || 'public';
  if (!['public', 'review', 'all'].includes(stage)) { console.error('stage는 public | review | all'); process.exit(1); }
  const r = loadAll(); report(r);
  const pick = r.projects.filter((p) => inStage(p, stage)).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
  for (const p of pick) for (const f of p._files) {
    const dest = path.join(PUBLIC_DIR, p.slug, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(CONTENT, p.slug, 'images', f), dest);
  }
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  const clean = pick.map(({ _files, ...p }) => (stage === 'public' ? (({ reviewNotes, ...q }) => q)(p) : p));
  fs.writeFileSync(MANIFEST, JSON.stringify({ stage, projects: clean }, null, 1));
  const skipped = r.projects.length - pick.length;
  console.log(`portfolio sync [${stage}] · 포함 ${pick.length}건 (${pick.map((p) => `${p.slug}:${p.status}`).join(', ') || '없음'}) · 제외 ${skipped}건`);
  if (stage === 'all') console.warn('  ⚠ stage "all"은 초안·비공개까지 포함합니다. 로컬 PDF 출력용이며 배포하면 안 됩니다.');
} else if (cmd === 'new') {
  const slug = rest[0];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug || '')) { console.error('사용: node scripts/portfolio.mjs new <slug>  (영문 소문자·숫자·하이픈)'); process.exit(1); }
  const dest = path.join(CONTENT, slug);
  if (fs.existsSync(dest)) { console.error(`이미 있습니다: content/portfolio/${slug}`); process.exit(1); }
  fs.mkdirSync(path.join(dest, 'images'), { recursive: true });
  const tpl = fs.readFileSync(path.join(CONTENT, '_template', 'project.json'), 'utf8').replaceAll('__SLUG__', slug);
  fs.writeFileSync(path.join(dest, 'project.json'), tpl);
  fs.writeFileSync(path.join(dest, 'images', '.gitkeep'), '');
  console.log(`만들었습니다: content/portfolio/${slug}/project.json (status: draft). 사진은 images/ 폴더에 넣으세요.`);
} else {
  console.error('사용: node scripts/portfolio.mjs check | sync [--stage public|review|all] | new <slug>'); process.exit(1);
}
