import { initAudio, startAmbientMusic, stopAmbientMusic } from './audio.js';
import { initHomepage, destroyHomepage } from './chapters/homepage.js';
import { initChapter1, destroyChapter1 } from './chapters/chapter1.js';
import { initChapter2, destroyChapter2 } from './chapters/chapter2.js';
import { initChapter3, destroyChapter3 } from './chapters/chapter3.js';
import { initChapter4, destroyChapter4 } from './chapters/chapter4.js';
import { initChapter5, destroyChapter5, setChapter5Color } from './chapters/chapter5.js';

// ─── State ───
let currentChapter = -1; // -1 = homepage
let isStaying = false;   // whether user clicked Stay Here
let rainbowIdx = 0;
const container = document.getElementById('chapter-container');
const navOverlay = document.getElementById('nav-overlay');
const fadeScreen = document.getElementById('fade-screen');
const hintText = document.getElementById('hint-text');
const opHint = document.getElementById('op-hint');
const theEnd = document.getElementById('the-end');
const multiInputOverlay = document.getElementById('multi-input-overlay');
const musicBtn = document.getElementById('music-btn');
const musicFileInput = document.getElementById('music-file-input');
const saveBtn = document.getElementById('save-btn');
const loadDialog = document.getElementById('load-dialog');
const loadList = document.getElementById('load-list');
const rainbowOverlay = document.getElementById('rainbow-overlay');

const SOFT_RAINBOW = [
  'rgba(255,160,160,0.12)',  // soft red
  'rgba(255,200,140,0.12)',  // soft orange
  'rgba(255,255,160,0.12)',  // soft yellow
  'rgba(160,255,180,0.12)',  // soft green
  'rgba(160,220,255,0.12)',  // soft blue
  'rgba(180,160,255,0.12)',  // soft indigo
  'rgba(230,170,255,0.12)',  // soft violet
];
const RAINBOW_FOG = [0xff9090,0xffc888,0xffffa0,0xa0ffb4,0xa0dcff,0xb4a0ff,0xe6aaff];

const chapters = [
  { init: initChapter1, destroy: destroyChapter1, hint: '点击暂停 · 拖拽旋转 · 滚轮缩放' },
  { init: initChapter2, destroy: destroyChapter2, hint: '四季轮回 · 静观宇宙变幻' },
  { init: initChapter3, destroy: destroyChapter3, hint: '人间烟火 · 各司其职' },
  { init: initChapter4, destroy: destroyChapter4, hint: '万物有灵 · 生命共舞' },
  { init: initChapter5, destroy: destroyChapter5, hint: '拖拽旋转 · 滚轮缩放 · 点击变色' },
];

// ─── Fade Transition ───
function fadeOut() {
  return new Promise(resolve => {
    fadeScreen.style.transition = 'opacity 1.5s ease';
    fadeScreen.classList.add('active');
    setTimeout(resolve, 1600);
  });
}
function fadeIn() {
  return new Promise(resolve => {
    fadeScreen.style.transition = 'opacity 1.5s ease';
    fadeScreen.classList.remove('active');
    setTimeout(resolve, 1600);
  });
}

// ─── Operation Hint ───
let opHintTimer = null;
function showOpHint(text) {
  if (opHintTimer) clearTimeout(opHintTimer);
  opHint.textContent = text;
  opHint.classList.add('visible');
  opHintTimer = setTimeout(() => {
    opHint.classList.remove('visible');
    opHintTimer = null;
  }, 2000);
}

// ─── Navigation System ───
function showNav() {
  navOverlay.classList.add('visible');
  const ch = chapters[currentChapter];
  if (ch && ch.hint) showOpHint(ch.hint);
}
function hideNav() {
  navOverlay.classList.remove('visible');
}

// ─── Rainbow Stay-Here click ───
function onRainbowClick() {
  if (!isStaying) return;
  rainbowIdx = (rainbowIdx + 1) % SOFT_RAINBOW.length;
  rainbowOverlay.style.backgroundColor = SOFT_RAINBOW[rainbowIdx];
  if (currentChapter === 4) setChapter5Color(RAINBOW_FOG[rainbowIdx]);
}
function enableRainbowClicks() {
  isStaying = true; rainbowIdx = 0;
  rainbowOverlay.classList.add('visible');
  rainbowOverlay.style.backgroundColor = SOFT_RAINBOW[0];
  document.addEventListener('click', onRainbowClick, true);
}
function disableRainbowClicks() {
  isStaying = false;
  rainbowOverlay.classList.remove('visible');
  rainbowOverlay.style.backgroundColor = '';
  document.removeEventListener('click', onRainbowClick, true);
  if (currentChapter === 4) setChapter5Color(null);
}

// ─── Floating Orbs (Stay Here) ───
let floatOrbs = [];

function clearFloatOrbs() {
  floatOrbs.forEach(o => { if (o.el && o.el.parentNode) o.el.parentNode.removeChild(o.el); });
  floatOrbs = [];
  selectedOrb = null;
  disableRainbowClicks();
}

// Macaron colors - vivid yet elegant, distinct against cosmic dark backgrounds
const MACARON_COLORS = [
  { bg:'radial-gradient(circle at 45% 40%, rgba(255,255,255,0.30), rgba(220,225,240,0.10))', shadow:'rgba(255,255,255,0.2)' },
  { bg:'radial-gradient(circle at 45% 40%, rgba(190,140,220,0.50), rgba(160,110,200,0.18))', shadow:'rgba(180,130,215,0.4)' },
  { bg:'radial-gradient(circle at 45% 40%, rgba(240,130,150,0.50), rgba(220,110,135,0.18))', shadow:'rgba(235,125,145,0.4)' },
  { bg:'radial-gradient(circle at 45% 40%, rgba(100,210,180,0.48), rgba(80,190,165,0.16))', shadow:'rgba(95,205,175,0.38)' },
  { bg:'radial-gradient(circle at 45% 40%, rgba(250,190,120,0.48), rgba(235,170,100,0.16))', shadow:'rgba(245,185,115,0.38)' },
  { bg:'radial-gradient(circle at 45% 40%, rgba(120,180,250,0.50), rgba(100,160,235,0.18))', shadow:'rgba(115,175,245,0.4)' },
  { bg:'radial-gradient(circle at 45% 40%, rgba(200,150,230,0.48), rgba(180,130,215,0.16))', shadow:'rgba(195,145,225,0.38)' },
  { bg:'radial-gradient(circle at 45% 40%, rgba(255,210,140,0.45), rgba(240,195,120,0.15))', shadow:'rgba(250,205,135,0.35)' },
];

let selectedOrb = null;
const BASE_SIZE = 90;
const MAX_SCALE_STEPS = 9;

function onOrbWheel(e) {
  if (!selectedOrb) return;
  e.preventDefault();
  const orb = selectedOrb;
  if (e.deltaY < 0 && orb.scaleLevel < MAX_SCALE_STEPS) orb.scaleLevel++;
  else if (e.deltaY > 0 && orb.scaleLevel > 0) orb.scaleLevel--;
  const scale = Math.pow(1.2, orb.scaleLevel);
  const sz = Math.round(BASE_SIZE * scale);
  orb.el.style.width = sz + 'px';
  orb.el.style.height = sz + 'px';
  orb.el.style.fontSize = Math.round(12 * Math.min(scale, 2.5)) + 'px';
}

function createFloatOrb(text, x, y, colorIdx0, scaleLevel0) {
  const el = document.createElement('div');
  el.className = 'float-orb';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);

  let isDragging = false, hasMoved = false, startX, startY, origLeft, origTop;
  const orb = { el, text, colorIdx: colorIdx0 || 0, scaleLevel: scaleLevel0 || 0 };

  // Apply initial color/size if restored
  if (orb.colorIdx > 0) {
    const c = MACARON_COLORS[orb.colorIdx % MACARON_COLORS.length];
    el.style.background = c.bg;
    el.style.boxShadow = `0 0 24px ${c.shadow}, 0 0 50px ${c.shadow.replace(/[\d.]+\)$/, '0.06)')}`;
  }
  if (orb.scaleLevel > 0) {
    const scale = Math.pow(1.2, orb.scaleLevel);
    const sz = Math.round(BASE_SIZE * scale);
    el.style.width = sz + 'px'; el.style.height = sz + 'px';
    el.style.fontSize = Math.round(12 * Math.min(scale, 2.5)) + 'px';
  }

  el.addEventListener('mousedown', e => {
    isDragging = true; hasMoved = false;
    startX = e.clientX; startY = e.clientY;
    origLeft = parseInt(el.style.left); origTop = parseInt(el.style.top);
    el.style.cursor = 'grabbing';
    selectedOrb = orb;
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
    el.style.left = (origLeft + dx) + 'px';
    el.style.top = (origTop + dy) + 'px';
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    el.style.cursor = 'grab';
  });

  // Single click → cycle macaron color & select for wheel
  el.addEventListener('click', e => {
    if (hasMoved) { hasMoved = false; return; }
    e.stopPropagation();
    selectedOrb = orb;
    orb.colorIdx = (orb.colorIdx + 1) % MACARON_COLORS.length;
    const c = MACARON_COLORS[orb.colorIdx];
    el.style.background = c.bg;
    el.style.boxShadow = `0 0 24px ${c.shadow}, 0 0 50px ${c.shadow.replace(/[\d.]+\)$/, '0.06)')}`;
  });

  // Double-click → burst
  el.addEventListener('dblclick', e => {
    e.stopPropagation();
    e.preventDefault();
    el.classList.add('burst');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
      floatOrbs = floatOrbs.filter(o => o.el !== el);
      if (selectedOrb === orb) selectedOrb = null;
      if (floatOrbs.length === 0) {
        disableRainbowClicks();
        goToNextChapter();
      }
    }, 500);
  });

  floatOrbs.push(orb);
  return orb;
}

// Wheel listener for orb resizing
window.addEventListener('wheel', onOrbWheel, { passive: false });

// ─── Multi-Input for Stay Here ───
let inputRows = [];
let inputCount = 0;

function showMultiInput() {
  multiInputOverlay.innerHTML = '';
  inputRows = [];
  inputCount = 0;
  addInputRow();

  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = 'position:absolute;bottom:20%;left:50%;transform:translateX(-50%);display:flex;gap:14px;';

  const addBtn = document.createElement('button');
  addBtn.className = 'mi-add-btn';
  addBtn.textContent = '+ 添加更多';
  addBtn.addEventListener('click', () => addInputRow());
  btnContainer.appendChild(addBtn);

  const doneBtn = document.createElement('button');
  doneBtn.className = 'mi-done-btn';
  doneBtn.textContent = '确认';
  doneBtn.addEventListener('click', () => confirmMultiInput());
  btnContainer.appendChild(doneBtn);

  multiInputOverlay.appendChild(btnContainer);
  multiInputOverlay.classList.add('visible');

  setTimeout(() => {
    const firstInput = multiInputOverlay.querySelector('input');
    if (firstInput) firstInput.focus();
  }, 100);
}

function addInputRow() {
  const row = document.createElement('div');
  row.className = 'mi-row';
  const topOffset = 30 + inputCount * 12;
  row.style.top = topOffset + '%';

  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 16;
  input.placeholder = inputCount === 0 ? '写下你的名字' : '再写点什么...';
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmMultiInput();
  });
  row.appendChild(input);
  multiInputOverlay.appendChild(row);
  inputRows.push({ row, input });
  inputCount++;
  input.focus();
}

function confirmMultiInput() {
  const texts = inputRows
    .map(r => r.input.value.trim())
    .filter(t => t.length > 0);

  if (texts.length === 0) return;

  hideMultiInput();
  enableRainbowClicks();

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  texts.forEach((text, i) => {
    const angle = (i / texts.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 60 + texts.length * 20;
    const x = cx + Math.cos(angle) * radius - 40;
    const y = cy + Math.sin(angle) * radius - 15;
    setTimeout(() => createFloatOrb(text, x, y), i * 200);
  });
  // Show continue button after orbs appear
  setTimeout(() => showContinueBtn(), texts.length * 200 + 300);
}

function hideMultiInput() {
  multiInputOverlay.classList.remove('visible');
  multiInputOverlay.innerHTML = '';
  inputRows = [];
  inputCount = 0;
}

// ─── The End (Chapter 5) ───
function showTheEnd() {
  theEnd.classList.add('visible');
  setTimeout(() => {
    theEnd.classList.remove('visible');
    setTimeout(() => showNav(), 800);
  }, 2000);
}

// ─── Music File Upload ───
let customAudioEl = null;
let usingCustomMusic = false;

musicBtn.addEventListener('click', () => {
  musicFileInput.click();
});
musicBtn.addEventListener('contextmenu', e => {
  e.preventDefault();
  if (usingCustomMusic && customAudioEl) {
    if (customAudioEl.paused) { customAudioEl.play(); musicBtn.classList.add('playing'); }
    else { customAudioEl.pause(); musicBtn.classList.remove('playing'); }
  }
});
musicFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  if (customAudioEl) { customAudioEl.pause(); URL.revokeObjectURL(customAudioEl.src); }
  stopAmbientMusic();
  customAudioEl = new Audio(url);
  customAudioEl.loop = true;
  customAudioEl.volume = 0.5;
  customAudioEl.play();
  usingCustomMusic = true;
  musicBtn.classList.add('playing');
  musicBtn.textContent = '♫';
});

// ─── Save / Load System ───
const SAVE_KEY = 'yunlv_saves';

function getSaves() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch { return []; }
}
function putSaves(saves) { localStorage.setItem(SAVE_KEY, JSON.stringify(saves)); }

function getOrbData() {
  return floatOrbs.map(o => ({
    text: o.text,
    x: parseInt(o.el.style.left),
    y: parseInt(o.el.style.top),
    colorIdx: o.colorIdx || 0,
    scaleLevel: o.scaleLevel || 0,
  }));
}

function doSave() {
  const saves = getSaves();
  const now = new Date();
  const name = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  saves.push({
    name,
    chapter: currentChapter,
    time: now.toISOString(),
    display: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
    orbs: getOrbData(),
  });
  if (saves.length > 30) saves.shift();
  putSaves(saves);
  // Remove orbs from screen before going to homepage
  floatOrbs.forEach(o => { if (o.el && o.el.parentNode) o.el.parentNode.removeChild(o.el); });
  floatOrbs = [];
  disableRainbowClicks();
  returnToHomepage();
}

saveBtn.addEventListener('click', () => doSave());

function openLoadDialog() {
  const saves = getSaves();
  loadList.innerHTML = '';
  if (saves.length === 0) {
    loadList.innerHTML = '<div class="load-empty">暂无存档</div>';
  } else {
    saves.slice().reverse().forEach((s, idx) => {
      const item = document.createElement('div');
      item.className = 'load-item';
      item.innerHTML = `<div class="load-item-name">${s.name}</div><div class="load-item-time">场景 ${s.chapter + 1} · ${s.display}</div>`;
      item.addEventListener('click', () => {
        closeLoadDialog();
        loadSave(s);
      });
      loadList.appendChild(item);
    });
  }
  loadDialog.classList.add('visible');
}
function closeLoadDialog() { loadDialog.classList.remove('visible'); }
document.getElementById('load-close').addEventListener('click', closeLoadDialog);
document.getElementById('load-clear').addEventListener('click', () => {
  putSaves([]);
  loadList.innerHTML = '<div class="load-empty">暂无存档</div>';
});

async function loadSave(save) {
  await fadeOut();
  destroyCurrent();
  if (!usingCustomMusic) { initAudio(); startAmbientMusic(); }
  currentChapter = save.chapter;
  saveBtn.style.display = 'block';
  chapters[save.chapter].init(container);
  hintText.textContent = '';
  await fadeIn();
  // Always show nav for non-final chapters
  if (save.chapter === chapters.length - 1) {
    setTimeout(() => showTheEnd(), 2000);
  } else {
    setTimeout(() => showNav(), 3000);
  }
  // Restore orbs if any
  if (save.orbs && save.orbs.length > 0) {
    enableRainbowClicks();
    save.orbs.forEach((o, i) => {
      setTimeout(() => createFloatOrb(o.text, o.x, o.y, o.colorIdx, o.scaleLevel), i * 150);
    });
    showContinueBtn();
  }
}

// ─── Chapter Management ───
function destroyCurrent() {
  disableRainbowClicks();
  removeContinueBtn();
  hintText.textContent = '';
  hintText.style.opacity = '0';
  if (currentChapter === -1) {
    destroyHomepage();
  } else if (currentChapter >= 0 && currentChapter < chapters.length) {
    chapters[currentChapter].destroy();
  }
  container.innerHTML = '';
}

function goToNextChapter() {
  const nextChapter = currentChapter + 1;
  if (nextChapter < chapters.length) {
    goToChapter(nextChapter);
  } else {
    returnToHomepage();
  }
}

async function returnToHomepage() {
  await fadeOut();
  destroyCurrent();
  removeContinueBtn();
  if (!usingCustomMusic) stopAmbientMusic();
  currentChapter = -1;
  saveBtn.style.display = 'none';
  initHomepage(container, startGame, openLoadDialog);
  await fadeIn();
}

async function goToChapter(index) {
  await fadeOut();
  destroyCurrent();
  currentChapter = index;
  saveBtn.style.display = 'block';

  if (index >= 0 && index < chapters.length) {
    chapters[index].init(container);
    hintText.textContent = '';
  }

  await fadeIn();

  if (index === chapters.length - 1) {
    setTimeout(() => showTheEnd(), 2000);
  } else {
    setTimeout(() => showNav(), 3000);
  }

}

// ─── Continue button (bottom of ch1-4) ───
let continueBtn = null;
function showContinueBtn() {
  removeContinueBtn();
  continueBtn = document.createElement('button');
  continueBtn.id = 'continue-btn';
  continueBtn.textContent = '点击继续';
  continueBtn.addEventListener('click', () => {
    removeContinueBtn();
    hideNav();
    clearFloatOrbs();
    goToNextChapter();
  });
  document.body.appendChild(continueBtn);
  // fade in
  requestAnimationFrame(() => continueBtn.classList.add('visible'));
}
function removeContinueBtn() {
  if (continueBtn && continueBtn.parentNode) continueBtn.parentNode.removeChild(continueBtn);
  continueBtn = null;
}

async function startGame() {
  await fadeOut();
  destroyCurrent();
  if (!usingCustomMusic) { initAudio(); startAmbientMusic(); }
  currentChapter = 0;
  saveBtn.style.display = 'block';
  chapters[0].init(container);
  await fadeIn();
  setTimeout(() => showNav(), 4000);
}

// ─── Button Events ───
document.getElementById('btn-go-on').addEventListener('click', () => {
  hideNav();
  clearFloatOrbs();
  const nextChapter = currentChapter + 1;
  if (nextChapter < chapters.length) {
    goToChapter(nextChapter);
  } else {
    returnToHomepage();
  }
});

document.getElementById('btn-stay').addEventListener('click', () => {
  hideNav();
  removeContinueBtn();
  setTimeout(() => showMultiInput(), 600);
});

// ─── Init ───
initHomepage(container, startGame, openLoadDialog);
