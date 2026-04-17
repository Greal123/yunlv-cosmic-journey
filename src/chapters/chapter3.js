// ─── Chapter 3: Human Society - Morning street scene (10am) ───
let canvas, ctx, animId, time = 0;
let people = [], clouds = [], smokeParticles = [];

const COLORS = {
  sky: ['#b8d4e8', '#d4e4f0', '#e8eff5'],
  building: ['#8a7e72', '#a09488', '#b8aa9c', '#c8bdb0', '#7a6e62'],
  ground: '#c8c0b4',
  sidewalk: '#d8d0c4',
};

function createPeople(w, h) {
  people = [];
  const groundY = h * 0.78;
  // Vendors
  for (let i = 0; i < 3; i++) {
    people.push({ type: 'vendor', x: w * (0.12 + i * 0.28), y: groundY, dir: 0, speed: 0,
      color: `hsl(${20 + i * 40}, 40%, ${40 + i * 5}%)`, stall: true, bobPhase: Math.random() * Math.PI * 2 });
  }
  // Walking people
  for (let i = 0; i < 12; i++) {
    const dir = Math.random() > 0.5 ? 1 : -1;
    people.push({ type: 'walker', x: Math.random() * w, y: groundY + Math.random() * 8 - 4,
      dir, speed: (0.3 + Math.random() * 0.5) * dir,
      color: `hsl(${Math.random() * 360}, ${20 + Math.random() * 30}%, ${35 + Math.random() * 20}%)`,
      legPhase: Math.random() * Math.PI * 2, h: 18 + Math.random() * 8 });
  }
  // Sanitation worker
  people.push({ type: 'sweeper', x: w * 0.6, y: groundY + 2, dir: -1, speed: -0.15,
    color: '#e8a020', legPhase: 0, h: 24, sweepPhase: 0 });
  // Delivery rider
  people.push({ type: 'rider', x: -30, y: groundY - 2, dir: 1, speed: 1.2,
    color: '#3388cc', h: 22 });
  // Shop assistants
  for (let i = 0; i < 2; i++) {
    people.push({ type: 'shopkeeper', x: w * (0.35 + i * 0.35), y: groundY - 30,
      dir: 0, speed: 0, color: `hsl(${200 + i * 60}, 30%, 50%)`, wavePhase: Math.random() * Math.PI * 2, h: 20 });
  }
}

function createSmoke(w, h) {
  smokeParticles = [];
  // Smoke from food stalls
  const stallX = [0.12, 0.40];
  stallX.forEach(sx => {
    for (let i = 0; i < 15; i++) {
      smokeParticles.push({
        x: w * sx + Math.random() * 20 - 10,
        y: h * 0.72 - Math.random() * 30,
        vy: -(0.2 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 0.15,
        size: 3 + Math.random() * 6,
        life: Math.random(),
        maxLife: 3 + Math.random() * 2,
        baseX: w * sx,
      });
    }
  });
}

function createClouds(w) {
  clouds = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({ x: Math.random() * w * 1.5, y: 30 + Math.random() * 60, w: 80 + Math.random() * 120, speed: 0.05 + Math.random() * 0.1 });
  }
}

function drawBuilding(ctx, x, y, w, h, color, windows) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y - h, w, h);
  // Windows
  if (windows) {
    const cols = Math.floor(w / 16);
    const rows = Math.floor(h / 22);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = x + 6 + c * 16;
        const wy = y - h + 8 + r * 22;
        ctx.fillStyle = Math.random() > 0.3 ? 'rgba(180,200,220,0.6)' : 'rgba(255,240,200,0.4)';
        ctx.fillRect(wx, wy, 10, 14);
      }
    }
  }
  // Roof line
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(x - 2, y - h - 3, w + 4, 6);
}

function drawPerson(ctx, p, t) {
  const { x, y, h: pH } = p;
  const headR = pH * 0.18;

  if (p.type === 'walker') {
    const legSwing = Math.sin(t * 4 + p.legPhase) * 4;
    // Body
    ctx.fillStyle = p.color;
    ctx.fillRect(x - 3, y - pH + headR * 2, 6, pH * 0.45);
    // Legs
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 1, y - pH * 0.35);
    ctx.lineTo(x - 1 + legSwing, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 1, y - pH * 0.35);
    ctx.lineTo(x + 1 - legSwing, y);
    ctx.stroke();
    // Head
    ctx.beginPath();
    ctx.arc(x, y - pH + headR, headR, 0, Math.PI * 2);
    ctx.fillStyle = '#e8d4c0';
    ctx.fill();
  } else if (p.type === 'vendor') {
    const bob = Math.sin(t * 2 + p.bobPhase) * 1.5;
    // Stall
    ctx.fillStyle = 'rgba(160,120,60,0.7)';
    ctx.fillRect(x - 20, y - 18, 40, 18);
    ctx.fillStyle = 'rgba(200,60,40,0.6)';
    ctx.fillRect(x - 22, y - 22, 44, 5);
    // Items on stall
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x - 12 + i * 8, y - 12, 3, 0, Math.PI * 2);
      ctx.fillStyle = ['#e84040','#40c040','#e8c040','#e88040'][i];
      ctx.fill();
    }
    // Person behind stall
    ctx.fillStyle = p.color;
    ctx.fillRect(x - 4, y - 38 + bob, 8, 16);
    ctx.beginPath();
    ctx.arc(x, y - 42 + bob, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8d4c0';
    ctx.fill();
  } else if (p.type === 'sweeper') {
    p.sweepPhase = (p.sweepPhase || 0) + 0.05;
    const sweep = Math.sin(p.sweepPhase) * 8;
    // Body
    ctx.fillStyle = p.color;
    ctx.fillRect(x - 3, y - pH + 8, 6, pH * 0.45);
    // Legs
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2.5;
    const ls = Math.sin(t * 2) * 3;
    ctx.beginPath(); ctx.moveTo(x - 1, y - pH * 0.35); ctx.lineTo(x - 1 + ls, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 1, y - pH * 0.35); ctx.lineTo(x + 1 - ls, y); ctx.stroke();
    // Head
    ctx.beginPath(); ctx.arc(x, y - pH + 5, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8d4c0'; ctx.fill();
    // Broom
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y - pH * 0.3);
    ctx.lineTo(x + 12 + sweep, y + 2);
    ctx.stroke();
    ctx.strokeStyle = '#6a4a20';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 10 + sweep, y);
    ctx.lineTo(x + 16 + sweep, y + 3);
    ctx.stroke();
  } else if (p.type === 'rider') {
    // Bike frame
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 8, y + 2, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 8, y + 2, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 8, y + 2); ctx.lineTo(x, y - 8); ctx.lineTo(x + 8, y + 2); ctx.stroke();
    // Person
    ctx.fillStyle = p.color;
    ctx.fillRect(x - 3, y - 22, 6, 12);
    ctx.beginPath(); ctx.arc(x, y - 26, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8d4c0'; ctx.fill();
    // Package
    ctx.fillStyle = '#cc8833';
    ctx.fillRect(x + 4, y - 18, 8, 8);
  } else if (p.type === 'shopkeeper') {
    const wave = Math.sin(t * 2 + p.wavePhase) * 5;
    ctx.fillStyle = p.color;
    ctx.fillRect(x - 3, y - 16, 6, 14);
    ctx.beginPath(); ctx.arc(x, y - 20, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8d4c0'; ctx.fill();
    // Waving arm
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 12);
    ctx.lineTo(x + 10, y - 18 + wave);
    ctx.stroke();
  }
}

function draw() {
  if (!canvas || !ctx) return;
  const w = canvas.width, h = canvas.height;
  time += 0.016;

  // Sky - warm morning
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  skyGrad.addColorStop(0, '#a8c8e0');
  skyGrad.addColorStop(0.5, '#d0e0f0');
  skyGrad.addColorStop(1, '#e8e4d8');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Sun glow (10am position)
  const sunX = w * 0.7, sunY = h * 0.12;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, h * 0.4);
  sunGrad.addColorStop(0, 'rgba(255,240,200,0.4)');
  sunGrad.addColorStop(0.3, 'rgba(255,230,180,0.15)');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, w, h);

  // Clouds
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x > w + 200) c.x = -200;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w * 0.5, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x + c.w * 0.2, c.y - 8, c.w * 0.3, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  const groundY = h * 0.78;

  // Background buildings
  const bColors = COLORS.building;
  const buildings = [
    { x: 0, w: 80, h: 180, c: bColors[0] },
    { x: 70, w: 100, h: 220, c: bColors[1] },
    { x: 160, w: 70, h: 160, c: bColors[2] },
    { x: 220, w: 90, h: 200, c: bColors[3] },
    { x: 300, w: 110, h: 240, c: bColors[4] },
    { x: 400, w: 80, h: 170, c: bColors[0] },
    { x: 470, w: 100, h: 210, c: bColors[2] },
    { x: 560, w: 85, h: 190, c: bColors[1] },
    { x: 640, w: 95, h: 230, c: bColors[3] },
    { x: 730, w: 80, h: 175, c: bColors[4] },
  ];
  // Scale buildings to screen
  const scale = w / 800;
  buildings.forEach(b => {
    drawBuilding(ctx, b.x * scale, groundY, b.w * scale, b.h * scale, b.c, true);
  });

  // Shop fronts (awnings)
  [0.2, 0.45, 0.7].forEach((px, i) => {
    const ax = w * px - 30;
    ctx.fillStyle = ['rgba(180,40,40,0.6)', 'rgba(40,120,180,0.5)', 'rgba(180,140,40,0.5)'][i];
    ctx.beginPath();
    ctx.moveTo(ax, groundY - 35);
    ctx.lineTo(ax + 60, groundY - 35);
    ctx.lineTo(ax + 65, groundY - 25);
    ctx.lineTo(ax - 5, groundY - 25);
    ctx.closePath();
    ctx.fill();
  });

  // Sidewalk
  ctx.fillStyle = COLORS.sidewalk;
  ctx.fillRect(0, groundY, w, 10);

  // Road
  ctx.fillStyle = '#a0a098';
  ctx.fillRect(0, groundY + 10, w, h - groundY - 10);

  // Road markings
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(0, groundY + h * 0.1 + 10);
  ctx.lineTo(w, groundY + h * 0.1 + 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Smoke
  smokeParticles.forEach(sp => {
    sp.y += sp.vy;
    sp.x += sp.vx + Math.sin(time + sp.life * 10) * 0.1;
    sp.life += 0.016 / sp.maxLife;
    if (sp.life > 1) {
      sp.life = 0;
      sp.x = sp.baseX + Math.random() * 20 - 10;
      sp.y = groundY - Math.random() * 10 - 15;
    }
    const alpha = (1 - sp.life) * 0.15;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.size * (1 + sp.life), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,200,200,${alpha})`;
    ctx.fill();
  });

  // People
  people.forEach(p => {
    if (p.speed !== 0) {
      p.x += p.speed;
      if (p.x > w + 40) p.x = -40;
      if (p.x < -40) p.x = w + 40;
    }
    drawPerson(ctx, p, time);
  });

  // Warm light overlay
  ctx.fillStyle = 'rgba(255,240,200,0.04)';
  ctx.fillRect(0, 0, w, h);

  animId = requestAnimationFrame(draw);
}

const onRz = () => {
  if (!canvas) return;
  canvas.width = innerWidth; canvas.height = innerHeight;
  createPeople(innerWidth, innerHeight);
  createSmoke(innerWidth, innerHeight);
  createClouds(innerWidth);
};

export function initChapter3(container) {
  time = 0;
  canvas = document.createElement('canvas');
  canvas.width = innerWidth; canvas.height = innerHeight;
  canvas.style.cssText = 'position:absolute;top:0;left:0;';
  container.appendChild(canvas);
  ctx = canvas.getContext('2d');
  createPeople(canvas.width, canvas.height);
  createSmoke(canvas.width, canvas.height);
  createClouds(canvas.width);
  window.addEventListener('resize', onRz);
  const hint = document.getElementById('hint-text');
  if (hint) { hint.textContent = '人间烟火 · 各司其职'; hint.style.opacity = '1';
    setTimeout(() => { hint.style.opacity = '0'; setTimeout(() => { hint.textContent = ''; }, 800); }, 1500);
  }
  draw();
}

export function destroyChapter3() {
  if (animId) cancelAnimationFrame(animId); animId = null;
  window.removeEventListener('resize', onRz);
  canvas = null; ctx = null;
  const hint = document.getElementById('hint-text');
  if (hint) { hint.textContent = ''; hint.style.opacity = '0'; }
}
