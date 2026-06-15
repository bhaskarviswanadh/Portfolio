/* ============================================================
   MAIN.JS — v2 entry point
   ============================================================ */

/* ---- Nav scroll + active spy ---- */
function initNav() {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-link[data-section]');
  const sections = [...document.querySelectorAll('section[id]')];

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
    let current = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= 80) current = sec.id;
    });
    links.forEach(l => l.classList.toggle('active', l.dataset.section === current));
  }, { passive: true });

  // Smooth scroll
  links.forEach(l => l.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById(l.dataset.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('nav-links')?.classList.remove('open');
  }));

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Mobile toggle
  document.getElementById('nav-toggle')?.addEventListener('click', () => {
    document.getElementById('nav-links')?.classList.toggle('open');
  });
}

/* ---- Scroll reveal ---- */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ---- Marquee duplicate (for seamless loop) ---- */
function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  // Clone items for seamless loop
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.parentNode.appendChild(clone);
}

/* ---- Typed cursor blink in hero ---- */
function initTypedCursor() {
  const cursor = document.getElementById('yaml-cursor');
  if (!cursor) return;
  setInterval(() => cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0', 530);
}

/* ---- Footer year ---- */
function setYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initMarquee();
  initTypedCursor();
  setYear();
});
