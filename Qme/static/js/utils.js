// ===================== UTILITIES =====================

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function gradeFor(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 75) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 40) return 'C';
  return 'F';
}

function starsFor(pct) {
  if (pct >= 90) return 3;
  if (pct >= 70) return 2;
  return 1;
}
