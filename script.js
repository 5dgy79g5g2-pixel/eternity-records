window.addEventListener('load',()=>{setTimeout(()=>document.querySelector('.loader')?.classList.add('hide'),matchMedia('(prefers-reduced-motion: reduce)').matches?150:2300)});

const glow=document.querySelector('.cursor-glow');
window.addEventListener('pointermove',e=>{
  if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}
});

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const menu=document.querySelector('.menu');
menu?.addEventListener('click',()=>{document.querySelector('.nav nav')?.classList.toggle('open')});

// Chrome emblem: subtle 3D parallax following the pointer.
const tilt=document.querySelector('[data-tilt]');
if(tilt && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  let tx=0,ty=0,cx=0,cy=0;
  window.addEventListener('pointermove',e=>{
    const x=(e.clientX/innerWidth-.5)*2;
    const y=(e.clientY/innerHeight-.5)*2;
    tx=x*7; ty=-y*6;
  });
  const frame=()=>{
    cx+=(tx-cx)*.08; cy+=(ty-cy)*.08;
    tilt.style.transform=`translate(-50%,-50%) rotateX(${cy}deg) rotateY(${cx}deg)`;
    requestAnimationFrame(frame);
  };
  frame();
}

// Add a little magnetic movement to the home CTA.
const cta=document.querySelector('.hero-bottomline a');
cta?.addEventListener('pointermove',e=>{
  const r=cta.getBoundingClientRect();
  const x=(e.clientX-r.left-r.width/2)*.12;
  const y=(e.clientY-r.top-r.height/2)*.12;
  cta.style.transform=`translate(${x}px,${y}px)`;
});
cta?.addEventListener('pointerleave',()=>cta.style.transform='');




/* Strict attribution: do not show another artist's releases on label profiles. */
(async function(){
 const artists=[
  {id:'ty3s',name:'LIL TY3S',artistId:1707765892},
  {id:'blessty',name:'BLESSTY'},
  {id:'emopluck',name:'EMOPLUCK'},
  {id:'kormina',name:'KORMINA'},
  {id:'cilianex',name:'CILIANEX'}
 ];
 function card(item){
  const a=document.createElement('a');a.className='release-cover-card';a.href=item.collectionViewUrl;a.target='_blank';a.rel='noopener noreferrer';
  const box=document.createElement('div');box.className='release-cover-art';
  const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt='Обложка '+item.collectionName;img.src=item.artworkUrl100.replace(/100x100bb/g,'600x600bb');box.append(img);
  const title=document.createElement('span');title.className='release-cover-caption';title.textContent=item.collectionName;a.append(box,title);return a;
 }
 for(const artist of artists){
  const grid=document.getElementById('covers-'+artist.id);if(!grid)continue;
  if(artist.id==='blessty')continue; // Exact Apple Music song is statically pinned in HTML.
  const pinned=artist.id==='ty3s'?grid.querySelector('.ty3s-pinned-release'):null;
  grid.replaceChildren();if(pinned)grid.append(pinned);
  if(!artist.artistId&&artist.id!=='blessty'){
   const p=document.createElement('p');p.className='release-state';p.textContent='Обложки релизов SoundCloud пока не подтверждены.';grid.append(p);continue;
  }
  const url=artist.artistId?'https://itunes.apple.com/lookup?id='+artist.artistId+'&entity=album&limit=200&country=ua':
   'https://itunes.apple.com/search?term='+encodeURIComponent('плачу blessty lil_ty3s')+'&entity=album&limit=100&country=ua';
  try{
   const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),9000);
   let res;try{res=await fetch(url,{signal:ctl.signal})}finally{clearTimeout(timer)}
   if(!res.ok)throw Error('Unavailable');
   const data=await res.json();
   const all=(data.results||[]).filter(x=>x.wrapperType==='collection'&&x.artworkUrl100&&x.collectionViewUrl);
   const items=all.filter(x=>artist.artistId?Number(x.artistId)===artist.artistId:
     /плачу/i.test(x.collectionName||'')&&/blessty/i.test(x.artistName||'')&&/ty3s/i.test(x.artistName||''));
   const unique=[...new Map(items.map(x=>[x.collectionId,x])).values()].sort((a,b)=>(b.releaseDate||'').localeCompare(a.releaseDate||''));
   for(const item of (artist.id==='blessty'?unique.slice(0,1):unique))grid.append(card(item));
   if(!grid.children.length){const p=document.createElement('p');p.className='release-state';p.textContent=artist.id==='blessty'?'Плачу (feat. LIL TY3S) — обложка ожидает подтверждения.':'Не удалось подтвердить обложки релизов.';grid.append(p)}
  }catch(e){const p=document.createElement('p');p.className='release-state';p.textContent='Обложки временно недоступны.';grid.append(p)}
 }
})();


/* Add hover glitch to headings, artist names and navigation; keep original text accessible. */
(function(){
 const selectors=['.nav nav a','.brand','.artist-card .artist-name','.producer-name','.release-main-title','.release-artist-head h3','.section-head p','.service h3','.profile-panel h2','.hero-sub','.release-platforms a','.release-cover-caption'];
 document.querySelectorAll(selectors.join(',')).forEach(el=>{
  if(el.classList.contains('glitch')||el.querySelector('img,svg'))return;
  const value=(el.textContent||'').trim();
  if(!value||value.length>110||el.children.length)return;
  el.classList.add('etr-glitch-hover');
  el.setAttribute('data-etr-glitch',value);
 });
})();


/* Obsidian home: animated shards, parallax, scroll motion and signal flashes */
(()=>{const hero=document.querySelector('.hero-home'),field=document.getElementById('etr-shards');if(!hero||!field)return;
const mobile=matchMedia('(max-width:700px)').matches;const count=mobile?18:38;
for(let i=0;i<count;i++){const e=document.createElement('span');e.className='etr-shard';const x=i%2===0?2+(i*19.7)%31:67+(i*13.1)%31;const w=12+(i*17)%68;const vars={'--flyx':((i%2===0?1:-1)*(100+(i*37)%360))+'px','--flyy':((i%3===0?-1:1)*(130+(i*29)%320))+'px','--x':x+'%','--y':(i*31.7)%96+'%','--w':w+'px','--h':w*(1.4+(i%4)*.4)+'px','--o':(.22+(i%5)*.12).toFixed(2),'--r':(i*137.508)%360+'deg','--dx':((i%3)-1)*24+'px','--dy':((i%4)-2)*20+'px','--dur':(9+i%11)+'s','--delay':(-i*.8)+'s'};for(const [k,v] of Object.entries(vars))e.style.setProperty(k,v);field.append(e)}
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
let scrollY=0,mouseX=0,mouseY=0,framePending=false;
const render=()=>{framePending=false;const rect=hero.getBoundingClientRect();const progress=Math.max(-1,Math.min(1,-rect.top/Math.max(rect.height,1)));field.style.transform='translate3d('+mouseX*12+'px,'+(progress*-90+mouseY*10)+'px,0)';field.style.opacity=String(Math.max(.3,1-Math.max(0,progress)*.6));hero.style.setProperty('--signal-x',(50+mouseX*8)+'%');hero.style.setProperty('--signal-y',(45+mouseY*8)+'%')};
const schedule=()=>{if(!framePending){framePending=true;requestAnimationFrame(render)}};
window.addEventListener('scroll',schedule,{passive:true});if(!mobile)window.addEventListener('pointermove',e=>{mouseX=e.clientX/innerWidth-.5;mouseY=e.clientY/innerHeight-.5;schedule()},{passive:true});render();
})();


/* V17: reliable cursor-follow logo (CSS variables bypass earlier !important transforms) */
(()=>{const hero=document.querySelector('.hero-home'),logo=hero?.querySelector('.hero-logo-wrap');if(!hero||!logo||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
let tx=0,ty=0,x=0,y=0;const desktop=matchMedia('(pointer:fine)').matches;
if(desktop){window.addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2},{passive:true});}
function tick(){x+=(tx-x)*.09;y+=(ty-y)*.09;logo.style.setProperty('--logo-x',(x*30).toFixed(2)+'px');logo.style.setProperty('--logo-y',(y*20).toFixed(2)+'px');logo.style.setProperty('--logo-rx',(-y*12).toFixed(2)+'deg');logo.style.setProperty('--logo-ry',(x*15).toFixed(2)+'deg');requestAnimationFrame(tick)}tick();
})();


/* V20: moving scene fragments sampled directly from the original tunnel image.
   Independent polygon crops, perspective, parallax, fog and reflected sparks. */
(()=>{
const hero=document.querySelector('.hero-home'),canvas=document.getElementById('etr-live-canvas');
if(!hero||!canvas||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
const image=new Image();image.src='Осколочный тоннель в красном тумане.png';
let W=1,H=1,dpr=1,mx=0,my=0,px=0,py=0,visible=true;
const rnd=n=>{const v=Math.sin(n*127.1+91.37)*43758.5453;return v-Math.floor(v)};
const fragments=Array.from({length:36},(_,i)=>{
const side=i%2===0?0:1,cluster=i%5,depth=.35+rnd(i+4)*1.4;
const x=side===0?.035+rnd(i+10)*.30:.665+rnd(i+10)*.30;
const y=.04+rnd(i+26)*.91;
return {x,y,side,depth,w:.016+rnd(i+34)*.05,h:.04+rnd(i+48)*.13,phase:rnd(i+59)*6.28,speed:.25+rnd(i+73)*.75,angle:(rnd(i+82)-.5)*.55,shape:i%4};
});
const embers=Array.from({length:55},(_,i)=>({x:rnd(i+211),y:rnd(i+391),speed:.13+rnd(i+501)*.45,size:.5+rnd(i+619)*1.9,phase:rnd(i+721)*6.28}));
const fog=Array.from({length:10},(_,i)=>({x:rnd(i+902),y:rnd(i+1002),r:.11+rnd(i+1102)*.19,speed:.15+rnd(i+1202)*.2,phase:rnd(i+1302)*6.28}));
function resize(){const r=hero.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
new ResizeObserver(resize).observe(hero);resize();
window.addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
const io=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true});io.observe(hero);
function frame(ms){requestAnimationFrame(frame);if(!visible||document.hidden)return;
const t=ms*.001;px+=(mx-px)*.035;py+=(my-py)*.035;ctx.clearRect(0,0,W,H);
const iw=image.naturalWidth,ih=image.naturalHeight;
if(iw&&ih){
const scale=Math.max(W/iw,H/ih),drawW=iw*scale,drawH=ih*scale,offsetX=(W-drawW)/2,offsetY=(H-drawH)/2;
for(const f of fragments){
const bx=f.x*W,by=f.y*H,fw=f.w*W,fh=f.h*H;
const drift=Math.sin(t*f.speed+f.phase),float=Math.cos(t*f.speed*.7+f.phase);
const dx=drift*(12+18*f.depth)+px*23*f.depth,dy=float*(9+15*f.depth)+py*13*f.depth;
const sx=(bx-offsetX)/scale,sy=(by-offsetY)/scale,sw=fw/scale,sh=fh/scale;
if(sx<0||sy<0||sx+sw>iw||sy+sh>ih)continue;
ctx.save();ctx.translate(bx+dx,by+dy);ctx.rotate(f.angle+Math.sin(t*f.speed*.5+f.phase)*.13);ctx.globalAlpha=.43+.19*Math.sin(t*.8+f.phase);
ctx.beginPath();ctx.moveTo(-fw*.48,-fh*.48);ctx.lineTo(fw*(f.shape%2?.45:.18),-fh*.48);ctx.lineTo(fw*.49,fh*(f.shape%3?.44:.12));ctx.lineTo(-fw*.38,fh*.5);ctx.closePath();ctx.clip();
ctx.drawImage(image,sx,sy,sw,sh,-fw/2,-fh/2,fw,fh);
ctx.globalAlpha=.15;ctx.strokeStyle='#d9e2ed';ctx.lineWidth=.7;ctx.stroke();ctx.restore();
}
}
ctx.save();ctx.globalCompositeOperation='screen';
for(const f of fog){const x=(f.x+.045*Math.sin(t*f.speed+f.phase))*W,y=(f.y+.06*Math.cos(t*f.speed*.7+f.phase))*H;const radius=f.r*Math.max(W,H);const g=ctx.createRadialGradient(x,y,0,x,y,radius);g.addColorStop(0,'rgba(114,13,22,.035)');g.addColorStop(.45,'rgba(95,9,18,.018)');g.addColorStop(1,'rgba(40,0,5,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill()}
for(const e of embers){const x=(e.x+Math.sin(t*.3+e.phase)*.017)*W,y=((e.y-t*e.speed*.065)%1+1)%1*H;const pulse=.25+.4*(.5+.5*Math.sin(t*1.8+e.phase));ctx.globalAlpha=pulse;ctx.fillStyle=e.size>1.5?'#ff5660':'#bd2631';ctx.beginPath();ctx.arc(x,y,e.size,0,Math.PI*2);ctx.fill()}
ctx.restore();
}requestAnimationFrame(frame);
})();
