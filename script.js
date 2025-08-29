/* ==========================================================================
   Portfolio interactions
   - Theme persistence, mobile nav, active link highlight
   - Scroll reveal (IntersectionObserver) with reduced-motion support
   - Form validation + fetch to Formspree with ARIA live status
   ========================================================================== */

/* 1) Theme: dark/light with persistence */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
  root.classList.add('light');
}
themeToggle?.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

/* 2) Mobile nav toggle */
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
navToggle?.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
siteNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  siteNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
}));

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
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-fade').forEach(el => el.classList.add('reveal-visible'));
}

/* 5) Contact form validation + AJAX (Formspree) */
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

function setError(name, msg = '') {
  const field = form?.querySelector(`[name="${name}"]`);
  const small = form?.querySelector(`small[data-for="${name}"]`);
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

  statusEl.textContent = 'Sending...';

  try {
    const resp = await fetch(form.getAttribute('action'), {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });

    if (resp.ok) {
      form.reset();
      statusEl.textContent = 'Thanks! Your message has been sent.';
      statusEl.style.color = 'var(--accent-2)';
    } else {
      const j = await resp.json().catch(() => ({}));
      statusEl.textContent = j.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
      statusEl.style.color = '#ef4444';
    }
  } catch {
    statusEl.textContent = 'Network error. Please try again.';
    statusEl.style.color = '#ef4444';
  }
});

/* 6) Footer year */
document.getElementById('year').textContent = new Date().getFullYear();
