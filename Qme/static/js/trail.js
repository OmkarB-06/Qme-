// ===================== TRAIL =====================

function isUnlocked(level) {
  if (level === 1) return true;
  return DATA.levels[level - 1] && DATA.levels[level - 1].passed;
}

function renderTrail() {
  const trail = $('#trail');
  trail.innerHTML = '<div class="trail-path"></div>';

  for (let lvl = 1; lvl <= 20; lvl++) {
    const row = document.createElement('div');
    row.className = 'trail-row ' + (lvl % 2 === 0 ? 'right' : 'left');

    const unlocked = isUnlocked(lvl);
    const info = DATA.levels[lvl];
    const passed = info && info.passed;
    const isCurrent = unlocked && !passed;

    const node = document.createElement('div');

    node.className = 'node ' +
      (passed
        ? 'passed'
        : (unlocked
          ? (isCurrent ? 'current' : '')
          : 'locked'));

    const tierNames = ['', 'FOUND.', 'SPEED', 'ADVANCED', 'PRO'];

    node.innerHTML =
      `<span class="tier-tag">${tierNames[levelTier(lvl)]}</span>` +
      `<span class="num">${lvl}</span>` +
      (passed
        ? `<span class="stars">${'★'.repeat(starsFor(info.bestPercent))}${'☆'.repeat(3 - starsFor(info.bestPercent))}</span>`
        : '');

    node.addEventListener('click', () => {
      if (unlocked) openLevelOverlay(lvl);
    });

    const label = document.createElement('div');

    label.className = 'node-label';

    label.textContent =
      `Level ${lvl} · ${levelName(lvl)}`;

    if (lvl % 2 === 0) {
      row.appendChild(node);
      row.appendChild(label);
    } else {
      row.appendChild(label);
      row.appendChild(node);
    }

    trail.appendChild(row);
  }
}


function openLevelOverlay(level) {

  activeLevel = level;

  $('#ov-title').textContent =
    'Level ' + level;

  $('#ov-sub').textContent =
    levelName(level) + ' · ' +
    [
      'Quant, logical & coding basics',
      'Faster pace, trickier logic',
      'Multi-step reasoning & DSA basics',
      'Placement-grade difficulty'
    ][levelTier(level) - 1];

  const info = DATA.levels[level];

  $('#ov-best').textContent = info
    ? `Best: ${info.bestPercent}% (${info.bestCorrect}/15)`
    : 'Best: —';

  $('#level-overlay').classList.remove('hidden');
}


// Only run trail event handlers on the Trail page
if ($('#trail')) {

  $('#ov-cancel').addEventListener('click', () => {
    $('#level-overlay').classList.add('hidden');
  });

  $('#ov-start').addEventListener('click', () => {
    window.location.href =
      '/test?level=' + activeLevel;
  });

}