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


/* Official Apple Music catalog: dynamically fetch all published collections and original cover art. */
(async function loadTy3sCatalog(){
 const grid=document.getElementById('ty3s-albums');if(!grid)return;
 const artistId=1707765892;
 const fallback=[['Censored - EP',2026],['Little - EP',2026],['плачу - Single',2025],['Аскорбін - Single',2025],['Ty3sseason',2025],['Work - Single',2025],['Мысли - EP',2025],['ВЕСНА - Single',2025],['Ty3s',2024],['Одесса 2015 - Single',2024],['Loser - Single',2024],['Замерзаю - Single',2024]];
 function render(items){
  grid.replaceChildren();
  for(const item of items){
   const a=document.createElement('a');a.className='ty3s-album';a.href=item.collectionViewUrl||'https://music.apple.com/ua/artist/lil-ty3s/'+artistId;a.target='_blank';a.rel='noopener noreferrer';
   const cover=document.createElement('div');cover.className='ty3s-album-cover';
   if(item.artworkUrl100){const img=document.createElement('img');img.loading='lazy';img.alt='Official artwork: '+item.collectionName;img.src=item.artworkUrl100.replace(/100x100bb/g,'600x600bb');cover.append(img)}
   else{const span=document.createElement('span');span.textContent='LIL TY3S';cover.append(span)}
   const name=document.createElement('strong');name.textContent=item.collectionName;
   const meta=document.createElement('small');meta.textContent=(item.releaseDate||'').slice(0,4)+' · APPLE MUSIC ↗';
   a.append(cover,name,meta);grid.append(a);
  }
 }
 try{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
  const response=await fetch('https://itunes.apple.com/lookup?id='+artistId+'&entity=album&limit=200&country=us',{signal:controller.signal});clearTimeout(timeout);
  if(!response.ok)throw Error('Apple catalog unavailable');
  const json=await response.json();
  const albums=(json.results||[]).filter(x=>x.wrapperType==='collection'&&String(x.artistId)===String(artistId));
  const unique=[...new Map(albums.map(x=>[x.collectionId,x])).values()].sort((a,b)=>(b.releaseDate||'').localeCompare(a.releaseDate||''));
  if(!unique.length)throw Error('No collections returned');
  render(unique);
 }catch(e){
  render(fallback.map(([collectionName,year])=>({collectionName,releaseDate:String(year),collectionViewUrl:'https://music.apple.com/ua/artist/lil-ty3s/'+artistId})));
  const note=document.createElement('p');note.className='ty3s-loading';note.textContent='For the complete live catalog and original covers, open Apple Music above.';grid.after(note);
 }
})();