// auth-guard.js
// Drop this on any page that should require login (e.g. your real index.html,
// about.html, etc). It checks with the server on page load — if there's no
// valid session, it redirects to /login. It also wires up any element
// with id="logout-btn" to log the user out.
//
// Usage: <script src="auth-guard.js"></script>  (near the end of <body>)

(function () {
  async function checkAuth() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (!res.ok) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      // Make the logged-in user's info available to the rest of the page.
      window.currentUser = data.user;
      document.dispatchEvent(new CustomEvent('auth-ready', { detail: data.user }));

      // If the page has an element to show the user's name, fill it in.
      const nameSlots = document.querySelectorAll('[data-user-name]');
      nameSlots.forEach(el => { el.textContent = data.user.name; });

    } catch (err) {
      window.location.href = '/login';
    }
  }

  function wireLogout() {
    const btn = document.getElementById('logout-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    wireLogout();
  });
})();
