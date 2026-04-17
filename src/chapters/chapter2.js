// ─── Chapter 2: Four Seasons - Realistic sky, nature, smooth transitions ───
let canvas, ctx, animId, time = 0;
let stars = [], particles = [], grassBlades = [], flowers = [];

const seasons = [
  { name:'spring',
    sky:[[120,160,220],[180,210,245],[230,235,240],[245,230,220]],
    sun:[255,220,180], sunY:0.22, sunOp:0.9,
    ground:[[90,145,60],[65,120,45]], grass:[80,170,55],
    foliage:[[230,180,190],[255,200,210],[255,170,180]],
    trunk:[75,55,35], flower:[[255,180,200],[255,150,180],[255,220,230],[240,200,255]],
    dust:[255,200,210], dustOp:0.2, cloudOp:0.5
  },
  { name:'summer',
    sky:[[40,120,200],[80,170,240],[160,210,250],[200,230,245]],
    sun:[255,240,200], sunY:0.12, sunOp:1.0,
    ground:[[50,130,35],[35,100,25]], grass:[55,150,40],
    foliage:[[40,140,45],[55,160,55],[30,120,35]],
    trunk:[65,48,30], flower:[[255,100,100],[255,200,50],[255,255,120],[200,100,255]],
    dust:[150,220,255], dustOp:0.08, cloudOp:0.3
  },
  { name:'autumn',
    sky:[[60,80,130],[140,120,100],[200,160,100],[220,180,130]],
    sun:[255,200,120], sunY:0.25, sunOp:0.7,
    ground:[[120,90,45],[100,75,35]], grass:[140,110,50],
    foliage:[[220,140,30],[200,80,20],[240,180,50]],
    trunk:[80,55,30], flower:[[200,120,40],[180,100,30]],
    dust:[220,160,60], dustOp:0.25, cloudOp:0.35
  },
  { name:'winter',
    sky:[[80,100,140],[140,155,180],[190,200,215],[210,215,225]],
    sun:[220,220,230], sunY:0.3, sunOp:0.4,
    ground:[[200,210,220],[180,190,200]], grass:[190,200,210],
    foliage:[[180,185,195],[190,195,205],[170,175,185]],
    trunk:[90,70,50], flower:[],
    dust:[230,235,245], dustOp:0.35, cloudOp:0.55
  },
];

const CYCLE = 28;
function lerp(a,b,t){return a+(b-a)*t;}
function lC(a,b,t){return a.map((_,i)=>lerp(a[i],b[i],t));}
function fl(a){return a.map(v=>Math.floor(v));}
function rgb(c){return `rgb(${fl(c)})`;}
function rgba(c,a){return `rgba(${fl(c)},${a})`;}

function getSeason(t){
  const phase=(t%CYCLE)/CYCLE;
  const idx=phase*4;
  const from=Math.floor(idx)%4, to=(from+1)%4;
  const smooth=(1-Math.cos((idx-Math.floor(idx))*Math.PI))/2;
  return {from:seasons[from],to:seasons[to],t:smooth,fromIdx:from,toIdx:to};
}

function createStars(w,h){
  stars=[];
  for(let i=0;i<600;i++) stars.push({x:Math.random()*w,y:Math.random()*h*0.55,size:Math.random()*1.8+0.2,br:Math.random()*0.6+0.3,tw:Math.random()*3+1,ph:Math.random()*Math.PI*2});
}
function createGrass(w,h){
  grassBlades=[];
  const gy=h*0.78;
  for(let i=0;i<300;i++){
    grassBlades.push({x:Math.random()*w,y:gy+Math.random()*(h-gy)*0.3,h:8+Math.random()*18,sw:Math.random()*2+0.5,ph:Math.random()*Math.PI*2});
  }
}
function createFlowers(w,h){
  flowers=[];
  const gy=h*0.78;
  for(let i=0;i<40;i++){
    flowers.push({x:Math.random()*w,y:gy+Math.random()*30,size:3+Math.random()*4,ph:Math.random()*Math.PI*2,ci:Math.floor(Math.random()*4)});
  }
}
function createParticles(w,h){
  particles=[];
  for(let i=0;i<180;i++){
    particles.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.3-0.05,size:Math.random()*3.5+1,life:Math.random(),sp:Math.random()*0.5+0.5,rot:Math.random()*Math.PI*2});
  }
}

function drawSun(x,w,h,season){
  const {from,to,t}=season;
  const sc=lC(from.sun,to.sun,t);
  const sy=lerp(from.sunY,to.sunY,t)*h;
  const op=lerp(from.sunOp,to.sunOp,t);
  const r=40+Math.sin(time*0.3)*3;
  const g1=x.createRadialGradient(w*0.75,sy,0,w*0.75,sy,r*4);
  g1.addColorStop(0,rgba(sc,op*0.3));g1.addColorStop(0.3,rgba(sc,op*0.08));g1.addColorStop(1,'transparent');
  x.fillStyle=g1;x.fillRect(0,0,w,h);
  const g2=x.createRadialGradient(w*0.75,sy,0,w*0.75,sy,r);
  g2.addColorStop(0,rgba([255,255,240],op*0.9));g2.addColorStop(0.7,rgba(sc,op*0.4));g2.addColorStop(1,'transparent');
  x.fillStyle=g2;x.beginPath();x.arc(w*0.75,sy,r,0,Math.PI*2);x.fill();
}

function drawClouds(x,w,h,season){
  const {from,to,t}=season;
  const op=lerp(from.cloudOp,to.cloudOp,t);
  const clouds=[[0.12,0.15,90],[0.35,0.12,70],[0.6,0.2,100],[0.82,0.1,60],[0.25,0.28,55]];
  clouds.forEach(([cx,cy,r],i)=>{
    const px=((cx+time*0.003*(i%2===0?1:-0.7))%1.3-0.15)*w;
    const py=cy*h+Math.sin(time*0.2+i)*5;
    for(let j=0;j<4;j++){
      const ox=(j-1.5)*r*0.55, oy=Math.sin(j*1.2)*r*0.15;
      const cr=r*(0.6+j*0.1);
      const g=x.createRadialGradient(px+ox,py+oy,0,px+ox,py+oy,cr);
      g.addColorStop(0,`rgba(255,255,255,${op*0.4})`);g.addColorStop(0.6,`rgba(245,248,255,${op*0.15})`);g.addColorStop(1,'transparent');
      x.fillStyle=g;x.fillRect(px+ox-cr,py+oy-cr,cr*2,cr*2);
    }
  });
}

function drawTree(x,tx,baseY,th,season,idx){
  const {from,to,t}=season;
  const fc=from.foliage.map((c,i)=>lC(c,to.foliage[Math.min(i,to.foliage.length-1)],t));
  // Pulsating breath: expand from small solid center → large glow → shrink back
  const speed=0.4+idx*0.07;
  const phase=(time*speed+idx*1.7)%Math.PI;
  const breath=Math.sin(phase); // 0→1→0
  const maxR=th*0.45;
  const curR=4+breath*maxR; // min 4px solid, max expands out
  const cy=baseY-th*0.5;
  // Determine colors: inner=dark, outer=light (season-based)
  const cInner=fc[0].map(v=>Math.floor(v*0.45));
  const cOuter=fc[fc.length-1].map(v=>Math.min(255,Math.floor(v*1.2)));
  const foliageOp=from.name==='winter'?lerp(0.2,0.55,t):
                  to.name==='winter'?lerp(0.55,0.2,t):0.6;
  // Outer glow ring (light, expands)
  if(curR>6){
    const g2=x.createRadialGradient(tx,cy,curR*0.3,tx,cy,curR);
    g2.addColorStop(0,rgba(cOuter,foliageOp*0.35*breath));
    g2.addColorStop(0.6,rgba(cOuter,foliageOp*0.15*breath));
    g2.addColorStop(1,'transparent');
    x.fillStyle=g2;x.beginPath();x.arc(tx,cy,curR,0,Math.PI*2);x.fill();
  }
  // Mid ring
  const midR=curR*0.55;
  if(midR>3){
    const cMid=fc[Math.min(1,fc.length-1)];
    const gm=x.createRadialGradient(tx,cy,midR*0.2,tx,cy,midR);
    gm.addColorStop(0,rgba(cMid,foliageOp*0.5));
    gm.addColorStop(1,rgba(cMid,foliageOp*0.1));
    x.fillStyle=gm;x.beginPath();x.arc(tx,cy,midR,0,Math.PI*2);x.fill();
  }
}

function drawGrass(x,w,h,season){
  const {from,to,t}=season;
  const gc=lC(from.grass,to.grass,t);
  grassBlades.forEach(g=>{
    const sway=Math.sin(time*1.5+g.ph+g.x*0.01)*g.h*0.15;
    x.strokeStyle=rgba(gc,0.5+Math.random()*0.2);
    x.lineWidth=g.sw;x.beginPath();x.moveTo(g.x,g.y);
    x.quadraticCurveTo(g.x+sway*0.5,g.y-g.h*0.5,g.x+sway,g.y-g.h);
    x.stroke();
  });
}

function drawFlowers(x,w,h,season){
  const {from,to,t}=season;
  const ff=from.flower,tf=to.flower;
  if(ff.length===0&&tf.length===0)return;
  const op=from.name==='winter'?lerp(0,0.7,t):to.name==='winter'?lerp(0.7,0,t):0.7;
  if(op<0.05)return;
  flowers.forEach(f=>{
    const cols=ff.length>0?ff:tf;
    const c=cols[f.ci%cols.length]||[255,200,200];
    const tc2=tf.length>0?tf:ff;
    const c2=tc2[f.ci%tc2.length]||c;
    const fc=lC(c,c2,t);
    const sway=Math.sin(time*1.2+f.ph)*2;
    const petalCount=5;
    for(let p=0;p<petalCount;p++){
      const a=(p/petalCount)*Math.PI*2+Math.sin(time*0.5+f.ph)*0.1;
      const px=f.x+sway+Math.cos(a)*f.size;
      const py=f.y+Math.sin(a)*f.size*0.7;
      x.beginPath();x.arc(px,py,f.size*0.45,0,Math.PI*2);
      x.fillStyle=rgba(fc,op);x.fill();
    }
    x.beginPath();x.arc(f.x+sway,f.y,f.size*0.25,0,Math.PI*2);
    x.fillStyle=rgba([255,240,150],op*0.8);x.fill();
  });
}

function draw(){
  if(!canvas||!ctx)return;
  const w=canvas.width,h=canvas.height;
  time+=0.016;
  const season=getSeason(time);
  const {from,to,t}=season;

  // Sky gradient - 4 stops for realistic horizon
  const grad=ctx.createLinearGradient(0,0,0,h*0.8);
  for(let i=0;i<4;i++){
    const c=lC(from.sky[i],to.sky[i],t);
    grad.addColorStop(i/3,rgb(c));
  }
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);

  // Stars (visible mainly at night/dim)
  const starOp=lerp(from.name==='winter'?0.25:from.name==='summer'?0.05:0.15,
                     to.name==='winter'?0.25:to.name==='summer'?0.05:0.15,t);
  if(starOp>0.03){
    stars.forEach(s=>{
      const tw=0.5+Math.sin(time*s.tw+s.ph)*0.35;
      const a=s.br*tw*starOp;
      ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,240,${a})`;ctx.fill();
    });
  }

  // Sun
  drawSun(ctx,w,h,season);

  // Clouds
  drawClouds(ctx,w,h,season);

  // Milky way (subtle)
  ctx.save();ctx.globalAlpha=0.03+Math.sin(time*0.2)*0.008;
  ctx.translate(w/2,h*0.3);ctx.rotate(-0.25+time*0.001);
  const mwg=ctx.createLinearGradient(-w,0,w,0);
  mwg.addColorStop(0,'transparent');mwg.addColorStop(0.4,'rgba(200,200,220,0.3)');
  mwg.addColorStop(0.5,'rgba(220,220,240,0.4)');mwg.addColorStop(0.6,'rgba(200,200,220,0.3)');
  mwg.addColorStop(1,'transparent');ctx.fillStyle=mwg;ctx.fillRect(-w,-h*0.06,w*2,h*0.12);
  ctx.restore();

  // Ground
  const gy=h*0.78;
  const g1=lC(from.ground[0],to.ground[0],t), g2=lC(from.ground[1],to.ground[1],t);
  const gg=ctx.createLinearGradient(0,gy,0,h);
  gg.addColorStop(0,rgba(g1,0.9));gg.addColorStop(0.4,rgba(g2,0.95));gg.addColorStop(1,rgba(g2.map(v=>v*0.5),1));
  ctx.fillStyle=gg;ctx.fillRect(0,gy,w,h-gy);

  // Rolling hills
  ctx.beginPath();ctx.moveTo(0,gy+10);
  for(let i=0;i<=w;i+=2){ctx.lineTo(i,gy+Math.sin(i*0.008+1)*8+Math.sin(i*0.015)*4);}
  ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
  ctx.fillStyle=rgba(g1,0.3);ctx.fill();

  // Grass
  drawGrass(ctx,w,h,season);

  // Trees
  const trees=[[0.1,140],[0.25,170],[0.42,190],[0.58,175],[0.75,155],[0.9,135]];
  trees.forEach(([px,th],i)=>{drawTree(ctx,w*px,gy+5,th,season,i);});

  // Flowers
  drawFlowers(ctx,w,h,season);

  // Particles (petals/leaves/snow)
  const dc=lC(from.dust,to.dust,t);
  const dop=lerp(from.dustOp,to.dustOp,t);
  particles.forEach(p=>{
    p.x+=p.vx*p.sp;p.y+=p.vy*p.sp;
    if(from.name==='winter'||to.name==='winter'){p.x+=Math.sin(time+p.life*10)*0.4*t;p.vy=Math.abs(p.vy)*0.4;}
    if(from.name==='autumn'||to.name==='autumn'){p.x+=Math.sin(time*0.7+p.life*5)*0.6;p.vy=Math.abs(p.vy)*0.25;p.rot+=0.02;}
    if(from.name==='spring'||to.name==='spring'){p.vy=-Math.abs(p.vy)*0.15;p.x+=Math.sin(time*0.6+p.life*8)*0.3;}
    if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;if(p.y<-10)p.y=h+10;if(p.y>h+10)p.y=-10;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot||0);
    if(from.name==='autumn'||to.name==='autumn'){
      ctx.beginPath();ctx.ellipse(0,0,p.size,p.size*0.5,0,0,Math.PI*2);
    } else {
      ctx.beginPath();ctx.arc(0,0,p.size*0.7,0,Math.PI*2);
    }
    ctx.fillStyle=rgba(dc,dop*(0.3+p.life*0.4));ctx.fill();ctx.restore();
  });

  // Season label
  const labels={spring:'春',summer:'夏',autumn:'秋',winter:'冬'};
  const labelOp=0.08+Math.sin(time*0.5)*0.03;
  ctx.fillStyle=`rgba(255,255,255,${labelOp})`;ctx.font='80px "Noto Serif SC",serif';ctx.textAlign='center';
  ctx.fillText(labels[from.name],w/2,h*0.5);

  animId=requestAnimationFrame(draw);
}

const onRz=()=>{if(canvas){canvas.width=innerWidth;canvas.height=innerHeight;createStars(innerWidth,innerHeight);createGrass(innerWidth,innerHeight);createFlowers(innerWidth,innerHeight);}};

export function initChapter2(container){
  time=0;
  canvas=document.createElement('canvas');canvas.width=innerWidth;canvas.height=innerHeight;
  canvas.style.cssText='position:absolute;top:0;left:0;';
  container.appendChild(canvas);ctx=canvas.getContext('2d');
  createStars(canvas.width,canvas.height);createParticles(canvas.width,canvas.height);
  createGrass(canvas.width,canvas.height);createFlowers(canvas.width,canvas.height);
  window.addEventListener('resize',onRz);
  const h=document.getElementById('hint-text');
  if(h){h.textContent='春 · 夏 · 秋 · 冬 — 四季轮回';h.style.opacity='1';setTimeout(()=>{h.style.opacity='0';setTimeout(()=>{h.textContent='';},800);},1500);}
  draw();
}

export function destroyChapter2(){
  if(animId)cancelAnimationFrame(animId);animId=null;
  window.removeEventListener('resize',onRz);
  canvas=null;ctx=null;
  const h=document.getElementById('hint-text');if(h){h.textContent='';h.style.opacity='0';}
}
