# Question Me — Fixed Flask Project

This is your project, corrected and consolidated into a **single working
Flask app**. Everything — pages and login/signup — now runs from one
server on one port. No more Node backend, no more port mismatches.

---

## 1. Requirements

You need **Python 3.9+** installed. Check with:
```
python --version
```
(On some systems it's `python3` instead of `python`.)

---

## 2. Install & Run

1. Unzip this project.
2. Open a terminal **inside the project folder** (the one with `app.py` in it).
3. Install Flask:
   ```
   pip install -r requirements.txt
   ```
4. Start the server:
   ```
   python app.py
   ```
   You should see:
   ```
   * Running on http://127.0.0.1:5000
   ```
5. Open your browser to:
   ```
   http://127.0.0.1:5000/
   ```
   That's your new Home page. Sign up, and you'll land on `/dashboard`.

**Keep the terminal window open** — closing it stops the server. Every page
(`/login`, `/signup`, `/dashboard`, `/trail`, `/test`, `/result`,
`/calendar`, `/about`, `/help`) and the login system are all served from
this one process now.

---

## 3. What was wrong, and what I fixed

Your uploaded project had two backends mixed together (an old Node/Express
auth server and a newer Flask app for pages), which conflicted and broke
login entirely. Full list of fixes:

1. **Login/signup now actually work.** Added real `/api/signup`,
   `/api/login`, `/api/logout`, `/api/me` routes directly in `app.py`,
   using Flask's built-in signed session cookie (`session["user_id"]`) and
   `werkzeug.security` for password hashing. Users are stored in
   `data/users.json` via `db.py` (same approach as before, just in Python).
2. **Fixed `login.html` / `signup.html`** — they were calling
   `http://127.0.0.1:5001/api/...` (a server that wasn't running, and would
   have hit a CORS error even if it were). Changed to relative `/api/...`
   calls, which now hit this same Flask server. Also removed a duplicate
   `</head>` tag in both files.
3. **Pages are now actually protected.** `auth-guard.js` is now included on
   `dashboard.html`, `trail.html`, `calendar.html`, `about.html`,
   `help.html`, `test.html`, and `result.html` — visiting any of them
   without being logged in redirects to `/login`. A working **Logout**
   button was added to the nav on `dashboard`, `trail`, `calendar`,
   `about`, and `help`.
4. **Removed the dead `auth.js`** — a second, incompatible auth script
   using `localStorage` tokens that wasn't referenced anywhere and
   conflicted with the cookie-based session approach.
5. **Fixed broken links** on `home.html` and `help.html` that pointed to
   `about.html` / `login.html` / `signup.html` (plain filenames) instead of
   the actual Flask routes (`/about`, `/login`, `/signup`).
6. **Fixed `home.js` not loading** — its `<script src="home.js">` tag was
   missing Flask's `url_for()`, so the browser 404'd on it.
7. **Removed clutter** that had ended up inside the project folder: a 32MB
   `node-v24.20.0-x64.msi` installer, a leftover nested zip, the old Node
   backend (`server.js`, `db.js`, `node_modules`, `package.json`), and an
   empty, unused `templates/index.html`.

Everything above was tested end-to-end with a live server before being
packaged: all 10 page routes return 200, all CSS/JS assets load, and the
full signup → duplicate-email-rejection → wrong-password-rejection →
login → session-check → logout flow was verified to work correctly.

---

## 4. Before you deploy this anywhere public

1. **Change the secret key.** In `app.py`:
   ```python
   app.secret_key = "change-this-to-a-long-random-secret-before-going-live"
   ```
   Replace it with a real random string (run
   `python -c "import secrets; print(secrets.token_hex(32))"` to generate
   one), ideally loaded from an environment variable instead of hardcoded.
2. **Turn off debug mode.** In `app.py`, change:
   ```python
   app.run(debug=True, port=5000)
   ```
   to `debug=False` once you're done developing — debug mode exposes a
   Python code execution console in the browser on errors, which is
   dangerous on a public server.
3. **Move off the JSON file database** (`data/users.json`) to a real
   database (PostgreSQL, MySQL, etc.) once you have real users. The
   functions in `db.py` are written so this swap doesn't require touching
   `app.py`.

---

## 5. What I did NOT touch

The actual aptitude-test engine — `question_generator.js`, `test.js`,
`trail.js`, `dashboard.js`, `calendar.js`, `result.js`, `state.js`,
`storage.js`, `question_data.js`, `utils.js` — was left exactly as you had
it. I ran a syntax check across all of it and found no errors, but I did
not review its internal logic. If something in the test-taking flow itself
misbehaves, let me know and I'll dig into those files specifically.

---

## 6. Quick troubleshooting

| Problem | Fix |
|---|---|
| `pip install` fails | Make sure you're inside the project folder and Python is installed (`python --version`). Some systems need `pip3` instead of `pip`. |
| Browser shows "This site can't be reached" | The server isn't running — run `python app.py` and keep that terminal open. |
| "An account with this email already exists" | Use Log In instead, or delete `data/users.json` to wipe all test accounts (a fresh one is created automatically). |
| A page keeps redirecting to `/login` | That's `auth-guard.js` working as intended — log in first. |
