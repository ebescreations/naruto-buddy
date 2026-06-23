(function(){
const stage=document.getElementById('stage'),cv=document.getElementById('cv');
const lbl=document.getElementById('lbl'),stEl=document.getElementById('st');
const jutsuBar=document.getElementById('jutsu-bar');
const ctx=cv.getContext('2d');
let W,H;
function resize(){W=stage.offsetWidth;H=stage.offsetHeight;cv.width=W;cv.height=H;}
resize();window.addEventListener('resize',()=>{resize();mX=Math.min(Math.max(60,mX),W-60);});

let frame=0,state='idle',sTimer=180,wDir=1;
let mX=0,legSw=0,armWv=0,breath=0,headB=0,eyeCl=0,blinkT=0,mSmile=0,lookD=0,lookT=0,strArm=0;
let zzs=[],zzT=0,zzI=0;
let particles=[],clones=[],hearts=[];
let jutsu=null,sageMode=false,sagePulse=0;
let rasenganCharge=0,rasenganActive=false;
let sexyPhaseLocal=0;
let sharinganActive=false,sharinganPulse=0;
let chidoriActive=false,chidoriCharge=0;
let susanooActive=false,susanooPulse=0;
let healActive=false,healPulse=0;
let gatesActive=false,gatesPulse=0;
let currentChar='naruto';

const CHARS={
  naruto:{label:'🍥 Naruto',color:'#FFD700',jutsu:[
    {id:'clone',label:'🌀 Shadow Clone',bg:'#FFD700',color:'#333'},
    {id:'rasengan',label:'💙 Rasengan',bg:'#4AAFFF',color:'#003'},
    {id:'sage',label:'🟠 Sage Mode',bg:'#FF6B35',color:'#fff'},
    {id:'sexy',label:'💕 Sexy Jutsu',bg:'#FF69B4',color:'#fff'}
  ]},
  sasuke:{label:'⚡ Sasuke',color:'#AA88FF',jutsu:[
    {id:'sharingan',label:'👁 Sharingan',bg:'#CC2222',color:'#fff'},
    {id:'chidori',label:'⚡ Chidori',bg:'#88CCFF',color:'#001'},
    {id:'susanoo',label:'💜 Susanoo',bg:'#6622AA',color:'#fff'}
  ]},
  sakura:{label:'🌸 Sakura',color:'#FF88BB',jutsu:[
    {id:'punch',label:'💥 Cherry Blossom Impact',bg:'#E05080',color:'#fff'},
    {id:'heal',label:'💚 Healing Jutsu',bg:'#22AA66',color:'#fff'},
    {id:'summon',label:'🐌 Summon Katsuyu',bg:'#5588AA',color:'#fff'}
  ]},
  kakashi:{label:'📖 Kakashi',color:'#88CCFF',jutsu:[
    {id:'lightning',label:'⚡ Lightning Blade',bg:'#66AAFF',color:'#001'},
    {id:'sharingan',label:'👁 Sharingan',bg:'#CC2222',color:'#fff'},
    {id:'kamui',label:'🌀 Kamui',bg:'#334466',color:'#fff'}
  ]},
  lee:{label:'🥊 Rock Lee',color:'#88FF99',jutsu:[
    {id:'gates',label:'🔥 Eight Gates',bg:'#CC4400',color:'#fff'},
    {id:'dynamic',label:'🥊 Dynamic Entry',bg:'#228833',color:'#fff'},
    {id:'lotus',label:'🌀 Primary Lotus',bg:'#886600',color:'#fff'}
  ]}
};

// ── Particles ──
function addSmoke(x,y,n,big){for(let i=0;i<(n||8);i++)particles.push({type:'smoke',x:x+(Math.random()-0.5)*70,y:y-Math.random()*20,vx:(Math.random()-0.5)*1.5,vy:-(0.4+Math.random()*1.8),r:(big?30:16)+Math.random()*20,life:1,decay:0.016});}
function addSpark(x,y,color,n){for(let i=0;i<(n||12);i++){const a=Math.random()*Math.PI*2,s=3+Math.random()*8;particles.push({type:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:4+Math.random()*6,life:1,color,decay:0.03});}}
function addHeart(x,y){hearts.push({x:x+(Math.random()-0.5)*40,y,vy:1.5+Math.random()*1.5,life:1,size:10+Math.random()*14,drift:(Math.random()-0.5)*0.8});}
function addHeal(x,y){if(Math.random()<0.3)particles.push({type:'spark',x:x+(Math.random()-0.5)*30,y:y-Math.random()*60,vx:(Math.random()-0.5)*1,vy:-(1+Math.random()*2),r:4+Math.random()*5,life:1,color:'#44FF88',decay:0.015});}
function drawHeart(x,y,s,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y+s*0.3);ctx.bezierCurveTo(x,y,x-s*0.6,y,x-s*0.6,y+s*0.4);ctx.bezierCurveTo(x-s*0.6,y+s*0.8,x,y+s*1.1,x,y+s*1.3);ctx.bezierCurveTo(x,y+s*1.1,x+s*0.6,y+s*0.8,x+s*0.6,y+s*0.4);ctx.bezierCurveTo(x+s*0.6,y,x,y,x,y+s*0.3);ctx.fill();}
function updateParticles(){
  particles=particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=p.decay;if(p.life<=0)return false;
    if(p.type==='smoke'){p.r+=0.9;p.vy*=0.96;const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,`rgba(220,220,220,${p.life*0.55})`);g.addColorStop(1,'rgba(180,180,180,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
    else{ctx.save();ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}
    return true;});
  hearts=hearts.filter(h=>{h.y-=h.vy;h.x+=h.drift;h.life-=0.012;if(h.life<=0)return false;ctx.save();ctx.globalAlpha=h.life;drawHeart(h.x,h.y,h.size,'#FF69B4');ctx.restore();return true;});
}
function showLabel(txt,color,dur){lbl.textContent=txt;lbl.style.color=color||'#FFD700';lbl.style.textShadow=`0 0 20px ${color||'#FFD700'}88,0 0 40px ${color||'#FFD700'}44`;lbl.style.opacity='1';clearTimeout(lbl._t);lbl._t=setTimeout(()=>{lbl.style.opacity='0';},dur||2000);}
function allBtnsDisabled(v){document.querySelectorAll('.jbtn').forEach(b=>b.disabled=v);}

// ── Base character drawing helpers ──
function baseHead(hX,hY,sk,eOpen,mOpen,irisColor,alpha){
  ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.lineCap='round';
  if(eOpen){
    [-8,8].forEach(ex=>{
      ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(hX+ex,hY,6,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=irisColor;ctx.beginPath();ctx.ellipse(hX+ex,hY+0.5,4.5,5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(hX+ex,hY+0.5,3,3.5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hX+ex-2,hY-1.5,1.5,0,Math.PI*2);ctx.fill();
    });
    ctx.strokeStyle='#111';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(hX-14,hY-5);ctx.quadraticCurveTo(hX-8,hY-8,hX-2,hY-5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(hX+2,hY-5);ctx.quadraticCurveTo(hX+8,hY-8,hX+14,hY-5);ctx.stroke();
  } else {
    ctx.strokeStyle='#111';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(hX-14,hY+1);ctx.quadraticCurveTo(hX-8,hY-4,hX-2,hY+1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(hX+2,hY+1);ctx.quadraticCurveTo(hX+8,hY-4,hX+14,hY+1);ctx.stroke();
  }
  ctx.strokeStyle='#111';ctx.lineWidth=1.5;
  if(mOpen){ctx.beginPath();ctx.moveTo(hX-5,hY+14);ctx.quadraticCurveTo(hX,hY+20,hX+5,hY+14);ctx.stroke();}
  else{ctx.beginPath();ctx.moveTo(hX-4,hY+15);ctx.quadraticCurveTo(hX,hY+18,hX+4,hY+15);ctx.stroke();}
  ctx.fillStyle='#E07070';ctx.globalAlpha=alpha*0.25;
  ctx.beginPath();ctx.ellipse(hX-13,hY+11,5,2.5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(hX+13,hY+11,5,2.5,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=alpha;
}
function baseArms(hX,aY,alR,arR,wv,st,armColor,skinColor){
  [[hX-16,0],[hX+16,1]].forEach(([ax,i])=>{
    ctx.save();ctx.translate(ax,aY);ctx.rotate((i===0?(alR-st):(arR+wv-st))*Math.PI/180);ctx.translate(-ax,-aY);
    ctx.fillStyle=armColor;ctx.beginPath();
    if(i===0){ctx.moveTo(hX-16,aY);ctx.quadraticCurveTo(hX-20,aY+15,hX-18,aY+30);ctx.quadraticCurveTo(hX-15,aY+36,hX-12,aY+30);ctx.quadraticCurveTo(hX-12,aY+15,hX-12,aY);}
    else{ctx.moveTo(hX+16,aY);ctx.quadraticCurveTo(hX+20,aY+15,hX+18,aY+30);ctx.quadraticCurveTo(hX+15,aY+36,hX+12,aY+30);ctx.quadraticCurveTo(hX+12,aY+15,hX+12,aY);}
    ctx.fill();
    ctx.fillStyle=skinColor;ctx.beginPath();ctx.ellipse(i===0?hX-15:hX+15,aY+36,6,5,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });
}
function sealPoseArms(hX,aY,armColor,skinColor){
  ctx.strokeStyle=armColor;ctx.lineWidth=9;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(hX-16,aY);ctx.quadraticCurveTo(hX-6,aY+20,hX-2,aY+30);ctx.stroke();
  ctx.beginPath();ctx.moveTo(hX+16,aY);ctx.quadraticCurveTo(hX+6,aY+20,hX+2,aY+30);ctx.stroke();
  ctx.fillStyle=skinColor;ctx.beginPath();ctx.ellipse(hX-2,aY+30,8,6,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(hX+2,aY+32,8,6,0,0,Math.PI*2);ctx.fill();
}
function baseLegs(hX,lgY,ll,lr,pantsColor,shoeColor){
  [[hX-6,ll,hX-13],[hX+6,lr,hX+2]].forEach(([pivot,rot,lx])=>{
    ctx.save();ctx.translate(pivot,lgY);ctx.rotate(rot*Math.PI/180);ctx.translate(-pivot,-lgY);
    ctx.fillStyle=pantsColor;ctx.beginPath();ctx.roundRect(lx,lgY,11,42,5);ctx.fill();
    ctx.fillStyle=shoeColor;ctx.beginPath();ctx.ellipse(lx+5.5,lgY+46,10,5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.roundRect(lx-1,lgY+38,12,10,2);ctx.fill();
    ctx.restore();
  });
}

// ── NARUTO ──
function drawNaruto(x,y,opts){
  const o=opts||{},alpha=o.alpha!=null?o.alpha:1;
  const isClone=!!o.isClone,sage=!!o.sage;
  const ll=o.ll||0,lr=o.lr||0,alR=o.alR||0,arR=o.arR||0,wv=o.wv||0,st=o.st||0;
  const eOpen=o.eOpen!==false,mOpen=!!o.mOpen,sealPose=!!o.sealPose;
  ctx.save();ctx.globalAlpha=alpha;
  const sk=isClone?'#90C0F0':'#F2B885',or=isClone?'#80A8D0':'#E06808',orD=isClone?'#507090':'#904000';
  const hr=isClone?'#C0E0FF':'#E8C020',hrD=isClone?'#80A0C0':'#9A7810';
  const iris=sage?'#FF6622':'#2A6AAA',hY=y-90,hX=x;
  // hair back
  ctx.fillStyle=hrD;ctx.beginPath();ctx.ellipse(hX,hY-6,22,20,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX-20,hY+4,7,10,0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+20,hY+4,7,10,-0.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(hX,hY,16,20,0,0,Math.PI*2);ctx.fill();
  if(sage){ctx.fillStyle='#CC5500';ctx.globalAlpha=alpha*0.7;ctx.beginPath();ctx.ellipse(hX-9,hY+6,5,3,-0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+9,hY+6,5,3,0.3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=alpha;}
  ctx.fillStyle='#5A6A7A';ctx.beginPath();ctx.roundRect(hX-17,hY-22,34,9,2);ctx.fill();ctx.fillStyle='#B8C8D8';ctx.beginPath();ctx.roundRect(hX-14,hY-21,28,7,1);ctx.fill();
  ctx.strokeStyle='#7A8A7A';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(hX,hY-17,5,3.5,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#6A7A6A';ctx.beginPath();ctx.moveTo(hX-2,hY-20);ctx.lineTo(hX,hY-14);ctx.lineTo(hX+2,hY-20);ctx.fill();
  ctx.fillStyle=hr;[[-14,-20,-20,-38,-8,-38],[-6,-22,-8,-42,2,-42],[4,-22,4,-42,12,-40],[10,-20,16,-36,20,-22]].forEach(([x1,y1,cx1,cy1,x2,y2])=>{ctx.beginPath();ctx.moveTo(hX+x1,hY+y1);ctx.quadraticCurveTo(hX+cx1,hY+cy1,hX+x2,hY+y2);ctx.lineTo(hX+x1,hY+y1);ctx.fill();});
  ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(hX-16,hY+2,4,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+16,hY+2,4,5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hX-14,hY-8);ctx.quadraticCurveTo(hX-8,hY-12,hX-3,hY-8);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+3,hY-8);ctx.quadraticCurveTo(hX+8,hY-12,hX+14,hY-8);ctx.stroke();
  baseHead(hX,hY,sk,eOpen,mOpen,iris,alpha);
  ctx.strokeStyle='#904828';ctx.lineWidth=1.3;for(let i=0;i<3;i++){const wy=hY+7+i*3.5;ctx.beginPath();ctx.moveTo(hX-18,wy);ctx.lineTo(hX-5,wy+1);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+5,wy+1);ctx.lineTo(hX+18,wy);ctx.stroke();}
  ctx.strokeStyle='#C87840';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hX-1,hY+8);ctx.quadraticCurveTo(hX+2,hY+11,hX+3,hY+9);ctx.stroke();
  if(sage){ctx.save();ctx.globalAlpha=alpha*0.28;const g=ctx.createRadialGradient(hX,hY,10,hX,hY,60);g.addColorStop(0,'rgba(255,120,0,0.5)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hX,hY,60,0,Math.PI*2);ctx.fill();ctx.restore();}
  const tY=hY+28;ctx.fillStyle=sk;ctx.beginPath();ctx.roundRect(hX-5,hY+20,10,10,2);ctx.fill();
  ctx.fillStyle=or;ctx.beginPath();ctx.moveTo(hX-16,tY);ctx.quadraticCurveTo(hX-18,tY+25,hX-14,tY+50);ctx.lineTo(hX+14,tY+50);ctx.quadraticCurveTo(hX+18,tY+25,hX+16,tY);ctx.closePath();ctx.fill();
  ctx.fillStyle=orD;ctx.beginPath();ctx.moveTo(hX-5,tY);ctx.lineTo(hX,tY+12);ctx.lineTo(hX+5,tY);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.45)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(hX,tY+28,7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(hX,tY+28,2.5,0,Math.PI*2);ctx.stroke();
  if(rasenganActive&&!isClone&&!sealPose){
    const rx=hX+28,ry=tY+20,ch=Math.min(rasenganCharge/40,1);
    ctx.save();ctx.globalAlpha=alpha*ch*0.75;const rg=ctx.createRadialGradient(rx,ry,0,rx,ry,20*ch);rg.addColorStop(0,'rgba(100,200,255,0.9)');rg.addColorStop(0.5,'rgba(50,150,255,0.6)');rg.addColorStop(1,'rgba(0,100,255,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(rx,ry,20*ch,0,Math.PI*2);ctx.fill();ctx.globalAlpha=alpha*ch;ctx.fillStyle='rgba(200,240,255,0.95)';ctx.beginPath();ctx.arc(rx,ry,8*ch,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(150,220,255,${ch*0.8})`;ctx.lineWidth=1.5;for(let i=0;i<4;i++){const a=frame*0.15+i*(Math.PI/2);ctx.beginPath();ctx.arc(rx,ry,12*ch,a,a+1.2);ctx.stroke();}ctx.restore();
    if(Math.random()<0.4)particles.push({type:'spark',x:rx+(Math.random()-0.5)*10,y:ry+(Math.random()-0.5)*10,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4,r:3+Math.random()*4,life:0.8,color:`hsl(${190+Math.random()*50},100%,70%)`,decay:0.05});
  }
  const aY=tY+6;
  if(sealPose)sealPoseArms(hX,aY,or,sk);
  else baseArms(hX,aY,alR,arR,wv,st,or,sk);
  const pY=tY+48;ctx.fillStyle=orD;ctx.beginPath();ctx.roundRect(hX-13,pY,26,16,3);ctx.fill();ctx.beginPath();ctx.roundRect(hX-14,pY-3,28,6,2);ctx.fill();
  baseLegs(hX,pY+13,ll,lr,orD,'#D8C880');
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(hX,y,22,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

// ── SASUKE ──
function drawSasuke(x,y,opts){
  const o=opts||{},alpha=o.alpha!=null?o.alpha:1;
  const ll=o.ll||0,lr=o.lr||0,alR=o.alR||0,arR=o.arR||0,wv=o.wv||0,st=o.st||0;
  const eOpen=o.eOpen!==false,mOpen=!!o.mOpen,sealPose=!!o.sealPose;
  ctx.save();ctx.globalAlpha=alpha;
  const sk='#F0C090',hY=y-90,hX=x;
  const iris=sharinganActive?'#CC0000':'#1A1A2A';
  ctx.fillStyle='#1A1A2A';ctx.beginPath();ctx.ellipse(hX,hY-8,20,18,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX-18,hY,6,9,0.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+18,hY,6,9,-0.4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(hX+8,hY-22);ctx.quadraticCurveTo(hX+30,hY-50,hX+20,hY-60);ctx.quadraticCurveTo(hX+12,hY-40,hX+4,hY-24);ctx.fill();
  ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(hX,hY,15,19,0,0,Math.PI*2);ctx.fill();
  if(sharinganActive){ctx.save();ctx.globalAlpha=alpha*0.3;const g=ctx.createRadialGradient(hX,hY,5,hX,hY,55);g.addColorStop(0,'rgba(255,0,0,0.5)');g.addColorStop(1,'rgba(150,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hX,hY,55,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(susanooActive){ctx.save();ctx.globalAlpha=alpha*0.25;const g=ctx.createRadialGradient(hX,hY,20,hX,hY,80);g.addColorStop(0,'rgba(120,40,200,0.7)');g.addColorStop(1,'rgba(60,0,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hX,hY,80,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(180,100,255,0.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(hX,hY-20,70,Math.PI*0.8,Math.PI*2.2);ctx.stroke();ctx.restore();}
  ctx.fillStyle='#4A4A5A';ctx.beginPath();ctx.roundRect(hX-17,hY-22,34,8,2);ctx.fill();ctx.fillStyle='#8A8AAA';ctx.beginPath();ctx.roundRect(hX-14,hY-21,28,6,1);ctx.fill();
  ctx.fillStyle='#1A1A2A';ctx.beginPath();ctx.moveTo(hX-14,hY-20);ctx.quadraticCurveTo(hX-18,hY-8,hX-14,hY+2);ctx.quadraticCurveTo(hX-10,hY-4,hX-8,hY-18);ctx.fill();
  ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(hX-16,hY+2,4,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+16,hY+2,4,5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#111';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hX-14,hY-9);ctx.lineTo(hX-3,hY-7);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+3,hY-7);ctx.lineTo(hX+14,hY-9);ctx.stroke();
  if(eOpen){
    [-8,8].forEach((ex,i)=>{
      ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(hX+ex,hY,5.5,6.5,0,0,Math.PI*2);ctx.fill();
      if(sharinganActive){
        ctx.fillStyle='#CC0000';ctx.beginPath();ctx.ellipse(hX+ex,hY,4,5,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#111';ctx.beginPath();ctx.arc(hX+ex,hY,2,0,Math.PI*2);ctx.fill();
        for(let t=0;t<3;t++){const a=frame*0.05+t*(Math.PI*2/3);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(hX+ex+Math.cos(a)*2.8,hY+Math.sin(a)*2.8,1,0,Math.PI*2);ctx.fill();}
      } else {
        ctx.fillStyle=iris;ctx.beginPath();ctx.ellipse(hX+ex,hY+0.5,4,4.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(hX+ex,hY+0.5,2.5,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hX+ex-2,hY-1,1.3,0,Math.PI*2);ctx.fill();
      }
    });
    ctx.strokeStyle='#111';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(hX-13,hY-5);ctx.quadraticCurveTo(hX-8,hY-8,hX-2,hY-5);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+2,hY-5);ctx.quadraticCurveTo(hX+8,hY-8,hX+13,hY-5);ctx.stroke();
  } else {ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hX-13,hY+1);ctx.quadraticCurveTo(hX-8,hY-4,hX-2,hY+1);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+2,hY+1);ctx.quadraticCurveTo(hX+8,hY-4,hX+13,hY+1);ctx.stroke();}
  ctx.strokeStyle='#C08050';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hX-1,hY+7);ctx.quadraticCurveTo(hX+1,hY+10,hX+3,hY+8);ctx.stroke();
  ctx.strokeStyle='#111';ctx.lineWidth=1.5;if(mOpen){ctx.beginPath();ctx.moveTo(hX-4,hY+14);ctx.quadraticCurveTo(hX,hY+18,hX+4,hY+14);ctx.stroke();}else{ctx.beginPath();ctx.moveTo(hX-3,hY+15);ctx.lineTo(hX+3,hY+15);ctx.stroke();}
  ctx.fillStyle='#E07070';ctx.globalAlpha=alpha*0.2;ctx.beginPath();ctx.ellipse(hX-12,hY+10,5,2.5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+12,hY+10,5,2.5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=alpha;
  const tY=hY+28;ctx.fillStyle=sk;ctx.beginPath();ctx.roundRect(hX-5,hY+20,10,10,2);ctx.fill();
  ctx.fillStyle='#1A2A4A';ctx.beginPath();ctx.moveTo(hX-16,tY);ctx.quadraticCurveTo(hX-18,tY+25,hX-14,tY+50);ctx.lineTo(hX+14,tY+50);ctx.quadraticCurveTo(hX+18,tY+25,hX+16,tY);ctx.closePath();ctx.fill();
  ctx.fillStyle='#0A1A3A';ctx.beginPath();ctx.moveTo(hX-8,tY);ctx.lineTo(hX-6,tY+14);ctx.lineTo(hX+6,tY+14);ctx.lineTo(hX+8,tY);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.arc(hX,tY+30,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#CC2222';ctx.beginPath();ctx.moveTo(hX,tY+24);ctx.lineTo(hX-3,tY+32);ctx.lineTo(hX+3,tY+32);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(hX,tY+26);ctx.lineTo(hX-2,tY+32);ctx.lineTo(hX+2,tY+32);ctx.closePath();ctx.fill();
  if(chidoriActive){
    const cx2=hX+28,cy2=tY+20,ch2=Math.min(chidoriCharge/40,1);
    ctx.save();ctx.globalAlpha=alpha*ch2;const cg=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,22*ch2);cg.addColorStop(0,'rgba(200,230,255,0.95)');cg.addColorStop(0.4,'rgba(100,180,255,0.7)');cg.addColorStop(1,'rgba(50,100,255,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx2,cy2,22*ch2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`rgba(220,240,255,${ch2*0.9})`;ctx.lineWidth=1;for(let i=0;i<6;i++){const a2=frame*0.2+i*(Math.PI/3),r1=8*ch2,r2=18*ch2;ctx.beginPath();ctx.moveTo(cx2+Math.cos(a2)*r1,cy2+Math.sin(a2)*r1);ctx.lineTo(cx2+Math.cos(a2+0.3)*(r1+r2*0.5),cy2+Math.sin(a2+0.3)*(r1+r2*0.5));ctx.lineTo(cx2+Math.cos(a2)*r2,cy2+Math.sin(a2)*r2);ctx.stroke();}
    ctx.restore();if(Math.random()<0.5)particles.push({type:'spark',x:cx2+(Math.random()-0.5)*15,y:cy2+(Math.random()-0.5)*15,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,r:2+Math.random()*4,life:0.7,color:'rgba(180,210,255,0.9)',decay:0.06});
  }
  const aY=tY+6;
  if(sealPose)sealPoseArms(hX,aY,'#1A2A4A',sk);
  else baseArms(hX,aY,alR,arR,wv,st,'#1A2A4A',sk);
  const pY=tY+48;ctx.fillStyle='#0A1A3A';ctx.beginPath();ctx.roundRect(hX-13,pY,26,16,3);ctx.fill();ctx.beginPath();ctx.roundRect(hX-14,pY-3,28,6,2);ctx.fill();
  baseLegs(hX,pY+13,ll,lr,'#0A1A3A','#3A2A1A');
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(hX,y,22,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

// ── SAKURA ──
function drawSakura(x,y,opts){
  const o=opts||{},alpha=o.alpha!=null?o.alpha:1;
  const ll=o.ll||0,lr=o.lr||0,alR=o.alR||0,arR=o.arR||0,wv=o.wv||0,st=o.st||0;
  const eOpen=o.eOpen!==false,mOpen=!!o.mOpen,sealPose=!!o.sealPose;
  ctx.save();ctx.globalAlpha=alpha;
  const sk='#F5C8A0',hY=y-90,hX=x;
  ctx.fillStyle='#E060A0';ctx.beginPath();ctx.ellipse(hX,hY-8,22,20,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX-18,hY+4,8,10,0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+18,hY+4,8,10,-0.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4A5A6A';ctx.beginPath();ctx.roundRect(hX-17,hY-26,34,8,2);ctx.fill();ctx.fillStyle='#8A9AAA';ctx.beginPath();ctx.roundRect(hX-14,hY-25,28,6,1);ctx.fill();ctx.strokeStyle='#6A7A8A';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(hX,hY-21,5,3,0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(hX,hY,15,19,0,0,Math.PI*2);ctx.fill();
  if(healActive){ctx.save();ctx.globalAlpha=alpha*0.3;const g=ctx.createRadialGradient(hX,hY,5,hX,hY,60);g.addColorStop(0,'rgba(100,255,150,0.5)');g.addColorStop(1,'rgba(0,200,100,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hX,hY,60,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.fillStyle='#E060A0';ctx.beginPath();ctx.moveTo(hX-14,hY-20);ctx.quadraticCurveTo(hX-16,hY-8,hX-12,hY+4);ctx.quadraticCurveTo(hX-8,hY-4,hX-10,hY-18);ctx.fill();
  ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(hX-15,hY+2,4,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+15,hY+2,4,5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#111';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hX-13,hY-8);ctx.quadraticCurveTo(hX-7,hY-12,hX-2,hY-9);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+2,hY-9);ctx.quadraticCurveTo(hX+7,hY-12,hX+13,hY-8);ctx.stroke();
  baseHead(hX,hY,sk,eOpen,mOpen,'#228844',alpha);
  ctx.strokeStyle='#C8905A';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hX-1,hY+8);ctx.quadraticCurveTo(hX+1,hY+10,hX+3,hY+9);ctx.stroke();
  const tY=hY+28;ctx.fillStyle=sk;ctx.beginPath();ctx.roundRect(hX-5,hY+20,10,10,2);ctx.fill();
  ctx.fillStyle='#CC2244';ctx.beginPath();ctx.moveTo(hX-15,tY);ctx.quadraticCurveTo(hX-17,tY+25,hX-13,tY+50);ctx.lineTo(hX+13,tY+50);ctx.quadraticCurveTo(hX+17,tY+25,hX+15,tY);ctx.closePath();ctx.fill();
  ctx.fillStyle='#AA1833';ctx.beginPath();ctx.moveTo(hX-4,tY);ctx.lineTo(hX,tY+10);ctx.lineTo(hX+4,tY);ctx.closePath();ctx.fill();
  if(healActive){const hx=hX+25,hy=tY+22;ctx.save();ctx.globalAlpha=alpha*(0.5+Math.sin(healPulse*0.15)*0.3);const hg=ctx.createRadialGradient(hx,hy,0,hx,hy,18);hg.addColorStop(0,'rgba(100,255,150,0.95)');hg.addColorStop(1,'rgba(0,200,100,0)');ctx.fillStyle=hg;ctx.beginPath();ctx.arc(hx,hy,18,0,Math.PI*2);ctx.fill();ctx.restore();addHeal(hx,hy);}
  const aY=tY+6;
  if(sealPose)sealPoseArms(hX,aY,'#CC2244',sk);
  else baseArms(hX,aY,alR,arR,wv,st,'#CC2244',sk);
  const pY=tY+48;ctx.fillStyle='#223344';ctx.beginPath();ctx.roundRect(hX-13,pY,26,16,3);ctx.fill();ctx.beginPath();ctx.roundRect(hX-14,pY-3,28,6,2);ctx.fill();
  baseLegs(hX,pY+13,ll,lr,'#223344','#CC2244');
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(hX,y,22,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

// ── KAKASHI ──
function drawKakashi(x,y,opts){
  const o=opts||{},alpha=o.alpha!=null?o.alpha:1;
  const ll=o.ll||0,lr=o.lr||0,alR=o.alR||0,arR=o.arR||0,wv=o.wv||0,st=o.st||0;
  const eOpen=o.eOpen!==false,mOpen=!!o.mOpen,sealPose=!!o.sealPose;
  ctx.save();ctx.globalAlpha=alpha;
  const sk='#F0C898',hY=y-90,hX=x;
  ctx.fillStyle='#C8C8D8';ctx.beginPath();ctx.ellipse(hX,hY-10,20,18,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(hX+4,hY-24);ctx.quadraticCurveTo(hX+20,hY-45,hX+28,hY-38);ctx.quadraticCurveTo(hX+18,hY-28,hX+10,hY-22);ctx.fill();
  ctx.beginPath();ctx.moveTo(hX+10,hY-22);ctx.quadraticCurveTo(hX+26,hY-40,hX+30,hY-30);ctx.quadraticCurveTo(hX+22,hY-24,hX+14,hY-20);ctx.fill();
  ctx.fillStyle='#A8A8C0';ctx.beginPath();ctx.ellipse(hX-18,hY+2,6,8,0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+18,hY+2,6,8,-0.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(hX,hY,15,18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#C8C8D0';ctx.beginPath();ctx.ellipse(hX,hY+10,14,12,0,0,Math.PI);ctx.fill();
  ctx.fillStyle='#A8A8B8';ctx.beginPath();ctx.moveTo(hX-14,hY+8);ctx.lineTo(hX-14,hY+20);ctx.bezierCurveTo(hX-10,hY+24,hX+10,hY+24,hX+14,hY+20);ctx.lineTo(hX+14,hY+8);ctx.closePath();ctx.fill();
  ctx.fillStyle='#4A5A6A';ctx.beginPath();ctx.roundRect(hX-17,hY-21,34,8,2);ctx.fill();ctx.fillStyle='#8A9AAA';ctx.beginPath();ctx.roundRect(hX-14,hY-20,28,6,1);ctx.fill();ctx.strokeStyle='#6A7A8A';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(hX,hY-16,5,3,0,0,Math.PI*2);ctx.stroke();
  // covered sharingan eye
  ctx.fillStyle='#4A5A6A';ctx.beginPath();ctx.ellipse(hX-7,hY-3,7,6,0,0,Math.PI*2);ctx.fill();
  if(sharinganActive){ctx.fillStyle='#CC0000';ctx.beginPath();ctx.ellipse(hX-7,hY-3,5,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(hX-7,hY-3,2,0,Math.PI*2);ctx.fill();for(let t=0;t<3;t++){const a=frame*0.05+t*(Math.PI*2/3);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(hX-7+Math.cos(a)*2.5,hY-3+Math.sin(a)*2.5,0.9,0,Math.PI*2);ctx.fill();}ctx.save();ctx.globalAlpha=alpha*0.4;const sg=ctx.createRadialGradient(hX-7,hY-3,2,hX-7,hY-3,18);sg.addColorStop(0,'rgba(255,0,0,0.6)');sg.addColorStop(1,'rgba(150,0,0,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(hX-7,hY-3,18,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(eOpen){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(hX+7,hY-3,5.5,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2A2A2A';ctx.beginPath();ctx.ellipse(hX+7,hY-3,4,4.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(hX+7,hY-3,2.5,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hX+5,hY-5,1.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(hX+2,hY-8);ctx.quadraticCurveTo(hX+7,hY-11,hX+12,hY-8);ctx.stroke();}
  else{ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hX+2,hY-3);ctx.quadraticCurveTo(hX+7,hY-8,hX+12,hY-3);ctx.stroke();}
  ctx.strokeStyle='#111';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(hX-13,hY-8);ctx.quadraticCurveTo(hX-7,hY-12,hX-2,hY-8);ctx.stroke();
  const tY=hY+28;ctx.fillStyle=sk;ctx.beginPath();ctx.roundRect(hX-5,hY+20,10,8,2);ctx.fill();
  ctx.fillStyle='#3A4A3A';ctx.beginPath();ctx.moveTo(hX-16,tY);ctx.quadraticCurveTo(hX-18,tY+25,hX-14,tY+50);ctx.lineTo(hX+14,tY+50);ctx.quadraticCurveTo(hX+18,tY+25,hX+16,tY);ctx.closePath();ctx.fill();
  ctx.fillStyle='#2A3A2A';ctx.beginPath();ctx.moveTo(hX-5,tY);ctx.lineTo(hX,tY+14);ctx.lineTo(hX+5,tY);ctx.closePath();ctx.fill();
  ctx.fillStyle='#2A3A2A';ctx.beginPath();ctx.roundRect(hX-14,tY+18,10,8,2);ctx.fill();ctx.beginPath();ctx.roundRect(hX+4,tY+18,10,8,2);ctx.fill();
  if(chidoriActive){
    const lx2=hX+28,ly2=tY+20,ch2=Math.min(chidoriCharge/40,1);
    ctx.save();ctx.globalAlpha=alpha*ch2;const lg=ctx.createRadialGradient(lx2,ly2,0,lx2,ly2,20*ch2);lg.addColorStop(0,'rgba(200,230,255,0.95)');lg.addColorStop(0.5,'rgba(100,180,255,0.7)');lg.addColorStop(1,'rgba(50,100,255,0)');ctx.fillStyle=lg;ctx.beginPath();ctx.arc(lx2,ly2,20*ch2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(220,240,255,0.9)';ctx.lineWidth=1.2;for(let i=0;i<8;i++){const a2=frame*0.18+i*(Math.PI/4),r1=6*ch2,r2=16*ch2;ctx.beginPath();ctx.moveTo(lx2+Math.cos(a2)*r1,ly2+Math.sin(a2)*r1);ctx.lineTo(lx2+Math.cos(a2+0.25)*(r1+(r2-r1)*0.5),ly2+Math.sin(a2+0.25)*(r1+(r2-r1)*0.5));ctx.lineTo(lx2+Math.cos(a2)*r2,ly2+Math.sin(a2)*r2);ctx.stroke();}
    ctx.restore();if(Math.random()<0.5)particles.push({type:'spark',x:lx2+(Math.random()-0.5)*15,y:ly2+(Math.random()-0.5)*15,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,r:2+Math.random()*4,life:0.6,color:'rgba(180,210,255,0.9)',decay:0.06});
  }
  const aY=tY+6;
  if(sealPose)sealPoseArms(hX,aY,'#3A4A3A',sk);
  else baseArms(hX,aY,alR,arR,wv,st,'#3A4A3A',sk);
  const pY=tY+48;ctx.fillStyle='#1A2A3A';ctx.beginPath();ctx.roundRect(hX-13,pY,26,16,3);ctx.fill();ctx.beginPath();ctx.roundRect(hX-14,pY-3,28,6,2);ctx.fill();
  baseLegs(hX,pY+13,ll,lr,'#1A2A3A','#2A2A2A');
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(hX,y,22,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

// ── ROCK LEE ──
function drawRockLee(x,y,opts){
  const o=opts||{},alpha=o.alpha!=null?o.alpha:1;
  const ll=o.ll||0,lr=o.lr||0,alR=o.alR||0,arR=o.arR||0,wv=o.wv||0,st=o.st||0;
  const eOpen=o.eOpen!==false,mOpen=!!o.mOpen;
  ctx.save();ctx.globalAlpha=alpha;
  const sk='#F0C890',hY=y-90,hX=x;
  ctx.fillStyle='#1A1A1A';ctx.beginPath();ctx.ellipse(hX,hY-8,20,16,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(hX-20,hY-4);ctx.quadraticCurveTo(hX-22,hY+6,hX-18,hY+10);ctx.quadraticCurveTo(hX-14,hY+4,hX-14,hY-2);ctx.fill();
  ctx.beginPath();ctx.moveTo(hX+20,hY-4);ctx.quadraticCurveTo(hX+22,hY+6,hX+18,hY+10);ctx.quadraticCurveTo(hX+14,hY+4,hX+14,hY-2);ctx.fill();
  ctx.fillStyle='#1A1A1A';ctx.beginPath();ctx.rect(hX-20,hY+2,40,8);ctx.fill();
  ctx.fillStyle=sk;ctx.beginPath();ctx.ellipse(hX,hY+4,14,16,0,0,Math.PI*2);ctx.fill();
  if(gatesActive){
    ctx.save();ctx.globalAlpha=alpha*0.35;const g=ctx.createRadialGradient(hX,hY,10,hX,hY,70);g.addColorStop(0,'rgba(255,80,0,0.7)');g.addColorStop(0.5,'rgba(200,40,0,0.4)');g.addColorStop(1,'rgba(150,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hX,hY,70,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`rgba(255,150,50,${0.4+Math.sin(gatesPulse*0.1)*0.2})`;ctx.lineWidth=2;for(let i=0;i<6;i++){const a=i*(Math.PI/3)+frame*0.02;ctx.beginPath();ctx.moveTo(hX+Math.cos(a)*20,hY+Math.sin(a)*20);ctx.lineTo(hX+Math.cos(a)*65,hY+Math.sin(a)*65);ctx.stroke();}ctx.restore();
  }
  ctx.fillStyle='#1A1A1A';ctx.beginPath();ctx.roundRect(hX-14,hY-4,11,4,2);ctx.fill();ctx.beginPath();ctx.roundRect(hX+3,hY-4,11,4,2);ctx.fill();
  if(eOpen){[-7,7].forEach(ex=>{ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(hX+ex,hY+3,5.5,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3A2A0A';ctx.beginPath();ctx.ellipse(hX+ex,hY+3,4,4.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(hX+ex,hY+3,2.5,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hX+ex-2,hY+1,1.3,0,Math.PI*2);ctx.fill();});ctx.strokeStyle='#111';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(hX-12,hY-1);ctx.quadraticCurveTo(hX-7,hY-4,hX-2,hY-1);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+2,hY-1);ctx.quadraticCurveTo(hX+7,hY-4,hX+12,hY-1);ctx.stroke();}
  else{ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hX-12,hY+3);ctx.quadraticCurveTo(hX-7,hY-2,hX-2,hY+3);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+2,hY+3);ctx.quadraticCurveTo(hX+7,hY-2,hX+12,hY+3);ctx.stroke();}
  ctx.strokeStyle='#C08050';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hX-1,hY+10);ctx.quadraticCurveTo(hX+1,hY+13,hX+3,hY+11);ctx.stroke();
  ctx.strokeStyle='#111';ctx.lineWidth=1.5;if(mOpen){ctx.beginPath();ctx.moveTo(hX-5,hY+16);ctx.quadraticCurveTo(hX,hY+22,hX+5,hY+16);ctx.stroke();}else{ctx.beginPath();ctx.moveTo(hX-4,hY+17);ctx.quadraticCurveTo(hX,hY+20,hX+4,hY+17);ctx.stroke();}
  ctx.fillStyle='#E07070';ctx.globalAlpha=alpha*0.25;ctx.beginPath();ctx.ellipse(hX-12,hY+12,5,2.5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+12,hY+12,5,2.5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=alpha;
  const tY=hY+30;ctx.fillStyle=sk;ctx.beginPath();ctx.roundRect(hX-5,hY+22,10,10,2);ctx.fill();
  ctx.fillStyle='#228822';ctx.beginPath();ctx.moveTo(hX-16,tY);ctx.quadraticCurveTo(hX-18,tY+25,hX-14,tY+50);ctx.lineTo(hX+14,tY+50);ctx.quadraticCurveTo(hX+18,tY+25,hX+16,tY);ctx.closePath();ctx.fill();
  ctx.fillStyle='#116611';ctx.beginPath();ctx.moveTo(hX-4,tY);ctx.lineTo(hX,tY+10);ctx.lineTo(hX+4,tY);ctx.closePath();ctx.fill();
  const aY=tY+6;baseArms(hX,aY,alR,arR,wv,st,'#228822',sk);
  const pY=tY+48;ctx.fillStyle='#116611';ctx.beginPath();ctx.roundRect(hX-13,pY,26,16,3);ctx.fill();ctx.beginPath();ctx.roundRect(hX-14,pY-3,28,6,2);ctx.fill();
  const lgY=pY+13;[[hX-6,ll,hX-13],[hX+6,lr,hX+2]].forEach(([pivot,rot,lx])=>{
    ctx.save();ctx.translate(pivot,lgY);ctx.rotate(rot*Math.PI/180);ctx.translate(-pivot,-lgY);
    ctx.fillStyle='#116611';ctx.beginPath();ctx.roundRect(lx,lgY,11,30,5);ctx.fill();
    ctx.fillStyle='#CC6600';ctx.beginPath();ctx.roundRect(lx,lgY+28,11,16,3);ctx.fill();
    ctx.fillStyle='#2A2A2A';ctx.beginPath();ctx.ellipse(lx+5.5,lgY+46,10,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.roundRect(lx-1,lgY+38,12,10,2);ctx.fill();
    ctx.restore();
  });
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(hX,y,22,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

// ── Dispatch ──
function drawChar(x,y,opts){
  if(currentChar==='naruto')drawNaruto(x,y,opts);
  else if(currentChar==='sasuke')drawSasuke(x,y,opts);
  else if(currentChar==='sakura')drawSakura(x,y,opts);
  else if(currentChar==='kakashi')drawKakashi(x,y,opts);
  else if(currentChar==='lee')drawRockLee(x,y,opts);
}

// ── Sleeping ──
function drawSleeping(){
  const cx=mX,cy=H-30;
  const cc={naruto:['#E06808','#904000','#E8C020','#9A7810','#F2B885'],sasuke:['#1A2A4A','#0A1A3A','#1A1A2A','#0A0A1A','#F0C090'],sakura:['#CC2244','#AA1833','#E060A0','#A04080','#F5C8A0'],kakashi:['#3A4A3A','#2A3A2A','#C8C8D8','#A8A8C0','#F0C898'],lee:['#228822','#116611','#1A1A1A','#0A0A0A','#F0C890']};
  const [c1,c2,h1,h2,faceC]=cc[currentChar];
  ctx.save();
  ctx.fillStyle=c1;ctx.beginPath();ctx.ellipse(cx+20,cy-18,32,14,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(cx+46,cy-12,16,10,-0.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#D8C880';ctx.beginPath();ctx.ellipse(cx+57,cy-8,10,6,0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx+50,cy-20,9,5,-0.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=c1;ctx.beginPath();ctx.ellipse(cx-6,cy-16,12,8,0.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=h2;ctx.beginPath();ctx.ellipse(cx-10,cy-30,18,14,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=h1;[[-22,-44,-14,-38],[-12,-48,-4,-40],[2,-48,10,-40],[12,-42,18,-36]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(cx+x1,cy+y1);ctx.lineTo(cx+x2,cy+y2);ctx.lineTo(cx+x1-4,cy+y2+4);ctx.fill();});
  ctx.fillStyle=faceC;ctx.beginPath();ctx.ellipse(cx-10,cy-28,16,18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#5A6A7A';ctx.beginPath();ctx.roundRect(cx-24,cy-38,28,7,2);ctx.fill();ctx.fillStyle='#8A9AAA';ctx.beginPath();ctx.roundRect(cx-21,cy-37,22,5,1);ctx.fill();
  ctx.strokeStyle='#111';ctx.lineWidth=1.8;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(cx-20,cy-27);ctx.quadraticCurveTo(cx-13,cy-31,cx-7,cy-27);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-5,cy-28);ctx.quadraticCurveTo(cx+2,cy-32,cx+8,cy-28);ctx.stroke();
  if(currentChar==='naruto'){ctx.strokeStyle='#904828';ctx.lineWidth=1.2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(cx-26,cy-20+i*3.5);ctx.lineTo(cx-14,cy-19+i*3.5);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-4,cy-19+i*3.5);ctx.lineTo(cx+8,cy-20+i*3.5);ctx.stroke();}}
  ctx.strokeStyle='#111';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx-14,cy-14);ctx.quadraticCurveTo(cx-9,cy-10,cx-4,cy-14);ctx.stroke();
  for(let z of zzs){ctx.globalAlpha=z.opacity;ctx.fillStyle='rgba(180,210,255,0.9)';ctx.font=`bold ${z.size}px sans-serif`;ctx.fillText(z.ch,cx+z.x,cy-55+z.y);}
  ctx.globalAlpha=1;ctx.restore();
}

// ── Sexy Jutsu form ──
function drawSexy(x,y,a){
  ctx.save();ctx.globalAlpha=a||1;
  const hX=x,hY=y-110;
  ctx.fillStyle='#2A1A08';ctx.beginPath();ctx.moveTo(hX-18,hY-18);ctx.bezierCurveTo(hX-30,hY+20,hX-32,hY+60,hX-26,hY+120);ctx.lineTo(hX-14,hY+120);ctx.bezierCurveTo(hX-20,hY+60,hX-18,hY+20,hX-10,hY+10);ctx.fill();ctx.beginPath();ctx.moveTo(hX+18,hY-18);ctx.bezierCurveTo(hX+30,hY+20,hX+32,hY+60,hX+26,hY+120);ctx.lineTo(hX+14,hY+120);ctx.bezierCurveTo(hX+20,hY+60,hX+18,hY+20,hX+10,hY+10);ctx.fill();ctx.beginPath();ctx.ellipse(hX,hY-8,20,18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#F5D5A5';ctx.beginPath();ctx.ellipse(hX,hY,15,18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(hX-7,hY-1,5.5,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3A1A8A';ctx.beginPath();ctx.ellipse(hX-7,hY,4,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(hX-7,hY,2.5,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hX-8.5,hY-2,1.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(hX+7,hY-1,5.5,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3A1A8A';ctx.beginPath();ctx.ellipse(hX+7,hY,4,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(hX+7,hY,2.5,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hX+5.5,hY-2,1.2,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#111';ctx.lineWidth=1.5;ctx.lineCap='round';[[-12,hY-6],[-10,hY-7.5],[-7,hY-8],[-4,hY-7.5],[-2,hY-6]].forEach(([ex,ey])=>{ctx.beginPath();ctx.moveTo(hX+ex,ey);ctx.lineTo(hX+ex-0.5,ey-3);ctx.stroke();});[[2,hY-6],[4,hY-7.5],[7,hY-8],[10,hY-7.5],[12,hY-6]].forEach(([ex,ey])=>{ctx.beginPath();ctx.moveTo(hX+ex,ey);ctx.lineTo(hX+ex+0.5,ey-3);ctx.stroke();});
  ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(hX-12,hY-10);ctx.quadraticCurveTo(hX-7,hY-14,hX-2,hY-11);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+2,hY-11);ctx.quadraticCurveTo(hX+7,hY-14,hX+12,hY-10);ctx.stroke();
  ctx.fillStyle='#E06080';ctx.beginPath();ctx.moveTo(hX-6,hY+12);ctx.bezierCurveTo(hX-3,hY+10,hX+3,hY+10,hX+6,hY+12);ctx.bezierCurveTo(hX+3,hY+15,hX-3,hY+15,hX-6,hY+12);ctx.fill();
  ctx.strokeStyle='rgba(160,100,70,0.35)';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(hX-14,hY+6+i*3);ctx.lineTo(hX-4,hY+7+i*3);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+4,hY+7+i*3);ctx.lineTo(hX+14,hY+6+i*3);ctx.stroke();}
  ctx.fillStyle='#FF8080';ctx.globalAlpha=(a||1)*0.25;ctx.beginPath();ctx.ellipse(hX-11,hY+9,6,3,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+11,hY+9,6,3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=a||1;
  ctx.fillStyle='#F5D5A5';ctx.beginPath();ctx.roundRect(hX-5,hY+17,10,10,2);ctx.fill();
  const bY=hY+27;ctx.fillStyle='#FF9EC0';ctx.beginPath();ctx.moveTo(hX-18,bY);ctx.bezierCurveTo(hX-20,bY+20,hX-18,bY+40,hX-14,bY+55);ctx.lineTo(hX+14,bY+55);ctx.bezierCurveTo(hX+18,bY+40,hX+20,bY+20,hX+18,bY);ctx.closePath();ctx.fill();
  ctx.fillStyle='#FF7AA8';ctx.beginPath();ctx.ellipse(hX,bY+38,10,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FF9EC0';ctx.beginPath();ctx.moveTo(hX-14,bY+50);ctx.bezierCurveTo(hX-20,bY+65,hX-22,bY+80,hX-18,bY+95);ctx.lineTo(hX+18,bY+95);ctx.bezierCurveTo(hX+22,bY+80,hX+20,bY+65,hX+14,bY+50);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#F5D5A5';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hX+18,bY+8);ctx.bezierCurveTo(hX+28,bY+22,hX+26,bY+36,hX+20,bY+44);ctx.stroke();ctx.beginPath();ctx.moveTo(hX-18,bY+8);ctx.bezierCurveTo(hX-28,bY-4,hX-30,bY-14,hX-24,bY-22);ctx.stroke();
  ctx.fillStyle='#F5D5A5';ctx.beginPath();ctx.arc(hX-24,bY-22,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(hX+20,bY+46,6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#F5D5A5';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(hX-8,bY+93);ctx.bezierCurveTo(hX-10,bY+108,hX-8,bY+118,hX-6,bY+128);ctx.stroke();ctx.beginPath();ctx.moveTo(hX+8,bY+93);ctx.bezierCurveTo(hX+10,bY+108,hX+8,bY+118,hX+6,bY+128);ctx.stroke();
  ctx.fillStyle='#F5D5A5';ctx.beginPath();ctx.ellipse(hX-5,bY+130,7,4,0.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(hX+7,bY+130,7,4,-0.2,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#111';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(hX+2,hY-1);ctx.quadraticCurveTo(hX+7,hY-5,hX+12,hY-1);ctx.stroke();
  const t=frame*0.08;['#FFD700','#FF69B4','#FF69B4','#FFD700'].forEach((c,i)=>{const ang=t+i*Math.PI/2,r=55+Math.sin(t+i)*8;ctx.fillStyle=c;ctx.globalAlpha=(a||1)*(0.6+Math.sin(t*2+i)*0.3);ctx.font=`${12+Math.sin(t+i)*3}px sans-serif`;ctx.fillText('✦',hX+Math.cos(ang)*r-6,hY+Math.sin(ang)*r+6);});
  ctx.globalAlpha=a||1;ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(hX,y,22,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

// ── Jutsu actions ──
const jutsuActions={
  clone(){if(jutsu)return;jutsu='clone';allBtnsDisabled(true);showLabel('影分身の術！','#FFD700',2200);setState('seal');sTimer=999;addSmoke(mX,H-30,14,true);clones=[];[-190,-110,110,190].forEach((off,i)=>{setTimeout(()=>{const cx=Math.max(60,Math.min(W-60,mX+off));addSmoke(cx,H-30,8);clones.push({x:cx,alpha:0,done:false});},500+i*160);});setTimeout(()=>{let d=0;[...clones].reverse().forEach(c=>{setTimeout(()=>{addSmoke(c.x,H-30,6);c.done=true;},d);d+=350;});setTimeout(()=>{clones=[];jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},d+600);},3400);},
  rasengan(){if(jutsu)return;jutsu='rasengan';allBtnsDisabled(true);showLabel('螺旋丸！','#4AAFFF',2000);setState('idle');sTimer=999;rasenganCharge=0;rasenganActive=true;const iv=setInterval(()=>{rasenganCharge++;if(rasenganCharge>=60){clearInterval(iv);setTimeout(()=>{addSpark(mX+40,H-130,'rgba(100,200,255,0.9)',20);addSmoke(mX+40,H-130,8);rasenganActive=false;setTimeout(()=>{jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},700);},400);}},30);},
  sage(){if(jutsu)return;jutsu='sage';allBtnsDisabled(true);showLabel('仙人モード！','#FF6B35',2500);sageMode=true;sagePulse=0;setState('idle');sTimer=999;setTimeout(()=>{sageMode=false;jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},4000);},
  sexy(){if(jutsu)return;jutsu='sexy';allBtnsDisabled(true);showLabel('おいろけの術！','#FF69B4',2200);setState('seal');sTimer=999;sexyPhaseLocal=1;addSmoke(mX,H-30,18,true);addSpark(mX,H-150,'#FF69B4',10);setTimeout(()=>{sexyPhaseLocal=2;const hi=setInterval(()=>{if(sexyPhaseLocal!==2){clearInterval(hi);return;}addHeart(mX+(Math.random()-0.5)*60,H-180);},300);setTimeout(()=>{sexyPhaseLocal=3;addSmoke(mX,H-30,18,true);addSpark(mX,H-150,'#FF69B4',10);setTimeout(()=>{sexyPhaseLocal=0;jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},800);},3500);},700);},
  sharingan(){if(jutsu)return;jutsu='sharingan';allBtnsDisabled(true);showLabel('写輪眼！','#CC0000',2200);sharinganActive=true;sharinganPulse=0;setState('idle');sTimer=999;addSpark(mX,H-130,'rgba(255,50,50,0.9)',10);setTimeout(()=>{sharinganActive=false;jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},4000);},
  chidori(){if(jutsu)return;jutsu='chidori';allBtnsDisabled(true);showLabel('千鳥！','#88CCFF',2000);setState('seal');sTimer=999;chidoriCharge=0;chidoriActive=true;const iv=setInterval(()=>{chidoriCharge++;if(chidoriCharge>=60){clearInterval(iv);setTimeout(()=>{addSpark(mX+40,H-130,'rgba(180,220,255,0.9)',20);addSmoke(mX+40,H-130,8);chidoriActive=false;setTimeout(()=>{jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},700);},400);}},30);},
  susanoo(){if(jutsu)return;jutsu='susanoo';allBtnsDisabled(true);showLabel('須佐能乎！','#AA44FF',2500);susanooActive=true;susanooPulse=0;sharinganActive=true;sharinganPulse=0;setState('idle');sTimer=999;addSpark(mX,H-150,'rgba(150,50,255,0.9)',15);setTimeout(()=>{susanooActive=false;sharinganActive=false;jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},4500);},
  punch(){if(jutsu)return;jutsu='punch';allBtnsDisabled(true);showLabel('怪力！','#FF4488',1800);setState('wave');sTimer=999;setTimeout(()=>{addSpark(mX+50,H-100,'rgba(255,100,150,0.9)',18);addSmoke(mX+50,H-100,10,true);for(let i=0;i<5;i++)setTimeout(()=>addSpark(mX+50+(Math.random()-0.5)*40,H-80+(Math.random()-0.5)*40,'rgba(255,150,200,0.9)',4),i*80);},400);setTimeout(()=>{jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},1800);},
  heal(){if(jutsu)return;jutsu='heal';allBtnsDisabled(true);showLabel('医療忍術！','#44FF88',2500);healActive=true;healPulse=0;setState('idle');sTimer=999;setTimeout(()=>{healActive=false;jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},4000);},
  summon(){if(jutsu)return;jutsu='summon';allBtnsDisabled(true);showLabel('口寄せ！カツユ！','#5588AA',2000);setState('seal');sTimer=999;addSmoke(mX,H-30,16,true);addSpark(mX,H-100,'rgba(100,180,255,0.9)',12);setTimeout(()=>{jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},2500);},
  lightning(){if(jutsu)return;jutsu='lightning';allBtnsDisabled(true);showLabel('雷切！','#66AAFF',2000);setState('seal');sTimer=999;chidoriCharge=0;chidoriActive=true;const iv=setInterval(()=>{chidoriCharge++;if(chidoriCharge>=60){clearInterval(iv);setTimeout(()=>{addSpark(mX+40,H-130,'rgba(180,220,255,0.9)',20);addSmoke(mX+40,H-130,8);chidoriActive=false;setTimeout(()=>{jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},700);},400);}},30);},
  kamui(){if(jutsu)return;jutsu='kamui';allBtnsDisabled(true);showLabel('神威！','#88AADD',2200);sharinganActive=true;sharinganPulse=0;setState('idle');sTimer=999;addSpark(mX,H-150,'rgba(80,120,200,0.9)',15);for(let i=0;i<8;i++)setTimeout(()=>{addSpark(mX+(Math.random()-0.5)*80,H-100+(Math.random()-0.5)*60,'rgba(100,150,255,0.7)',4);},i*150);setTimeout(()=>{sharinganActive=false;jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},3500);},
  gates(){if(jutsu)return;jutsu='gates';allBtnsDisabled(true);showLabel('八門遁甲！','#FF4400',2500);gatesActive=true;gatesPulse=0;setState('idle');sTimer=999;addSpark(mX,H-150,'rgba(255,100,0,0.9)',18);setTimeout(()=>{gatesActive=false;jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},4500);},
  dynamic(){if(jutsu)return;jutsu='dynamic';allBtnsDisabled(true);showLabel('ダイナミック・エントリー！','#228833',1800);setState('wave');sTimer=999;addSpark(mX,H-100,'rgba(100,255,100,0.9)',15);addSmoke(mX,H-50,10);setTimeout(()=>{jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},2000);},
  lotus(){if(jutsu)return;jutsu='lotus';allBtnsDisabled(true);showLabel('初蓮！','#886600',2000);setState('seal');sTimer=999;addSmoke(mX,H-30,12,true);addSpark(mX,H-150,'rgba(200,150,50,0.9)',14);for(let i=0;i<6;i++)setTimeout(()=>addSpark(mX+(Math.random()-0.5)*60,H-80+(Math.random()-0.5)*50,'rgba(220,180,80,0.8)',4),i*120);setTimeout(()=>{jutsu=null;allBtnsDisabled(false);setState('idle');sTimer=120;},2500);}
};

// ── Character switcher ──
function switchChar(id){
  if(id===currentChar)return;
  currentChar=id;
  jutsu=null;sageMode=false;sharinganActive=false;susanooActive=false;healActive=false;gatesActive=false;chidoriActive=false;rasenganActive=false;sexyPhaseLocal=0;clones=[];particles=[];hearts=[];
  setState('idle');sTimer=120;
  document.querySelectorAll('.cbtn').forEach(b=>b.classList.toggle('active',b.dataset.char===id));
  buildJutsuBar();allBtnsDisabled(false);
}
function buildJutsuBar(){
  jutsuBar.innerHTML='';
  CHARS[currentChar].jutsu.forEach(j=>{
    const btn=document.createElement('button');
    btn.className='jbtn';btn.textContent=j.label;btn.style.background=j.bg;btn.style.color=j.color;
    btn.addEventListener('click',()=>{if(jutsuActions[j.id])jutsuActions[j.id]();});
    jutsuBar.appendChild(btn);
  });
}
document.querySelectorAll('.cbtn').forEach(b=>b.addEventListener('click',()=>switchChar(b.dataset.char)));

// ── State machine ──
function setState(s){state=s;stEl.textContent=s;}
function nextState(){
  const r=Math.random();
  if(r<0.3)setState('idle');else if(r<0.55)setState('walk');else if(r<0.68)setState('wave');else if(r<0.80)setState('sleep');else if(r<0.90)setState('stretch');else setState('look');
  if(state==='idle')sTimer=180+Math.random()*150;else if(state==='walk'){sTimer=100+Math.random()*120;wDir=Math.random()>0.5?1:-1;}else if(state==='wave')sTimer=110;else if(state==='sleep')sTimer=300+Math.random()*250;else if(state==='stretch')sTimer=75;else sTimer=65+Math.random()*45;
}

// ── Main loop ──
function loop(){
  ctx.clearRect(0,0,W,H);frame++;
  breath=Math.sin(frame*0.03)*1.2;blinkT++;if(blinkT>120+Math.random()*80){eyeCl=1;blinkT=0;}if(eyeCl>0)eyeCl=Math.max(0,eyeCl-0.18);
  if(state!=='wave')mSmile=Math.max(0,mSmile-0.04);
  if(sageMode)sagePulse++;if(sharinganActive)sharinganPulse++;if(susanooActive)susanooPulse++;if(healActive)healPulse++;if(gatesActive)gatesPulse++;
  if(!jutsu){sTimer--;if(sTimer<=0)nextState();}
  if(state==='idle'){headB=Math.sin(frame*0.025)+breath*0.3;legSw=0;armWv=0;strArm=0;lookD=0;}
  if(state==='walk'){legSw+=0.14;headB=Math.sin(legSw*2)*1.5;mX+=wDir*1.4;if(mX<60){mX=60;wDir=1;}if(mX>W-60){mX=W-60;wDir=-1;}}
  if(state==='wave'){armWv=-Math.sin(frame*0.2)*60-20;headB=Math.sin(frame*0.12)*1.5;mSmile=1;}
  if(state==='stretch'){strArm=Math.min(strArm+2.5,70);headB=-strArm*0.04;mSmile=strArm>35?1:0;}else strArm=Math.max(0,strArm-3);
  if(state==='look'){lookT++;if(lookT<22)lookD=1;else if(lookT<44)lookD=-1;else lookD=0;}else lookT=0;
  updateParticles();
  clones.forEach(c=>{c.alpha=c.done?Math.max(0,c.alpha-0.06):Math.min(0.85,c.alpha+0.05);if(c.alpha>0)drawNaruto(c.x,H-8,{alpha:c.alpha,isClone:true,eOpen:true});});
  if(state==='sleep'){
    zzT++;if(zzT%65===0){const ch=['z','z','Z'];zzs.push({x:30+zzI*12,y:0,ch:ch[zzI%3],size:12+zzI*4,opacity:1});zzI++;if(zzI>2){zzI=0;zzs=[];}}
    for(let z of zzs){z.y-=0.25;z.opacity-=0.0025;}zzs=zzs.filter(z=>z.opacity>0);drawSleeping();
  } else if(currentChar==='naruto'&&sexyPhaseLocal===2){
    drawSexy(mX,H-8,1);
  } else if(currentChar==='naruto'&&(sexyPhaseLocal===1||sexyPhaseLocal===3)){
    const a=sexyPhaseLocal===1?Math.max(0,1-(frame%40)/20):Math.min(1,(frame%40)/20);
    drawChar(mX,H-8,{eOpen:eyeCl<0.5,sealPose:true,alpha:Math.max(0,a)});
  } else {
    zzs=[];zzI=0;zzT=0;
    const isSeal=state==='seal';
    const ll=state==='walk'?Math.sin(legSw)*18:0,lr=state==='walk'?-Math.sin(legSw)*18:0;
    const alR=state==='walk'?-Math.sin(legSw)*15:0,arR=state==='walk'?Math.sin(legSw)*15:0;
    const wv=state==='wave'?armWv:0,st=state==='stretch'?strArm:0;
    const flip=state==='walk'&&wDir<0;
    const opts={ll,lr,alR,arR,wv,st,eOpen:eyeCl<0.5,mOpen:mSmile>0.5||state==='wave',sealPose:isSeal,sage:sageMode};
    if(flip){ctx.save();ctx.scale(-1,1);ctx.translate(-W,0);drawChar(W-mX,H-8,opts);ctx.restore();}
    else drawChar(mX,H-8,opts);
  }
  requestAnimationFrame(loop);
}

buildJutsuBar();setState('idle');sTimer=180;mX=W/2;loop();
})();
