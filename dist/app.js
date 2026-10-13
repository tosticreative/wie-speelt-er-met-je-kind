const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches)document.documentElement.classList.add('motion-ready');
