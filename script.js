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



/* Uniform official-release cover galleries. No artist-profile embeds. */
(async function(){
 const artists=[
  {id:'ty3s',name:'LIL TY3S',artistId:1707765892},
  {id:'blessty',name:'BLESSTY'},
  {id:'emopluck',name:'EMOPLUCK'},
  {id:'kormina',name:'KORMINA'},
  {id:'cilianex',name:'CILIANEX'}
 ];
 function makeCard(item){
  const link=document.createElement('a');link.className='release-cover-card';
  link.href=item.collectionViewUrl||item.trackViewUrl||'#releases';
  link.target='_blank';link.rel='noopener noreferrer';link.title=item.collectionName||item.trackName||'Релиз';
  const wrap=document.createElement('div');wrap.className='release-cover-art';
  const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt='Обложка: '+(item.collectionName||item.trackName||'релиз');
  img.src=item.artworkUrl100.replace(/100x100bb|100x100/g,'600x600bb');
  wrap.append(img);
  const caption=document.createElement('span');caption.className='release-cover-caption';caption.textContent=item.collectionName||item.trackName;
  link.append(wrap,caption);return link;
 }
 async function getJSON(url){
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),12000);
  try{const res=await fetch(url,{signal:ctrl.signal});if(!res.ok)throw Error('catalog unavailable');return await res.json()}finally{clearTimeout(timer)}
 }
 for(const artist of artists){
  const grid=document.getElementById('covers-'+artist.id);if(!grid)continue;
  try{
   const url=artist.artistId?
    'https://itunes.apple.com/lookup?id='+artist.artistId+'&entity=album&limit=200&country=ua':
    'https://itunes.apple.com/search?term='+encodeURIComponent(artist.name)+'&entity=album&attribute=artistTerm&limit=200&country=ua';
   const data=await getJSON(url);
   const items=(data.results||[]).filter(x=>x.wrapperType==='collection'&&x.artworkUrl100&&(
    artist.artistId?Number(x.artistId)===artist.artistId:
    (x.artistName||'').trim().toLowerCase()===artist.name.toLowerCase()
   ));
   const unique=[...new Map(items.map(x=>[x.collectionId,x])).values()].sort((a,b)=>(b.releaseDate||'').localeCompare(a.releaseDate||''));
   grid.replaceChildren();
   if(!unique.length){const p=document.createElement('p');p.className='release-state';p.textContent='Подтверждённых обложек в Apple Music пока нет.';grid.append(p);continue}
   for(const item of unique)grid.append(makeCard(item));
  }catch(e){grid.replaceChildren();const p=document.createElement('p');p.className='release-state';p.textContent='Не удалось загрузить обложки. Откройте профиль артиста по ссылке выше.';grid.append(p)}
 }
})();