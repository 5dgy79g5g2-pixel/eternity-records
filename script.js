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
