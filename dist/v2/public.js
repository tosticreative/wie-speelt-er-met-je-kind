const [{fields},savedResponse]=await Promise.all([
  fetch('defaults.json').then(response=>response.json()),
  fetch('content.json').then(response=>response.ok?response.json():{values:{}}).catch(()=>({values:{}}))
]);

const values={
  ...Object.fromEntries(Object.entries(fields).map(([key,field])=>[key,field.value])),
  ...(savedResponse.values||{})
};

window.copyValues=values;

document.querySelectorAll('[data-copy]').forEach(element=>{
  const value=values[element.dataset.copy];
  if(value!==undefined)element.textContent=value;
});

document.querySelectorAll('[data-copy-attrs]').forEach(element=>{
  element.dataset.copyAttrs.split('|').forEach(binding=>{
    const separator=binding.indexOf(':');
    const attribute=binding.slice(0,separator);
    const key=binding.slice(separator+1);
    if(values[key]!==undefined)element.setAttribute(attribute,values[key]);
  });
});

await import('./app.js');
