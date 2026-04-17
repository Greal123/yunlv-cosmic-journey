// ─── Homepage: Galaxy background + silhouette figure ───
let canvas, ctx, animId;
let stars = [];
let nebulaClouds = [];
let time = 0;

function createStars(w, h) {
  stars = [];
  for (let i = 0; i < 1200; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h * 0.85,
      size: Math.random() * 2 + 0.3,
      brightness: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
      twinkleSpeed: Math.random() * 2 + 1,
      hue: Math.random() > 0.7 ? 220 + Math.random() * 40 : 40 + Math.random() * 20,
    });
  }
}

function createNebula() {
  nebulaClouds = [];
  for (let i = 0; i < 15; i++) {
    nebulaClouds.push({
      x: Math.random(),
      y: Math.random() * 0.7 + 0.05,
      radius: Math.random() * 0.25 + 0.1,
      r: Math.floor(Math.random() * 60 + 20),
      g: Math.floor(Math.random() * 60 + 40),
      b: Math.floor(Math.random() * 180 + 80),
      alpha: Math.random() * 0.06 + 0.02,
      drift: (Math.random() - 0.5) * 0.00005,
    });
  }
}

function drawMilkyWay(ctx, w, h, t) {
  // Central band of milky way
  const gradient = ctx.createLinearGradient(0, h * 0.3, w, h * 0.5);
  gradient.addColorStop(0, 'rgba(60, 80, 140, 0)');
  gradient.addColorStop(0.3, `rgba(80, 100, 180, ${0.04 + Math.sin(t * 0.3) * 0.01})`);
  gradient.addColorStop(0.5, `rgba(120, 140, 200, ${0.06 + Math.sin(t * 0.2) * 0.015})`);
  gradient.addColorStop(0.7, `rgba(80, 100, 180, ${0.04 + Math.sin(t * 0.3) * 0.01})`);
  gradient.addColorStop(1, 'rgba(60, 80, 140, 0)');

  ctx.save();
  ctx.translate(w / 2, h * 0.4);
  ctx.rotate(-0.3);
  ctx.fillStyle = gradient;
  ctx.fillRect(-w, -h * 0.15, w * 2, h * 0.3);
  ctx.restore();
}

function drawSilhouette(ctx, w, h) {
  const cx = w / 2;
  const groundY = h * 0.88;

  // Ground/platform - subtle reflection
  const groundGrad = ctx.createLinearGradient(cx - w * 0.3, groundY, cx + w * 0.3, groundY);
  groundGrad.addColorStop(0, 'rgba(40,50,80,0)');
  groundGrad.addColorStop(0.5, 'rgba(40,50,80,0.3)');
  groundGrad.addColorStop(1, 'rgba(40,50,80,0)');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(cx - w * 0.3, groundY, w * 0.6, h * 0.02);

  // Ground glow
  const glowGrad = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, w * 0.25);
  glowGrad.addColorStop(0, 'rgba(100,130,200,0.08)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(cx - w * 0.3, groundY - 20, w * 0.6, 60);

  // WeChat-style back view silhouette (looking up at stars)
  const scale = Math.min(w, h) / 800;
  const fH = 110 * scale; // total figure height
  const fX = cx;
  const fY = groundY;

  ctx.fillStyle = '#08080f';

  // Head (slightly oval, seen from behind)
  ctx.beginPath();
  ctx.ellipse(fX, fY - fH + 14 * scale, 11 * scale, 13 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair detail on top (short messy back-view hair)
  ctx.beginPath();
  ctx.ellipse(fX, fY - fH + 8 * scale, 12 * scale, 9 * scale, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillRect(fX - 4 * scale, fY - fH + 26 * scale, 8 * scale, 8 * scale);

  // Shoulders + upper body (jacket/coat shape from behind)
  ctx.beginPath();
  ctx.moveTo(fX - 22 * scale, fY - fH + 38 * scale); // left shoulder
  ctx.quadraticCurveTo(fX - 18 * scale, fY - fH + 30 * scale, fX - 5 * scale, fY - fH + 32 * scale); // shoulder curve
  ctx.lineTo(fX + 5 * scale, fY - fH + 32 * scale);
  ctx.quadraticCurveTo(fX + 18 * scale, fY - fH + 30 * scale, fX + 22 * scale, fY - fH + 38 * scale); // right shoulder
  ctx.lineTo(fX + 20 * scale, fY - fH + 72 * scale); // right waist
  ctx.lineTo(fX - 20 * scale, fY - fH + 72 * scale); // left waist
  ctx.closePath();
  ctx.fill();

  // Arms hanging naturally by sides
  ctx.beginPath();
  ctx.moveTo(fX - 22 * scale, fY - fH + 38 * scale);
  ctx.quadraticCurveTo(fX - 26 * scale, fY - fH + 55 * scale, fX - 23 * scale, fY - fH + 70 * scale);
  ctx.lineTo(fX - 19 * scale, fY - fH + 70 * scale);
  ctx.quadraticCurveTo(fX - 20 * scale, fY - fH + 55 * scale, fX - 18 * scale, fY - fH + 42 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(fX + 22 * scale, fY - fH + 38 * scale);
  ctx.quadraticCurveTo(fX + 26 * scale, fY - fH + 55 * scale, fX + 23 * scale, fY - fH + 70 * scale);
  ctx.lineTo(fX + 19 * scale, fY - fH + 70 * scale);
  ctx.quadraticCurveTo(fX + 20 * scale, fY - fH + 55 * scale, fX + 18 * scale, fY - fH + 42 * scale);
  ctx.closePath();
  ctx.fill();

  // Legs
  ctx.beginPath();
  ctx.moveTo(fX - 16 * scale, fY - fH + 72 * scale);
  ctx.lineTo(fX - 14 * scale, fY);
  ctx.lineTo(fX - 3 * scale, fY);
  ctx.lineTo(fX - 5 * scale, fY - fH + 72 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(fX + 5 * scale, fY - fH + 72 * scale);
  ctx.lineTo(fX + 3 * scale, fY);
  ctx.lineTo(fX + 14 * scale, fY);
  ctx.lineTo(fX + 16 * scale, fY - fH + 72 * scale);
  ctx.closePath();
  ctx.fill();

  // Shoes
  ctx.beginPath();
  ctx.ellipse(fX - 8 * scale, fY + 2 * scale, 7 * scale, 3 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(fX + 8 * scale, fY + 2 * scale, 7 * scale, 3 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Faint reflection below
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.scale(1, -1);
  ctx.translate(0, -groundY * 2);
  ctx.fillStyle = '#1a2040';
  ctx.beginPath();
  ctx.ellipse(fX, fY - fH + 14 * scale, 11 * scale, 13 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(fX - 20 * scale, fY - fH + 32 * scale, 40 * scale, 40 * scale);
  ctx.restore();
}

function draw() {
  const w = canvas.width;
  const h = canvas.height;
  time += 0.016;

  // Clear
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, w, h);

  // Nebula clouds
  nebulaClouds.forEach(c => {
    c.x += c.drift;
    if (c.x < -0.2) c.x = 1.2;
    if (c.x > 1.2) c.x = -0.2;

    const grad = ctx.createRadialGradient(
      c.x * w, c.y * h, 0,
      c.x * w, c.y * h, c.radius * w
    );
    grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${c.alpha})`);
    grad.addColorStop(0.6, `rgba(${c.r},${c.g},${c.b},${c.alpha * 0.3})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });

  // Milky way band
  drawMilkyWay(ctx, w, h, time);

  // Stars
  stars.forEach(s => {
    const twinkle = 0.4 + Math.sin(time * s.twinkleSpeed + s.x) * 0.3 + 0.3;
    const alpha = s.brightness * twinkle;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${s.hue}, 70%, ${70 + alpha * 30}%, ${alpha})`;
    ctx.fill();

    if (s.brightness > 0.8 && s.size > 1.2) {
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 5);
      glow.addColorStop(0, `hsla(${s.hue}, 80%, 90%, ${alpha * 0.15})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(s.x - s.size * 5, s.y - s.size * 5, s.size * 10, s.size * 10);
    }
  });

  // Horizon glow
  const horizonGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
  horizonGrad.addColorStop(0, 'transparent');
  horizonGrad.addColorStop(0.5, 'rgba(60,80,130,0.05)');
  horizonGrad.addColorStop(1, 'rgba(20,25,40,0.8)');
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, h * 0.75, w, h * 0.25);

  // Silhouette
  drawSilhouette(ctx, w, h);

  animId = requestAnimationFrame(draw);
}

export function initHomepage(container, onStart, onLoad) {
  canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  container.appendChild(canvas);
  ctx = canvas.getContext('2d');

  // Title overlay
  const titleDiv = document.createElement('div');
  titleDiv.id = 'homepage-title';
  titleDiv.innerHTML = '<h1>蕴 率</h1><p>宇宙的频率 · 生命的流动</p>';
  container.appendChild(titleDiv);

  // Start button
  const startBtn = document.createElement('button');
  startBtn.id = 'start-btn';
  startBtn.textContent = '开始旅程';
  startBtn.addEventListener('click', () => {
    if (onStart) onStart();
  });
  container.appendChild(startBtn);

  // Load button (top-right)
  if (onLoad) {
    const loadBtn = document.createElement('button');
    loadBtn.id = 'load-btn';
    loadBtn.textContent = '读档';
    loadBtn.addEventListener('click', () => onLoad());
    container.appendChild(loadBtn);
  }

  createStars(canvas.width, canvas.height);
  createNebula();
  draw();

  const onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars(canvas.width, canvas.height);
  };
  window.addEventListener('resize', onResize);
  canvas._onResize = onResize;
}

export function destroyHomepage() {
  if (animId) cancelAnimationFrame(animId);
  if (canvas && canvas._onResize) {
    window.removeEventListener('resize', canvas._onResize);
  }
  animId = null;
  canvas = null;
  ctx = null;
}
