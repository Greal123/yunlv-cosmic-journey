// ─── Chapter 5: 3D Black & White Galaxy with drag/rotate/zoom ───
import * as THREE from 'three';
let renderer, scene, camera, animId, clock, milkyWay, bgStars, glowMesh;
let camAngleX = 0, camAngleY = 0.3, targetDist = 180, currentDist = 180;
let dragging = false, dragMoved = false, lastMX = 0, lastMY = 0;
let colorTint = null; // for rainbow stay-here clicks
let elapsedTime = 0;

function createBgStars(sc) {
  const n = 6000, pos = new Float32Array(n * 3), sizes = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3, r = 300 + Math.random() * 700;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i3] = r * Math.sin(ph) * Math.cos(th);
    pos[i3+1] = r * Math.sin(ph) * Math.sin(th);
    pos[i3+2] = r * Math.cos(ph);
    sizes[i] = Math.random() * 2 + 0.3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.PointsMaterial({
    color: 0xcccccc, size: 1.2, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  bgStars = new THREE.Points(geo, mat);
  sc.add(bgStars);
}

function createMilkyWayBand(sc) {
  const n = 12000, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3, t = Math.random();
    const bandX = (t - 0.5) * 600;
    const spread = (Math.random() + Math.random() + Math.random() - 1.5) * 60;
    const spreadY = (Math.random() + Math.random() - 1) * 20;
    pos[i3] = bandX;
    pos[i3+1] = spreadY;
    pos[i3+2] = spread;
    const b = 0.5 + Math.random() * 0.5;
    col[i3] = b; col[i3+1] = b; col[i3+2] = b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  milkyWay = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.8, vertexColors: true, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  milkyWay.rotation.z = -0.3;
  milkyWay.rotation.x = 0.15;
  sc.add(milkyWay);
}

function createCentralGlow(sc) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(220,220,230,0.25)');
  g.addColorStop(0.3, 'rgba(180,180,200,0.08)');
  g.addColorStop(1, 'transparent');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  sp.scale.set(120, 120, 1);
  glowMesh = sp;
  sc.add(sp);
}

function nebulaBg3D(sc) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 2048;
  const x = c.getContext('2d');
  x.fillStyle = '#020205'; x.fillRect(0, 0, 2048, 2048);
  const clouds = [[500,500,500,8],[1200,400,400,6],[800,1000,600,10],[1500,1200,450,5],[300,1400,500,7]];
  clouds.forEach(([cx,cy,r,b]) => {
    const g = x.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0, `rgba(${b*2},${b*2},${b*3},0.12)`);
    g.addColorStop(1, 'transparent');
    x.fillStyle = g; x.fillRect(0, 0, 2048, 2048);
  });
  for (let i = 0; i < 3000; i++) {
    const sx = Math.random()*2048, sy = Math.random()*2048, sz = Math.random()*1.5+0.2;
    const br = Math.random()*0.6+0.2;
    x.beginPath(); x.arc(sx, sy, sz, 0, Math.PI*2);
    x.fillStyle = `rgba(${180+br*60},${180+br*60},${190+br*60},${br})`; x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  sc.background = t;
}

const onClick5 = () => { if (dragMoved) return; };
const onMD5 = e => { dragging = true; dragMoved = false; lastMX = e.clientX; lastMY = e.clientY; };
const onMM5 = e => {
  if (!dragging) return;
  const dx = e.clientX - lastMX, dy = e.clientY - lastMY;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved = true;
  camAngleX -= dx * 0.005; camAngleY = Math.max(0.05, Math.min(1.5, camAngleY + dy * 0.005));
  lastMX = e.clientX; lastMY = e.clientY;
};
const onMU5 = () => { if (dragMoved) setTimeout(() => { dragging = false; }, 50); else dragging = false; };
const onWh5 = e => { e.preventDefault(); targetDist += e.deltaY * 0.15; targetDist = Math.max(30, Math.min(600, targetDist)); };
const onRz5 = () => { if (!renderer || !camera) return; camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };

function animate() {
  animId = requestAnimationFrame(animate);
  const dt = clock.getDelta();
  elapsedTime += dt;
  if (bgStars) bgStars.rotation.y += dt * 0.003;
  if (milkyWay) milkyWay.rotation.y += dt * 0.005;
  if (glowMesh) glowMesh.material.opacity = 0.6 + Math.sin(elapsedTime * 0.4) * 0.15;
  currentDist += (targetDist - currentDist) * 0.05;
  camera.position.set(
    Math.sin(camAngleX) * Math.cos(camAngleY) * currentDist,
    Math.sin(camAngleY) * currentDist,
    Math.cos(camAngleX) * Math.cos(camAngleY) * currentDist
  );
  camera.lookAt(0, 0, 0);
  if (colorTint) {
    if (!scene.fog) scene.fog = new THREE.FogExp2(colorTint, 0.0008);
    else scene.fog.color.set(colorTint);
  } else if (scene.fog) {
    scene.fog = null;
  }
  renderer.render(scene, camera);
}

export function setChapter5Color(hex) { colorTint = hex; }

export function initChapter5(container) {
  colorTint = null; camAngleX = 0; camAngleY = 0.3; targetDist = 180; currentDist = 180; elapsedTime = 0;
  clock = new THREE.Clock(); scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 10000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);
  nebulaBg3D(scene); createBgStars(scene); createMilkyWayBand(scene); createCentralGlow(scene);
  scene.add(new THREE.AmbientLight(0x222233, 0.5));
  const hint = document.getElementById('hint-text');
  if (hint) { hint.textContent = '黑白星河 · 永恒闪烁'; hint.style.opacity = '1';
    setTimeout(() => { hint.style.opacity = '0'; setTimeout(() => { hint.textContent = ''; }, 800); }, 1500);
  }
  renderer.domElement.addEventListener('click', onClick5);
  renderer.domElement.addEventListener('mousedown', onMD5);
  window.addEventListener('mousemove', onMM5);
  window.addEventListener('mouseup', onMU5);
  renderer.domElement.addEventListener('wheel', onWh5, { passive: false });
  window.addEventListener('resize', onRz5);
  animate();
}

export function destroyChapter5() {
  if (animId) cancelAnimationFrame(animId); animId = null;
  renderer?.domElement?.removeEventListener('click', onClick5);
  renderer?.domElement?.removeEventListener('mousedown', onMD5);
  window.removeEventListener('mousemove', onMM5);
  window.removeEventListener('mouseup', onMU5);
  renderer?.domElement?.removeEventListener('wheel', onWh5);
  window.removeEventListener('resize', onRz5);
  renderer?.dispose(); scene = null; camera = null; renderer = null;
  colorTint = null;
  const h = document.getElementById('hint-text'); if (h) { h.textContent = ''; h.style.opacity = '0'; }
}
