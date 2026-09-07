// ===================== APP =====================

function showView(name) {

  currentView = name;

  // Hide/show only elements that actually exist on this page
  ['dashboard', 'trail', 'test', 'result', 'calendar'].forEach(v => {

    const view = $('#view-' + v);

    if (view) {
      view.classList.toggle('hidden', v !== name);
    }

  });

  // Update navigation buttons if they use data-view
  $$('.nav button').forEach(b => {

    if (b.dataset.view) {
      b.classList.toggle(
        'active',
        b.dataset.view === name
      );
    }

  });

  // Render only the view that exists
  if (name === 'dashboard' && $('#view-dashboard')) {
    renderDashboard();
  }

  if (name === 'trail' && $('#view-trail')) {
    renderTrail();
  }

  if (name === 'calendar' && $('#view-calendar')) {
    renderCalendar();
  }

}


// Navigation buttons
$$('.nav button').forEach(b => {

  if (b.dataset.view) {

    b.addEventListener('click', () => {
      showView(b.dataset.view);
    });

  }

});


// Start the app
loadData();


// Detect which page/view exists
if ($('#view-calendar')) {

  showView('calendar');

} else if ($('#view-dashboard')) {

  showView('dashboard');

} else if ($('#view-trail')) {

  showView('trail');

} else if ($('#view-test')) {

  showView('test');

} else if ($('#view-result')) {

  showView('result');

}