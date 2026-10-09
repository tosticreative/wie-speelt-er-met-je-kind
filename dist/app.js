const questions = [
  'Laat eens zien wat je zo leuk vindt aan dit spel',
  'Met wie speel je meestal?',
  'Hoe weet je wie er achter een account zit?',
  'Heeft iemand je ooit gevraagd ergens anders verder te praten?',
  'Wat zou je doen als iemand je gratis spullen aanbiedt?',
  'Weet je dat je geen straf krijgt als je iets vertelt wat niet goed voelde?'
];

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
  result.innerHTML = `<p class="eyebrow">Jullie volgende stap</p><h3>Kies één moment om samen te kijken.</h3><ul>${items}</ul><p><small>Dit is geen risicoscore of diagnose. Het zijn gesprekspunten op basis van wat je zelf hebt aangevinkt.</small></p><button type="button" class="button primary" id="reset-check">Opnieuw invullen</button>`;
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
