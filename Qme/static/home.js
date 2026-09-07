// home.js — interactivity for the Question Me landing page

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Mobile nav toggle ---------------- */
  const nav = document.getElementById('site-nav');
  const navToggle = document.getElementById('nav-toggle');
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('menu-open');
  });
  // Close the mobile menu whenever a nav link is tapped.
  document.querySelectorAll('.nav-links a, .nav-actions a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('menu-open'));
  });

  /* ---------------- Logged-in state check ---------------- */
  // If the person already has a session (from our auth backend), swap the
  // Login/Sign Up buttons and hero CTA for a single "Go to Dashboard" link,
  // instead of asking them to sign up again.
  (async function checkLoginState() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (!res.ok) return; // not logged in — leave the default buttons as-is

      const data = await res.json();
      const name = data.user && data.user.name ? data.user.name.split(' ')[0] : 'there';

      const navActions = document.getElementById('nav-actions');
      navActions.innerHTML = `<a href="index.html" class="nav-btn primary">Go to Dashboard</a>`;

      const heroCta = document.getElementById('hero-cta-primary');
      if (heroCta) {
        heroCta.textContent = `Continue, ${name} →`;
        heroCta.href = 'index.html';
      }

      const finalCta = document.getElementById('final-cta-btn');
      if (finalCta) {
        finalCta.textContent = 'Go to Dashboard →';
        finalCta.href = 'index.html';
      }

      const heroNote = document.getElementById('hero-note');
      if (heroNote) heroNote.textContent = `Welcome back, ${name}. Pick up right where you left off.`;

    } catch (err) {
      // Server not reachable (e.g. this page opened without the backend running) —
      // fail silently and just show the default logged-out buttons.
    }
  })();

  /* ---------------- Animated stat counters ---------------- */
  const statEls = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 900;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => statObserver.observe(el));

  /* ---------------- Scroll-reveal for cards ---------------- */
  const revealTargets = document.querySelectorAll(
    '.feature-card, .step-card, .testimonial-carousel, .faq-item, .mock-window'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------------- Testimonial carousel ---------------- */
  const track = document.getElementById('tcar-track');
  const slides = track ? Array.from(track.children) : [];
  const dotsWrap = document.getElementById('tcar-dots');
  const prevBtn = document.getElementById('tcar-prev');
  const nextBtn = document.getElementById('tcar-next');
  let current = 0;
  let autoplayTimer = null;

  if (track && slides.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'tcar-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function restartAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goTo(current + 1), 5500);
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); restartAutoplay(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); restartAutoplay(); });

    restartAutoplay();
  }

  /* ---------------- Back to top button ---------------- */
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
