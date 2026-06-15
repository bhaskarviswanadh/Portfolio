/* ============================================================
   DASHBOARD.JS — Live metrics, sparklines, counters
   ============================================================ */

// Sparkline renderer (pure canvas)
function drawSparkline(canvas, data, color = '#00d4ff') {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio || canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 36;
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = canvas.offsetWidth  * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;

  ctx.clearRect(0, 0, w, h);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step  = w / (data.length - 1);

  // Points
  const pts = data.map((v, i) => ({
    x: i * step,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '33');
  grad.addColorStop(1, color + '00');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + step / 2;
    const cp1y = pts[i - 1].y;
    const cp2x = pts[i].x - step / 2;
    const cp2y = pts[i].y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pts[i].x, pts[i].y);
  }
  ctx.lineTo(pts[pts.length - 1].x, h);
  ctx.lineTo(pts[0].x, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + step / 2;
    const cp1y = pts[i - 1].y;
    const cp2x = pts[i].x - step / 2;
    const cp2y = pts[i].y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// Generate seeded random data
function seededData(seed, len = 20, base = 85, spread = 12) {
  let s = seed;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  return Array.from({ length: len }, () => base + rng() * spread);
}

// Update "last checked" timestamps
function updateTimestamps() {
  document.querySelectorAll('[data-last-checked]').forEach(el => {
    el.textContent = 'Checked ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
}

// Animate a counter from 0 to target
function animateCounter(el, target, suffix = '') {
  const duration = 1200;
  const start = performance.now();
  const isFloat = String(target).includes('.');
  const decimals = isFloat ? 2 : 0;

  function step(now) {
    const pct = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - pct, 3); // ease-out cubic
    const current = eased * target;
    el.textContent = current.toFixed(decimals) + suffix;
    if (pct < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export function initDashboard() {
  // Draw sparklines
  document.querySelectorAll('.sparkline[data-seed]').forEach(canvas => {
    const seed   = parseInt(canvas.dataset.seed, 10);
    const color  = canvas.dataset.color || '#00d4ff';
    const base   = parseFloat(canvas.dataset.base || '85');
    const spread = parseFloat(canvas.dataset.spread || '12');
    const data   = seededData(seed, 24, base, spread);
    drawSparkline(canvas, data, color);
  });

  // Animate metric numbers on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));

  // Live timestamp update
  updateTimestamps();
  setInterval(updateTimestamps, 30000);

  // Redraw sparklines on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('.sparkline[data-seed]').forEach(canvas => {
        const seed   = parseInt(canvas.dataset.seed, 10);
        const color  = canvas.dataset.color || '#00d4ff';
        const base   = parseFloat(canvas.dataset.base || '85');
        const spread = parseFloat(canvas.dataset.spread || '12');
        drawSparkline(canvas, seededData(seed, 24, base, spread), color);
      });
    }, 200);
  });
}
