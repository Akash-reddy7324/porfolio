/* Theme toggle */
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

/* Mobile nav */
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
navToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
siteNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  siteNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

/* Active link highlight */
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.site-nav a')];
const byId = id => navLinks.find(a => a.getAttribute('href') === `#${id}`);
const onScroll = () => {
  const offset = window.scrollY + 120;
  for (const sec of sections) {
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const link = byId(sec.id);
    if (!link) continue;
    if (offset >= top && offset < bottom) link.classList.add('active');
    else link.classList.remove('active');
  }
};
document.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('load', onScroll);

/* Reveal animations */
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

/* Contact form validation + AJAX (Formspree) */
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

function showError(id, msg) {
  const small = form?.querySelector(`small[data-for="${id}"]`);
  if (small) small.textContent = msg || '';
}
function validate() {
  let ok = true;
  if (!form) return false;
  const name = form.name.value.trim();
  const email = form['_replyto'].value.trim();
  const message = form.message.value.trim();
  showError('name'); showError('email'); showError('message');
  if (!name) { showError('name', 'Please enter your name.'); ok = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', 'Please enter a valid email.'); ok = false; }
  if (message.length < 10) { showError('message', 'Please write a slightly longer message.'); ok = false; }
  return ok;
}

form?.addEventListener('submit', async (e) => {
  if (!validate()) { e.preventDefault(); return; }
  e.preventDefault();
  statusEl.textContent = 'Sending...';
  const data = new FormData(form);
  try {
    const resp = await fetch(form.getAttribute('action'), {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    });
    if (resp.ok) {
      form.reset();
      statusEl.textContent = 'Thanks! Your message has been sent.';
      statusEl.style.color = 'var(--success)';
    } else {
      const j = await resp.json().catch(() => ({}));
      statusEl.textContent = j.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
      statusEl.style.color = 'var(--danger)';
    }
  } catch {
    statusEl.textContent = 'Network error. Please try again.';
    statusEl.style.color = 'var(--danger)';
  }
});

/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();
