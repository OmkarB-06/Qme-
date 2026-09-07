// ===================== RESULT =====================

function renderResult() {
  const r = lastResult;

  $('#result-grade').textContent = r.grade;
  $('#result-grade').style.borderColor =
    r.passed ? 'var(--accent-teal)' : 'var(--accent-coral)';
  $('#result-grade').style.color =
    r.passed ? 'var(--accent-teal)' : 'var(--accent-coral)';

  $('#result-title').textContent =
    r.passed
      ? `Level ${activeLevel} cleared!`
      : `Level ${activeLevel} — not cleared yet`;

  $('#result-sub').textContent =
    r.passed
      ? (activeLevel < 20
        ? 'Level ' + (activeLevel + 1) + ' is now unlocked.'
        : 'You have conquered the final level!')
      : 'Score 40% or higher to unlock the next level. Try again!';

  $('#r-correct').textContent = r.correct;
  $('#r-incorrect').textContent = r.incorrect;
  $('#r-unattempted').textContent = r.unattempted;
  $('#r-marks').textContent = r.marks + ' / 15';
  $('#r-percent').textContent = r.percent + '%';

  $('#review-list').classList.add('hidden');
  $('#btn-review-toggle').textContent = 'Review Answers';

  const list = $('#review-list');

  list.innerHTML = r.reviews.map((item, idx) => {
    const correctText = item.q.opts[item.q.correctIndex];
    const yourText =
      item.ans !== null ? item.q.opts[item.ans] : '— not answered —';
    const isRight = item.ans === item.q.correctIndex;

    return `<div class="review-item">
      <div class="qmeta" style="font-size:10.5px;color:var(--text-faint);text-transform:uppercase;margin-bottom:6px;">
        Q${idx + 1} · ${item.q.category}
      </div>
      <div class="qtext">${escapeHtml(item.q.qtext)}</div>
      ${item.q.code ? `<pre>${escapeHtml(item.q.code)}</pre>` : ''}
      <div class="ans-line ${isRight ? 'correct' : 'wrong'}">
        Your answer: ${escapeHtml(yourText)}
      </div>
      ${!isRight
        ? `<div class="ans-line correct">Correct answer: ${escapeHtml(correctText)}</div>`
        : ''}
    </div>`;
  }).join('');
}

const btnReviewToggle = $('#btn-review-toggle');
const btnBackTrail = $('#btn-back-trail');

if (btnReviewToggle) {
  btnReviewToggle.addEventListener('click', () => {
    const list = $('#review-list');
    const hidden = list.classList.toggle('hidden');

    btnReviewToggle.textContent =
      hidden ? 'Review Answers' : 'Hide Review';
  });
}

if (btnBackTrail) {
  btnBackTrail.addEventListener('click', () => {
    showView('trail');
  });
}