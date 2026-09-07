// ===================== CALENDAR =====================

function renderCalendar() {
  const dowRow = $('#cal-dow-row');

  dowRow.innerHTML =
    ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      .map(d => `<div class="cal-dow">${d}</div>`)
      .join('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  $('#cal-month-label').textContent =
    `${monthNames[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const grid = $('#cal-grid');

  grid.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const c = document.createElement('div');
    c.className = 'cal-cell empty';
    grid.appendChild(c);
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  for (let d = 1; d <= daysInMonth; d++) {

    const dateStr =
      `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const dayAttempts =
      DATA.attempts.filter(a => a.date === dateStr);

    const cell = document.createElement('div');

    cell.className =
      'cal-cell' +
      (dayAttempts.length ? ' has-attempt' : '') +
      (dateStr === todayStr ? ' today' : '');

    const bestPct =
      dayAttempts.length
        ? Math.max(...dayAttempts.map(a => a.percent))
        : null;

    cell.innerHTML =
      `<span>${d}</span>` +
      (dayAttempts.length
        ? `<span class="dot" style="background:${bestPct >= 40
            ? 'var(--accent-teal)'
            : 'var(--accent-coral)'};"></span>`
        : '');

    if (dayAttempts.length) {
      cell.addEventListener('click', () =>
        renderDayList(dateStr, dayAttempts)
      );
    }

    grid.appendChild(cell);
  }

  $('#day-list').innerHTML = '';
}


function renderDayList(dateStr, attempts) {

  const box = $('#day-list');

  box.innerHTML =
    `<div style="font-family:'Space Grotesk',sans-serif;font-size:15px;margin:14px 0 10px;">
      ${dateStr} — ${attempts.length} attempt(s)
    </div>` +

    attempts.map(a =>
      `<div class="day-attempt">
        <span>
          Level ${a.level} · ${a.correct} correct / ${a.incorrect} incorrect
        </span>

        <span style="color:${a.percent >= 40
          ? 'var(--accent-teal)'
          : 'var(--accent-coral)'};
          font-weight:700;">
          ${a.percent}% · ${a.grade}
        </span>
      </div>`
    ).join('');
}


// Previous month
$('#cal-prev').addEventListener('click', () => {

  calMonth--;

  if (calMonth < 0) {
    calMonth = 11;
    calYear--;
  }

  renderCalendar();
});


// Next month
$('#cal-next').addEventListener('click', () => {

  calMonth++;

  if (calMonth > 11) {
    calMonth = 0;
    calYear++;
  }

  renderCalendar();
});