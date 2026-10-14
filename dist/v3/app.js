const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const heroScene=document.querySelector('.persona-hero');
let heroInView=true;

function updateHeroMotion(){
  document.documentElement.classList.toggle('motion-ready',!reducedMotion.matches);
  heroScene?.classList.toggle('is-motion-paused',reducedMotion.matches||!heroInView||document.hidden);
}

reducedMotion.addEventListener('change',updateHeroMotion);
document.addEventListener('visibilitychange',updateHeroMotion);
if(heroScene&&'IntersectionObserver' in window){
  new IntersectionObserver(([entry])=>{
    heroInView=entry.isIntersecting;
    updateHeroMotion();
  },{threshold:0}).observe(heroScene);
}
updateHeroMotion();

const carousel=document.querySelector('[data-carousel]');
if(carousel){
  const slides=[...carousel.querySelectorAll('.persona-slide')];
  const bioName=carousel.querySelector('.carousel-bio h3');
  const bioText=carousel.querySelector('.carousel-bio p');
  const dots=carousel.querySelector('.carousel-dots');
  const carouselVisual=carousel.querySelector('.carousel-visual');
  let current=0;

  slides.forEach((slide,index)=>{
    const dot=document.createElement('button');
    dot.type='button';
    dot.setAttribute('aria-label',window.copyValues['avatars.dot.'+index]);
    dot.dataset.copyAttrs='aria-label:avatars.dot.'+index;
    dot.addEventListener('click',()=>select(index));
    dots.append(dot);
    slide.addEventListener('click',()=>select(index));
  });

  const wrappedDistance=(index)=>{
    let distance=index-current;
    const half=Math.floor(slides.length/2);
    if(distance>half)distance-=slides.length;
    if(distance < -half)distance+=slides.length;
    return distance;
  };

  function select(index){
    current=(index+slides.length)%slides.length;
    slides.forEach((slide,slideIndex)=>{
      const distance=wrappedDistance(slideIndex);
      // A wrapped slide must jump offstage, never travel behind the active one.
      const previous=Number(slide.style.getPropertyValue('--position'));
      const reposition=Math.abs(distance-previous)>1 || Math.abs(distance)>1;
      slide.style.transition=reposition?'none':'';
      slide.style.setProperty('--position',distance);
      slide.style.setProperty('--translate',`${distance*78}%`);
      slide.dataset.distance=Math.abs(distance);
      slide.classList.toggle('is-current',distance===0);
      slide.setAttribute('aria-pressed',distance===0?'true':'false');
      slide.tabIndex=distance===0?0:-1;
    });
    // Commit offstage positions before restoring transitions on the next selection.
    void carouselVisual.offsetWidth;
    [...dots.children].forEach((dot,index)=>{
      dot.classList.toggle('is-current',index===current);
      dot.setAttribute('aria-current',index===current?'true':'false');
    });
    bioName.textContent=slides[current].dataset.name;
    bioName.dataset.copy=slides[current].dataset.copyAttrs.split('|').find(x=>x.startsWith('data-name:')).slice(10);
    bioText.textContent=slides[current].dataset.bio;
    bioText.dataset.copy=slides[current].dataset.copyAttrs.split('|').find(x=>x.startsWith('data-bio:')).slice(9);
    if(!reducedMotion.matches){
      [bioName,bioText].forEach(el=>{
        el.getAnimations().forEach(animation=>animation.cancel());
        el.animate([{opacity:.35,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
      });
    }
    window.prepareInline?.();
    window.fitAvatarNames?.();
    window.glitchAvatar?.(slides[current].querySelector('img'));
  }

  carousel.querySelector('.previous').addEventListener('click',()=>select(current-1));
  carousel.querySelector('.next').addEventListener('click',()=>select(current+1));
  carousel.addEventListener('keydown',(event)=>{
    if(event.key==='ArrowLeft'){event.preventDefault();select(current-1)}
    if(event.key==='ArrowRight'){event.preventDefault();select(current+1)}
  });
  let touchStart=0;
  carouselVisual.addEventListener('touchstart',(event)=>{touchStart=event.changedTouches[0].clientX},{passive:true});
  carouselVisual.addEventListener('touchend',(event)=>{
    const distance=event.changedTouches[0].clientX-touchStart;
    if(Math.abs(distance)>45)select(current+(distance<0?1:-1));
  },{passive:true});
  window.refreshCarousel=()=>select(current);
  select(1);
}

const revealElements=[...document.querySelectorAll('.section-heading,.problem-intro,.problem-character,.persona-carousel,.media-card,.action-grid article,.help-first article,.help-grid>a,.about>div,.editorial>h2,.editorial>div,.risk-terms details')];
let revealObserver;
function configureReveals(){
  revealObserver?.disconnect();
  if(reducedMotion.matches||!('IntersectionObserver' in window)){
    revealElements.forEach(el=>el.classList.remove('scroll-reveal'));
    return;
  }
  revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting)entry.target.classList.add('is-visible');
      else if(entry.boundingClientRect.top>window.innerHeight)entry.target.classList.remove('is-visible');
    });
  },{threshold:0,rootMargin:'0px 0px -90px 0px'});
  revealElements.forEach(el=>{
    if(el.closest('.action-grid,.help-first,.help-grid,.media-grid')){
      el.style.setProperty('--reveal-delay',`${[...el.parentElement.children].indexOf(el)*120}ms`);
    }
    // Content already above or inside the viewport stays visible on reload/deep links.
    if(el.getBoundingClientRect().top<window.innerHeight)el.classList.add('is-visible');
    el.classList.add('scroll-reveal');
    revealObserver.observe(el);
  });
}
configureReveals();
reducedMotion.addEventListener('change',configureReveals);

// Only the decorative backdrop moves; content stays anchored for reading/editing.
let depthFrame=0;
function updateDepth(){
  depthFrame=0;
  if(!heroScene)return;
  const desktop=window.matchMedia('(min-width:851px)').matches;
  const offset=reducedMotion.matches||!desktop?0:Math.min(90,Math.max(0,-document.querySelector('.hero').getBoundingClientRect().top)*.16);
  heroScene.style.setProperty('--circle-offset',`${offset}px`);
}
function scheduleDepth(){if(!depthFrame)depthFrame=requestAnimationFrame(updateDepth)}
window.addEventListener('scroll',scheduleDepth,{passive:true});
window.addEventListener('resize',scheduleDepth,{passive:true});
reducedMotion.addEventListener('change',scheduleDepth);
updateDepth();

// Short, staggered RGB slices; no full-screen flashes or continuous shaking.
const glitchImages=[...document.querySelectorAll('.hero-persona-main,.persona-slide>img')];
const glitchLayers=new Map();
const glitchLastRun=new WeakMap();
glitchImages.forEach(img=>{
  const layer=document.createElement('img');
  layer.src=img.src;layer.alt='';layer.setAttribute('aria-hidden','true');
  layer.className='avatar-glitch-layer';
  img.parentElement.append(layer);glitchLayers.set(img,layer);
  img.parentElement.addEventListener('pointerenter',()=>glitchAvatar(img));
});
function glitchAvatar(img){
  const layer=glitchLayers.get(img);
  if(!layer||reducedMotion.matches||document.hidden)return;
  const rect=img.getBoundingClientRect();
  if(rect.bottom<0||rect.top>innerHeight||img.closest('[data-distance="2"]'))return;
  if(performance.now()-(glitchLastRun.get(img)??-5000)<1800)return;
  glitchLastRun.set(img,performance.now());
  layer.getAnimations().forEach(a=>a.cancel());
  layer.animate([
    {opacity:0,transform:'translateX(0)',clipPath:'inset(8% 0 58% 0)'},
    {opacity:1,transform:'translateX(-18px)',clipPath:'inset(8% 0 58% 0)',offset:.1},
    {opacity:.95,transform:'translateX(16px)',clipPath:'inset(42% 0 22% 0)',offset:.35},
    {opacity:.9,transform:'translateX(-12px)',clipPath:'inset(65% 0 8% 0)',offset:.6},
    {opacity:.7,transform:'translateX(8px)',clipPath:'inset(18% 0 48% 0)',offset:.8},
    {opacity:0,transform:'translateX(0)',clipPath:'inset(18% 0 48% 0)'}
  ],{duration:720,easing:'steps(1,end)'});
  img.animate([
    {translate:'0 0'},
    {translate:'-3px 0',offset:.15},
    {translate:'3px 0',offset:.4},
    {translate:'-2px 0',offset:.65},
    {translate:'0 0'}
  ],{duration:720,easing:'steps(1,end)'});
}
window.glitchAvatar=glitchAvatar;
// Measure actual rendered text, including edited names and loaded web fonts.
const avatarNames=[...document.querySelectorAll('.carousel-bio h3,.hero-avatar-tag')];
function fitAvatarNames(){
  avatarNames.forEach(el=>{
    el.style.removeProperty('font-size');
    const available=el.clientWidth;
    if(!available)return;
    const size=parseFloat(getComputedStyle(el).fontSize);
    if(el.scrollWidth>available)el.style.fontSize=`${Math.floor(size*available/el.scrollWidth*100)/100}px`;
  });
}
window.fitAvatarNames=fitAvatarNames;
const nameResize=new ResizeObserver(fitAvatarNames);
avatarNames.forEach(el=>{
  nameResize.observe(el.parentElement);
  new MutationObserver(fitAvatarNames).observe(el,{childList:true,characterData:true,subtree:true});
});
document.fonts.ready.then(fitAvatarNames);
window.addEventListener('resize',fitAvatarNames,{passive:true});
fitAvatarNames();
const playersTitle=document.querySelector('#players-title');
function fitTitlePanel(){
  if(!playersTitle)return;
  playersTitle.style.removeProperty('width');
  const range=document.createRange();
  const text=playersTitle.querySelector('[data-copy]');
  if(!text)return;
  range.selectNodeContents(text);
  const lines=[...range.getClientRects()];
  if(!lines.length)return;
  const style=getComputedStyle(playersTitle);
  const scale=playersTitle.getBoundingClientRect().width/playersTitle.offsetWidth||1;
  const textWidth=Math.max(...lines.map(line=>line.width))/scale;
  const frame=['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'].reduce((sum,key)=>sum+parseFloat(style[key]),0);
  playersTitle.style.width=`${Math.ceil(textWidth+frame+2)}px`;
}
document.fonts.ready.then(fitTitlePanel);
new ResizeObserver(fitTitlePanel).observe(playersTitle.parentElement);
new MutationObserver(fitTitlePanel).observe(playersTitle,{childList:true,characterData:true,subtree:true});
window.addEventListener('resize',fitTitlePanel,{passive:true});
setInterval(()=>{
  if(reducedMotion.matches||document.hidden)return;
  const visible=glitchImages.filter(img=>{
    const rect=img.getBoundingClientRect();
    return rect.bottom>0&&rect.top<innerHeight&&(img.matches('.hero-persona-main')||img.closest('.persona-slide.is-current'));
  });
  visible.forEach(glitchAvatar);
},2600);
if('IntersectionObserver' in window){
  const glitchObserver=new IntersectionObserver(entries=>{
    entries.filter(entry=>entry.isIntersecting).forEach(entry=>{
      const img=entry.target;
      if(img.matches('.hero-persona-main')||img.closest('.is-current'))glitchAvatar(img);
    });
  },{threshold:.35});
  glitchImages.forEach(img=>glitchObserver.observe(img));
}
reducedMotion.addEventListener('change',()=>{
  if(reducedMotion.matches)[...glitchLayers.values(),...glitchImages].forEach(layer=>layer.getAnimations().forEach(a=>a.cancel()));
});
