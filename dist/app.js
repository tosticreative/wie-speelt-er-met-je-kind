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
  chat: 'Vraag eens wie er meestal meeluisteren en of je kind weet hoe blokkeren en rapporteren werkt.',
  unknown: 'Vraag hoe je kind deze spelers heeft leren kennen en wat ze van elkaar weten.',
  move: 'Kijk samen waarom het gesprek naar een andere app gaat en welke gegevens daar zichtbaar zijn.',
  money: 'Spreek samen een bedrag af en zet goedkeuring voor aankopen aan.',
  unsure: 'Laat je kind zijn favoriete game en een paar vaste medespelers aan je voorstellen.'
};

const form = document.querySelector('#safety-form');
const result = document.querySelector('#check-result');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const chosen = [...form.querySelectorAll('input:checked')].map(input => input.value);
  const items = chosen.length ? chosen.map(key => `<li>${advice[key]}</li>`).join('') : '<li>Vraag je kind om zijn of haar favoriete game aan jou uit te leggen.</li>';
  result.innerHTML = `<h3>Dit kun je eens vragen</h3><ul>${items}</ul><p><small>Je hoeft ze niet allemaal tegelijk te bespreken. Kies er eentje die bij jullie past.</small></p><button type="button" class="button primary" id="reset-check">Nog een keer</button>`;
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
