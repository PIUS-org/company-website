/* ---- PIUS Glass Renderer (WebGL2 SDF raymarch) — adapted from the reference hero ---- */
/*
 * PIUS Glass Renderer
 * ------------------------------------------------------------
 * 외부 라이브러리 없이 WebGL2 하나로 PIUS 심볼을 "유리 오브젝트"로 렌더링합니다.
 *
 * 방식
 *  1) 로고 SVG path(P / I / U / S 4조각)를 Canvas2D로 래스터화
 *  2) 조각별 Signed Distance Field(SDF)를 CPU에서 계산 → RGBA 텍스처 1장(채널 = 조각)
 *  3) 풀스크린 셰이더에서 SDF를 두께 방향으로 extrude + bevel 하여 raymarching
 *  4) 반사(Fresnel) + 굴절(내부 재진입/탈출) + 약한 분산(RGB별 굴절률)으로 유리 질감 표현
 *
 * 3D 모델 파일을 쓰지 않기 때문에 용량이 매우 작고, 해상도에 따라 품질을 자동 조절합니다.
 */
(function () {
  'use strict';

  /* ---------- Euclidean distance transform (Felzenszwalb & Huttenlocher) ---------- */
  function edt1d(f, n, d, v, z) {
    var k = 0, s, q;
    v[0] = 0; z[0] = -1e20; z[1] = 1e20;
    for (q = 1; q < n; q++) {
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
    }
    k = 0;
    for (q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
  }
  function edt2d(grid, w, h) {
    var n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n),
      v = new Int32Array(n), z = new Float64Array(n + 1), x, y;
    for (x = 0; x < w; x++) {
      for (y = 0; y < h; y++) f[y] = grid[y * w + x];
      edt1d(f, h, d, v, z);
      for (y = 0; y < h; y++) grid[y * w + x] = d[y];
    }
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) f[x] = grid[y * w + x];
      edt1d(f, w, d, v, z);
      for (x = 0; x < w; x++) grid[y * w + x] = Math.sqrt(d[x]);
    }
  }

  /* 로고 조각 → SDF 텍스처 데이터. 월드 좌표에서 텍스처는 [-1, 1] 정사각형을 덮는다. */
  function buildSDF(logo, size) {
    var b = logo.bbox, bw = b[2] - b[0], bh = b[3] - b[1];
    var span = Math.max(bw, bh) * 1.22;           // 여백 포함
    var cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    var sc = size / span;
    var cvs = document.createElement('canvas');
    cvs.width = cvs.height = size;
    var ctx = cvs.getContext('2d', { willReadFrequently: true });
    var N = size * size, out = new Float32Array(N * 4), INF = 1e20;
    var keys = ['P', 'I', 'U', 'S'], centers = [], boxes = [];
    keys.forEach(function (key, ci) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.setTransform(sc, 0, 0, sc, size / 2 - cx * sc, size / 2 - cy * sc);
      ctx.fillStyle = '#fff';
      ctx.fill(new Path2D(logo.pieces[key]));
      var px = ctx.getImageData(0, 0, size, size).data;
      var toIn = new Float64Array(N), toOut = new Float64Array(N), sx = 0, sy = 0, cnt = 0,
        x0 = size, y0 = size, x1 = 0, y1 = 0;
      // TinySDF 방식: 안티앨리어싱 커버리지로 서브픽셀 정밀도 확보
      for (var i = 0; i < N; i++) {
        var a = px[i * 4 + 3] / 255;
        if (a >= 0.999) { toIn[i] = 0; toOut[i] = INF; }
        else if (a <= 0.001) { toIn[i] = INF; toOut[i] = 0; }
        else { var da = Math.max(0, 0.5 - a), db = Math.max(0, a - 0.5); toIn[i] = da * da; toOut[i] = db * db; }
        if (a > 0.5) {
          var px_ = i % size, py_ = (i / size) | 0;
          sx += px_; sy += py_; cnt++;
          if (px_ < x0) x0 = px_; if (px_ > x1) x1 = px_; if (py_ < y0) y0 = py_; if (py_ > y1) y1 = py_;
        }
      }
      edt2d(toIn, size, size);
      edt2d(toOut, size, size);
      // 1px 분리형 블러: 거리장의 꺾임(벽면 줄무늬 원인)을 부드럽게
      var sdA = new Float32Array(N), sdB = new Float32Array(N), x, y, i2;
      for (var j = 0; j < N; j++) sdA[j] = toIn[j] - toOut[j];
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) { i2 = y * size + x;
        sdB[i2] = (sdA[i2 - (x > 0 ? 1 : 0)] + 2 * sdA[i2] + sdA[i2 + (x < size - 1 ? 1 : 0)]) * .25; }
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) { i2 = y * size + x;
        sdA[i2] = (sdB[i2 - (y > 0 ? size : 0)] + 2 * sdB[i2] + sdB[i2 + (y < size - 1 ? size : 0)]) * .25; }
      for (j = 0; j < N; j++) out[j * 4 + ci] = sdA[j] / size * 2;   // 픽셀 → 월드 단위
      centers.push([(sx / cnt) / size * 2 - 1, 1 - (sy / cnt) / size * 2]);
      boxes.push({ cx: ((x0 + x1) / 2) / size * 2 - 1, cy: 1 - ((y0 + y1) / 2) / size * 2, w: (x1 - x0) / size * 2, h: (y1 - y0) / size * 2 });
    });
    return { data: out, centers: centers, boxes: boxes };
  }

  /* ---------------------------------- shaders ----------------------------------
   * 로고를 "진짜 큐브"로 재구성:
   *   원본 로고는 등각(평행) 투영으로 그린 큐브 그림이다. 그 투영 행렬(uAX/uAY/uAZ)을 역산해
   *   P·I는 윗면, U는 왼쪽 면, S는 오른쪽 면 위에 얇은 유리판으로 붙인다.
   *   같은 평행 투영으로 렌더하므로 정지 상태에서는 원본 로고와 정확히 일치하고,
   *   회전시켜도 각 글자가 면에 붙어 있어 큐브의 입체가 유지된다.
   * ------------------------------------------------------------------------------ */
  var VS = '#version 300 es\nin vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}';

  var FS = [
    '#version 300 es',
    'precision highp float;',
    'out vec4 outColor;',
    'uniform vec2 uRes; uniform float uTime, uHalf, uScroll;',
    'uniform sampler2D uSDF;',
    'uniform vec2 uL0, uAX, uAY, uAZ;',          // 3D(rest) -> logo 2D
    'uniform vec3 uMi0, uMi1, uDir, uC;',        // logo 2D -> 3D(rest), 시선 방향, 회전 중심
    'uniform mat3 uR, uRInv, uV;',               // 오브젝트 회전, 뷰 기저
    'uniform vec2 uPos; uniform float uScale;',
    'uniform mat3 uPR[4]; uniform vec3 uPO[4]; uniform vec3 uPC[4]; uniform vec3 uN[4]; uniform vec3 uO[4]; uniform float uK[4];',
    'uniform vec3 uBMin, uBMax;',
    'uniform float uThick, uBevel, uDim, uGrid, uSweep;',
    'uniform int uSteps;',
    'uniform vec2 uMouse; uniform float uLens; uniform vec3 uAccent; uniform vec2 uPulse;',

    'float extr(float w, float d2){',
    '  vec2 q = vec2(d2 + uBevel, abs(w) - uThick + uBevel);',
    '  return min(max(q.x, q.y), 0.) + length(max(q, 0.)) - uBevel;',
    '}',
    'vec4 tex4(vec2 q){',
    '  vec2 uv = vec2(q.x * .5 + .5, .5 - q.y * .5);',
    '  vec2 cuv = clamp(uv, 0., 1.);',
    '  return texture(uSDF, cuv) + length(uv - cuv) * 2.;',
    '}',
    'vec2 proj(vec3 p){ return uL0 + uAX * p.x + uAY * p.y + uAZ * p.z; }',
    'float piece(vec3 p, int i){',
    '  vec3 q = uPR[i] * (p - uPO[i] - uPC[i]) + uPC[i];',
    '  float w = dot(q - uO[i], uN[i]);',
    '  vec4 d = tex4(proj(q - uN[i] * w));',
    '  float dd = i == 0 ? d.x : i == 1 ? d.y : i == 2 ? d.z : d.w;',
    '  return extr(w, dd * uK[i]);',
    '}',
    'float map(vec3 p){ return min(min(piece(p, 0), piece(p, 1)), min(piece(p, 2), piece(p, 3))); }',
    'vec3 calcN(vec3 p){',
    '  const vec2 k = vec2(1., -1.); float h = .006;',
    '  return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) +',
    '                   k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h));',
    '}',

    /* 스튜디오 조명 (뷰 공간 방향) */
    'vec3 env(vec3 d){',
    '  vec3 c = vec3(0.);',
    '  float top = smoothstep(.45, .98, d.y);',
    '  c += vec3(.95) * top * top * .9;',
    '  c += vec3(1.) * exp(-pow((d.x - .72) * 5.5, 2.)) * smoothstep(-.5, .35, d.y) * .85;',
    '  c += vec3(.85, .88, .92) * exp(-pow((d.x + .78) * 8., 2.)) * smoothstep(-.3, .6, d.y) * .45;',
    '  c += vec3(.012) * smoothstep(0., 1., d.z);',
    '  vec3 sb = normalize(vec3(-.45, .55, .7));',
    '  c += vec3(.55) * smoothstep(.86, .9, dot(d, sb));',
    '  vec3 L = normalize(vec3(uMouse.x * .9, .35 + uMouse.y * .6, .85));',
    '  float k = max(dot(d, L), 0.);',
    '  c += uAccent * (pow(k, 120.) * 6. + pow(k, 10.) * .16);',
    '  c += vec3(1.) * exp(-pow((d.x + d.y * .45 - uSweep) * 9., 2.)) * 1.6;',
    '  return c;',
    '}',

    /* 배경: 등각 격자의 점(로고와 같은 투영 언어). 커서 주변은 렌즈처럼 부풀고 연결선이 드러남 */
    'vec3 lattice(vec2 s){',
    '  float sp = .082, h = sp * .8660254;',
    '  vec2 dv = s - uMouse; float r2 = dot(dv, dv);',
    '  float lens = exp(-r2 / (2. * .3 * .3)) * uLens;',
    '  vec2 p = s + vec2(0., uScroll) - dv * lens * .22;',
    '  float b = p.y / h, a = p.x / sp - b * .5;',
    '  vec2 f = floor(vec2(a, b)); float best = 9.;',
    '  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {',
    '    vec2 g = f + vec2(float(i), float(j));',
    '    vec2 q = vec2((g.x + g.y * .5) * sp, g.y * h);',
    '    best = min(best, length(p - q));',
    '  }',
    '  float px = uHalf * 2. / uRes.y;',
    '  float rad = .0042 + .006 * lens;',
    '  float dotm = 1. - smoothstep(rad - px * .8, rad + px * .8, best);',
    '  float pr = length(s - uPulse), ph = fract(uTime / 7.);',
    '  float ring = exp(-pow((pr - ph * 3.2) * 5., 2.)) * (1. - ph);',
    '  float e1 = abs(fract(p.y / h + .5) - .5) * h;',
    '  float e2 = abs(fract(dot(p, vec2(.8660254, -.5)) / h + .5) - .5) * h;',
    '  float e3 = abs(fract(dot(p, vec2(.8660254, .5)) / h + .5) - .5) * h;',
    '  float ln = 1. - smoothstep(0., px * 1.1, min(e1, min(e2, e3)));',
    '  vec3 base = mix(vec3(.82, .85, .9), uAccent, lens * .55);',
    '  float vig = smoothstep(2.6, .2, length(s * vec2(.75, 1.)));',
    '  return (base * dotm * (.022 + .2 * lens + .05 * ring) + vec3(.8, .83, .9) * ln * lens * .03) * uGrid * vig;',
    '}',

    /* 유리 너머로 보이는 배경: 점 무늬 대신 부드러운 빛만 (가파른 각도의 줄무늬 방지) */
    'vec3 latticeSoft(vec2 s){',
    '  vec2 dv = s - uMouse; float lens = exp(-dot(dv, dv) / (2. * .3 * .3)) * uLens;',
    '  float pr = length(s - uPulse), ph = fract(uTime / 7.);',
    '  float ring = exp(-pow((pr - ph * 3.2) * 5., 2.)) * (1. - ph);',
    '  vec3 base = mix(vec3(.82, .85, .9), uAccent, lens * .55);',
    '  return base * (.012 + .09 * lens + .03 * ring) * uGrid;',
    '}',
    'vec2 box(vec3 ro, vec3 rd){',
    '  vec3 ird = 1. / rd;',
    '  vec3 t0 = (uBMin - ro) * ird, t1 = (uBMax - ro) * ird;',
    '  vec3 mn = min(t0, t1), mx = max(t0, t1);',
    '  return vec2(max(max(mn.x, mn.y), mn.z), min(min(mx.x, mx.y), mx.z));',
    '}',
    'vec2 toScreen(vec3 pObj){ vec3 r = uR * (pObj - uC) + uC; return uPos + proj(r) * uScale; }',

    'void main(){',
    '  vec2 s = (gl_FragCoord.xy * 2. - uRes) / uRes.y * uHalf;',
    '  vec3 col = vec3(0.); float alpha = 0.;',   /* transparent: only the glass pieces are drawn */
    '  if (uDim > .001) {',
    '    vec2 l = (s - uPos) / uScale - uL0;',
    '    vec3 rr = uMi0 * l.x + uMi1 * l.y - uDir * 6.;',
    '    vec3 ro = uRInv * (rr - uC) + uC, rd = uRInv * uDir;',
    '    vec2 bt = box(ro, rd);',
    '    if (bt.x < bt.y && bt.y > 0.) {',
    '      float t = max(bt.x, 0.); bool hit = false;',
    '      for (int i = 0; i < 140; i++) {',
    '        if (i >= uSteps) break;',
    '        float d = map(ro + rd * t);',
    '        if (d < .0015) { hit = true; break; }',
    '        t += d * .85;',
    '        if (t > bt.y) break;',
    '      }',
    '      if (hit) {',
    '        vec3 p = ro + rd * t;',
    '        vec3 n = calcN(p);',
    '        mat3 VR = uV * uR;',
    '        vec3 nv = VR * n, dv = VR * rd;',
    '        float ci = clamp(dot(-rd, n), 0., 1.);',
    '        float F = .04 + .96 * pow(1. - ci, 5.);',
    '        vec3 refl = env(reflect(dv, nv));',
    '        vec3 rin = refract(rd, n, 1. / 1.5);',
    '        vec3 q = p - n * .004; float ti = 0.;',
    '        for (int j = 0; j < 48; j++) {',
    '          float d = -map(q + rin * ti);',
    '          if (d < .0015) break;',
    '          ti += max(d, .0015);',
    '        }',
    '        vec3 pe = q + rin * ti;',
    '        vec3 ne = -calcN(pe);',
    '        vec2 se = toScreen(pe);',
    '        vec3 inner;',
    '        for (int c = 0; c < 3; c++) {',
    '          float eta = 1.5 + (float(c) - 1.) * .035;',
    '          vec3 o2 = refract(rin, ne, eta);',
    '          if (dot(o2, o2) < .01) o2 = reflect(rin, ne);',
    '          vec3 ov = VR * o2;',
    '          vec3 sc = env(ov) * .9 + latticeSoft(se + ov.xy * .35 * uScale);',
    '          inner[c] = c == 0 ? sc.r : c == 1 ? sc.g : sc.b;',
    '        }',
    '        vec3 absorb = exp(-ti * vec3(1.5, 1.38, 1.25));',
    '        vec3 body = inner * absorb + vec3(.008, .0085, .01) * (1. - absorb.g);',
    '        vec3 g = mix(body, refl, F);',
    '        g += vec3(.9) * pow(1. - ci, 4.) * .22;',
    '        col = g; alpha = uDim;',
    '      }',
    '    }',
    '  }',
    '  if (alpha <= 0.) { outColor = vec4(0.); return; }',
    '  col = 1. - exp(-col * 1.25);',
    '  col = pow(col, vec3(.4545));',
    '  float nz = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);',
    '  col += (nz - .5) / 255.;',
    '  outColor = vec4(max(col, 0.) * alpha, alpha);',
    '}'
  ].join('\n');

  /* ---------------------------------- math ---------------------------------- */
  function rotXYZ(x, y, z) {
    var cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
    // R = Ry * Rx * Rz  (column-major for GLSL)
    var Rx = [1, 0, 0, 0, cx, sx, 0, -sx, cx];
    var Ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];
    var Rz = [cz, sz, 0, -sz, cz, 0, 0, 0, 1];
    return mul(Ry, mul(Rx, Rz));
  }
  function mul(a, b) { // column-major 3x3
    var r = new Array(9);
    for (var c = 0; c < 3; c++) for (var rr = 0; rr < 3; rr++)
      r[c * 3 + rr] = a[rr] * b[c * 3] + a[3 + rr] * b[c * 3 + 1] + a[6 + rr] * b[c * 3 + 2];
    return r;
  }
  function transpose(m) { return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]; }

  /* --------------------------------- renderer --------------------------------- */
  function create(canvas, logo, opts) {
    opts = opts || {};
    var gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    if (!gl) return null;

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return null; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uRes', 'uTime', 'uHalf', 'uScroll', 'uSDF', 'uL0', 'uAX', 'uAY', 'uAZ', 'uMi0', 'uMi1', 'uDir', 'uC', 'uR', 'uRInv', 'uV',
      'uPos', 'uScale', 'uBMin', 'uBMax', 'uThick', 'uBevel', 'uDim', 'uGrid', 'uSweep', 'uSteps', 'uMouse', 'uLens', 'uAccent', 'uPulse'
    ].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    var PU = { PR: [], PO: [], PC: [], N: [], O: [], K: [] };
    for (var i = 0; i < 4; i++) ['PR', 'PO', 'PC', 'N', 'O', 'K'].forEach(function (n) { PU[n].push(gl.getUniformLocation(prog, 'u' + n + '[' + i + ']')); });

    var mobile = opts.mobile, sz = 512;   // 모바일도 동일 해상도: 얇은 유리 벽의 계단 줄무늬 방지
    var sdf = buildSDF(logo, sz);
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, sz, sz, 0, gl.RGBA, gl.FLOAT, sdf.data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.uSDF, 0);

    /* ---- 로고 투영 역산 (원본 SVG 좌표에서 측정한 큐브의 세 축) ---- */
    var b = logo.bbox, span = Math.max(b[2] - b[0], b[3] - b[1]) * 1.22, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, f = 2 / span;
    var L0 = [(195.71 - cx) * f, -(197.28 - cy) * f];       // 윗면 왼쪽 꼭짓점
    var AX = [117.25 * f, 49.77 * f];                         // 윗면 → 뒤쪽 모서리
    var AZ = [110.0 * f, -42.2 * f];                          // 윗면 → 앞쪽 모서리
    var AY = [0, 100 * f];                                    // 수직
    var row0 = [AX[0], AY[0], AZ[0]], row1 = [AX[1], AY[1], AZ[1]];
    var d0 = cross(row0, row1), DIR = norm(d0);
    if (DIR[1] > 0) DIR = [-DIR[0], -DIR[1], -DIR[2]];        // 위에서 내려다보는 방향
    // 의사역행렬 M+ = M^T (M M^T)^-1
    var a11 = dot(row0, row0), a12 = dot(row0, row1), a22 = dot(row1, row1), det = a11 * a22 - a12 * a12;
    var i11 = a22 / det, i12 = -a12 / det, i22 = a11 / det;
    var MI0 = [row0[0] * i11 + row1[0] * i12, row0[1] * i11 + row1[1] * i12, row0[2] * i11 + row1[2] * i12];
    var MI1 = [row0[0] * i12 + row1[0] * i22, row0[1] * i12 + row1[1] * i22, row0[2] * i12 + row1[2] * i22];
    function unproj(l) { return [MI0[0] * l[0] + MI1[0] * l[1], MI0[1] * l[0] + MI1[1] * l[1], MI0[2] * l[0] + MI1[2] * l[1]]; }
    function proj(p) { return [L0[0] + AX[0] * p[0] + AY[0] * p[1] + AZ[0] * p[2], L0[1] + AX[1] * p[0] + AY[1] * p[1] + AZ[1] * p[2]]; }
    // 뷰 기저: vz = 관찰자 방향, vx = 화면 오른쪽
    var vz = [-DIR[0], -DIR[1], -DIR[2]];
    var ux = unproj([1, 0]), vx = norm(sub(ux, scale3(vz, dot(ux, vz)))), vy = cross(vz, vx);
    if (dot(vy, unproj([0, 1])) < 0) { vy = scale3(vy, -1); }
    var V = [vx[0], vy[0], vz[0], vx[1], vy[1], vz[1], vx[2], vy[2], vz[2]]; // rows vx,vy,vz (column-major)

    // 면 정의: P, I = 윗면 / U = 왼쪽 면 / S = 오른쪽 면
    function solve2(c1, c2, r) { var dt = c1[0] * c2[1] - c2[0] * c1[1]; return [(r[0] * c2[1] - c2[0] * r[1]) / dt, (c1[0] * r[1] - r[0] * c1[1]) / dt]; }
    function sigmaMax(c1, c2) { var a = c1[0] * c1[0] + c1[1] * c1[1], bb = c1[0] * c2[0] + c1[1] * c2[1], c = c2[0] * c2[0] + c2[1] * c2[1];
      var tr = a + c, dd = Math.sqrt(Math.max(0, (a - c) * (a - c) + 4 * bb * bb)); return Math.sqrt((tr + dd) / 2); }
    var faces = [
      { n: [0, 1, 0], o: [0, 0, 0], c1: AX, c2: AZ, map: function (u) { return [u[0], 0, u[1]]; }, sh: [0, 0] },
      { n: [0, 1, 0], o: [0, 0, 0], c1: AX, c2: AZ, map: function (u) { return [u[0], 0, u[1]]; }, sh: [0, 0] },
      { n: [-1, 0, 0], o: [0, 0, 0], c1: AZ, c2: AY, map: function (u) { return [0, u[1], u[0]]; }, sh: [0, 0] },
      { n: [0, 0, 1], o: [0, 0, 1], c1: AX, c2: AY, map: function (u) { return [u[0], u[1], 1]; }, sh: AZ }
    ];
    var P3 = [], cc = [0, 0, 0];
    faces.forEach(function (fc, k) {
      var bx = sdf.boxes[k];
      var r = [bx.cx - L0[0] - fc.sh[0], bx.cy - L0[1] - fc.sh[1]];
      var c3 = fc.map(solve2(fc.c1, fc.c2, r));
      var K = 1 / sigmaMax(fc.c1, fc.c2);
      P3.push({ c: c3, n: fc.n, o: fc.o, k: K, w: bx.w, h: bx.h, sx: bx.cx, sy: bx.cy });
      cc = [cc[0] + c3[0] / 4, cc[1] + c3[1] / 4, cc[2] + c3[2] / 4];
      gl.uniform3fv(PU.N[k], fc.n); gl.uniform3fv(PU.O[k], fc.o); gl.uniform1f(PU.K[k], K); gl.uniform3fv(PU.PC[k], c3);
    });
    var CEN = cc;
    gl.uniform2fv(U.uL0, L0); gl.uniform2fv(U.uAX, AX); gl.uniform2fv(U.uAY, AY); gl.uniform2fv(U.uAZ, AZ);
    gl.uniform3fv(U.uMi0, MI0); gl.uniform3fv(U.uMi1, MI1); gl.uniform3fv(U.uDir, DIR); gl.uniform3fv(U.uC, CEN);
    gl.uniformMatrix3fv(U.uV, false, V);
    gl.uniform3fv(U.uAccent, opts.accent || [1.0, 0.71, 0.28]);

    var HALF = 1.2;
    // quality = (기기 픽셀 배율 × 이 값)으로 렌더. 모바일은 최소 1.25배 CSS 픽셀을 보장해 뭉개짐 방지
    var dprRaw = Math.min(window.devicePixelRatio || 1, 2);
    var quality = mobile ? 0.8 : 0.85, qMin = mobile ? Math.min(1, 1.25 / dprRaw) : 0.5, qMax = 1.0;
    if (opts.quality) { quality = qMin = qMax = opts.quality; }
    var dpr = dprRaw;
    var cssW = 1, cssH = 1, frames = 0, acc = 0, last = 0;

    function resize(w, h) {
      cssW = w; cssH = h;
      var q = dpr * quality;
      var budget = mobile ? 1.6e6 : 3.2e6;                    // 픽셀 수 상한 (발열·배터리)
      if (w * h * q * q > budget) q = Math.sqrt(budget / (w * h));
      canvas.width = Math.max(2, Math.round(w * q));
      canvas.height = Math.max(2, Math.round(h * q));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function viewHalf() { return { h: HALF, w: HALF * (cssW / cssH) }; }
    /* 뷰 공간 회전(yaw: 화면 세로축, pitch: 화면 가로축) → 오브젝트 공간 회전 */
    function viewRot(yaw, pitch, roll) {
      var Rv = rotXYZ(pitch, yaw, roll || 0);
      return mul(transpose(V), mul(Rv, V));
    }
    /* 축-각 회전 (조각별) */
    function axisAngle(ax, ang) {
      var l = Math.hypot(ax[0], ax[1], ax[2]) || 1, x = ax[0] / l, y = ax[1] / l, z = ax[2] / l, c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
      return [t * x * x + c, t * x * y + s * z, t * x * z - s * y, t * x * y - s * z, t * y * y + c, t * y * z + s * x, t * x * z + s * y, t * y * z - s * x, t * z * z + c];
    }

    /*
     * st = { x, y, size, yaw, pitch, dim, grid, lens, mouse:[sx,sy](-1..1), sweep, scroll, pieces:[{off:[3], m:[9]}] | null }
     */
    var I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    function render(time, st) {
      var vh = viewHalf(), m = Math.min(vh.w, vh.h);
      var scl = st.size * m / 0.82;
      var pos = [st.x * vh.w - CEN_SCREEN()[0] * scl, st.y * vh.h - CEN_SCREEN()[1] * scl];
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, time / 1000);
      gl.uniform1f(U.uHalf, HALF);
      gl.uniform1f(U.uScroll, st.scroll || 0);
      var R = viewRot(st.yaw, st.pitch, st.roll);
      gl.uniformMatrix3fv(U.uR, false, R);
      gl.uniformMatrix3fv(U.uRInv, false, transpose(R));
      gl.uniform2fv(U.uPos, pos);
      gl.uniform1f(U.uScale, scl);
      gl.uniform1f(U.uThick, st.thick || 0.045);
      gl.uniform1f(U.uBevel, 0.022);
      gl.uniform1f(U.uDim, st.dim);
      gl.uniform1f(U.uGrid, st.grid);
      gl.uniform1f(U.uSweep, st.sweep);
      gl.uniform2f(U.uMouse, st.mouse[0] * vh.w, st.mouse[1] * vh.h);
      gl.uniform1f(U.uLens, st.lens == null ? 1 : st.lens);
      gl.uniform2fv(U.uPulse, [st.x * vh.w, st.y * vh.h]);
      gl.uniform1i(U.uSteps, mobile ? 110 : 120);
      var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      for (var k = 0; k < 4; k++) {
        var pc = st.pieces ? st.pieces[k] : null, o = pc ? pc.off : [0, 0, 0];
        gl.uniform3fv(PU.PO[k], o);
        gl.uniformMatrix3fv(PU.PR[k], false, pc ? transpose(pc.m) : I3);
        var c = P3[k].c, rad = 1.0;
        for (var a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], c[a] + o[a] - rad); mx[a] = Math.max(mx[a], c[a] + o[a] + rad); }
      }
      gl.uniform3fv(U.uBMin, mn); gl.uniform3fv(U.uBMax, mx);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (last) {
        acc += time - last; frames++;
        if (frames >= 12) {
          var avg = acc / frames, nq = quality;
          if (avg > 40 && quality > qMin) nq = Math.max(qMin, quality - 0.15);
          else if (avg > 22 && quality > qMin) nq = Math.max(qMin, quality - 0.08);
          else if (avg < 14 && quality < qMax) nq = Math.min(qMax, quality + 0.04);
          if (nq !== quality) { quality = nq; resize(cssW, cssH); }
          frames = 0; acc = 0;
        }
      }
      last = time;
    }
    var _cs = null;
    function CEN_SCREEN() { return _cs || (_cs = proj(CEN)); }  // 큐브 중심의 로고 좌표 → 화면 위치 기준점

    return {
      render: render, resize: resize, viewHalf: viewHalf,
      pieces: P3, center: CEN, dir: DIR, proj: proj, unproj: unproj, axisAngle: axisAngle, mul: mul,
      viewToObj: function (v) { return [V[0] * v[0] + V[1] * v[1] + V[2] * v[2], V[3] * v[0] + V[4] * v[1] + V[5] * v[2], V[6] * v[0] + V[7] * v[1] + V[8] * v[2]]; },
      logoCenter: function () { return CEN_SCREEN(); },
      resetTiming: function () { last = 0; frames = 0; acc = 0; }
    };
  }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function scale3(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }

  window.PiusGlass = { create: create };
})();
