import * as THREE from 'three';
let renderer, scene, camera, animId, clock, dustParticles, sun, sunLight, hintEl;
let isPaused = false, elapsedTime = 0, planets = [];
let targetDist = 220, currentDist = 220, camAngleX = 0, camAngleY = 0.35;
let dragging = false, dragMoved = false, lastMX = 0, lastMY = 0;

const PD = [
  { name:'水星', r:1.2, d:28, sp:4.15, tilt:0.03,  id:'mercury' },
  { name:'金星', r:2.0, d:38, sp:1.62, tilt:2.64,  id:'venus' },
  { name:'地球', r:2.1, d:52, sp:1.0,  tilt:0.41,  id:'earth', atmo:true },
  { name:'火星', r:1.6, d:68, sp:0.53, tilt:0.44,  id:'mars' },
  { name:'木星', r:5.5, d:100,sp:0.084,tilt:0.05,  id:'jupiter' },
  { name:'土星', r:4.8, d:135,sp:0.034,tilt:0.47,  id:'saturn', ring:true },
  { name:'天王星',r:3.2, d:170,sp:0.012,tilt:1.71,  id:'uranus' },
  { name:'海王星',r:3.0, d:200,sp:0.006,tilt:0.49,  id:'neptune' },
];

function nebulaBg(sc) {
  const c = document.createElement('canvas'); c.width=2048; c.height=2048;
  const x = c.getContext('2d');
  x.fillStyle='#020818'; x.fillRect(0,0,2048,2048);
  [[400,400,600,[30,60,200,.15]],[1200,300,500,[120,40,200,.12]],[800,800,700,[20,120,220,.18]],
   [1500,1000,550,[200,60,140,.1]],[300,1200,450,[40,180,220,.14]],[1000,1500,600,[80,30,180,.12]],
   [600,600,800,[0,200,240,.08]],[1400,700,500,[220,120,60,.08]]].forEach(([cx,cy,r,co])=>{
    const g=x.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0,`rgba(${co[0]},${co[1]},${co[2]},${co[3]})`);
    g.addColorStop(1,'transparent');
    x.fillStyle=g; x.fillRect(0,0,2048,2048);
  });
  for(let i=0;i<4000;i++){
    const sx=Math.random()*2048,sy=Math.random()*2048,sz=Math.random()*1.8+.2,br=Math.random()*.8+.2;
    x.beginPath(); x.arc(sx,sy,sz,0,Math.PI*2);
    const h=Math.random()>.7?210+Math.random()*40:40+Math.random()*20;
    x.fillStyle=`hsla(${h},70%,${70+br*30}%,${br})`; x.fill();
  }
  const t=new THREE.CanvasTexture(c); t.mapping=THREE.EquirectangularReflectionMapping; sc.background=t;
}

function mkDust(sc) {
  const n=5000,pos=new Float32Array(n*3),col=new Float32Array(n*3);
  for(let i=0;i<n;i++){const i3=i*3,r=Math.random()*500,th=Math.random()*Math.PI*2,ph=Math.random()*Math.PI;
    pos[i3]=r*Math.sin(ph)*Math.cos(th);pos[i3+1]=(Math.random()-.5)*200;pos[i3+2]=r*Math.sin(ph)*Math.sin(th);
    const cc=Math.random(); col[i3]=cc<.3?.4:.6; col[i3+1]=cc<.3?.6:.4; col[i3+2]=1;}
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({size:.8,vertexColors:true,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  sc.add(pts); return pts;
}

function mkTex(id){
  const W=512,H=256,c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d');
  if(id==='mercury'){
    x.fillStyle='#b0a8a0';x.fillRect(0,0,W,H);
    for(let i=0;i<120;i++){const v=Math.random()*20-10;
      x.fillStyle=`rgba(${150+v},${140+v},${130+v},0.25)`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*40+8,Math.random()*30+6,Math.random()*Math.PI,0,Math.PI*2);x.fill();}
    for(let i=0;i<40;i++){x.fillStyle=`rgba(130,120,105,${Math.random()*0.15+0.05})`;
      x.beginPath();x.arc(Math.random()*W,Math.random()*H,Math.random()*15+3,0,Math.PI*2);x.fill();}
  } else if(id==='venus'){
    x.fillStyle='#e8dca0';x.fillRect(0,0,W,H);
    for(let i=0;i<80;i++){x.fillStyle=`rgba(235,220,160,${Math.random()*0.2+0.05})`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*60+20,Math.random()*20+5,Math.random()*Math.PI,0,Math.PI*2);x.fill();}
    x.fillStyle='rgba(255,255,240,0.12)';x.fillRect(0,0,W,H);
    for(let i=0;i<20;i++){x.fillStyle=`rgba(255,250,235,${Math.random()*0.08+0.03})`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*80+30,Math.random()*30+10,Math.random()*Math.PI,0,Math.PI*2);x.fill();}
  } else if(id==='earth'){
    x.fillStyle='#2860a8';x.fillRect(0,0,W,H);
    for(let i=0;i<60;i++){const v=Math.random()*20-10;
      x.fillStyle=`rgba(${40+v},${100+v},${175+v},0.15)`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*50+15,Math.random()*25+8,Math.random()*Math.PI,0,Math.PI*2);x.fill();}
    const lands=[[120,80,70,45],[280,140,55,30],[380,100,80,40],[100,180,50,25],[420,60,40,20]];
    lands.forEach(([lx,ly,lw,lh])=>{
      x.fillStyle='rgba(110,140,80,0.6)';x.beginPath();x.ellipse(lx,ly,lw,lh,0.2,0,Math.PI*2);x.fill();
      x.fillStyle='rgba(180,170,130,0.3)';x.beginPath();x.ellipse(lx+10,ly+5,lw*0.5,lh*0.4,0.1,0,Math.PI*2);x.fill();});
    for(let i=0;i<15;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*0.15+0.05})`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*40+15,Math.random()*10+4,Math.random()*Math.PI,0,Math.PI*2);x.fill();}
  } else if(id==='mars'){
    x.fillStyle='#c06830';x.fillRect(0,0,W,H);
    for(let i=0;i<80;i++){const v=Math.random()*25-12;
      x.fillStyle=`rgba(${190+v},${100+v},${50+v},0.2)`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*50+10,Math.random()*30+8,Math.random()*Math.PI,0,Math.PI*2);x.fill();}
    for(let i=0;i<30;i++){x.fillStyle=`rgba(${120+Math.random()*30},${90+Math.random()*20},${70+Math.random()*20},0.15)`;
      x.beginPath();x.arc(Math.random()*W,Math.random()*H,Math.random()*20+5,0,Math.PI*2);x.fill();}
  } else if(id==='jupiter'){
    const bands=[[0,.08,'#c89858'],[.08,.18,'#e0c890'],[.18,.28,'#d0a060'],[.28,.38,'#e8d8b0'],[.38,.48,'#c89050'],
      [.48,.55,'#b07838'],[.55,.65,'#e0c080'],[.65,.75,'#d8b070'],[.75,.85,'#e8d8b0'],[.85,1,'#c89858']];
    bands.forEach(([y0,y1,col])=>{x.fillStyle=col;x.fillRect(0,y0*H,W,(y1-y0)*H);});
    for(let i=0;i<40;i++){const v=Math.random()*20-10;
      x.fillStyle=`rgba(${210+v},${180+v},${120+v},0.12)`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*80+30,Math.random()*6+2,0,0,Math.PI*2);x.fill();}
    x.fillStyle='rgba(180,80,60,0.35)';x.beginPath();x.ellipse(350,H*0.55,22,14,0.1,0,Math.PI*2);x.fill();
    x.fillStyle='rgba(160,60,40,0.2)';x.beginPath();x.ellipse(350,H*0.55,16,10,0.1,0,Math.PI*2);x.fill();
  } else if(id==='saturn'){
    const bands=[[0,.1,'#d8c888'],[.1,.25,'#e8d8a8'],[.25,.4,'#d0c080'],[.4,.55,'#e0d0a0'],
      [.55,.7,'#c8b878'],[.7,.85,'#e8d8b0'],[.85,1,'#d0c088']];
    bands.forEach(([y0,y1,col])=>{x.fillStyle=col;x.fillRect(0,y0*H,W,(y1-y0)*H);});
    for(let i=0;i<30;i++){const v=Math.random()*15-7;
      x.fillStyle=`rgba(${220+v},${210+v},${170+v},0.1)`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*70+20,Math.random()*4+1,0,0,Math.PI*2);x.fill();}
  } else if(id==='uranus'){
    x.fillStyle='#a0d0d8';x.fillRect(0,0,W,H);
    for(let i=0;i<60;i++){x.fillStyle=`rgba(${170+Math.random()*20},${215+Math.random()*15},${220+Math.random()*15},0.08)`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*50+15,Math.random()*25+8,Math.random()*Math.PI,0,Math.PI*2);x.fill();}
    x.fillStyle='rgba(200,230,235,0.06)';x.fillRect(0,0,W,H);
  } else if(id==='neptune'){
    x.fillStyle='#2838a0';x.fillRect(0,0,W,H);
    for(let i=0;i<12;i++){const y0=(i/12)*H;
      x.fillStyle=i%2===0?'rgba(50,65,180,0.2)':'rgba(70,100,200,0.15)';
      x.fillRect(0,y0,W,H/12);}
    for(let i=0;i<40;i++){x.fillStyle=`rgba(${60+Math.random()*30},${80+Math.random()*40},${180+Math.random()*30},0.1)`;
      x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,Math.random()*60+20,Math.random()*5+2,0,0,Math.PI*2);x.fill();}
  }
  return new THREE.CanvasTexture(c);
}

function mkRingTex(){
  const c=document.createElement('canvas');c.width=512;c.height=64;const x=c.getContext('2d');
  // Saturn ring: bands of ice and rock - light gray, white, warm beige
  const bands=[[0,.15,'rgba(200,195,180,0.6)'],[.15,.25,'rgba(220,215,200,0.4)'],[.25,.35,'rgba(180,175,165,0.55)'],
    [.35,.5,'rgba(210,205,190,0.5)'],[.5,.6,'rgba(190,185,175,0.35)'],[.6,.75,'rgba(215,210,195,0.5)'],
    [.75,.85,'rgba(200,195,185,0.3)'],[.85,1,'rgba(180,175,168,0.2)']];
  bands.forEach(([y0,y1,col])=>{x.fillStyle=col;x.fillRect(0,y0*64,512,(y1-y0)*64);});
  for(let i=0;i<200;i++){x.fillStyle=`rgba(${210+Math.random()*30},${205+Math.random()*30},${190+Math.random()*30},${Math.random()*0.1})`;
    x.fillRect(Math.random()*512,Math.random()*64,Math.random()*20+2,1);}
  return new THREE.CanvasTexture(c);
}

function mkLabel(t){
  const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');
  x.fillStyle='rgba(255,255,255,.7)';x.font='22px serif';x.textAlign='center';x.fillText(t,128,40);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));
  sp.scale.set(14,3.5,1);return sp;
}

function buildSystem(sc){
  const sg=new THREE.Group();
  sg.add(new THREE.Mesh(new THREE.SphereGeometry(12,64,64),new THREE.MeshBasicMaterial({color:0xffcc33})));
  sg.add(new THREE.Mesh(new THREE.SphereGeometry(15,32,32),new THREE.MeshBasicMaterial({color:0xffaa00,transparent:true,opacity:.25,side:THREE.BackSide})));
  sg.add(new THREE.Mesh(new THREE.SphereGeometry(18,32,32),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.08,side:THREE.BackSide})));
  sc.add(sg); sun=sg;
  sunLight=new THREE.PointLight(0xfff5e0,2.5,1000); sc.add(sunLight);
  sc.add(new THREE.PointLight(0xffaa44,.8,300)); sc.add(new THREE.AmbientLight(0x334466,.4));

  planets=[];
  const emMap={mercury:0x1a1a18,venus:0x2a2510,earth:0x0a1830,mars:0x201008,jupiter:0x201a08,saturn:0x201a08,uranus:0x0a1820,neptune:0x080a20};
  const roughMap={mercury:.95,venus:.8,earth:.6,mars:.85,jupiter:.7,saturn:.7,uranus:.65,neptune:.65};
  PD.forEach((d,idx)=>{
    const grp=new THREE.Group(),tex=mkTex(d.id);
    const em=emMap[d.id]||0x111111,rough=roughMap[d.id]||.75;
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(d.r,48,48),new THREE.MeshStandardMaterial({map:tex,emissive:em,emissiveIntensity:.1,roughness:rough,metalness:.08}));
    mesh.rotation.z=d.tilt; grp.add(mesh);
    if(d.atmo){grp.add(new THREE.Mesh(new THREE.SphereGeometry(d.r*1.08,48,48),new THREE.MeshBasicMaterial({color:0x88bbee,transparent:true,opacity:.08})));}
    if(d.ring){
      const ringTex=mkRingTex();
      const rg=new THREE.Mesh(new THREE.RingGeometry(d.r*1.4,d.r*2.2,64),new THREE.MeshBasicMaterial({map:ringTex,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}));
      rg.rotation.x=-Math.PI/2+d.tilt; grp.add(rg);
    }
    const oP=[];for(let i=0;i<=128;i++){const a=(i/128)*Math.PI*2;oP.push(Math.cos(a)*d.d,0,Math.sin(a)*d.d);}
    const oG=new THREE.BufferGeometry();oG.setAttribute('position',new THREE.Float32BufferAttribute(oP,3));
    sc.add(new THREE.LineLoop(oG,new THREE.LineBasicMaterial({color:0x4466aa,transparent:true,opacity:.1})));
    const lb=mkLabel(d.name);lb.position.y=d.r+3;grp.add(lb);
    const sa=Math.random()*Math.PI*2;grp.position.x=Math.cos(sa)*d.d;grp.position.z=Math.sin(sa)*d.d;
    sc.add(grp); planets.push({group:grp,mesh,data:d,angle:sa});
  });
}

const onClick=()=>{if(dragMoved)return;isPaused=!isPaused;if(hintEl)hintEl.textContent=isPaused?'点击继续':'点击暂停 · 拖拽旋转 · 滚轮缩放';};
const onMD=e=>{dragging=true;dragMoved=false;lastMX=e.clientX;lastMY=e.clientY;};
const onMM=e=>{if(!dragging)return;const dx=e.clientX-lastMX,dy=e.clientY-lastMY;if(Math.abs(dx)>2||Math.abs(dy)>2)dragMoved=true;
  camAngleX-=dx*.005;camAngleY=Math.max(.05,Math.min(1.5,camAngleY+dy*.005));lastMX=e.clientX;lastMY=e.clientY;};
const onMU=()=>{if(dragMoved)setTimeout(()=>{dragging=false;},50);else dragging=false;};
const onWh=e=>{e.preventDefault();targetDist+=e.deltaY*.15;targetDist=Math.max(40,Math.min(500,targetDist));};
const onRz=()=>{if(!renderer||!camera)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};

function animate(){
  animId=requestAnimationFrame(animate);const dt=clock.getDelta();if(!isPaused)elapsedTime+=dt;
  if(!isPaused){planets.forEach(p=>{p.angle+=p.data.sp*dt*.3;p.group.position.x=Math.cos(p.angle)*p.data.d;p.group.position.z=Math.sin(p.angle)*p.data.d;p.mesh.rotation.y+=dt*.5;});
    sun.scale.setScalar(1+Math.sin(elapsedTime*2)*.02);sunLight.intensity=2.5+Math.sin(elapsedTime*3)*.3;dustParticles.rotation.y+=dt*.008;}
  currentDist+=(targetDist-currentDist)*.05;
  camera.position.set(Math.sin(camAngleX)*Math.cos(camAngleY)*currentDist,Math.sin(camAngleY)*currentDist,Math.cos(camAngleX)*Math.cos(camAngleY)*currentDist);
  camera.lookAt(0,0,0); renderer.render(scene,camera);
}

export function initChapter1(container){
  isPaused=false;elapsedTime=0;targetDist=220;currentDist=220;camAngleX=0;camAngleY=.35;
  clock=new THREE.Clock();scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,10000);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);
  nebulaBg(scene);dustParticles=mkDust(scene);buildSystem(scene);
  hintEl=document.getElementById('hint-text');if(hintEl){hintEl.textContent='点击暂停 · 拖拽旋转 · 滚轮缩放';hintEl.style.opacity='1';setTimeout(()=>{hintEl.style.opacity='0';setTimeout(()=>{hintEl.textContent='';},800);},1500);}
  renderer.domElement.addEventListener('click',onClick);
  renderer.domElement.addEventListener('mousedown',onMD);
  window.addEventListener('mousemove',onMM);window.addEventListener('mouseup',onMU);
  renderer.domElement.addEventListener('wheel',onWh,{passive:false});
  window.addEventListener('resize',onRz);animate();
}

export function destroyChapter1(){
  if(animId)cancelAnimationFrame(animId);animId=null;
  renderer?.domElement?.removeEventListener('click',onClick);
  renderer?.domElement?.removeEventListener('mousedown',onMD);
  window.removeEventListener('mousemove',onMM);window.removeEventListener('mouseup',onMU);
  renderer?.domElement?.removeEventListener('wheel',onWh);
  window.removeEventListener('resize',onRz);
  renderer?.dispose();scene=null;camera=null;renderer=null;planets=[];
  const h=document.getElementById('hint-text');if(h){h.textContent='';h.style.opacity='0';}
}
