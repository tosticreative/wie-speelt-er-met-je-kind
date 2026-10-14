/* Consent-first GA4 measurement for the public campaign site. */
const measurementId='G-Z5BH6NGYPD';
const consentKey='wsmjk-analytics-consent';
const consentPanel=document.querySelector('[data-analytics-consent]');
const settingsButtons=document.querySelectorAll('[data-analytics-settings]');
let analyticsReady=false;
let sectionsObserved=false;

function currentConsent(){
  try{return localStorage.getItem(consentKey)}catch{return null}
}

function safeLabel(value){
  return String(value||'').trim().replace(/\s+/g,' ').slice(0,80);
}

function destinationType(link){
  const href=link.getAttribute('href')||'';
  if(href.startsWith('#'))return 'internal';
  if(href.startsWith('tel:'))return 'phone';
  if(/wa\.me|whatsapp/i.test(href))return 'whatsapp';
  return 'external';
}

function send(eventName,parameters={}){
  if(!analyticsReady||typeof window.gtag!=='function')return;
  window.gtag('event',eventName,parameters);
}

function showConsent(){
  consentPanel.hidden=false;
  consentPanel.querySelector('[data-analytics-choice="granted"]')?.focus();
}

function hideConsent(){consentPanel.hidden=true}

function initialiseAnalytics(){
  if(analyticsReady)return;
  analyticsReady=true;
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments)};
  const script=document.createElement('script');
  script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);
  window.gtag('js',new Date());
  window.gtag('config',measurementId,{
    allow_google_signals:false,
    allow_ad_personalization_signals:false,
    send_page_view:true
  });
  window.gtag('event','consent_granted',{event_category:'privacy'});
  configureMeasurement();
}

function configureMeasurement(){
  document.addEventListener('click',event=>{
    const link=event.target.closest('a');
    if(link){
      const section=link.closest('section,footer')?.id||link.closest('footer')?.className||'page';
      send('campaign_click',{
        link_text:safeLabel(link.textContent),
        link_type:destinationType(link),
        section_name:safeLabel(section)
      });
    }
  });

  document.querySelectorAll('.persona-slide').forEach(slide=>slide.addEventListener('click',()=>{
    send('avatar_selected',{avatar_name:safeLabel(slide.dataset.name)});
  }));
  document.querySelectorAll('.carousel-arrow').forEach(button=>button.addEventListener('click',()=>{
    send('carousel_navigation',{direction:button.classList.contains('next')?'next':'previous'});
  }));
  document.querySelectorAll('.risk-terms details').forEach((term,index)=>term.addEventListener('toggle',()=>{
    if(term.open)send('term_opened',{term_name:safeLabel(term.querySelector('strong')?.textContent),term_number:index+1});
  }));

  const milestones=[25,50,75,90];
  const reached=new Set();
  const checkScroll=()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    if(max<=0)return;
    const progress=Math.round((window.scrollY/max)*100);
    milestones.forEach(milestone=>{
      if(progress>=milestone&&!reached.has(milestone)){
        reached.add(milestone);send('scroll_depth',{percent_scrolled:milestone});
      }
    });
  };
  window.addEventListener('scroll',checkScroll,{passive:true});
  checkScroll();

  if(!sectionsObserved&&'IntersectionObserver' in window){
    sectionsObserved=true;
    const seen=new Set();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting&&!seen.has(entry.target.id)){
        seen.add(entry.target.id);send('section_view',{section_name:entry.target.id});observer.unobserve(entry.target);
      }
    }),{threshold:.45});
    document.querySelectorAll('main>section[id]').forEach(section=>observer.observe(section));
  }
}

consentPanel?.querySelectorAll('[data-analytics-choice]').forEach(button=>button.addEventListener('click',()=>{
  const choice=button.dataset.analyticsChoice;
  try{localStorage.setItem(consentKey,choice)}catch{}
  hideConsent();
  if(choice==='granted')initialiseAnalytics();
}));
settingsButtons.forEach(button=>button.addEventListener('click',showConsent));

const choice=currentConsent();
if(choice==='granted')initialiseAnalytics();
else if(choice!=='denied')showConsent();

window.campaignAnalytics={openSettings:showConsent,track:send};
