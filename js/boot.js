/* ============================================================
   BOOT.JS — Hero boot sequence animation
   ============================================================ */

const BOOT_LINES = [
  { text: '[    0.000000] Linux version 6.1.0-cloud-engineer (gcc version 12.2.0)', cls: 'boot-line-dim' },
  { text: '[    0.000000] BIOS-provided physical RAM map:', cls: 'boot-line-dim' },
  { text: '[    0.001000] ACPI: IRQ0 used by override.', cls: 'boot-line-dim' },
  { text: '[    0.012000] Initializing cloud infrastructure modules...', cls: 'boot-line-info' },
  { text: '[  OK  ] Started AWS SDK Runtime Services.', cls: 'boot-line-ok' },
  { text: '[  OK  ] Started Kubernetes Controller Manager.', cls: 'boot-line-ok' },
  { text: '[  OK  ] Started Terraform State Backend.', cls: 'boot-line-ok' },
  { text: '[  OK  ] Started Jenkins Automation Engine.', cls: 'boot-line-ok' },
  { text: '[  OK  ] Started Prometheus Metrics Collector.', cls: 'boot-line-ok' },
  { text: '[  OK  ] Started Grafana Visualization Service.', cls: 'boot-line-ok' },
  { text: '[  WARN ] Docker daemon requires elevated privileges.', cls: 'boot-line-warn' },
  { text: '[  OK  ] Mounted /dev/sda1 on / type ext4.', cls: 'boot-line-ok' },
  { text: '[    1.420000] Loading portfolio modules...', cls: 'boot-line-info' },
  { text: '[  OK  ] All systems operational. Welcome.', cls: 'boot-line-ok' },
  { text: '', cls: 'boot-line-dim' },
  { text: 'viswa@cloud-engineer:~$ whoami', cls: 'boot-line-info', pause: 400 },
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function typeBootLine(container, line) {
  const el = document.createElement('div');
  el.className = `boot-line ${line.cls}`;
  el.style.opacity = '0';
  container.appendChild(el);

  // Fade in immediately for most lines
  await sleep(10);
  el.style.opacity = '1';
  el.textContent = line.text;

  if (line.pause) {
    await sleep(line.pause);
  }
}

export async function runBootSequence() {
  const bootScreen = document.getElementById('boot-screen');
  const bootBody = document.getElementById('boot-body');
  const heroContent = document.getElementById('hero-content');
  const scrollIndicator = document.getElementById('scroll-indicator');

  if (!bootBody) return;

  // Type each line
  for (let i = 0; i < BOOT_LINES.length; i++) {
    const line = BOOT_LINES[i];
    await typeBootLine(bootBody, line);
    await sleep(i < 3 ? 40 : i < 10 ? 100 : 80);
  }

  // Add final prompt with blinking cursor
  const finalEl = document.createElement('div');
  finalEl.className = 'boot-line boot-line-ok';
  finalEl.innerHTML = 'viswa@cloud-engineer:~$ <span class="boot-cursor"></span>';
  bootBody.appendChild(finalEl);

  await sleep(600);

  // Fade out boot screen
  bootScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  bootScreen.style.opacity = '0';
  bootScreen.style.transform = 'scale(0.98)';

  await sleep(500);

  bootScreen.style.display = 'none';

  // Reveal hero content
  heroContent.classList.add('visible');
  await sleep(400);

  // Show scroll indicator
  if (scrollIndicator) {
    scrollIndicator.classList.add('visible');
  }
}
