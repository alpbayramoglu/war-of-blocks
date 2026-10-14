/* War of Blocks — 6 yaş için sıra tabanlı kartopu oyunu.
   Her şey tek bir canvas'a, sabit 864x400 mantıksal çözünürlükte çiziliyor. */
'use strict';
(() => {

/* ================= Sabitler ================= */
const W = 864, H = 400, B = 16, COLS = 54, ROWS = 25;
const INK = '#1E2233';
const GRAV = 520;          // mermi yerçekimi (px/s²)
const VMAX = 640;          // en güçlü atış hızı
const WIND_ACC = 30;       // rüzgâr kademesi başına yatay ivme
const SIM_DT = 1 / 120;
const PULL_MAX = 150;      // tam güç için parmağın çekilmesi gereken mesafe
const WALK_BUDGET = 90;    // tur başına yürüme mesafesi (px)
const FONT = '"Pixelify Sans", ui-monospace, Menlo, monospace';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

/* ================= Sprite'lar ================= */
const SPR = {
  penguin: { map: [
    "..KKKKKKKK..",
    ".KKKKKKKKKK.",
    ".KWWWKKWWWK.",
    ".KWPWKKWPWK.",
    ".KWWWOOWWWK.",
    ".KKKKOOKKKK.",
    ".SSSSSSSSSS.",
    "KKSSWWWWWKKK",
    "KKKSWWWWWKKK",
    ".KKKWWWWWKK.",
    ".KKWWWWWWKK.",
    "..KKWWWWKK..",
    "..OOO..OOO.."],
    pal: { K: '#2B3147', W: '#F7FAFF', P: '#11131C', O: '#F5A623', S: '#2F7DE1' } },
  cat: { map: [
    "OO........OO",
    "OOO......OOO",
    "ONOOOOOOOONO",
    "OOOODOODOOOO",
    "OOGPOOOOGPOO",
    "OOGPOOOOGPOO",
    "OOOOWNNWOOOO",
    "OOOWWWWWWOOO",
    ".SSSSSSSSSS.",
    ".OOOWWWWOOO.",
    ".ODOWWWWODO.",
    ".OOOWWWWOOO.",
    "..WW....WW.."],
    pal: { O: '#F39A3B', D: '#C96A1E', N: '#F7A1B5', W: '#FFF4E6', G: '#7ED957', P: '#1E2233', S: '#E5483B' } },
  snowball: { map: [
    ".WWWW.",
    "WWWWWL",
    "WWWWWL",
    "WWWWLL",
    "LWWLLL",
    ".LLLL."], pal: { W: '#FFFFFF', L: '#BFD9EE' } },
  balloon: { map: [
    "..BBB..",
    ".BHBBB.",
    "BHBBBBB",
    "BBBBBBB",
    "BBBBBBD",
    ".BBBBD.",
    "..BDD..",
    "...K...",
    "..K.K.."], pal: { B: '#4FB3F0', H: '#D6F1FF', D: '#2E86C9', K: '#1E2233' } },
  paint: { map: [
    "HHMMMMM",
    "HMMMMMN",
    "MMMMMMN",
    "MMMMMMN",
    "MNMMNMN",
    ".N..N.N",
    "....N.."], pal: { M: '#E84BB0', H: '#FF9AD8', N: '#B8338A' } },
  computer: { map: [
    "KKKKKKKK",
    "KGGGGGGK",
    "KGPGGPGK",
    "KGGGGGGK",
    "KGPPPPGK",
    "KKKKKKKK",
    "...KK...",
    ".KKKKKK."], pal: { K: '#3A4256', G: '#7FE0C2', P: '#1E2233' } },
  heart: { map: [
    ".RR.RR.",
    "RHRRRRR",
    "RRRRRRR",
    ".RRRRR.",
    "..RRR..",
    "...R..."], pal: { R: '#E5483B', H: '#FF9C92' } },
  heartEmpty: { map: [
    ".RR.RR.",
    "RRRRRRR",
    "RRRRRRR",
    ".RRRRR.",
    "..RRR..",
    "...R..."], pal: { R: '#D5DEE8' } },
  snowhat: { map: [
    "....WWW.....",
    "..WWWWWWL...",
    ".WWWWWWWWLL."], pal: { W: '#FFFFFF', L: '#D5E6F3' } },
  arrow: { map: [
    "BBBBBBB",
    ".BBBBB.",
    "..BBB..",
    "...B..."], pal: { B: '#FFD23F' } },
  chevron: { map: [
    "XX..",
    ".XX.",
    "..XX",
    ".XX.",
    "XX.."], pal: { X: '#2BB3A3' } },
  home: { map: [
    "....X....",
    "...XXX...",
    "..XXXXX..",
    ".XXXXXXX.",
    "XXXXXXXXX",
    ".XXX.XXX.",
    ".XXX.XXX.",
    ".XXX.XXX."], pal: { X: INK } },
  play: { map: [
    "XX.....",
    "XXXX...",
    "XXXXXX.",
    "XXXXXXX",
    "XXXXXX.",
    "XXXX...",
    "XX....."], pal: { X: INK } },
  retry: { map: [
    "..XXXX.X.",
    ".XX..XXX.",
    "XX...XXX.",
    "XX.......",
    "XX.....XX",
    ".XX...XX.",
    "..XXXXX.."], pal: { X: INK } },
  pause: { map: [
    "XX.XX",
    "XX.XX",
    "XX.XX",
    "XX.XX",
    "XX.XX",
    "XX.XX"], pal: { X: INK } },
  lock: { map: [
    "..XXX..",
    ".X...X.",
    ".X...X.",
    "XXXXXXX",
    "XXX.XXX",
    "XXX.XXX",
    "XXXXXXX"], pal: { X: '#7A869A' } },
  star: { map: [
    "....X....",
    "...XXX...",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..XXXXX..",
    "..XXXXX..",
    ".XXX.XXX.",
    ".XX...XX."], pal: { X: '#FFD23F' } },
  starEmpty: { map: [
    "....X....",
    "...XXX...",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..XXXXX..",
    "..XXXXX..",
    ".XXX.XXX.",
    ".XX...XX."], pal: { X: '#C9D3E0' } },
  question: { map: [
    ".XXXX.",
    "XX..XX",
    "....XX",
    "..XXX.",
    "..XX..",
    "......",
    "..XX.."], pal: { X: '#FFFFFF' } },
};
SPR.penguinHit = { map: SPR.penguin.map.slice(), pal: SPR.penguin.pal };
SPR.penguinHit.map[2] = ".KWWWKKWWWK.";
SPR.penguinHit.map[3] = ".KPPPKKPPPK.";
SPR.catHit = { map: SPR.cat.map.slice(), pal: SPR.cat.pal };
SPR.catHit.map[4] = "OOOOOOOOOOOO";
SPR.catHit.map[5] = "OPPPOOOOPPPO";
for (const k in SPR) { SPR[k].w = SPR[k].map[0].length; SPR[k].h = SPR[k].map.length; }

function drawSprite(ctx, spr, x, y, s, opt = {}) {
  const { flip = false, outline = true, alpha = 1, pal = spr.pal } = opt;
  x = Math.round(x); y = Math.round(y);
  if (alpha !== 1) { ctx.save(); ctx.globalAlpha = alpha; }
  if (outline) {
    const o = Math.max(1, Math.round(s / 3));
    ctx.fillStyle = INK;
    for (let j = 0; j < spr.h; j++) for (let i = 0; i < spr.w; i++) {
      if (spr.map[j][i] === '.') continue;
      const ii = flip ? spr.w - 1 - i : i;
      ctx.fillRect(x + ii * s - o, y + j * s - o, s + 2 * o, s + 2 * o);
    }
  }
  for (let j = 0; j < spr.h; j++) for (let i = 0; i < spr.w; i++) {
    const ch = spr.map[j][i]; if (ch === '.') continue;
    const ii = flip ? spr.w - 1 - i : i;
    ctx.fillStyle = pal[ch]; ctx.fillRect(x + ii * s, y + j * s, s, s);
  }
  if (alpha !== 1) ctx.restore();
}

/* ================= Bloklar ================= */
function hash(a, b, c) {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const TILE = {
  grassTop: ['#6CCB55', '#5DBB4A', '#4FA83F'],
  snowTop: ['#FFFFFF', '#EEF5FB', '#E1ECF5'],
  dirt: ['#9B6B43', '#8A5D39', '#A97A50'],
  stone: ['#8C8F99', '#7D808A', '#9A9DA6', '#6E717B'],
  sand: ['#E9D59A', '#DCC585', '#F1E0AB'],
  water: ['#3E8FD8', '#4A9BE2', '#3584CC'],
  ice: ['#6FB6E3', '#7CC0EA', '#64AAD8'],
};
const BASE_COLOR = { grass: '#5DBB4A', snow: '#F2F7FB', dirt: '#9B6B43', stone: '#8C8F99', sand: '#E9D59A' };
const TYPE_ID = { grass: 1, snow: 2, dirt: 3, stone: 4, sand: 5 };

function drawTile(ctx, type, x, y, b, cx, cy) {
  const n = 4, s = b / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    let pal;
    if (type === 'grass' || type === 'snow') {
      const top = j === 0 || (j === 1 && hash(cx * 4 + i, cy, 7) < 0.45);
      pal = top ? (type === 'grass' ? TILE.grassTop : TILE.snowTop) : TILE.dirt;
    } else pal = TILE[type];
    ctx.fillStyle = pal[Math.floor(hash(cx * 4 + i, cy * 4 + j, TYPE_ID[type]) * pal.length)];
    ctx.fillRect(x + i * s, y + j * s, s, s);
  }
}

const THEMES = {
  grass: { sky: ['#8FD0F5', '#9BD5F6', '#A8DBF8', '#B6E1F9', '#C4E7FA', '#D3EDFB'], water: TILE.water, sun: true },
  snow: { sky: ['#9EC3E6', '#AACBEA', '#B7D4EE', '#C4DCF2', '#D1E5F5', '#DEEDF8'], water: TILE.ice, sun: false, flakes: true },
};

class Terrain {
  constructor(heights, themeKey, water) {
    this.h0 = heights; this.themeKey = themeKey; this.theme = THEMES[themeKey]; this.water = water;
    this.cells = new Uint8Array(COLS * ROWS);
    this.paint = new Uint8Array(COLS * ROWS);
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) this.cells[c * ROWS + r] = r < heights[c] ? 1 : 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = W; this.canvas.height = H;
    this.ctx = this.canvas.getContext('2d');
    this.render();
  }
  solid(c, r) { return c >= 0 && c < COLS && r >= 0 && r < ROWS && this.cells[c * ROWS + r] === 1; }
  solidAt(x, y) { return this.solid(Math.floor(x / B), Math.floor((H - 1 - y) / B)); }
  get waterY() { return H - this.water * B; }
  top(c) { for (let r = ROWS - 1; r >= 0; r--) if (this.solid(c, r)) return r; return -1; }
  surfaceY(c) { return H - (this.top(c) + 1) * B; }
  typeAt(c, r) {
    const d = this.h0[c] - 1 - r;
    if (this.themeKey === 'snow') return d === 0 ? 'snow' : d <= 2 ? 'dirt' : 'stone';
    const low = this.h0[c] <= this.water + 1;
    if (d === 0) return low ? 'sand' : 'grass';
    if (d <= 2) return low ? 'sand' : 'dirt';
    return 'stone';
  }
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      const x = c * B, y = H - (r + 1) * B;
      if (this.solid(c, r)) {
        drawTile(ctx, this.typeAt(c, r), x, y, B, c, r);
        if (this.paint[c * ROWS + r]) {
          ctx.fillStyle = 'rgba(232,75,176,.55)'; ctx.fillRect(x, y, B, B);
          ctx.fillStyle = 'rgba(255,154,216,.7)'; if (hash(c, r, 9) < .5) ctx.fillRect(x + 4, y + 4, 4, 4);
        }
      } else if (r < this.water) {
        const pal = this.theme.water;
        ctx.globalAlpha = .9;
        ctx.fillStyle = pal[Math.floor(hash(c, r, 3) * pal.length)];
        ctx.fillRect(x, y, B, B);
        ctx.globalAlpha = 1;
        if (r === this.water - 1) {
          ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x, y, B, 2);
          if (c % 3 === 0) ctx.fillRect(x + 4, y + 4, 8, 2);
        }
      }
    }
  }
  carve(x, y, rad, paintRad = 0) {
    const pr = Math.max(rad, paintRad);
    const c0 = Math.max(0, Math.floor((x - pr) / B)), c1 = Math.min(COLS - 1, Math.floor((x + pr) / B));
    for (let c = c0; c <= c1; c++) for (let r = 0; r < ROWS; r++) {
      const dx = c * B + B / 2 - x, dy = H - (r + .5) * B - y, d2 = dx * dx + dy * dy;
      if (d2 < rad * rad) this.cells[c * ROWS + r] = 0;
      else if (paintRad && d2 < paintRad * paintRad && this.cells[c * ROWS + r]) this.paint[c * ROWS + r] = 1;
    }
    this.render();
  }
  thumb() {
    const s = 4, cv = document.createElement('canvas');
    cv.width = COLS * s; cv.height = ROWS * s;
    const ctx = cv.getContext('2d');
    drawSky(ctx, cv.width, cv.height, this.theme.sky);
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      const x = c * s, y = (ROWS - 1 - r) * s;
      if (this.solid(c, r)) { ctx.fillStyle = BASE_COLOR[this.typeAt(c, r)]; ctx.fillRect(x, y, s, s); }
      else if (r < this.water) { ctx.fillStyle = this.theme.water[0]; ctx.fillRect(x, y, s, s); }
    }
    return cv;
  }
}

function makeHeights(fn) {
  const a = [];
  for (let c = 0; c < COLS; c++) a.push(clamp(Math.round(fn(c)), 2, ROWS - 7));
  return a;
}

/* ================= Bölümler ================= */
const LEVELS = [
  { island: 0, theme: 'grass', water: 3, h: c => 8 + 1.5 * Math.sin(c / 7) + Math.sin(c / 3), p: 10, e: 43, wind: 0, items: ['snowball'], err: .35, preview: .9 },
  { island: 0, theme: 'grass', water: 5, h: c => 7 + 4 * Math.cos(2 * Math.PI * c / 54) + 1.2 * Math.sin(c * .9) - (c > 20 && c < 34 ? 1 : 0), p: 8, e: 46, wind: 0, items: ['snowball'], err: .28, preview: .75 },
  { island: 0, theme: 'grass', water: 4, h: c => 6 + 7 * Math.exp(-Math.pow((c - 27) / 6, 2)) + Math.sin(c / 2.5), p: 9, e: 45, wind: 1, items: ['snowball', 'balloon'], err: .22, preview: .6 },
  { island: 1, theme: 'snow', water: 4, h: c => 8 + 3 * Math.sin(c / 5 + 1) + 1.5 * Math.sin(c / 2.1), p: 7, e: 47, wind: 1, items: ['snowball', 'balloon'], err: .18, preview: .5 },
  { island: 1, theme: 'snow', water: 4, h: c => 7 + 2 * Math.sin(c / 4) + (c >= 22 && c <= 32 ? 7 : 0), p: 10, e: 44, wind: 2, items: ['snowball', 'balloon', 'paint'], err: .14, preview: .45 },
  { island: 1, theme: 'snow', water: 5, h: c => 5 + 6 * Math.max(0, Math.cos(2 * Math.PI * c / 27)) + 1.5 * Math.sin(c / 2), p: 4, e: 50, wind: 3, items: ['snowball', 'balloon', 'paint'], err: .11, preview: .4 },
];
const ISLANDS = [{ name: 'ÇİMEN ADASI', color: '#5DBB4A' }, { name: 'KAR ADASI', color: '#7CC4EA' }];
const ALL_ITEMS = ['snowball', 'balloon', 'paint'];

function mapDef(key) {
  if (key === 'grass') return Object.assign({}, LEVELS[1], { wind: 1, preview: .6 });
  if (key === 'snow') return Object.assign({}, LEVELS[3], { wind: 2, preview: .5 });
  // sürpriz: her seferinde yeni bir ada
  const th = Math.random() < .5 ? 'grass' : 'snow';
  const a = rand(1, 4), f = rand(3, 7), ph = rand(0, 6);
  const mid = Math.random() < .5 ? rand(4, 8) : -rand(0, 3);
  return {
    theme: th, water: 3 + Math.floor(rand(0, 3)), wind: 2, preview: .5,
    h: c => 7 + a * Math.sin(c / f + ph) + 1.2 * Math.sin(c / 2.3 + ph * 2) + mid * Math.exp(-Math.pow((c - 27) / 6, 2)),
    p: 6 + Math.floor(rand(0, 6)), e: 42 + Math.floor(rand(0, 6)),
  };
}

const ITEMS = {
  snowball: { spr: 'snowball', r: 26, wind: .6, word: 'POF!', sound: 'pof', colors: ['#FFFFFF', '#E6F0F8', '#BFD9EE', '#9B6B43'] },
  balloon: { spr: 'balloon', r: 40, wind: 1.3, word: 'ŞLAP!', sound: 'splash', colors: ['#4FB3F0', '#D6F1FF', '#2E86C9', '#FFFFFF'] },
  paint: { spr: 'paint', r: 30, wind: .9, word: 'ŞAP!', sound: 'splat', colors: ['#E84BB0', '#FF9AD8', '#B8338A'], bounce: true, paintR: 54 },
};

/* ================= Kayıt ================= */
const Store = {
  key: 'war-of-blocks.v1',
  stars: LEVELS.map(() => 0),
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(this.key) || 'null');
      if (d && Array.isArray(d.stars)) this.stars = LEVELS.map((_, i) => clamp(d.stars[i] | 0, 0, 3));
    } catch (e) {}
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify({ stars: this.stars })); } catch (e) {} },
  unlocked(i) { return i === 0 || this.stars[i - 1] > 0; },
};
Store.load();

/* ================= Ses ================= */
const Sound = {
  ctx: null,
  unlock() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) {}
  },
  noise(dur, { type = 'lowpass', freq = 900, freqEnd = 0, gain = .5, q = 1 } = {}) {
    const a = this.ctx; if (!a) return;
    const len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(freq, a.currentTime);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, a.currentTime + dur);
    const g = a.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(a.destination); src.start();
  },
  tone(freq, dur, { type = 'square', gain = .12, to = 0, delay = 0 } = {}) {
    const a = this.ctx; if (!a) return;
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .05);
  },
  play(name) {
    try {
      switch (name) {
        case 'pof': this.noise(.3, { freq: 900, freqEnd: 200, gain: .7 }); this.tone(120, .2, { type: 'sine', gain: .3, to: 50 }); break;
        case 'splat': this.noise(.35, { type: 'bandpass', freq: 1800, freqEnd: 300, gain: .9, q: 2 }); break;
        case 'splash': this.noise(.5, { type: 'bandpass', freq: 2500, freqEnd: 400, gain: .7, q: 1.5 }); break;
        case 'throw': this.noise(.18, { type: 'highpass', freq: 800, freqEnd: 3000, gain: .25 }); break;
        case 'hit': this.tone(600, .25, { to: 180, gain: .12 }); break;
        case 'click': this.tone(880, .06, { gain: .07 }); break;
        case 'turn': this.tone(660, .08, { gain: .07 }); this.tone(990, .1, { gain: .07, delay: .09 }); break;
        case 'bounce': this.tone(300, .12, { type: 'sine', to: 600, gain: .18 }); break;
        case 'win': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .2, { gain: .1, delay: i * .12 })); break;
        case 'lose': [392, 330, 262].forEach((f, i) => this.tone(f, .25, { type: 'triangle', gain: .14, delay: i * .18 })); break;
      }
    } catch (e) {}
  },
};

/* ================= Canvas ve ölçek ================= */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let K = 1;
function resize() {
  const wrap = document.getElementById('wrap');
  const cs = getComputedStyle(wrap);
  const cw = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const chh = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const s = Math.max(.1, Math.min(cw / W, chh / H));
  canvas.style.width = Math.floor(W * s) + 'px';
  canvas.style.height = Math.floor(H * s) + 'px';
  const dpr = window.devicePixelRatio || 1;
  K = clamp(Math.round(s * dpr), 1, 4);
  canvas.width = W * K; canvas.height = H * K;
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();

/* ================= Çizim yardımcıları ================= */
function drawSky(c, w, h, bands) {
  const bh = Math.ceil(h / bands.length);
  bands.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * bh, w, bh); });
}
const CLOUD = ["..XXX.....", ".XXXXXX...", "XXXXXXXXX.", ".LLLLLLLLL"];
function drawCloud(x, y, s) {
  for (let j = 0; j < CLOUD.length; j++) for (let i = 0; i < CLOUD[j].length; i++) {
    const ch = CLOUD[j][i]; if (ch === '.') continue;
    ctx.fillStyle = ch === 'L' ? '#E3F1FA' : '#FFFFFF';
    ctx.fillRect(Math.round(x + i * s), y + j * s, s, s);
  }
}
function drawClouds(time) {
  [[60, 92, 6], [330, 118, 5], [520, 82, 4], [760, 130, 6]].forEach(([x0, y, s], i) => {
    const span = W + 160, x = ((x0 + time * 10 * (1 + i * .25)) % span + span) % span - 100;
    drawCloud(x, y, s);
  });
}
function drawSun(x, y) {
  ctx.fillStyle = '#FFE680'; ctx.fillRect(x - 6, y - 6, 60, 60);
  ctx.fillStyle = '#FFD23F'; ctx.fillRect(x, y, 48, 48);
  ctx.fillStyle = '#FFF2B0'; ctx.fillRect(x + 6, y + 6, 14, 14);
}
function panel(x, y, w, h, frame, fill = '#FFFFFF') {
  ctx.fillStyle = INK; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = frame; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  ctx.fillStyle = fill; ctx.fillRect(x + 7, y + 7, w - 14, h - 14);
}
function text(str, x, y, size, opt = {}) {
  const { align = 'center', color = '#FFFFFF', stroke = INK, lw = Math.max(3, size / 6), base = 'middle' } = opt;
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textAlign = align; ctx.textBaseline = base; ctx.lineJoin = 'round';
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
}
function centerSprite(spr, cx, cy, s, opt) { drawSprite(ctx, SPR[spr], cx - SPR[spr].w * s / 2, cy - SPR[spr].h * s / 2, s, opt); }

/* ================= Düğmeler ================= */
let buttons = [];
function button(x, y, w, h, onTap, drawInside, opt = {}) {
  const b = { x, y, w, h, onTap, onDown: opt.onDown, onUp: opt.onUp, disabled: opt.disabled };
  buttons.push(b);
  const down = pointer.btn && pointer.btn.x === x && pointer.btn.y === y;
  const o = down ? 3 : 0;
  ctx.fillStyle = 'rgba(30,34,51,.9)'; ctx.fillRect(x + 4, y + 4, w, h);
  ctx.save(); ctx.globalAlpha = opt.disabled ? .5 : 1;
  panel(x + o, y + o, w, h, opt.frame || '#FFD23F', opt.fill || '#FFFFFF');
  if (drawInside) drawInside(x + o, y + o, w, h);
  ctx.restore();
}

/* ================= Parçacıklar ================= */
let parts = [], words = [], shake = 0;
function spawn(x, y, n, colors, speed = 1) {
  for (let i = 0; i < n; i++) parts.push({
    x, y, vx: rand(-.5, .5) * 300 * speed, vy: -rand(60, 320) * speed,
    s: 4 + Math.floor(rand(0, 3)) * 2, c: colors[i % colors.length], life: rand(.9, 1.4), g: 620,
  });
}
function confetti(n) {
  const cols = ['#FFD23F', '#E5483B', '#2F7DE1', '#5DBB4A', '#E84BB0', '#FFFFFF'];
  for (let i = 0; i < n; i++) parts.push({ x: rand(0, W), y: rand(-40, -5), vx: rand(-40, 40), vy: rand(40, 140), s: 6, c: cols[i % cols.length], life: 4, g: 60 });
}
function updateParts(dt) {
  for (const p of parts) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  parts = parts.filter(p => p.life > 0 && p.y < H + 30);
  for (const w of words) w.t += dt;
  words = words.filter(w => w.t < 1);
}
function drawParts() {
  for (const p of parts) {
    ctx.fillStyle = INK; ctx.fillRect(p.x - 1, p.y - 1, p.s + 2, p.s + 2);
    ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s);
  }
  for (const w of words) {
    const e = 1 - Math.pow(1 - w.t, 3);
    ctx.save(); ctx.globalAlpha = 1 - w.t * w.t;
    text(w.word, w.x, w.y - 26 - 22 * e, Math.round(w.size * (.7 + .5 * e)), { color: w.color || '#FFFFFF', lw: 6 });
    ctx.restore();
  }
}

/* ================= Oyun durumu ================= */
let screen = 'title';
let play = null;
let flakes = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, H), v: rand(18, 40), s: Math.random() < .3 ? 4 : 2 }));
let time = 0;

function makeTeam(id, cpu, items) {
  return {
    id, cpu, items: items.slice(), hearts: 3,
    spr: id === 0 ? 'penguin' : 'cat', hitSpr: id === 0 ? 'penguinHit' : 'catHit',
    color: id === 0 ? '#2F7DE1' : '#E5483B',
    x: 0, y: 0, vx: 0, vy: 0, grounded: true, spawnCol: 0, walkAnim: 0,
    ammo: { snowball: Infinity, balloon: 1, paint: 1 }, item: 'snowball', hitShow: false,
  };
}
function spawnCol(T, c0) {
  for (let d = 0; d < COLS; d++) for (const s of [c0 + d, c0 - d]) {
    if (s >= 1 && s <= COLS - 2 && T.top(s) >= T.water) return s;
  }
  return c0;
}
function place(T, ch, c0) {
  const c = spawnCol(T, c0);
  ch.spawnCol = c; ch.x = c * B + B / 2; ch.y = T.surfaceY(c); ch.grounded = true; ch.vx = ch.vy = 0;
}

function startMatch(mode, li, mapKey, def) {
  def = def || (mode === '1p' ? LEVELS[li] : mapDef(mapKey));
  const T = new Terrain(makeHeights(def.h), def.theme, def.water);
  const items = mode === '1p' ? def.items : ALL_ITEMS;
  const teams = [makeTeam(0, false, items), makeTeam(1, mode === '1p', items)];
  place(T, teams[0], def.p); place(T, teams[1], def.e);
  parts = []; words = []; shake = 0;
  play = {
    mode, li, mapKey, def, T, teams, turn: 0, phase: 'banner', t: 0,
    proj: null, wind: 0, aim: null, walkDir: 0, walkLeft: WALK_BUDGET,
    ai: null, cpuShots: 0, winner: null, overT: 0, paused: false, acc: 0,
  };
  screen = 'play';
  beginTurn();
}
const cur = () => play.teams[play.turn];
const foe = () => play.teams[1 - play.turn];

function beginTurn() {
  const ch = cur();
  ch.hitShow = false;
  play.phase = 'banner'; play.t = 0; play.aim = null; play.ai = null; play.walkDir = 0; play.walkLeft = WALK_BUDGET;
  const wm = play.def.wind || 0;
  play.wind = wm ? Math.round(rand(-wm, wm)) : 0;
  if (!(ch.ammo[ch.item] > 0) || !ch.items.includes(ch.item)) ch.item = 'snowball';
  Sound.play('turn');
}

/* ----- Karakter fiziği ----- */
function onGround(T, ch) { return T.solidAt(ch.x - 8, ch.y) || T.solidAt(ch.x, ch.y) || T.solidAt(ch.x + 8, ch.y); }
function charPhysics(ch, dt) {
  const T = play.T;
  if (ch.grounded && !onGround(T, ch)) { ch.grounded = false; ch.vy = Math.max(ch.vy, 0); }
  if (ch.grounded) return;
  ch.vy = Math.min(ch.vy + 900 * dt, 700);
  ch.x = clamp(ch.x + ch.vx * dt, 14, W - 14);
  let dy = ch.vy * dt;
  if (dy <= 0) ch.y += dy;
  else while (dy > 0) {
    const s = Math.min(4, dy); ch.y += s; dy -= s;
    if (onGround(T, ch)) {
      const r = Math.floor((H - 1 - ch.y) / B);
      ch.y = H - (r + 1) * B; ch.vy = 0; ch.vx = 0; ch.grounded = true; break;
    }
  }
  if (ch.y > T.waterY + 14 || ch.y > H + 30) splash(ch);
}
function splash(ch) {
  const T = play.T;
  Sound.play('splash');
  spawn(ch.x, T.waterY, 18, ['#4FB3F0', '#D6F1FF', '#FFFFFF']);
  words.push({ x: ch.x, y: T.waterY, word: 'ŞAPUR!', size: 26, t: 0 });
  if (ch.hearts > 0) { ch.hearts--; ch.hitShow = true; }
  const c = spawnCol(T, ch.spawnCol);
  ch.x = c * B + B / 2; ch.y = T.surfaceY(c) - 90; ch.vx = 0; ch.vy = 0; ch.grounded = false;
}
function walk(ch, dir, dt) {
  const T = play.T;
  if (!ch.grounded || play.walkLeft <= 0) return;
  const sp = 70 * dt;
  const nx = clamp(ch.x + dir * sp, 14, W - 14);
  const fx = nx + dir * 9;
  if (T.solidAt(fx, ch.y - 2)) {
    const r = Math.floor((H - 1 - (ch.y - 2)) / B), c = Math.floor(fx / B);
    if (T.solid(c, r + 1) || T.solid(c, r + 2) || T.solid(c, r + 3)) return; // duvar çok yüksek
    ch.y = H - (r + 1) * B;
  }
  ch.x = nx; play.walkLeft -= sp; ch.walkAnim += dt;
}

/* ----- Mermi ----- */
function stepProj(p, dt) {
  const T = play.T, it = ITEMS[p.item];
  p.vx += play.wind * WIND_ACC * it.wind * dt;
  p.vy += GRAV * dt;
  p.x += p.vx * dt; p.y += p.vy * dt; p.t += dt;
  if (p.x < -60 || p.x > W + 60 || p.y > H + 40 || p.t > 9) return { type: 'out' };
  for (const ch of play.teams) {
    if (ch.id === p.owner && p.t < .4) continue;
    if (Math.abs(p.x - ch.x) < 15 && p.y > ch.y - 40 && p.y < ch.y) return { type: 'char', id: ch.id };
  }
  if (T.solidAt(p.x, p.y)) return { type: 'terrain' };
  if (p.y >= T.waterY) return { type: 'water' };
  return null;
}
function simulate(x, y, vx, vy, item, owner, maxT, path) {
  const p = { x, y, vx, vy, item, owner, t: 0 };
  let n = 0;
  while (p.t < maxT) {
    const hit = stepProj(p, SIM_DT);
    if (path && (n++ % 6 === 0)) path.push({ x: p.x, y: p.y });
    if (hit) return Object.assign(hit, { x: p.x, y: p.y });
  }
  return null;
}
function fire(vx, vy) {
  const ch = cur();
  play.proj = { x: ch.x, y: ch.y - 24, vx, vy, item: ch.item, owner: ch.id, t: 0, trail: [], bounced: false };
  if (ch.ammo[ch.item] !== Infinity) ch.ammo[ch.item]--;
  if (ch.cpu) play.cpuShots++;
  play.phase = 'fly'; play.aim = null; play.acc = 0;
  Sound.play('throw');
}
function explode(x, y, kind) {
  const p = play.proj, it = ITEMS[p.item], T = play.T;
  play.proj = null;
  play.phase = 'settle'; play.t = 0;
  if (kind === 'out') return;
  if (kind === 'water') {
    Sound.play('splash');
    spawn(x, T.waterY, 16, ['#4FB3F0', '#D6F1FF', '#FFFFFF']);
    words.push({ x, y: T.waterY, word: 'ŞAPUR!', size: 26, t: 0 });
  } else {
    T.carve(x, y, it.r, it.paintR || 0);
    Sound.play(it.sound);
    spawn(x, y, 26, it.colors);
    words.push({ x, y, word: it.word, size: 34, t: 0 });
    shake = 6;
  }
  for (const ch of play.teams) {
    if (ch.id === p.owner) continue; // kendine zarar yok
    const dx = ch.x - x, dy = (ch.y - 18) - y;
    if (Math.hypot(dx, dy) < it.r + 16) {
      if (ch.hearts > 0) { ch.hearts--; ch.hitShow = true; Sound.play('hit'); }
      ch.vx = Math.sign(dx || 1) * 90; ch.vy = -220; ch.grounded = false;
    }
  }
}

/* ----- Bilgisayar rakip ----- */
function aiPlan() {
  const me = cur(), them = foe();
  let item = 'snowball';
  if (me.items.includes('balloon') && me.ammo.balloon > 0 && Math.random() < .35) item = 'balloon';
  else if (me.items.includes('paint') && me.ammo.paint > 0 && Math.random() < .3) item = 'paint';
  const sx = me.x, sy = me.y - 24, dir = Math.sign(them.x - me.x) || -1;
  let best = null;
  for (let a = 15; a <= 80; a += 2.5) for (let pw = .3; pw <= 1.0001; pw += .025) {
    const ang = a * Math.PI / 180;
    const res = simulate(sx, sy, Math.cos(ang) * pw * VMAX * dir, -Math.sin(ang) * pw * VMAX, item, me.id, 6);
    if (!res) continue;
    let d = Math.hypot(res.x - them.x, res.y - (them.y - 18));
    if (res.type === 'char' && res.id === them.id) d -= 30;
    if (!best || d < best.d) best = { d, ang, pw };
  }
  if (!best) best = { ang: Math.PI / 4, pw: .7 };
  // Çocuk kolay kazansın diye hata payı: ilk atışlarda ve çocuğun tek kalbi kaldığında daha çok ıskalar.
  let e = play.def.err;
  if (play.cpuShots === 0) e *= 1.6;
  if (them.hearts === 1) e *= 1.4;
  if (them.hearts < me.hearts) e *= 1.25;
  const ang = best.ang + gauss() * e * .5;
  const pw = clamp(best.pw * (1 + gauss() * e), .2, 1);
  return { item, vx: Math.cos(ang) * pw * VMAX * dir, vy: -Math.sin(ang) * pw * VMAX, pw };
}

/* ----- Oyun döngüsü ----- */
function updatePlay(dt) {
  const T = play.T;
  play.t += dt;
  for (const ch of play.teams) charPhysics(ch, dt);
  const ch = cur();

  if (play.phase === 'banner') {
    if (play.t > 1.0) { play.phase = 'aim'; play.t = 0; }
  } else if (play.phase === 'aim') {
    if (ch.cpu) {
      if (!play.ai && play.t > .5) { play.ai = aiPlan(); ch.item = play.ai.item; }
      if (play.ai && play.t > 1.6) fire(play.ai.vx, play.ai.vy);
    } else if (play.walkDir) walk(ch, play.walkDir, dt);
  } else if (play.phase === 'fly') {
    const p = play.proj;
    play.acc += dt;
    while (play.acc >= SIM_DT && play.proj) {
      play.acc -= SIM_DT;
      const px = p.x, py = p.y;
      const hit = stepProj(p, SIM_DT);
      if (hit) {
        if (hit.type === 'terrain' && ITEMS[p.item].bounce && !p.bounced) {
          p.x = px; p.y = py; p.vy = -Math.abs(p.vy) * .5; p.vx *= .65; p.bounced = true;
          Sound.play('bounce');
        } else explode(p.x, p.y, hit.type);
      }
    }
    if (play.proj) { p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 6) p.trail.shift(); }
  } else if (play.phase === 'settle') {
    if (play.t > .9 && play.teams.every(c => c.grounded)) {
      if (!checkOver()) { play.turn = 1 - play.turn; beginTurn(); }
    }
  } else if (play.phase === 'over') {
    play.overT += dt;
    const happy = play.mode === '2p' || play.winner === 0;
    if (happy && play.overT < 3 && Math.random() < .5) confetti(2);
  }
  if (play.phase === 'aim' || play.phase === 'banner') checkOver();
}
function checkOver() {
  const dead = play.teams.find(c => c.hearts <= 0);
  if (!dead || !play.teams.every(c => c.grounded)) return false;
  play.phase = 'over'; play.overT = 0; play.winner = 1 - dead.id; play.walkDir = 0; play.aim = null;
  if (play.mode === '1p') {
    if (play.winner === 0) {
      const st = clamp(play.teams[0].hearts, 1, 3);
      if (st > Store.stars[play.li]) { Store.stars[play.li] = st; Store.save(); }
      Sound.play('win');
    } else Sound.play('lose');
  } else Sound.play('win');
  return true;
}

/* ================= Ekranlar ================= */
let titleT = null, stripCanvas = null, thumbs = null;
function titleTerrain() {
  if (!titleT) titleT = new Terrain(makeHeights(LEVELS[1].h), 'grass', LEVELS[1].water);
  return titleT;
}
function drawWorldBg(theme, T) {
  drawSky(ctx, W, H, theme.sky);
  if (theme.sun) drawSun(700, 92);
  drawClouds(time);
  if (T) ctx.drawImage(T.canvas, 0, 0);
}
function drawFlakes(dt) {
  for (const f of flakes) {
    f.y += f.v * dt; f.x += Math.sin(time + f.v) * 10 * dt + (play ? play.wind * 6 * dt : 0);
    if (f.y > H) { f.y = -4; f.x = rand(0, W); }
    if (f.x < 0) f.x += W; if (f.x > W) f.x -= W;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(f.x, f.y, f.s, f.s);
  }
}
function drawChar(ch, isTurn) {
  const bob = ch.walkAnim > 0 && play && play.walkDir && isTurn ? Math.abs(Math.sin(ch.walkAnim * 14)) * 2 : 0;
  const x = ch.x - 18, y = ch.y - 39 - bob;
  drawSprite(ctx, SPR[ch.hitShow ? ch.hitSpr : ch.spr], x, y, 3);
  if (ch.hitShow) drawSprite(ctx, SPR.snowhat, x, y - 6, 3);
}

/* ----- Açılış ----- */
function drawTitle() {
  const T = titleTerrain();
  drawWorldBg(THEMES.grass, T);
  const pc = spawnCol(T, 8), cc = spawnCol(T, 46);
  const b1 = Math.abs(Math.sin(time * 3)) * 4, b2 = Math.abs(Math.sin(time * 3 + 1.4)) * 4;
  drawSprite(ctx, SPR.penguin, pc * B + B / 2 - 18, T.surfaceY(pc) - 39 - b1, 3);
  drawSprite(ctx, SPR.cat, cc * B + B / 2 - 18, T.surfaceY(cc) - 39 - b2, 3);

  text('WAR OF BLOCKS', W / 2, 82, 64, { lw: 10 });

  const bw = 230, bh = 136, gap = 40, y = 140;
  button(W / 2 - bw - gap / 2, y, bw, bh, () => { screen = 'levels'; }, (x, yy, w, h) => {
    centerSprite('penguin', x + w / 2 - 40, yy + 52, 4);
    text('×', x + w / 2, yy + 54, 28, { color: INK, stroke: null });
    centerSprite('computer', x + w / 2 + 42, yy + 56, 5);
    text('1 OYUNCU', x + w / 2, yy + h - 28, 26, { color: INK, stroke: null });
  }, { frame: '#2F7DE1', fill: '#E6F2FF' });
  button(W / 2 + gap / 2, y, bw, bh, () => { screen = 'maps'; thumbs = null; }, (x, yy, w, h) => {
    centerSprite('penguin', x + w / 2 - 40, yy + 52, 4);
    text('×', x + w / 2, yy + 54, 28, { color: INK, stroke: null });
    centerSprite('cat', x + w / 2 + 40, yy + 52, 4);
    text('2 OYUNCU', x + w / 2, yy + h - 28, 26, { color: INK, stroke: null });
  }, { frame: '#E5483B', fill: '#FFEDEB' });
}

/* ----- Bölüm haritası ----- */
const NODES = [[110, 236], [220, 176], [330, 240], [534, 236], [644, 176], [754, 240]];
function levelStrip() {
  if (stripCanvas) return stripCanvas;
  stripCanvas = document.createElement('canvas'); stripCanvas.width = W; stripCanvas.height = 5 * B;
  const c = stripCanvas.getContext('2d');
  for (let col = 0; col < COLS; col++) for (let r = 0; r < 5; r++) {
    const snow = col >= COLS / 2;
    const type = r === 0 ? (snow ? 'snow' : 'grass') : r < 3 ? 'dirt' : 'stone';
    drawTile(c, type, col * B, r * B, B, col, r);
  }
  return stripCanvas;
}
function drawLevels() {
  drawWorldBg(THEMES.grass, null);
  ctx.drawImage(levelStrip(), 0, H - 5 * B);
  homeButton(() => { screen = 'title'; });

  ISLANDS.forEach((isl, i) => text(isl.name, i === 0 ? 220 : 644, 100, 30, { lw: 7 }));
  // yol
  for (let i = 0; i < NODES.length - 1; i++) {
    const [x1, y1] = NODES[i], [x2, y2] = NODES[i + 1];
    for (let k = 1; k < 8; k++) {
      const t = k / 8, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      ctx.fillStyle = INK; ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.fillStyle = Store.unlocked(i + 1) ? '#FFD23F' : '#FFFFFF'; ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }
  let next = Store.stars.findIndex(s => s === 0);
  NODES.forEach(([cx, cy], i) => {
    const open = Store.unlocked(i), isl = ISLANDS[LEVELS[i].island], s = 76;
    button(cx - s / 2, cy - s / 2, s, s, open ? () => startMatch('1p', i) : null, (x, y, w, h) => {
      if (open) text(String(i + 1), x + w / 2, y + h / 2 + 2, 38, { color: INK, stroke: null });
      else centerSprite('lock', x + w / 2, y + h / 2, 5, { outline: false });
    }, { frame: open ? isl.color : '#B9C6D6', fill: open ? '#FFFFFF' : '#E3E9F0', disabled: !open });
    if (open) for (let k = 0; k < 3; k++) drawSprite(ctx, SPR[k < Store.stars[i] ? 'star' : 'starEmpty'], cx - 33 + k * 23, cy + s / 2 + 10, 2);
    if (i === next) {
      const bob = Math.abs(Math.sin(time * 4)) * 6;
      drawSprite(ctx, SPR.penguin, cx - 18, cy - s / 2 - 50 - bob, 3);
    }
  });
}
function homeButton(fn) {
  button(14, 14, 56, 56, fn, (x, y, w, h) => centerSprite('home', x + w / 2, y + h / 2, 3, { outline: false }));
}

/* ----- 2 oyuncu harita seçimi ----- */
function drawMaps() {
  drawWorldBg(THEMES.grass, null);
  ctx.drawImage(levelStrip(), 0, H - 5 * B);
  homeButton(() => { screen = 'title'; });
  text('HARİTA SEÇ', W / 2, 52, 36, { lw: 8 });
  if (!thumbs) thumbs = {
    grass: new Terrain(makeHeights(LEVELS[1].h), 'grass', LEVELS[1].water).thumb(),
    snow: new Terrain(makeHeights(LEVELS[3].h), 'snow', LEVELS[3].water).thumb(),
  };
  const cw = 244, chh = 196, gap = 22, x0 = W / 2 - (cw * 3 + gap * 2) / 2, y = 100;
  [['grass', 'ÇİMEN', '#5DBB4A'], ['snow', 'KAR', '#7CC4EA'], ['random', 'SÜRPRİZ', '#E84BB0']].forEach(([key, label, col], i) => {
    button(x0 + i * (cw + gap), y, cw, chh, () => startMatch('2p', null, key), (x, yy, w, h) => {
      const tx = x + 14, ty = yy + 14;
      if (thumbs[key]) ctx.drawImage(thumbs[key], tx, ty);
      else {
        ctx.fillStyle = '#E84BB0'; ctx.fillRect(tx, ty, 216, 100);
        for (let k = 0; k < 18; k++) { ctx.fillStyle = ['#FF9AD8', '#FFD23F', '#7CC4EA', '#5DBB4A'][k % 4]; ctx.fillRect(tx + hash(k, 1, 2) * 200, ty + hash(k, 3, 4) * 84, 16, 16); }
        centerSprite('question', tx + 108, ty + 50, 8);
      }
      ctx.fillStyle = INK; ctx.fillRect(tx, ty + 100, 216, 3);
      text(label, x + w / 2, yy + h - 36, 30, { color: INK, stroke: null });
    }, { frame: col });
  });
}

/* ----- Oyun ekranı ----- */
function drawPlay(dt) {
  const T = play.T, ch = cur();
  ctx.save();
  if (shake > 0) { ctx.translate(Math.round(rand(-shake, shake)), Math.round(rand(-shake, shake))); }
  drawWorldBg(T.theme, T);
  for (const c of play.teams) drawChar(c, c === ch);

  if (play.phase === 'banner' || play.phase === 'aim') {
    const bob = Math.sin(time * 6) * 3;
    drawSprite(ctx, SPR.arrow, ch.x - 10, ch.y - 64 + bob, 3);
  }
  if (play.phase === 'aim') drawAim(ch);
  if (play.proj) drawProj(play.proj);
  drawParts();
  if (T.theme.flakes) drawFlakes(dt);
  ctx.restore();

  drawHud();
  if (play.phase === 'banner') drawBanner();
  if (play.phase === 'over' && play.overT > .9) drawOver();
  if (play.paused) drawPause();
}
function drawAim(ch) {
  const hx = ch.x, hy = ch.y - 24;
  let vx, vy, pull = 0;
  if (ch.cpu) {
    if (!play.ai) { text('...', ch.x, ch.y - 80, 28, { color: '#FFFFFF' }); return; }
    const k = clamp((play.t - .5) / .9, 0, 1);
    vx = play.ai.vx; vy = play.ai.vy; pull = play.ai.pw * k;
  } else {
    if (!play.aim) return;
    const dx = play.aim.x0 - play.aim.x, dy = play.aim.y0 - play.aim.y, len = Math.hypot(dx, dy);
    if (len < 12) return;
    const pw = Math.min(len / PULL_MAX, 1);
    vx = dx / len * pw * VMAX; vy = dy / len * pw * VMAX; pull = pw;
    const path = [];
    simulate(hx, hy, vx, vy, ch.item, ch.id, play.def.preview || .5, path);
    path.forEach((q, i) => {
      if (i === 0) return;
      const r = Math.max(2, 5 - i * .25);
      ctx.fillStyle = INK; ctx.fillRect(q.x - r - 1, q.y - r - 1, r * 2 + 2, r * 2 + 2);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(q.x - r, q.y - r, r * 2, r * 2);
    });
  }
  const sp = Math.hypot(vx, vy) || 1;
  const bx = hx - vx / sp * pull * 48, by = hy - vy / sp * pull * 48;
  ctx.strokeStyle = '#8A5D39'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hx - 8, hy - 4); ctx.lineTo(bx, by); ctx.lineTo(hx + 8, hy - 4); ctx.stroke();
  const spr = SPR[ITEMS[ch.item].spr];
  drawSprite(ctx, spr, bx - spr.w * 1.5, by - spr.h * 1.5, 3);
}
function drawProj(p) {
  p.trail.forEach((q, i) => {
    ctx.globalAlpha = (i + 1) / p.trail.length * .5;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(q.x - 3, q.y - 3, 6, 6);
  });
  ctx.globalAlpha = 1;
  const spr = SPR[ITEMS[p.item].spr];
  if (p.y < -4) {
    // ekranın üstünde: nerede olduğunu göster
    const x = clamp(p.x, 20, W - 20);
    drawSprite(ctx, { map: [".X.", "XXX", "XXX"], pal: { X: '#FFD23F' }, w: 3, h: 3 }, x - 6, 4, 4);
    drawSprite(ctx, spr, x - spr.w, 20, 2);
  } else drawSprite(ctx, spr, p.x - spr.w * 1.5, p.y - spr.h * 1.5, 3);
}
function drawHud() {
  const [a, b] = play.teams;
  panel(12, 12, 176, 56, a.color);
  drawSprite(ctx, SPR.penguin, 24, 21, 3, { outline: false });
  for (let i = 0; i < 3; i++) drawSprite(ctx, SPR[i < a.hearts ? 'heart' : 'heartEmpty'], 70 + i * 36, 28, 4, { outline: false });
  panel(W - 188, 12, 176, 56, b.color);
  drawSprite(ctx, SPR.cat, W - 176, 21, 3, { outline: false });
  for (let i = 0; i < 3; i++) drawSprite(ctx, SPR[i < b.hearts ? 'heart' : 'heartEmpty'], W - 130 + i * 36, 28, 4, { outline: false });

  // rüzgâr
  panel(W / 2 - 62, 12, 124, 56, '#2BB3A3');
  const n = Math.abs(play.wind), flip = play.wind < 0;
  for (let i = 0; i < 3; i++) {
    const idx = flip ? 2 - i : i;
    drawSprite(ctx, SPR.chevron, W / 2 - 40 + i * 28, 30, 4, { outline: false, flip, pal: { X: idx < n ? '#2BB3A3' : '#D7E6EC' } });
  }

  if (screen === 'play' && play.phase !== 'over') {
    button(200, 12, 56, 56, () => { play.paused = true; }, (x, y, w, h) => centerSprite('pause', x + w / 2, y + h / 2, 4, { outline: false }), { frame: '#B9C6D6' });
  }

  const ch = cur();
  if (play.phase === 'aim' && !ch.cpu && !play.paused) {
    // eşyalar
    const its = ch.items, sw = 64, gap = 12, total = its.length * sw + (its.length - 1) * gap;
    its.forEach((k, i) => {
      const x = W / 2 - total / 2 + i * (sw + gap), y = H - sw - 12;
      const left = ch.ammo[k], empty = !(left > 0);
      button(x, y, sw, sw, empty ? null : () => { ch.item = k; }, (bx, by, w, h) => {
        const spr = SPR[ITEMS[k].spr], s = k === 'balloon' ? 4 : 5;
        drawSprite(ctx, spr, bx + (w - spr.w * s) / 2, by + (h - spr.h * s) / 2, s);
        if (left !== Infinity) {
          ctx.fillStyle = INK; ctx.fillRect(bx + w - 22, by + h - 22, 18, 18);
          text(String(left), bx + w - 13, by + h - 12, 14, { stroke: null });
        }
      }, { frame: ch.item === k ? '#FFD23F' : '#B9C6D6', disabled: empty });
    });
    // yürüme
    const canWalk = play.walkLeft > 0;
    [[-1, 14], [1, 86]].forEach(([dir, x]) => {
      button(x, H - 76, 60, 60, null, (bx, by, w, h) => centerSprite('play', bx + w / 2, by + h / 2, 4, { outline: false, flip: dir < 0 }), {
        frame: '#B9C6D6', disabled: !canWalk,
        onDown: () => { if (canWalk) play.walkDir = dir; }, onUp: () => { play.walkDir = 0; },
      });
    });
    ctx.fillStyle = INK; ctx.fillRect(14, H - 10, 132, 6);
    ctx.fillStyle = '#5DBB4A'; ctx.fillRect(15, H - 9, 130 * clamp(play.walkLeft / WALK_BUDGET, 0, 1), 4);
  }
}
function drawBanner() {
  const ch = cur(), t = play.t;
  const a = t < .15 ? t / .15 : t > .85 ? (1 - t) / .15 : 1;
  ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
  const w = 380, h = 112, x = W / 2 - w / 2, y = 84;
  panel(x, y, w, h, ch.color);
  drawSprite(ctx, SPR[ch.spr], x + 28, y + 22, 5, { outline: false });
  const msg = play.mode === '1p' ? (ch.cpu ? 'SIRA KEDİDE' : 'SIRA SENDE!') : (ch.id === 0 ? 'SIRA MAVİDE!' : 'SIRA KIRMIZIDA!');
  text(msg, x + 112 + (w - 112) / 2 - 10, y + h / 2, 30, { color: INK, stroke: null });
  ctx.restore();
}
function drawOver() {
  ctx.fillStyle = 'rgba(30,34,51,.45)'; ctx.fillRect(0, 0, W, H);
  const w = 440, h = 300, x = W / 2 - w / 2, y = 50;
  const win = play.teams[play.winner];
  const humanWon = play.mode === '1p' && play.winner === 0;
  const humanLost = play.mode === '1p' && play.winner === 1;
  panel(x, y, w, h, humanLost ? '#B9C6D6' : win.color);
  const bob = Math.abs(Math.sin(time * 5)) * 8;
  const sprKey = humanLost ? 'penguin' : win.spr;
  drawSprite(ctx, SPR[sprKey], W / 2 - 36, y + 26 - bob, 6);
  const msg = humanWon ? 'KAZANDIN!' : humanLost ? 'TEKRAR DENE!' : 'KAZANDI!';
  text(msg, W / 2, y + 128, 40, { color: humanLost ? INK : win.color, stroke: humanLost ? null : INK, lw: 7 });
  if (humanWon) for (let k = 0; k < 3; k++) drawSprite(ctx, SPR[k < play.teams[0].hearts ? 'star' : 'starEmpty'], W / 2 - 75 + k * 52, y + 160, 5);

  const bs = 70, by = y + h - bs - 22;
  const btns = [['home', () => { screen = play.mode === '1p' ? 'levels' : 'maps'; play = null; }]];
  btns.push(['retry', () => startMatch(play.mode, play.li, play.mapKey, play.mapKey === 'random' ? null : play.def)]);
  if (humanWon && play.li < LEVELS.length - 1) btns.push(['play', () => startMatch('1p', play.li + 1)]);
  const total = btns.length * bs + (btns.length - 1) * 20;
  btns.forEach(([icon, fn], i) => {
    const bx = W / 2 - total / 2 + i * (bs + 20);
    button(bx, by, bs, bs, fn, (xx, yy, ww, hh) => centerSprite(icon, xx + ww / 2, yy + hh / 2, 4, { outline: false }),
      { frame: icon === 'play' ? '#5DBB4A' : '#FFD23F' });
  });
  if (humanWon && play.li === LEVELS.length - 1) text('HEPSİNİ BİTİRDİN!', W / 2, y + h + 26, 26, { lw: 6 });
}
function drawPause() {
  ctx.fillStyle = 'rgba(30,34,51,.55)'; ctx.fillRect(0, 0, W, H);
  const bs = 96, gap = 28, total = bs * 3 + gap * 2, x0 = W / 2 - total / 2, y = H / 2 - bs / 2;
  [['play', () => { play.paused = false; }, '#5DBB4A'],
   ['retry', () => startMatch(play.mode, play.li, play.mapKey, play.mapKey === 'random' ? null : play.def), '#FFD23F'],
   ['home', () => { screen = play.mode === '1p' ? 'levels' : 'maps'; play = null; }, '#FFD23F']].forEach(([icon, fn, col], i) => {
    button(x0 + i * (bs + gap), y, bs, bs, fn, (xx, yy, ww, hh) => centerSprite(icon, xx + ww / 2, yy + hh / 2, 6, { outline: false }), { frame: col });
  });
}

/* ================= Dokunma ================= */
const pointer = { id: null, btn: null };
function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  Sound.unlock();
  if (pointer.id !== null) return;
  pointer.id = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  const p = toLogical(e);
  for (let i = buttons.length - 1; i >= 0; i--) {
    const b = buttons[i];
    if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      if (b.disabled) return;
      pointer.btn = b;
      if (b.onDown) b.onDown();
      if (b.onTap) { Sound.play('click'); b.onTap(); }
      return;
    }
  }
  if (screen === 'play' && play && !play.paused && play.phase === 'aim' && !cur().cpu) {
    play.aim = { x0: p.x, y0: p.y, x: p.x, y: p.y };
  }
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId !== pointer.id) return;
  if (play && play.aim) { const p = toLogical(e); play.aim.x = p.x; play.aim.y = p.y; }
});
function pointerEnd(e) {
  if (e.pointerId !== pointer.id) return;
  pointer.id = null;
  if (pointer.btn && pointer.btn.onUp) pointer.btn.onUp();
  pointer.btn = null;
  if (screen === 'play' && play && play.aim && play.phase === 'aim') {
    const p = toLogical(e);
    const dx = play.aim.x0 - p.x, dy = play.aim.y0 - p.y, len = Math.hypot(dx, dy);
    play.aim = null;
    if (e.type === 'pointerup' && len >= 18) {
      const pw = Math.min(len / PULL_MAX, 1);
      fire(dx / len * pw * VMAX, dy / len * pw * VMAX);
    }
  }
}
canvas.addEventListener('pointerup', pointerEnd);
canvas.addEventListener('pointercancel', pointerEnd);
['gesturestart', 'gesturechange', 'dblclick', 'contextmenu'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('visibilitychange', () => { if (document.hidden && play && play.phase !== 'over') play.paused = true; });
const portrait = window.matchMedia('(orientation: portrait)');
const onOrient = () => { if (portrait.matches && play && play.phase !== 'over') play.paused = true; resize(); };
if (portrait.addEventListener) portrait.addEventListener('change', onOrient); else if (portrait.addListener) portrait.addListener(onOrient);

/* ================= Ana döngü ================= */
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  time += dt;
  if (screen === 'play' && play && !play.paused) updatePlay(dt);
  if (!(play && play.paused)) updateParts(dt);
  shake = Math.max(0, shake - dt * 30);

  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.imageSmoothingEnabled = false;
  buttons = [];
  if (screen === 'title') { drawTitle(); drawParts(); }
  else if (screen === 'levels') drawLevels();
  else if (screen === 'maps') drawMaps();
  else if (screen === 'play' && play) drawPlay(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Test ve hata ayıklama için küçük bir kapı (oyunu etkilemez)
window.__wob = { get play() { return play; }, get screen() { return screen; }, startMatch, Store, LEVELS, fire, aiPlan, walk };
})();
