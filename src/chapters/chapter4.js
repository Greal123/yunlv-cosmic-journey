// ─── Chapter 4: Animal World - Land / Sea / Air with cats, dogs, tigers, elephants, whales, dolphins ───
let canvas, ctx, animId, time = 0;
let landAnimals = [], seaAnimals = [], birds = [], bubbles = [], clouds = [];

function createScene(w, h) {
  const skyH = h * 0.35, landH = h * 0.30, seaH = h * 0.35;
  const landY = skyH, seaY = skyH + landH;

  // ── Birds in sky ──
  birds = [];
  for (let i = 0; i < 6; i++) {
    birds.push({
      x: Math.random() * w, y: skyH * 0.2 + Math.random() * skyH * 0.5,
      speed: 0.4 + Math.random() * 0.6, wing: Math.random() * 6, dir: Math.random() > 0.5 ? 1 : -1,
      size: 6 + Math.random() * 6
    });
  }
  // Eagle
  birds.push({ x: w * 0.3, y: skyH * 0.15, speed: 0.3, wing: 0, dir: 1, size: 14, eagle: true });

  // ── Clouds ──
  clouds = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({ x: Math.random() * w * 1.3, y: 20 + Math.random() * skyH * 0.3, w: 60 + Math.random() * 100, speed: 0.06 + Math.random() * 0.08 });
  }

  // ── Land animals ──
  landAnimals = [];
  // Cats
  for (let i = 0; i < 3; i++) {
    landAnimals.push({ type: 'cat', x: w * (0.08 + i * 0.12), y: landY + landH * 0.7 + Math.random() * 10,
      dir: Math.random() > 0.5 ? 1 : -1, speed: (0.15 + Math.random() * 0.2), leg: Math.random() * 6,
      color: ['#e8a040', '#888', '#222'][i], tailPhase: Math.random() * 6 });
  }
  // Dogs
  for (let i = 0; i < 3; i++) {
    landAnimals.push({ type: 'dog', x: w * (0.45 + i * 0.1), y: landY + landH * 0.65 + Math.random() * 10,
      dir: Math.random() > 0.5 ? 1 : -1, speed: (0.2 + Math.random() * 0.3), leg: Math.random() * 6,
      color: ['#c08040', '#e0c080', '#705030'][i], tailPhase: Math.random() * 6 });
  }
  // Tiger
  landAnimals.push({ type: 'tiger', x: w * 0.78, y: landY + landH * 0.55, dir: -1, speed: 0.18, leg: 0,
    color: '#d08020', stripes: true, tailPhase: 0 });
  // Elephant
  landAnimals.push({ type: 'elephant', x: w * 0.88, y: landY + landH * 0.45, dir: -1, speed: 0.08, leg: 0,
    color: '#808890', trunkPhase: 0 });

  // ── Sea animals ──
  seaAnimals = [];
  // Whales
  seaAnimals.push({ type: 'whale', x: w * 0.25, y: seaY + seaH * 0.45, dir: 1, speed: 0.12, phase: 0, size: 1 });
  seaAnimals.push({ type: 'whale', x: w * 0.7, y: seaY + seaH * 0.65, dir: -1, speed: 0.08, phase: 2, size: 0.7 });
  // Dolphins
  for (let i = 0; i < 3; i++) {
    seaAnimals.push({ type: 'dolphin', x: w * (0.15 + i * 0.25), y: seaY + seaH * (0.2 + i * 0.15),
      dir: i % 2 === 0 ? 1 : -1, speed: 0.3 + Math.random() * 0.3, jumpPhase: Math.random() * 6, size: 0.8 + Math.random() * 0.3 });
  }
  // Fish schools
  for (let i = 0; i < 12; i++) {
    seaAnimals.push({ type: 'fish', x: Math.random() * w, y: seaY + seaH * 0.3 + Math.random() * seaH * 0.5,
      dir: Math.random() > 0.5 ? 1 : -1, speed: 0.2 + Math.random() * 0.4, size: 3 + Math.random() * 4,
      color: `hsl(${180 + Math.random() * 60}, 60%, ${50 + Math.random() * 20}%)` });
  }

  // Bubbles
  bubbles = [];
  for (let i = 0; i < 20; i++) {
    bubbles.push({ x: Math.random() * w, y: seaY + Math.random() * seaH,
      vy: -(0.2 + Math.random() * 0.4), size: 2 + Math.random() * 4, baseX: Math.random() * w });
  }
}

// ── Drawing helpers ──
function drawCat(ctx, a) {
  const { x, y, color, dir } = a;
  const d = dir, s = 8;
  ctx.fillStyle = color;
  // Body
  ctx.beginPath(); ctx.ellipse(x, y, s * 1.5, s * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.beginPath(); ctx.arc(x + d * s * 1.3, y - s * 0.5, s * 0.65, 0, Math.PI * 2); ctx.fill();
  // Ears
  ctx.beginPath();
  ctx.moveTo(x + d * s * 1.1, y - s * 1.1);
  ctx.lineTo(x + d * s * 1.5, y - s * 1.6);
  ctx.lineTo(x + d * s * 1.7, y - s * 0.9);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + d * s * 0.9, y - s * 1.0);
  ctx.lineTo(x + d * s * 0.6, y - s * 1.5);
  ctx.lineTo(x + d * s * 1.1, y - s * 0.8);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#ffe060';
  ctx.beginPath(); ctx.arc(x + d * s * 1.5, y - s * 0.5, 1.5, 0, Math.PI * 2); ctx.fill();
  // Tail
  const tw = Math.sin(time * 3 + a.tailPhase) * 6;
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - d * s * 1.3, y - 2);
  ctx.quadraticCurveTo(x - d * s * 2, y - s + tw, x - d * s * 2.5, y - s * 1.5 + tw);
  ctx.stroke();
  // Legs
  const lw = Math.sin(time * 4 + a.leg) * 2;
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x - s * 0.6, y + s * 0.6); ctx.lineTo(x - s * 0.6 + lw, y + s * 1.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * 0.6, y + s * 0.6); ctx.lineTo(x + s * 0.6 - lw, y + s * 1.4); ctx.stroke();
}

function drawDog(ctx, a) {
  const { x, y, color, dir } = a;
  const d = dir, s = 10;
  ctx.fillStyle = color;
  // Body
  ctx.beginPath(); ctx.ellipse(x, y, s * 1.6, s * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.beginPath(); ctx.ellipse(x + d * s * 1.5, y - s * 0.3, s * 0.7, s * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  // Snout
  ctx.beginPath(); ctx.ellipse(x + d * s * 2.1, y - s * 0.1, s * 0.35, s * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  // Ear (floppy)
  ctx.beginPath();
  ctx.ellipse(x + d * s * 1.2, y - s * 0.7, s * 0.35, s * 0.55, d * 0.3, 0, Math.PI * 2); ctx.fill();
  // Eye
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(x + d * s * 1.6, y - s * 0.45, 1.5, 0, Math.PI * 2); ctx.fill();
  // Nose
  ctx.beginPath(); ctx.arc(x + d * s * 2.3, y - s * 0.1, 2, 0, Math.PI * 2); ctx.fill();
  // Tail wagging
  const tw = Math.sin(time * 5 + a.tailPhase) * 8;
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - d * s * 1.4, y - s * 0.3);
  ctx.quadraticCurveTo(x - d * s * 2, y - s * 1.2 + tw, x - d * s * 2.2, y - s * 1.5 + tw);
  ctx.stroke();
  // Legs
  const lw = Math.sin(time * 4 + a.leg) * 3;
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - s * 0.8, y + s * 0.7); ctx.lineTo(x - s * 0.8 + lw, y + s * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * 0.8, y + s * 0.7); ctx.lineTo(x + s * 0.8 - lw, y + s * 1.5); ctx.stroke();
}

function drawTiger(ctx, a) {
  const { x, y, color, dir } = a;
  const d = dir, s = 16;
  ctx.fillStyle = color;
  // Body
  ctx.beginPath(); ctx.ellipse(x, y, s * 1.8, s, 0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.beginPath(); ctx.arc(x + d * s * 1.6, y - s * 0.2, s * 0.8, 0, Math.PI * 2); ctx.fill();
  // Ears
  ctx.beginPath(); ctx.arc(x + d * s * 1.3, y - s * 0.9, s * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + d * s * 1.9, y - s * 0.9, s * 0.25, 0, Math.PI * 2); ctx.fill();
  // Stripes on body
  ctx.strokeStyle = '#402010'; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const sx = x - s + i * s * 0.5;
    ctx.beginPath(); ctx.moveTo(sx, y - s * 0.6); ctx.lineTo(sx + 3, y + s * 0.6); ctx.stroke();
  }
  // Eyes
  ctx.fillStyle = '#ffe040';
  ctx.beginPath(); ctx.arc(x + d * s * 1.4, y - s * 0.35, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + d * s * 1.8, y - s * 0.35, 2.5, 0, Math.PI * 2); ctx.fill();
  // Legs
  const lw = Math.sin(time * 2.5 + a.leg) * 3;
  ctx.fillStyle = color;
  ctx.fillRect(x - s * 0.9, y + s * 0.7, s * 0.4, s * 0.8 + lw);
  ctx.fillRect(x + s * 0.5, y + s * 0.7, s * 0.4, s * 0.8 - lw);
  // Tail
  const tw = Math.sin(time * 2 + a.tailPhase) * 6;
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - d * s * 1.6, y);
  ctx.quadraticCurveTo(x - d * s * 2.2, y - s * 0.5 + tw, x - d * s * 2.8, y - s + tw);
  ctx.stroke();
}

function drawElephant(ctx, a) {
  const { x, y, color, dir } = a;
  const d = dir, s = 22;
  ctx.fillStyle = color;
  // Body
  ctx.beginPath(); ctx.ellipse(x, y, s * 1.6, s * 1.2, 0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.beginPath(); ctx.arc(x + d * s * 1.4, y - s * 0.4, s * 0.85, 0, Math.PI * 2); ctx.fill();
  // Ear
  ctx.fillStyle = '#707880';
  ctx.beginPath(); ctx.ellipse(x + d * s * 0.8, y - s * 0.2, s * 0.6, s * 0.9, d * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  // Eye
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(x + d * s * 1.7, y - s * 0.6, 3, 0, Math.PI * 2); ctx.fill();
  // Trunk
  const trSwing = Math.sin(time * 1.5 + a.trunkPhase) * 8;
  ctx.strokeStyle = color; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + d * s * 2, y - s * 0.1);
  ctx.quadraticCurveTo(x + d * s * 2.3, y + s * 0.5, x + d * s * 2.1 + trSwing, y + s * 1.1);
  ctx.stroke();
  // Legs
  const lw = Math.sin(time * 1.5) * 3;
  ctx.fillStyle = color;
  ctx.fillRect(x - s * 0.9, y + s * 0.9, s * 0.5, s * 0.9 + lw);
  ctx.fillRect(x + s * 0.4, y + s * 0.9, s * 0.5, s * 0.9 - lw);
  ctx.fillRect(x - s * 0.3, y + s * 0.9, s * 0.5, s * 0.8);
  ctx.fillRect(x + s * 0.9, y + s * 0.9, s * 0.5, s * 0.8);
  // Tusk
  ctx.strokeStyle = '#e8e0d0'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + d * s * 1.8, y + s * 0.1);
  ctx.quadraticCurveTo(x + d * s * 2.3, y + s * 0.3, x + d * s * 2.1, y + s * 0.5);
  ctx.stroke();
}

function drawWhale(ctx, a) {
  const { x, y, size } = a;
  const s = 40 * size;
  const d = a.dir;
  const bob = Math.sin(time * 0.8 + a.phase) * 4;
  ctx.fillStyle = '#3050a0';
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y + bob, s * 1.2, s * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = '#8090c0';
  ctx.beginPath();
  ctx.ellipse(x, y + bob + s * 0.15, s * 1.0, s * 0.25, 0, 0, Math.PI);
  ctx.fill();
  // Tail fin
  ctx.fillStyle = '#3050a0';
  ctx.beginPath();
  ctx.moveTo(x - d * s * 1.1, y + bob);
  ctx.quadraticCurveTo(x - d * s * 1.5, y + bob - s * 0.4, x - d * s * 1.8, y + bob - s * 0.5);
  ctx.quadraticCurveTo(x - d * s * 1.5, y + bob, x - d * s * 1.8, y + bob + s * 0.5);
  ctx.quadraticCurveTo(x - d * s * 1.5, y + bob + s * 0.3, x - d * s * 1.1, y + bob);
  ctx.fill();
  // Eye
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x + d * s * 0.8, y + bob - s * 0.1, 3 * size, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(x + d * s * 0.82, y + bob - s * 0.1, 1.5 * size, 0, Math.PI * 2); ctx.fill();
}

function drawDolphin(ctx, a) {
  const { x, y, size, dir } = a;
  const s = 18 * size, d = dir;
  const jump = Math.sin(time * 2 + a.jumpPhase) * 12;
  const cy = y + jump;
  ctx.fillStyle = '#5070b0';
  // Body
  ctx.beginPath();
  ctx.ellipse(x, cy, s * 1.3, s * 0.4, d * -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = '#a0b0d0';
  ctx.beginPath();
  ctx.ellipse(x + d * s * 0.2, cy + s * 0.12, s * 0.8, s * 0.15, 0, 0, Math.PI);
  ctx.fill();
  // Fin (dorsal)
  ctx.fillStyle = '#4060a0';
  ctx.beginPath();
  ctx.moveTo(x, cy - s * 0.35);
  ctx.lineTo(x - d * s * 0.2, cy - s * 0.75);
  ctx.lineTo(x + d * s * 0.3, cy - s * 0.35);
  ctx.fill();
  // Tail
  ctx.beginPath();
  ctx.moveTo(x - d * s * 1.2, cy);
  ctx.lineTo(x - d * s * 1.6, cy - s * 0.3);
  ctx.lineTo(x - d * s * 1.4, cy);
  ctx.lineTo(x - d * s * 1.6, cy + s * 0.3);
  ctx.closePath();
  ctx.fill();
  // Snout
  ctx.fillStyle = '#5070b0';
  ctx.beginPath();
  ctx.ellipse(x + d * s * 1.2, cy + s * 0.05, s * 0.3, s * 0.12, d * -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Eye
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(x + d * s * 0.8, cy - s * 0.08, 1.5, 0, Math.PI * 2); ctx.fill();
}

function draw() {
  if (!canvas || !ctx) return;
  const w = canvas.width, h = canvas.height;
  time += 0.016;
  const skyH = h * 0.35, landH = h * 0.30, seaY = skyH + landH;

  // ── Sky ──
  const skyG = ctx.createLinearGradient(0, 0, 0, skyH);
  skyG.addColorStop(0, '#6aa0d8'); skyG.addColorStop(1, '#b0d8f0');
  ctx.fillStyle = skyG; ctx.fillRect(0, 0, w, skyH);

  // Sun
  const sunG = ctx.createRadialGradient(w * 0.8, skyH * 0.2, 0, w * 0.8, skyH * 0.2, 80);
  sunG.addColorStop(0, 'rgba(255,240,180,0.6)'); sunG.addColorStop(1, 'transparent');
  ctx.fillStyle = sunG; ctx.fillRect(0, 0, w, skyH);

  // Clouds
  clouds.forEach(c => {
    c.x += c.speed; if (c.x > w + 200) c.x = -200;
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w * 0.5, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x + c.w * 0.2, c.y - 8, c.w * 0.3, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x - c.w * 0.15, c.y - 5, c.w * 0.25, 9, 0, 0, Math.PI * 2); ctx.fill();
  });

  // ── Birds ──
  birds.forEach(b => {
    b.x += b.speed * b.dir; b.wing += 0.12;
    if (b.x > w + 30) b.x = -30; if (b.x < -30) b.x = w + 30;
    const wy = Math.sin(b.wing) * b.size * 0.5;
    if (b.eagle) {
      ctx.strokeStyle = 'rgba(50,30,10,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x - b.size, b.y + wy); ctx.quadraticCurveTo(b.x - b.size * 0.3, b.y - 4, b.x, b.y);
      ctx.quadraticCurveTo(b.x + b.size * 0.3, b.y - 4, b.x + b.size, b.y + wy);
      ctx.stroke();
      // Body
      ctx.fillStyle = 'rgba(60,40,20,0.7)';
      ctx.beginPath(); ctx.ellipse(b.x, b.y + 1, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(40,40,40,0.45)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x - b.size * 0.5, b.y + wy);
      ctx.quadraticCurveTo(b.x, b.y - 2, b.x + b.size * 0.5, b.y + wy);
      ctx.stroke();
    }
  });

  // ── Land ──
  const landG = ctx.createLinearGradient(0, skyH, 0, seaY);
  landG.addColorStop(0, '#6aaa50'); landG.addColorStop(0.4, '#508a3a'); landG.addColorStop(1, '#406830');
  ctx.fillStyle = landG; ctx.fillRect(0, skyH, w, landH);

  // Trees
  [0.05, 0.22, 0.42, 0.62, 0.82, 0.95].forEach((tx, i) => {
    const treeX = w * tx, treeY = skyH + 15;
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(treeX - 3, treeY, 6, 30 + i * 5);
    ctx.fillStyle = `hsl(${110 + i * 8}, 50%, ${30 + i * 3}%)`;
    ctx.beginPath(); ctx.arc(treeX, treeY - 5, 18 + i * 3, 0, Math.PI * 2); ctx.fill();
  });

  // Grass texture
  ctx.strokeStyle = 'rgba(80,140,50,0.3)'; ctx.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    const gx = Math.random() * w, gy = skyH + landH * 0.4 + Math.random() * landH * 0.5;
    const gh = 4 + Math.random() * 6;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.sin(time + i) * 2, gy - gh); ctx.stroke();
  }

  // Land animals
  landAnimals.forEach(a => {
    a.x += a.speed * a.dir;
    if (a.x > w + 60) a.x = -60; if (a.x < -60) a.x = w + 60;
    if (a.type === 'cat') drawCat(ctx, a);
    else if (a.type === 'dog') drawDog(ctx, a);
    else if (a.type === 'tiger') drawTiger(ctx, a);
    else if (a.type === 'elephant') drawElephant(ctx, a);
  });

  // ── Beach transition ──
  const beachG = ctx.createLinearGradient(0, seaY - 15, 0, seaY + 10);
  beachG.addColorStop(0, '#c0b080'); beachG.addColorStop(1, '#2060a0');
  ctx.fillStyle = beachG; ctx.fillRect(0, seaY - 15, w, 25);

  // ── Sea ──
  const seaG = ctx.createLinearGradient(0, seaY, 0, h);
  seaG.addColorStop(0, '#2070b0'); seaG.addColorStop(0.5, '#1850a0'); seaG.addColorStop(1, '#0a2060');
  ctx.fillStyle = seaG; ctx.fillRect(0, seaY, w, h - seaY);

  // Wave pattern
  ctx.strokeStyle = 'rgba(100,160,220,0.15)'; ctx.lineWidth = 1.5;
  for (let row = 0; row < 6; row++) {
    ctx.beginPath();
    const wy = seaY + 10 + row * 18;
    for (let x = 0; x < w; x += 4) {
      ctx.lineTo(x, wy + Math.sin(x * 0.02 + time * 1.5 + row) * 3);
    }
    ctx.stroke();
  }

  // Bubbles
  bubbles.forEach(b => {
    b.y += b.vy; b.x += Math.sin(time * 2 + b.baseX) * 0.2;
    if (b.y < seaY) { b.y = h - 10; b.x = b.baseX + Math.random() * 30 - 15; }
    ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(150,200,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();
  });

  // Sea animals
  seaAnimals.forEach(a => {
    a.x += a.speed * a.dir;
    if (a.x > w + 80) a.x = -80; if (a.x < -80) a.x = w + 80;
    if (a.type === 'whale') drawWhale(ctx, a);
    else if (a.type === 'dolphin') drawDolphin(ctx, a);
    else if (a.type === 'fish') {
      const fy = a.y + Math.sin(time * 2 + a.x * 0.01) * 3;
      ctx.fillStyle = a.color;
      ctx.beginPath(); ctx.ellipse(a.x, fy, a.size, a.size * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(a.x - a.dir * a.size, fy);
      ctx.lineTo(a.x - a.dir * a.size * 1.8, fy - a.size * 0.4);
      ctx.lineTo(a.x - a.dir * a.size * 1.8, fy + a.size * 0.4);
      ctx.closePath(); ctx.fill();
    }
  });

  // Light overlay
  ctx.fillStyle = 'rgba(255,250,230,0.02)'; ctx.fillRect(0, 0, w, h);

  animId = requestAnimationFrame(draw);
}

const onRz = () => { if (!canvas) return; canvas.width = innerWidth; canvas.height = innerHeight; createScene(innerWidth, innerHeight); };

export function initChapter4(container) {
  time = 0;
  canvas = document.createElement('canvas'); canvas.width = innerWidth; canvas.height = innerHeight;
  canvas.style.cssText = 'position:absolute;top:0;left:0;';
  container.appendChild(canvas); ctx = canvas.getContext('2d');
  createScene(canvas.width, canvas.height);
  window.addEventListener('resize', onRz);
  const hint = document.getElementById('hint-text');
  if (hint) { hint.textContent = '万物有灵 · 生命共舞'; hint.style.opacity = '1';
    setTimeout(() => { hint.style.opacity = '0'; setTimeout(() => { hint.textContent = ''; }, 800); }, 1500);
  }
  draw();
}

export function destroyChapter4() {
  if (animId) cancelAnimationFrame(animId); animId = null;
  window.removeEventListener('resize', onRz);
  canvas = null; ctx = null;
  const h = document.getElementById('hint-text'); if (h) { h.textContent = ''; h.style.opacity = '0'; }
}
