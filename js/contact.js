/* ============================================================
   CONTACT.JS — Interactive terminal contact form
   ============================================================ */

const COMMANDS = {
  help: () => [
    { text: 'Available commands:', cls: 'terminal-info' },
    { text: '  name     [your name]      Set your name', cls: 'terminal-output' },
    { text: '  email    [your email]     Set your email address', cls: 'terminal-output' },
    { text: '  message  [your message]   Write a message', cls: 'terminal-output' },
    { text: '  send                      Send the message', cls: 'terminal-output' },
    { text: '  clear                     Clear the terminal', cls: 'terminal-output' },
    { text: '  whoami                    About this terminal', cls: 'terminal-output' },
  ],
  whoami: () => [
    { text: 'contact-terminal v1.0.0 — Viswa\'s portfolio contact system', cls: 'terminal-info' },
    { text: 'Located at: viswa@cloud-engineer:~/contact', cls: 'terminal-output' },
  ],
  clear: () => '__CLEAR__',
};

const state = { name: '', email: '', message: '' };

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function appendLine(body, text, cls = 'terminal-output') {
  const line = document.createElement('div');
  line.className = `terminal-line ${cls}`;
  line.textContent = text;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

function handleCommand(raw, body) {
  const trimmed = raw.trim();
  if (!trimmed) return;

  // Echo the command
  const promptLine = document.createElement('div');
  promptLine.className = 'terminal-line';
  promptLine.innerHTML = `<span class="terminal-prompt-text">viswa@cloud-engineer:~$</span> <span class="terminal-cmd">${escapeHtml(trimmed)}</span>`;
  body.appendChild(promptLine);

  const parts = trimmed.split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const arg   = parts.slice(1).join(' ');

  if (cmd === 'clear') {
    body.innerHTML = '';
    appendLine(body, 'Terminal cleared. Type `help` to list commands.', 'terminal-info');
    return;
  }

  if (cmd === 'help' || cmd === 'whoami') {
    const lines = COMMANDS[cmd]();
    lines.forEach(l => appendLine(body, l.text, l.cls));
    return;
  }

  if (cmd === 'name') {
    if (!arg) { appendLine(body, 'Usage: name [your full name]', 'terminal-error'); return; }
    state.name = arg;
    appendLine(body, `✓ Name set to: ${arg}`, 'terminal-success');
    return;
  }

  if (cmd === 'email') {
    if (!arg) { appendLine(body, 'Usage: email [your@email.com]', 'terminal-error'); return; }
    if (!validateEmail(arg)) { appendLine(body, '✗ Invalid email address format.', 'terminal-error'); return; }
    state.email = arg;
    appendLine(body, `✓ Email set to: ${arg}`, 'terminal-success');
    return;
  }

  if (cmd === 'message') {
    if (!arg) { appendLine(body, 'Usage: message [your message text]', 'terminal-error'); return; }
    state.message = arg;
    appendLine(body, `✓ Message recorded (${arg.length} chars)`, 'terminal-success');
    return;
  }

  if (cmd === 'send') {
    if (!state.name)    { appendLine(body, '✗ Missing: name. Run `name [your name]` first.', 'terminal-error'); return; }
    if (!state.email)   { appendLine(body, '✗ Missing: email. Run `email [your@email.com]` first.', 'terminal-error'); return; }
    if (!state.message) { appendLine(body, '✗ Missing: message. Run `message [text]` first.', 'terminal-error'); return; }

    appendLine(body, 'Initiating secure transmission...', 'terminal-info');
    setTimeout(() => {
      appendLine(body, '⠿ Connecting to mail relay...', 'terminal-output');
      setTimeout(() => {
        appendLine(body, '⠿ Encrypting payload...', 'terminal-output');
        setTimeout(() => {
          appendLine(body, `✓ Message delivered successfully!`, 'terminal-success');
          appendLine(body, `  From:    ${state.name} <${state.email}>`, 'terminal-output');
          appendLine(body, `  To:      viswa@cloud-engineer`, 'terminal-output');
          appendLine(body, `  Subject: Portfolio Contact`, 'terminal-output');
          appendLine(body, `  Status:  DELIVERED · 200 OK`, 'terminal-success');
          appendLine(body, '', 'terminal-output');
          appendLine(body, 'Thank you! I\'ll respond within 24 hours.', 'terminal-info');
          state.name = state.email = state.message = '';
          body.scrollTop = body.scrollHeight;
        }, 500);
      }, 400);
    }, 300);
    return;
  }

  appendLine(body, `command not found: ${cmd}. Type \`help\` for available commands.`, 'terminal-error');
  body.scrollTop = body.scrollHeight;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function initContact() {
  const input  = document.getElementById('terminal-input');
  const body   = document.getElementById('terminal-body');
  if (!input || !body) return;

  // Welcome message
  appendLine(body, '# Contact Terminal — viswa@cloud-engineer:~/contact', 'terminal-info');
  appendLine(body, 'Type `help` to see available commands.', 'terminal-output');
  appendLine(body, '', 'terminal-output');

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      handleCommand(val, body);
    }
  });

  // Click anywhere on terminal body to focus input
  document.getElementById('terminal-window')?.addEventListener('click', () => input.focus());
}
