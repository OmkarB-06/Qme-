// ===================== TEST =====================

function startTest(level) {
  activeLevel = level;
  testQuestions = buildTest(level);
  userAnswers = new Array(15).fill(null);
  currentQIndex = 0;
  timeLeft = 15 * 60;

  if (typeof showView === 'function') {
  showView('test');
}

  $('#test-title').textContent = 'Level ' + level + ' — ' + levelName(level);

  renderJumpgrid();
  renderQuestion();

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(tick, 1000);
  updateTimerDisplay();
}

function tick() {
  timeLeft--;

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    timeLeft = 0;
    finishTest();
  }

  updateTimerDisplay();
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const el = $('#timer');

  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  el.classList.toggle('low', timeLeft <= 60);
}

function renderQuestion() {
  const q = testQuestions[currentQIndex];

  $('#test-sub').textContent = `Question ${currentQIndex + 1} of 15`;
  $('#progress-fill').style.width = ((currentQIndex + 1) / 15 * 100) + '%';

  const card = $('#qcard');

  let html =
    `<div class="qmeta">${q.category}</div>` +
    `<div class="qtext">${escapeHtml(q.qtext)}</div>`;

  if (q.code) {
    html += `<pre>${escapeHtml(q.code)}</pre>`;
  }

  q.opts.forEach((opt, i) => {
    const sel = userAnswers[currentQIndex] === i;

    html +=
      `<div class="opt ${sel ? 'selected' : ''}" data-i="${i}">` +
      `<div class="letter">${String.fromCharCode(65 + i)}</div>` +
      `<div class="otext">${escapeHtml(opt)}</div>` +
      `</div>`;
  });

  card.innerHTML = html;

  card.querySelectorAll('.opt').forEach(el => {
    el.addEventListener('click', () => {
      userAnswers[currentQIndex] = parseInt(el.dataset.i);
      renderQuestion();
      renderJumpgrid();
    });
  });

  $('#btn-prev').disabled = currentQIndex === 0;
  $('#btn-prev').style.opacity = currentQIndex === 0 ? .4 : 1;
}

function renderJumpgrid() {
  const g = $('#jumpgrid');
  g.innerHTML = '';

  for (let i = 0; i < 15; i++) {
    const b = document.createElement('div');

    b.className =
      'jbtn ' +
      (userAnswers[i] !== null ? 'answered' : '') +
      (i === currentQIndex ? ' current' : '');

    b.textContent = i + 1;

    b.addEventListener('click', () => {
      currentQIndex = i;
      renderQuestion();
      renderJumpgrid();
    });

    g.appendChild(b);
  }
}


async function finishTest() {
  if (timerInterval) clearInterval(timerInterval);

  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;
  const reviews = [];

  testQuestions.forEach((q, i) => {
    const ans = userAnswers[i];

    if (ans === null) {
      unattempted++;
    } else if (ans === q.correctIndex) {
      correct++;
    } else {
      incorrect++;
    }

    reviews.push({ q, ans });
  });

  const marks = correct;
  const percent = Math.round((correct / 15) * 1000) / 10;
  const grade = gradeFor(percent);
  const passed = percent >= 40;

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  DATA.attempts.push({
    level: activeLevel,
    date: dateStr,
    correct,
    incorrect,
    unattempted,
    percent,
    grade
  });

  const info = DATA.levels[activeLevel] || {
    bestPercent: 0,
    bestCorrect: 0,
    bestIncorrect: 0,
    attempts: 0,
    passed: false
  };

  info.attempts = (info.attempts || 0) + 1;
  info.lastDate = dateStr;

  if (percent >= (info.bestPercent || 0)) {
    info.bestPercent = percent;
    info.bestCorrect = correct;
    info.bestIncorrect = incorrect;
  }

  if (passed) info.passed = true;

  DATA.levels[activeLevel] = info;

  saveData();

  lastResult = {
    correct,
    incorrect,
    unattempted,
    marks,
    percent,
    grade,
    passed,
    reviews
};

localStorage.setItem('lastResult', JSON.stringify(lastResult));

window.location.href = '/result';
}
const btnPrev = $('#btn-prev');
const btnNext = $('#btn-next');
const btnSubmit = $('#btn-submit');

if (btnPrev && btnNext && btnSubmit) {

  btnPrev.addEventListener('click', () => {
    if (currentQIndex > 0) {
      currentQIndex--;
      renderQuestion();
      renderJumpgrid();
    }
  });

  btnNext.addEventListener('click', () => {
    if (currentQIndex < 14) {
      currentQIndex++;
      renderQuestion();
      renderJumpgrid();
    }
  });

  btnSubmit.addEventListener('click', () => {
    if (confirm('Submit the test now?')) {
      finishTest();
    }
  });

}
// Automatically start the selected level when /test?level=... opens
if (
  typeof CURRENT_LEVEL !== 'undefined' &&
  $('#test-title')
) {
  startTest(CURRENT_LEVEL);
}
