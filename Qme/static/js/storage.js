// ===================== STORAGE =====================

const STORE_KEY = 'climbiq-progress-v1';

function loadData() {

  try {

    const saved = localStorage.getItem(STORE_KEY);

    if (saved) {
      DATA = JSON.parse(saved);
    }

  } catch (e) {

    console.error('Could not load saved progress:', e);

  }

  // Only render Dashboard if Dashboard elements exist
  if ($('#stat-levels')) {
    renderDashboard();
  }

  // Only render Trail if Trail elements exist
  if ($('#trail')) {
    renderTrail();
  }

}

function saveData() {

  try {

    localStorage.setItem(
      STORE_KEY,
      JSON.stringify(DATA)
    );

  } catch (e) {

    console.error('Could not save progress:', e);

  }

}
