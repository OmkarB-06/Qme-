QUESTION ME — SEPARATED JAVASCRIPT FILES
========================================

Files:
- state.js               -> global app state
- storage.js             -> saves progress in browser localStorage
- question_data.js       -> 20 levels × 15 questions
- question_generator.js  -> question generation and level helpers
- utils.js               -> common helper functions
- dashboard.js           -> dashboard
- trail.js               -> 20-level trail
- test.js                -> test, timer, answers and scoring
- result.js              -> result and answer review
- calendar.js            -> calendar/history
- app.js                 -> navigation and startup
- script.js              -> optional loader for all files

IMPORTANT FIXES INCLUDED
1. The old code used undefined LOGICAL_POOL and CODE_POOL.
   buildTest() now uses QUESTION_POOL[level], which actually exists.
2. The old code used window.storage, which is not a normal browser API.
   Progress is now stored with localStorage.
3. The old code called render(), but no render() function existed.
   Startup now calls loadData() and showView('dashboard').

IF YOU ARE USING FLASK
Recommended structure:

project/
    app.py
    templates/
        dashboard.html
    static/
        css/
            style.css
        js/
            state.js
            storage.js
            question_data.js
            question_generator.js
            utils.js
            dashboard.js
            trail.js
            test.js
            result.js
            calendar.js
            app.js
            script.js

In dashboard.html use:
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">

At the bottom use either ALL individual scripts in this exact order:
<script src="{{ url_for('static', filename='js/state.js') }}"></script>
<script src="{{ url_for('static', filename='js/storage.js') }}"></script>
<script src="{{ url_for('static', filename='js/question_data.js') }}"></script>
<script src="{{ url_for('static', filename='js/question_generator.js') }}"></script>
<script src="{{ url_for('static', filename='js/utils.js') }}"></script>
<script src="{{ url_for('static', filename='js/dashboard.js') }}"></script>
<script src="{{ url_for('static', filename='js/trail.js') }}"></script>
<script src="{{ url_for('static', filename='js/test.js') }}"></script>
<script src="{{ url_for('static', filename='js/result.js') }}"></script>
<script src="{{ url_for('static', filename='js/calendar.js') }}"></script>
<script src="{{ url_for('static', filename='js/app.js') }}"></script>

OR use only:
<script src="{{ url_for('static', filename='js/script.js') }}"></script>

If using script.js, make sure script.js is inside static/js/.
