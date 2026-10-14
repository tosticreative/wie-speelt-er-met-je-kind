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
  const bioSource=carousel.querySelector('.persona-source a');
  const sources=[
    ['https://hulplijn.offlimits.nl/onderwerpen/sextortion','Offlimits over sextortion'],
    ['https://www.politie.nl/nieuws/2026/juli/23/verdachte-20-van-verkrachting-en-mishandeling-binnen-764-com-langer-vast.html','Politie/OM over online dwang'],
    ['https://www.nji.nl/kennis/kindermishandeling/online-seksueel-misbruik','NJi over grooming en misbruik'],
    ['https://hulplijn.offlimits.nl/onderwerpen/online-benaderd-voor-seks','Offlimits over ongewenst online contact'],
    ['https://www.nji.nl/kennis/kindermishandeling/online-seksueel-misbruik','NJi over macht en controle bij misbruik']
  ];
  let current=0;

  slides.forEach((slide,index)=>{
    const dot=document.createElement('button');
    dot.type='button';
    dot.setAttribute('aria-label',`Toon ${slide.dataset.name}`);
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
    bioText.textContent=slides[current].dataset.bio;
    if(bioSource){
      bioSource.href=sources[current][0];
      bioSource.textContent=sources[current][1]+' ↗';
    }
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
  select(0);
}
