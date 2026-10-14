const response = await fetch('defaults.json');
const {fields} = await response.json();
let saved = {}, revision, token, available = false, dirty = false, saving = false;
let values = Object.fromEntries(Object.entries(fields).map(([k,f])=>[k,f.value]));
try {
  const r = await fetch('/api/content');
  if (!r.ok) throw Error('Opslag niet beschikbaar');
  const data = await r.json();
  saved = data.values; revision = data.revision; token = data.token;
  values = {...values, ...saved}; available = true;
} catch (e) { console.warn('Lokale tekstserver vereist voor opslag.', e); }
window.copyValues = values;
function apply() {
  document.querySelectorAll('[data-copy]').forEach(el=>{
    if (values[el.dataset.copy] !== undefined) el.textContent = values[el.dataset.copy];
  });
  document.querySelectorAll('[data-copy-attrs]').forEach(el=>{
    el.dataset.copyAttrs.split('|').forEach(binding=>{
      const i=binding.indexOf(':'); const attr=binding.slice(0,i), key=binding.slice(i+1);
      if(values[key] !== undefined) el.setAttribute(attr,values[key]);
    });
  });
  window.refreshCarousel?.();
  window.prepareInline?.();
}
apply();
await import('./app.js');
const toolbar=document.createElement('aside');
toolbar.className='editor-bar';
toolbar.innerHTML='<strong>V2 · Tekststudio</strong><button type="button" id="edit-toggle" aria-pressed="true">Bewerken aan</button><span id="save-state" role="status"></span><button type="button" id="save-copy">Opslaan</button><button type="button" id="metadata-toggle">Paginagegevens</button><button type="button" id="export-copy">Exporteer kopie</button>';
document.body.append(toolbar);
const panel=document.createElement('aside');
panel.className='editor-panel';panel.hidden=true;panel.setAttribute('aria-label','Onzichtbare paginagegevens');
panel.innerHTML='<header><h2>Paginagegevens</h2><button type="button" id="close-editor" aria-label="Editor sluiten">Sluiten ×</button></header><p>Zichtbare teksten bewerk je direct op de pagina. Hier staan alleen onzichtbare labels, alt-teksten en metadata.</p><label>Zoeken<input type="search" id="copy-search" placeholder="Zoek op tekst of onderdeel"></label><label>Onderdeel<select id="copy-section"><option value="">Alle onderdelen</option></select></label><p id="field-count"></p><div id="field-list"></div><hr><label>Herstel een geëxporteerde kopie<input id="import-copy" type="file" accept="application/json,.json"></label><p>Importeren zet teksten klaar. Pas na Opslaan worden ze bewaard.</p>';
document.body.append(panel);
const status=document.querySelector('#save-state'), save=document.querySelector('#save-copy');
function state(message){status.textContent=message || (dirty?'Niet-opgeslagen wijzigingen':available?'Bewaard op deze computer':'Alleen voorbeeld — start de tekstserver'); save.disabled=saving||!available||!dirty;}
state();
let editing=true;
function prepareInline(){
 document.body.classList.toggle('editing',editing);
 document.querySelectorAll('body [data-copy]').forEach(el=>{
  el.setAttribute('contenteditable',editing?'plaintext-only':'false');
  el.setAttribute('spellcheck','true');
 });
}
window.prepareInline=prepareInline;
prepareInline();
document.querySelector('#edit-toggle').onclick=()=>{
 document.activeElement?.blur(); editing=!editing;prepareInline();
 const button=document.querySelector('#edit-toggle');button.textContent=editing?'Bewerken aan':'Voorbeeld bekijken';
 button.setAttribute('aria-pressed',String(editing));
};
function setOpen(open){panel.hidden=!open;if(open)document.querySelector('#copy-search').focus();}
document.querySelector('#metadata-toggle').onclick=()=>setOpen(panel.hidden);
document.querySelector('#close-editor').onclick=()=>setOpen(false);
const names={'algemeen':'Algemeen','metadata':'Paginatitel en metadata','site-header':'Navigatie','top':'Header','spelers':'Personages','grooming':'Begrippen','media':'In de media','doen':'Wat ouders kunnen doen','hulp':'Hulp','over':'Campagne','verantwoording':'Verantwoording','site-footer':'Footer'};
const select=document.querySelector('#copy-section');
for(const section of new Set(Object.values(fields).map(f=>f.section))){const o=document.createElement('option');o.value=section;o.textContent=names[section]||section;select.append(o);}
const list=document.querySelector('#field-list');
function render(filterKey){
 list.replaceChildren();
 const query=document.querySelector('#copy-search').value.toLocaleLowerCase();
 for(const [key,field] of Object.entries(fields)){
  if(!field.attribute && !key.startsWith('metadata.') || field.attribute==='data-name'||field.attribute==='data-bio')continue;
  if(filterKey?key!==filterKey:(select.value&&field.section!==select.value)||!`${field.label} ${values[key]} ${names[field.section]||field.section}`.toLocaleLowerCase().includes(query))continue;
  const label=document.createElement('label');label.className='copy-field';
  const name=document.createElement('span');name.textContent=`${names[field.section]||field.section} · ${field.attribute||'Tekst'} — ${field.label}`;
  const input=document.createElement('textarea');input.value=values[key];input.rows=values[key].length>120?5:2;input.maxLength=20000;input.dataset.key=key;
  input.oninput=()=>{values[key]=input.value;dirty=true;apply();state();};
  label.append(name,input);list.append(label);
 }
 document.querySelector('#field-count').textContent=`${list.children.length} van ${Object.keys(fields).length} tekstvelden`;
}
render();select.onchange=()=>render();document.querySelector('#copy-search').oninput=()=>render();
document.addEventListener('click',event=>{
 if(!editing||event.target.closest('.editor-panel,.editor-bar'))return;
 const el=event.target.closest('[data-copy]');
 if(!el)return;
 // Prevent following links or toggling a details element, but keep native caret placement.
 if(el.closest('a,summary,button')) event.preventDefault();
 event.stopPropagation();
 el.focus();
},true);
document.addEventListener('input',event=>{
 const el=event.target.closest('body [data-copy]');
 if(!editing||!el)return;
 const key=el.dataset.copy;
 values[key]=el.innerText;
 dirty=true;state();
 // Update bindings without replacing the active text node or moving the caret.
 document.querySelectorAll('[data-copy-attrs]').forEach(node=>{
  node.dataset.copyAttrs.split('|').forEach(binding=>{
   const i=binding.indexOf(':');
   if(binding.slice(i+1)===key)node.setAttribute(binding.slice(0,i),values[key]);
  });
 });
 document.querySelectorAll('[data-copy]').forEach(node=>{
  if(node!==el&&node.dataset.copy===key)node.textContent=values[key];
 });
});
document.addEventListener('keydown',event=>{
 if(!event.target.closest('body [data-copy][contenteditable="plaintext-only"]'))return;
 if(event.key==='ArrowLeft'||event.key==='ArrowRight')event.stopPropagation();
 if(event.key==='Escape'){event.target.blur();event.stopPropagation();}
},true);
save.onclick=async()=>{
 const snapshot=JSON.stringify(values);
 saving=true;state('Bezig met opslaan…');
 try{
  const r=await fetch('/api/content',{method:'POST',headers:{'Content-Type':'application/json','X-Editor-Token':token},body:JSON.stringify({revision,values:JSON.parse(snapshot)})});
  const data=await r.json();if(!r.ok)throw Error(data.error||'Opslaan mislukt');
  revision=data.revision;dirty=JSON.stringify(values)!==snapshot;saving=false;state(dirty?'Nieuwere wijzigingen nog niet opgeslagen':'Opgeslagen op deze computer · '+new Date().toLocaleTimeString('nl-NL'));
 }catch(e){saving=false;state(e.message);}
};
document.querySelector('#export-copy').onclick=()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify({schema:1,values},null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='website-teksten-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
document.querySelector('#import-copy').onchange=async event=>{
 try{
  const file=event.target.files[0];if(!file)return;if(file.size>2000000)throw Error('Bestand te groot');
  const data=JSON.parse(await file.text());
  if(data.schema!==1||!data.values||Array.isArray(data.values)||typeof data.values!=='object'||Object.values(data.values).some(v=>typeof v!=='string'||v.length>20000))throw Error('Ongeldige tekstkopie');
  values={...values,...data.values};window.copyValues=values;dirty=true;apply();render();state('Kopie ingeladen — klik Opslaan om te bewaren');
 }catch(e){state(e.message);}
 event.target.value='';
};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();if(!save.disabled)save.click();}if(e.key==='Escape')setOpen(false);});
