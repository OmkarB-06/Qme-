const scripts = [
  'state.js',
  'storage.js',
  'question_data.js',
  'question_generator.js',
  'utils.js',
  'dashboard.js',
  'trail.js',
  'test.js',
  'result.js',
  'calendar.js',
  'app.js'
];

let index = 0;

function loadNextScript() {
  if (index >= scripts.length) {
    return;
  }

  const script = document.createElement('script');

  script.src = `/static/js/${scripts[index]}`;

 script.onload = () => {
  index++;

  if (index >= scripts.length) {
    loadData();
    return;
  }

  loadNextScript();
};

  script.onerror = () => {
    console.error(`Failed to load: ${scripts[index]}`);
  };

  document.body.appendChild(script);
}

loadNextScript();