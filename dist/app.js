const questions = [
  'Laat eens zien wat je zo leuk vindt aan dit spel',
  'Met wie speel je meestal?',
  'Hoe weet je wie er achter een account zit?',
  'Heeft iemand je ooit gevraagd ergens anders verder te praten?',
  'Wat zou je doen als iemand je gratis spullen aanbiedt?',
  'Welke afspraken zouden jou helpen als iets online niet goed voelt?'
];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches) document.documentElement.classList.add('motion-ready');

let questionIndex = 0;
const questionCard = document.querySelector('#question-card');
document.querySelector('#next-question').addEventListener('click', () => {
  questionIndex = (questionIndex + 1) % questions.length;
  questionCard.textContent = `“${questions[questionIndex]}”`;
});

const advice = {
  chat: 'Vraag wie er kan meeluisteren en hoe je kind iemand blokkeert of rapporteert.',
  unknown: 'Bekijk samen de contacten. Vraag wat je kind over deze spelers weet en hoe het dat weet.',
  move: 'Bespreek waarom het gesprek verhuist en welke persoonlijke informatie daar zichtbaar wordt.',
  money: 'Spreek vooraf een bedrag af en zet waar mogelijk aankoopbeveiliging of goedkeuring aan.',
  unsure: 'Laat je kind één favoriete game en een paar vaste medespelers aan je voorstellen.'
};

const form = document.querySelector('#safety-form');
const result = document.querySelector('#check-result');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const chosen = [...form.querySelectorAll('input:checked')].map(input => input.value);
  const items = chosen.length ? chosen.map(key => `<li>${advice[key]}</li>`).join('') : '<li>Begin eenvoudig: vraag je kind om zijn of haar favoriete game aan jou uit te leggen.</li>';
  result.innerHTML = `<h3>Kies één moment om samen te kijken.</h3><ul>${items}</ul><p><small>Geen score of diagnose—alleen praktische gesprekspunten.</small></p><button type="button" class="button primary" id="reset-check">Opnieuw invullen</button>`;
  form.hidden = true;
  result.hidden = false;
  result.focus();
  document.querySelector('#reset-check').addEventListener('click', () => {
    form.reset();
    result.hidden = true;
    form.hidden = false;
    form.querySelector('input').focus();
  });
});
