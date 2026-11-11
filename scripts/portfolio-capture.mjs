#!/usr/bin/env node
// PIUS portfolio — capture real screens from a demo (local HTML file or URL) into a project's images folder.
//
//   npm run portfolio:capture -- --slug abc --name app-home --url ./demo/app/index.html --preset mobile
//   npm run portfolio:capture -- --slug abc --name admin-orders --url http://localhost:8800/admin/ --preset desktop \
//        --fill "input[name=id]" admin --fill "input[type=password]" 1234 --click "로그인" --click "주문 관리"
//
// options
//   --slug <slug>        content/portfolio/<slug>/images/ (created if missing)
//   --name <id>          file name without extension (= image id in project.json)
//   --url <path|url>     a local .html file (served from its folder) or an http(s) URL
//   --preset mobile|desktop|tablet   mobile 390×844 @3x → 1170×2532 · desktop 1440×900 @2x → 2880×1800 · tablet 1024×1366 @2x
//   steps, run in the order given:
//     --click "<text or css>"   click an element (text match first, then CSS selector)
//     --fill  "<css>" "<value>" type into an input
//     --eval  "<js>"            run JavaScript in the page (e.g. open a screen of a demo router)
//     --wait  <ms>              wait
//     --scroll <px>             scroll the page
//     --mask  "<css>"           cover matching elements with a grey block (client logos, company names in images)
//     --replace "<text>" "<new>" replace text on the page before the shot
//   Client names listed in content/portfolio/_clients.txt are always replaced on the page with a neutral
//   word before the shot (거래처 공개 금지). Logos and names inside images are not text: hide them with --mask.
//   --close-dialogs      press Escape and remove role=dialog overlays before the shot (permission pop-ups etc.)
//   --full               full-page screenshot instead of one screen
//
// Output is JPEG (quality 90): small enough for the web and accepted by the portfolio check. No extra dependencies.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const one = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const fail = (m) => { console.error(`✖ ${m}`); process.exit(1); };
const slug = one('slug'), name = one('name'), target = one('url'), preset = one('preset') || 'mobile';
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail('--slug 가 필요합니다 (영문 소문자·숫자·하이픈)');
if (!name || !/^[a-z0-9-]+$/.test(name)) fail('--name 이 필요합니다 (이미지 id, 영문 소문자·숫자·하이픈)');
if (!target) fail('--url 이 필요합니다 (데모 HTML 파일 경로 또는 주소)');
const PRESETS = { mobile: [390, 844, 3], desktop: [1440, 900, 2], tablet: [1024, 1366, 2] };
if (!PRESETS[preset]) fail('--preset 은 mobile | desktop | tablet');

/* steps in argument order */
const steps = [];
for (let i = 0; i < argv.length; i++) {
  const k = argv[i].replace(/^--/, '');
  if (k === 'fill' || k === 'replace') { steps.push([k, argv[i + 1], argv[i + 2]]); i += 2; }
  else if (['click', 'eval', 'wait', 'scroll', 'mask'].includes(k)) steps.push([k, argv[++i]]);
}

let playwright;
try { playwright = await import('playwright'); } catch { fail('playwright 가 없습니다. npm ci 후 `npx playwright install chromium` 을 한 번 실행하세요.'); }

/* local file → tiny static server rooted at its folder (relative images/fonts keep working) */
let server, url = target;
if (!/^https?:\/\//.test(target)) {
  const file = path.resolve(target);
  if (!fs.existsSync(file)) fail(`파일이 없습니다: ${file}`);
  const dir = path.dirname(file);
  server = http.createServer((req, res) => {
    const p = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(dir) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(p).toLowerCase();
    const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json' };
    res.writeHead(200, { 'content-type': T[ext] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}/${path.basename(file)}`;
}

const [w, h, dpr] = PRESETS[preset];
const browser = await playwright.chromium.launch();
const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr })).newPage();
const missing = [];
page.on('response', (r) => { if (r.status() === 404) missing.push(r.url()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
for (const [k, v, v2] of steps) {
  if (k === 'wait') await page.waitForTimeout(+v);
  else if (k === 'scroll') await page.evaluate((y) => scrollBy(0, y), +v);
  else if (k === 'eval') { await page.evaluate(v); await page.waitForTimeout(900); }
  else if (k === 'fill') await page.locator(v).first().fill(v2 ?? '');
  else if (k === 'replace') await page.evaluate(([a, b]) => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) if (n.nodeValue.includes(a)) n.nodeValue = n.nodeValue.split(a).join(b); }, [v, v2 ?? '']);
  else if (k === 'mask') {
    const n = await page.evaluate((sel) => { const els = document.querySelectorAll(sel); els.forEach((e) => { e.style.setProperty('background', '#d9dadd', 'important'); e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('border-radius', '6px'); e.querySelectorAll('*').forEach((c) => c.style.setProperty('visibility', 'hidden', 'important')); if (e.tagName === 'IMG' || e.tagName === 'SVG' || e.tagName === 'svg' || e.tagName === 'CANVAS') e.style.setProperty('filter', 'brightness(0) invert(.86)', 'important'); }); return els.length; }, v);
    if (!n) console.warn(`  ⚠ --mask "${v}": 맞는 요소가 없습니다`);
  }
  else if (k === 'click') {
    const byText = page.getByText(v, { exact: false }).first();
    if (await byText.count()) await byText.click(); else await page.locator(v).first().click();
    await page.waitForTimeout(900);
  }
}
if (argv.includes('--close-dialogs')) {
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelectorAll('[role=dialog],[aria-modal=true]').forEach((d) => d.remove()));
  await page.waitForTimeout(300);
}
/* 거래처 공개 금지: client names from _clients.txt never reach a screenshot as text */
{
  const file = path.join(root, 'content', 'portfolio', '_clients.txt');
  const names = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim()).filter(Boolean) : [];
  const hits = await page.evaluate((list) => {
    let c = 0;
    const res = list.map((n) => new RegExp(/^[\x00-\x7f]+$/.test(n) ? `\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b` : n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) for (const re of res) if (re.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(re, '○○○'); c++; }
    document.querySelectorAll('input,textarea').forEach((el) => { for (const re of res) if (re.test(el.value)) { el.value = el.value.replace(re, '○○○'); c++; } });
    return c;
  }, names);
  if (hits) console.warn(`  ⚠ 화면 글자 속 거래처 이름 ${hits}곳을 ○○○로 가렸습니다. 이미지 속 로고·상호는 --mask로 가리세요`);
}
await page.evaluate(() => document.fonts && document.fonts.ready);
const dir = path.join(root, 'content', 'portfolio', slug, 'images');
fs.mkdirSync(dir, { recursive: true });
const out = path.join(dir, `${name}.jpg`);
await page.screenshot({ path: out, type: 'jpeg', quality: 90, fullPage: argv.includes('--full') });
await browser.close(); server?.close();
console.log(`✔ ${path.relative(root, out)} (${w * dpr}×${argv.includes('--full') ? 'full' : h * dpr}, ${Math.round(fs.statSync(out).size / 1024)}KB)`);
if (missing.length) console.warn(`  ⚠ 불러오지 못한 파일 ${missing.length}개 (화면에 빈 이미지가 있는지 확인): ${missing.slice(0, 3).join(', ')}`);
