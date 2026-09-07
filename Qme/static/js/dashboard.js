function renderDashboard() {
  // Do nothing if we are not on the dashboard page
  if (!$('#stat-levels')) {
    return;
  }

  let passed = 0, tests = 0, correct = 0, incorrect = 0;

  for (const k in DATA.levels) {
    if (DATA.levels[k].passed) passed++;
  }

  DATA.attempts.forEach(a => {
    tests++;
    correct += a.correct;
    incorrect += a.incorrect;
  });

  $('#stat-levels').textContent = passed + ' / 20';
  $('#stat-tests').textContent = tests;
  $('#stat-correct').textContent = correct;
  $('#stat-incorrect').textContent = incorrect;

  const nextLevel = firstUnlockedIncomplete();

  $('#dash-msg').textContent = tests === 0
    ? 'Start Level 1 to begin your aptitude trail.'
    : `You're currently on Level ${nextLevel}. Keep climbing!`;

  const recent = DATA.attempts.slice(-5).reverse();
  const box = $('#dash-recent');

  if (recent.length === 0) {
    box.innerHTML =
      '<div class="empty-state"><div class="big">🧗</div>No attempts yet — head to the Level Trail to take your first test.</div>';
  } else {
    box.innerHTML =
      '<div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;margin-bottom:10px;color:var(--text-muted);">Recent attempts</div>' +
      recent.map(a =>
        `<div class="day-attempt"><span>Level ${a.level} · ${a.date}</span>` +
        `<span style="color:${a.percent >= 40 ? 'var(--accent-teal)' : 'var(--accent-coral)'};font-weight:700;">${a.percent}% · ${a.grade}</span></div>`
      ).join('');
  }
}

function firstUnlockedIncomplete() {
  for (let i = 1; i <= 20; i++) {
    if (!DATA.levels[i] || !DATA.levels[i].passed) {
      return i;
    }
  }

  return 20;
}