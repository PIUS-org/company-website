#!/usr/bin/env node
// PIUS portfolio — PDF / PNG export (local only; nothing here is deployed).
//
//   npm run portfolio:export -- --slug fity --lang ko
//   npm run portfolio:export -- --slug fity --lang all --png
//   npm run portfolio:export -- --all --format 169
//   npm run portfolio:export -- --slug fity --mode external --lang all --png
//   npm run portfolio:export -- --all --mode both --lang all
//
// options
//   --slug <slug> | --all     project(s) to export (projects with includeInPdf: true)
//   --lang ko|en|ja|all       default ko
//   --format a4|169           default a4 (A4 landscape). 169 = 16:9 presentation size
//   --mode full|external|both default full. external = short submission edition (5–7 pages, e.g. outsourcing platforms)
//                             full keeps the old file names; external files end in "-external"
//   --png                     also save every page as PNG (2x)
//   --stage review|all|public which projects may be exported (default review; "all" includes drafts/private)
//   --no-build                reuse the last export build (.export-build)
//   --out <dir>               default exports/
//   --raw                     embed screens as they are (lossless, very large PDFs). By default every opaque screen is
//                             handed to the PDF as a JPEG (quality 86, long side ≤ 2000px) — only inside the PDF;
//                             the original files are never changed
//
// How it works: static build of the print pages (PIUS_EXPORT=1, PORTFOLIO_PRINT=1) → tiny local server →
// Playwright Chromium prints /portfolio/<slug>/print/<lang> to PDF. Then public/portfolio is re-synced
// to the public stage so no unapproved image stays in public/.
// Needs Playwright's Chromium once:  npx playwright install chromium
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const has = (k) => argv.includes(`--${k}`);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };

const stage = opt('stage', 'review');
const langs = (opt('lang', 'ko') === 'all' ? ['ko', 'en', 'ja'] : [opt('lang', 'ko')]);
const format = opt('format', 'a4');
const modeArg = opt('mode', 'full');
const modes = modeArg === 'both' ? ['full', 'external'] : [modeArg];
const outDir = path.resolve(root, opt('out', 'exports'));
const buildDir = path.join(root, '.export-build');
if (!['ko', 'en', 'ja'].includes(langs[0])) fail('--lang 는 ko | en | ja | all');
if (!['a4', '169'].includes(format)) fail('--format 은 a4 | 169');
if (!['full', 'external', 'both'].includes(modeArg)) fail('--mode 는 full | external | both');
if (!has('slug') && !has('all')) fail('--slug <slug> 또는 --all 을 지정하세요');

function fail(m) { console.error(`✖ ${m}`); process.exit(1); }
const run = (cmd, env = {}) => execSync(cmd, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });

let playwright;
try { playwright = await import('playwright'); } catch { fail('playwright 가 없습니다. npm ci 후 `npx playwright install chromium` 을 한 번 실행하세요.'); }

/* 1) data + build */
run(`node scripts/portfolio.mjs sync --stage ${stage}`);
const manifest = JSON.parse(fs.readFileSync(path.join(root, '.portfolio', 'manifest.json'), 'utf8'));
const printable = manifest.projects.filter((p) => p.includeInPdf);
const slugs = has('all') ? printable.map((p) => p.slug) : [opt('slug')];
for (const s of slugs) if (!printable.some((p) => p.slug === s)) {
  run('node scripts/portfolio.mjs sync --stage public');
  fail(`"${s}" 는 출력할 수 없습니다. stage "${stage}"에서 출력 가능한 프로젝트: ${printable.map((p) => p.slug).join(', ') || '없음'} (status·visible·includeInPdf 확인, 필요하면 --stage all)`);
}
try {
  if (!has('no-build') || !fs.existsSync(buildDir)) run('npx next build', { PIUS_EXPORT: '1', PORTFOLIO_PRINT: '1', PORTFOLIO_STAGE: stage });

  /* 2) local static server */
  const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.txt': 'text/plain' };
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const cands = [u, `${u}.html`, path.join(u, 'index.html')].map((c) => path.join(buildDir, c));
    const f = cands.find((c) => c.startsWith(buildDir) && fs.existsSync(c) && fs.statSync(c).isFile());
    if (!f) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  /* 3) print */
  const browser = await playwright.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  /* PDF-only image copies: Chromium stores PNG/WebP screens as lossless bitmaps (a 12-page deck ≈ 16MB) but keeps
     JPEG data as it is. So opaque screens are served to the print page as JPEG (long side ≤ 2000px). Images with
     transparency are left untouched. Originals in content/ and public/ are not modified. */
  let sharp = null;
  if (!has('raw')) { try { sharp = (await import('sharp')).default; } catch { console.warn('  ⚠ sharp 가 없어 이미지를 원본 그대로 넣습니다 (PDF 용량이 커질 수 있음)'); } }
  if (sharp) {
    const cache = new Map();
    await ctx.route(/\/portfolio\/[^/]+\/[^/?]+\.(webp|png|avif)(\?.*)?$/i, async (route) => {
      const u = decodeURIComponent(new URL(route.request().url()).pathname);
      const f = path.join(buildDir, u);
      try {
        if (!cache.has(f)) {
          const img = sharp(fs.readFileSync(f));
          const meta = await img.metadata();
          cache.set(f, meta.hasAlpha ? null : await img.rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toBuffer());
        }
        const buf = cache.get(f);
        if (buf) return route.fulfill({ status: 200, contentType: 'image/jpeg', body: buf });
      } catch { /* fall through to the original */ }
      return route.continue();
    });
  }
  const results = [];
  for (const slug of slugs) for (const lang of langs) for (const mode of modes) {
    const page = await ctx.newPage();
    const proj = manifest.projects.find((p) => p.slug === slug);
    const pending = Object.values(proj.images).filter((i) => !i.src).length;
    await page.goto(`${base}/portfolio/${slug}/print/${lang}?format=${format}&mode=${mode}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('html[data-print-ready="1"]');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    });
    /* layout check: nothing may stick out of its page (cut text / images) */
    const issues = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('#pfDoc > [data-set]').forEach((set) => { if (getComputedStyle(set).display === 'none') set.remove(); });
      document.querySelectorAll('section[data-page]').forEach((pg) => {
        const r = pg.getBoundingClientRect();
        pg.querySelectorAll('h1,h2,h3,p,li,dd,dt,figure').forEach((el) => {
          const e = el.getBoundingClientRect();
          if (e.width && (e.bottom > r.bottom + 1 || e.right > r.right + 1 || e.left < r.left - 1)) {
            out.push(`p.${pg.getAttribute('data-page')} <${el.tagName.toLowerCase()}> ${(el.textContent || '').trim().slice(0, 40)}`);
          }
        });
        const body = pg.querySelector('[class*="pg__body"]');
        if (body && body.scrollHeight > body.clientHeight + 2) out.push(`p.${pg.getAttribute('data-page')} 본문이 페이지 높이를 넘칩니다`);
      });
      return out;
    });
    const n = await page.locator('section[data-page]').count();
    /* which screens ended up in this PDF (by image id, in page order) */
    const shown = await page.evaluate(() => [...document.querySelectorAll('section[data-page]')].map((pg) => [...pg.querySelectorAll('[data-img]')].map((f) => f.getAttribute('data-img'))));
    const dir = path.join(outDir, slug);
    fs.mkdirSync(dir, { recursive: true });
    const suffix = mode === 'external' ? '-external' : '';
    const pdf = path.join(dir, `${slug}-${lang}-${format}${suffix}.pdf`);
    await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
    if (has('png')) {
      const pngDir = path.join(dir, `${slug}-${lang}-${format}${suffix}-pages`);
      fs.rmSync(pngDir, { recursive: true, force: true }); fs.mkdirSync(pngDir, { recursive: true });
      const els = await page.locator('section[data-page]').all();
      for (const [i, el] of els.entries()) await el.screenshot({ path: path.join(pngDir, `${String(i + 1).padStart(2, '0')}.png`) });
    }
    /* an external edition is only "ready to submit" when every screen exists and nothing is cut */
    const ready = mode === 'external' ? (pending === 0 && issues.length === 0) : undefined;
    results.push({ slug, lang, format, mode, pdf: path.relative(root, pdf), pages: n, bytes: fs.statSync(pdf).size, issues, pending, ready, images: shown });
    await page.close();
  }
  await browser.close();
  server.close();

  const kb = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)}MB` : `${Math.round(b / 1024)}KB`);
  for (const r of results) {
    const tag = r.mode === 'external' ? (r.ready ? ' · 외부 제출 준비 완료' : ` · 외부 제출 준비 미완료${r.pending ? ` (화면 이미지 대기 ${r.pending}건)` : ''}`) : '';
    console.log(`✔ ${r.pdf} · ${r.pages}쪽 · ${kb(r.bytes)}${has('png') ? ' · PNG 저장' : ''}${tag}`);
    for (const i of r.issues) console.warn(`  ⚠ 잘림 의심: ${i}`);
  }
  /* machine-readable report of this run (exports/report.json) — kept per run, never deployed */
  fs.mkdirSync(outDir, { recursive: true });
  /* merged with earlier runs: one entry per PDF file, the newest wins */
  const repPath = path.join(outDir, 'report.json');
  let prev = [];
  try { prev = JSON.parse(fs.readFileSync(repPath, 'utf8')).results || []; } catch { /* first run */ }
  const merged = [...prev.filter((x) => !results.some((r) => r.pdf === x.pdf)), ...results].sort((a, b) => a.pdf.localeCompare(b.pdf));
  fs.writeFileSync(repPath, JSON.stringify({ at: new Date().toISOString(), lastRun: { stage, format, modes, count: results.length }, results: merged }, null, 2));
  const bad = results.filter((r) => r.issues.length);
  console.log(`\n결과: ${results.length}개 PDF · 잘림 의심 ${bad.length}건${modes.includes('external') ? ` · 외부 제출 준비 완료 ${results.filter((r) => r.ready).length}/${results.filter((r) => r.mode === 'external').length}` : ''} · 보고서 ${path.relative(root, path.join(outDir, 'report.json'))}`);
} finally {
  /* leave public/portfolio and the manifest in the public stage */
  if (stage !== 'public') run('node scripts/portfolio.mjs sync --stage public');
  /* Next.js writes the intermediate build of a static export into .next even when distDir is set.
     That .next now holds review/unapproved content, so it is removed: run `npm run build` again before `next start`. */
  fs.rmSync(path.join(root, '.next'), { recursive: true, force: true });
}
