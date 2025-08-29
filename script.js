/* ==========================================================================
   Portfolio interactions
   - Theme persistence (respects system + user toggle)
   - Mobile nav, active link highlight
   - Scroll reveal (IntersectionObserver) with reduced-motion support
   - (No native contact form JS needed when using embedded Google Form)
   ========================================================================== */

/* 1) Theme: dark/light with persistence and system sync */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const mqLight = window.matchMedia('(prefers-color-scheme: light)');

// Apply initial theme
if (savedTheme === 'light' || (!savedTheme && mqLight.matches)) {
  root.classList.add('light');
}

// Toggle by user
themeToggle?.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

// If user hasn't chosen, follow system changes
mqLight.addEventListener?.('change', e => {
  const hasUserChoice = localStorage.getItem('theme') !== null;
  if (!hasUserChoice) {
    root.classList.toggle('light', e.matches);
  }
});

/* 2) Mobile nav toggle */
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle?.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

siteNav?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open menu');
  })
);

/* 3) Active section highlighting on scroll */
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.site-nav a.nav-link')];
const linkFor = id => navLinks.find(a => a.getAttribute('href') === `#${id}`);

function setActiveOnScroll() {
  const offset = window.scrollY + 120;
  for (const sec of sections) {
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const link = linkFor(sec.id);
    if (!link) continue;
    if (offset >= top && offset < bottom) link.classList.add('active');
    else link.classList.remove('active');
  }
}
document.addEventListener('scroll', setActiveOnScroll, { passive: true });
window.addEventListener('load', setActiveOnScroll);

/* 4) Scroll reveal (respect reduced motion) */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-fade');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-fade')
    .forEach(el => el.classList.add('reveal-visible'));
}

/* 5) Contact form JS (legacy support only)
   You’re embedding a Google Form now, so there’s no native form to validate.
   The block below keeps compatibility if you later switch back to Formspree.
*/
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

function setError(name, msg = '') {
  if (!form) return;
  const field = form.querySelector(`[name="${name}"]`);
  const small = form.querySelector(`small[data-for="${name}"]`);
  if (!field || !small) return;
  small.textContent = msg;
  field.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function validateForm() {
  if (!form) return false;
  let ok = true;
  const name = form.name.value.trim();
  const email = form['_replyto'].value.trim();
  const message = form.message.value.trim();

  setError('name'); setError('email'); setError('message');

  if (!name) { setError('name', 'Please enter your name.'); ok = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email', 'Please enter a valid email.'); ok = false; }
  if (message.length < 10) { setError('message', 'Please write a slightly longer message.'); ok = false; }

  return ok;
}

form?.addEventListener('submit', async (e) => {
  if (!validateForm()) { e.preventDefault(); return; }
  e.preventDefault();

  if (statusEl) statusEl.textContent = 'Sending...';

  try {
    const resp = await fetch(form.getAttribute('action'), {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });

    if (resp.ok) {
      form.reset();
      if (statusEl) {
        statusEl.textContent = 'Thanks! Your message has been sent.';
        statusEl.style.color = 'var(--primary)';
      }
    } else {
      const j = await resp.json().catch(() => ({}));
      if (statusEl) {
        statusEl.textContent = j.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
        statusEl.style.color = '#ef4444';
      }
    }
  } catch {
    if (statusEl) {
      statusEl.textContent = 'Network error. Please try again.';
      statusEl.style.color = '#ef4444';
    }
  }
});

/* 6) Footer year */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
