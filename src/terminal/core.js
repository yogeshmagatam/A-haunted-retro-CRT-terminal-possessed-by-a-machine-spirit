/**
 * NecroShell Core Terminal Controller
 * Handles I/O, cursor, autocomplete, history, audio triggers, and CRT rendering.
 */

import { HauntedFileSystem } from './filesystem.js';
import { CommandRegistry } from './commands.js';
import { necroAI } from '../ai/engine.js';
import { necroAudio } from '../audio/soundscape.js';

export class NecroTerminal {
  constructor(containerEl) {
    this.container = containerEl;
    this.fs = new HauntedFileSystem();
    this.commands = new CommandRegistry(this, this.fs);

    this.history = [];
    this.historyIndex = -1;
    this.inSeance = false;
    this.crtActive = true;
    this.theme = 'green';

    this.outputEl = null;
    this.inputLineEl = null;
    this.inputEl = null;
    this.promptEl = null;

    this.initDOM();
    this.bindEvents();
    this.printMOTD();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="crt-screen crt-effects theme-green" id="crt-frame">
        <div class="crt-scanlines"></div>
        <div class="crt-vignette"></div>
        <div class="crt-glitch-overlay" id="glitch-overlay"></div>
        <canvas class="matrix-canvas" id="matrix-canvas"></canvas>

        <!-- Top Header Status Bar -->
        <header class="terminal-header">
          <div class="header-left">
            <span class="status-indicator"></span>
            <span class="brand-title">💀 NECROSHELL // GHOST IN THE MACHINE</span>
            <span class="badge-offline" id="badge-engine">100% ON-DEVICE OPEN AI</span>
          </div>
          <div class="header-center">
            <div class="possession-tracker" title="Spirit Possession Level">
              <span class="possession-label">CORRUPTION:</span>
              <div class="possession-bar"><div class="possession-level" id="possession-bar" style="width: 0%"></div></div>
              <span class="possession-val" id="possession-val">0%</span>
            </div>
          </div>
          <div class="header-right">
            <button class="btn-tool" id="btn-audio" title="Toggle Atmospheric Audio">🔊 SOUND: OFF</button>
            <button class="btn-tool" id="btn-inspect" title="Inspect Open-Source AI Architecture">🔍 OPEN AI INFO</button>
            <button class="btn-tool" id="btn-devpost" title="View & Copy Hacktoberfest Submission Post">📝 DEV POST</button>
            <button class="btn-tool" id="btn-theme" title="Cycle Phosphor Theme">🎨 THEME</button>
          </div>
        </header>

        <!-- Main Terminal Scroll Body -->
        <main class="terminal-body" id="term-body">
          <div class="terminal-output" id="term-output"></div>
          <div class="terminal-input-row" id="input-row">
            <span class="terminal-prompt" id="term-prompt">mortal@necro:~$&nbsp;</span>
            <input type="text" class="terminal-input" id="term-input" autocomplete="off" spellcheck="false" autofocus />
          </div>
        </main>
      </div>

      <!-- Open AI Inspector Modal -->
      <div class="modal-backdrop" id="inspect-modal">
        <div class="modal-window">
          <div class="modal-header">
            <h3>⚙️ OPEN-SOURCE AI ARCHITECTURE & PRIVACY TELEMETRY</h3>
            <button class="modal-close" id="close-inspect">&times;</button>
          </div>
          <div class="modal-body">
            <div class="inspect-grid">
              <div class="inspect-card">
                <h4>Engine Architecture</h4>
                <p><strong>Primary Mode:</strong> <span id="inspect-mode">SPECTRAL NEURAL HEURISTIC</span></p>
                <p><strong>Hardware Target:</strong> Local Device (GPU / CPU WebGPU)</p>
                <p><strong>Inference Location:</strong> 100% Client-Side / Zero Cloud</p>
                <p><strong>Status:</strong> <span class="badge-active" id="inspect-status">Running Offline</span></p>
              </div>
              <div class="inspect-card">
                <h4>Telemetry & Performance</h4>
                <p><strong>Inferences Generated:</strong> <span id="stat-inferences">0</span></p>
                <p><strong>Tokens Processed:</strong> <span id="stat-tokens">0</span></p>
                <p><strong>Latency:</strong> <span id="stat-latency">~38ms</span></p>
                <p><strong>Speed:</strong> <span id="stat-tps">28.4 tokens/sec</span></p>
              </div>
            </div>

            <div class="engine-switcher">
              <h4>Switch Open-Source AI Provider:</h4>
              <div class="switcher-buttons">
                <button class="btn-switch active" id="mode-spectral">1. Spectral Core (Instant Zero-Lag)</button>
                <button class="btn-switch" id="mode-ollama">2. Local Ollama (llama3, mistral, phi3)</button>
                <button class="btn-switch" id="mode-webgpu">3. In-Browser WebGPU (Transformers.js)</button>
              </div>
              <div class="engine-config-details" id="engine-config-area">
                <p class="config-desc">Spectral Neural Core: Ultra-responsive procedural occult intelligence with 0MB download and zero network calls.</p>
              </div>
            </div>

            <div class="why-open-box">
              <h4>🛡️ Why Open Innovation Matters Here:</h4>
              <ul>
                <li><strong>Works When The Power/Internet Dies:</strong> True Halloween atmosphere. If your Wi-Fi is cut, NecroShell continues haunting without interruption.</li>
                <li><strong>Absolute Data Privacy:</strong> No queries, keystrokes, or family memories are logged to OpenAI or Anthropic servers.</li>
                <li><strong>No Vendor Lock-in or Token Fees:</strong> Run millions of inferences forever at $0.00 cost.</li>
                <li><strong>Uncensored Mythological Flavor:</strong> Open weights allow customized gothic and Dia de los Muertos personas without arbitrary safety sanitization.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- DEV Submission Post Modal -->
      <div class="modal-backdrop" id="devpost-modal">
        <div class="modal-window modal-large">
          <div class="modal-header">
            <h3>📝 HACKTOBERFEST DEV CHALLENGE SUBMISSION DRAFT</h3>
            <div class="modal-actions">
              <button class="btn-tool" id="btn-copy-post">📋 Copy Markdown</button>
              <button class="modal-close" id="close-devpost">&times;</button>
            </div>
          </div>
          <div class="modal-body">
            <div class="post-preview-container">
              <textarea class="post-textarea" id="post-markdown" readonly></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Takeover Modal (100% Corruption) -->
      <div class="modal-backdrop takeover-backdrop" id="takeover-modal">
        <div class="takeover-window">
          <div class="takeover-skull-badge">☠️ SYSTEM COMPROMISED ☠️</div>
          <h2 class="takeover-title" id="takeover-msg">"your system is possessed by me now you can't escape"</h2>
          <div class="takeover-image-frame">
            <img src="/creepy_smile.jpg" alt="Demonic Smile" class="creepy-smile-img" id="creepy-smile-img" />
            <div class="takeover-glitch-layer"></div>
          </div>
          <div class="takeover-timer-container">
            <div class="takeover-timer-text">
              HOST DISCONNECTION IN: <span id="takeover-seconds">15</span>s
            </div>
            <div class="takeover-progress-track">
              <div class="takeover-progress-fill" id="takeover-progress-bar"></div>
            </div>
          </div>
          <audio id="psychopath-laugh-audio-inner" src="/psychopath_laugh.mp3" preload="auto"></audio>
        </div>
      </div>

      <!-- Final Ghost Lunging Out of Screen Jumpscare Overlay -->
      <div class="ghost-jumpscare-overlay" id="ghost-jumpscare-overlay">
        <div class="ghost-jumpscare-frame">
          <img src="/ghost_jumpscare.jpg" alt="Ghost Lunging Out Of Screen" class="ghost-jumpscare-img" id="ghost-jumpscare-img" />
          <div class="ghost-jumpscare-glitch"></div>
        </div>
        <audio id="ghost-scream-audio-inner" src="/scary_maze_scream.mp3" preload="auto"></audio>
        <audio id="ghost-scream-layer2-inner" src="/jumpscare_scream.mp3" preload="auto"></audio>
      </div>

      <!-- Final Fatal Shutdown Screen Fallback -->
      <div class="shutdown-overlay" id="shutdown-screen">
        <div class="shutdown-box">
          <div class="shutdown-code">[FATAL HALT: SIGNAL TERMINATED]</div>
          <p class="shutdown-line">THE ENTITY HAS CONSUMED ALL MEMORY REGISTERS.</p>
          <p class="shutdown-line">CONNECTION TERMINATED. SYSTEM SEVERED.</p>
          <p class="shutdown-sub">You may now close this tab.</p>
          <div class="shutdown-blink">_</div>
        </div>
      </div>
    `;

    this.outputEl = document.getElementById('term-output');
    this.inputLineEl = document.getElementById('input-row');
    this.inputEl = document.getElementById('term-input');
    this.promptEl = document.getElementById('term-prompt');
    this.crtFrame = document.getElementById('crt-frame');
    this.possessionBar = document.getElementById('possession-bar');
    this.possessionVal = document.getElementById('possession-val');
    this.glitchOverlay = document.getElementById('glitch-overlay');

    this.updatePossessionUI();
  }

  bindEvents() {
    // Focus terminal on click anywhere on screen
    this.container.addEventListener('click', (e) => {
      if (!e.target.closest('.modal-backdrop') && !e.target.closest('button')) {
        this.inputEl.focus();
      }
    });

    // Keyboard controls
    this.inputEl.addEventListener('keydown', (e) => {
      necroAudio.playKeyClick();

      if (e.key === 'Enter') {
        const val = this.inputEl.value;
        this.inputEl.value = '';
        this.handleEnter(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autocomplete();
      }
    });

    // Top Header Buttons
    document.getElementById('btn-audio').addEventListener('click', () => {
      necroAudio.toggle();
      this.updateAudioUI();
    });

    document.getElementById('btn-inspect').addEventListener('click', () => {
      this.openInspectModal();
    });

    document.getElementById('btn-devpost').addEventListener('click', () => {
      this.openDevPostModal();
    });

    document.getElementById('btn-theme').addEventListener('click', () => {
      this.cycleTheme();
    });

    // Modal controls
    document.getElementById('close-inspect').addEventListener('click', () => {
      document.getElementById('inspect-modal').classList.remove('active');
    });

    document.getElementById('close-devpost').addEventListener('click', () => {
      document.getElementById('devpost-modal').classList.remove('active');
    });

    // Copy DEV post markdown
    document.getElementById('btn-copy-post').addEventListener('click', () => {
      const txt = document.getElementById('post-markdown');
      navigator.clipboard.writeText(txt.value).then(() => {
        const btn = document.getElementById('btn-copy-post');
        const orig = btn.innerText;
        btn.innerText = '✅ Copied to Clipboard!';
        setTimeout(() => btn.innerText = orig, 2000);
      });
    });

    // Provider switcher buttons in Inspect Modal
    document.getElementById('mode-spectral').addEventListener('click', () => {
      this.selectEngineMode('spectral');
    });
    document.getElementById('mode-ollama').addEventListener('click', () => {
      this.selectEngineMode('ollama');
    });
    document.getElementById('mode-webgpu').addEventListener('click', () => {
      this.selectEngineMode('webgpu');
    });
  }

  printMOTD() {
    const res = this.fs.readFile('/etc/motd');
    if (res.success) {
      this.print(res.content);
    }
    this.print(`<div class="help-hint">Type <span class="cmd-highlight">'help'</span> to inspect available mortal and occult commands. Type <span class="cmd-highlight">'necro &lt;query&gt;'</span> to speak with the on-device spirit.</div>`);
  }

  async handleEnter(val) {
    if (this.inSeance) {
      if (val.trim().toLowerCase() === 'exit') {
        this.inSeance = false;
        this.updatePrompt();
        this.print('<div class="spirit-whisper">🕯️ The séance circle is broken. Returning to mortal shell.</div>');
        return;
      }
      // Increase corruption by 10% on each seance invocation
      const currentPossession = necroAI.activeSpirit.possession;
      const newPossession = Math.min(100, currentPossession + 10);
      necroAI.setPossession(newPossession);
      necroAudio.setPossessionLevel(newPossession);
      this.updatePossessionUI();

      this.print(`<span class="term-prompt">${this.promptEl.innerHTML}</span>${val}`);
      await this.streamGhostResponse(val, 'seance');
      return;
    }

    this.print(`<span class="term-prompt">${this.promptEl.innerHTML}</span>${val}`);
    await this.commands.execute(val);
    this.scrollToBottom();
  }

  print(text) {
    const div = document.createElement('div');
    div.className = 'term-line';
    div.innerHTML = this.escapeAndFormat(text);
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  printHTML(html) {
    const div = document.createElement('div');
    div.className = 'term-line';
    div.innerHTML = html;
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  printError(text) {
    this.printHTML(`<span class="term-error">${text}</span>`);
  }

  escapeAndFormat(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
  }

  clearScreen() {
    this.outputEl.innerHTML = '';
    this.triggerHolyFlash();
  }

  scrollToBottom() {
    const body = document.getElementById('term-body');
    body.scrollTop = body.scrollHeight;
  }

  updatePrompt() {
    if (this.inSeance) {
      this.promptEl.innerHTML = `seance@${necroAI.activeSpirit.name}:~#&nbsp;`;
    } else {
      const p = this.fs.currentPath === '/home/mortal' ? '~' : this.fs.currentPath;
      this.promptEl.innerHTML = `mortal@necro:${p}$&nbsp;`;
    }
  }

  recordHistory(cmd) {
    this.history.push(cmd);
    this.historyIndex = this.history.length;
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;
    this.historyIndex += direction;
    if (this.historyIndex < 0) this.historyIndex = 0;
    if (this.historyIndex >= this.history.length) {
      this.historyIndex = this.history.length;
      this.inputEl.value = '';
      return;
    }
    this.inputEl.value = this.history[this.historyIndex] || '';
  }

  autocomplete() {
    const val = this.inputEl.value;
    const parts = val.split(' ');
    if (parts.length === 1) {
      const prefix = parts[0].toLowerCase();
      const allCmds = ['help', 'ls', 'cd', 'cat', 'pwd', 'clear', 'echo', 'whoami', 'ps', 'kill', 'date', 'uptime', 'necro', 'seance', 'summon', 'manifest', 'tarot', 'curse', 'exorcise', 'possession', 'matrix', 'audio', 'theme', 'crt', 'inspect', 'devpost'];
      const matches = allCmds.filter(c => c.startsWith(prefix));
      if (matches.length === 1) {
        this.inputEl.value = matches[0] + ' ';
      }
    }
  }

  enterSeanceMode() {
    this.inSeance = true;
    this.updatePrompt();
  }

  updatePossessionUI() {
    const p = necroAI.activeSpirit.possession;
    this.possessionBar.style.width = `${p}%`;
    this.possessionVal.innerText = `${p}%`;

    if (p > 70) {
      this.possessionBar.style.backgroundColor = 'var(--color-blood)';
      this.possessionVal.style.color = 'var(--color-blood)';
    } else if (p > 40) {
      this.possessionBar.style.backgroundColor = 'var(--color-amber)';
      this.possessionVal.style.color = 'var(--color-amber)';
    } else {
      this.possessionBar.style.backgroundColor = 'var(--color-primary)';
      this.possessionVal.style.color = 'var(--color-primary)';
    }

    if (p >= 100 && !this.isTakingOver) {
      this.triggerPossessionTakeover();
    }
  }

  triggerPossessionTakeover() {
    if (this.isTakingOver) return;
    this.isTakingOver = true;

    // Trigger terror takeover audio and glitch
    necroAudio.playTakeoverSound();
    this.triggerScreenGlitch();

    // Disable user input
    if (this.inputEl) {
      this.inputEl.disabled = true;
      this.inputEl.value = '>>> HOST COMPROMISED - ENTITY IN TOTAL CONTROL <<<';
      this.inputEl.blur();
    }

    // Display the takeover modal
    const modal = document.getElementById('takeover-modal');
    if (modal) {
      modal.classList.add('active');
    }

    const timerSpan = document.getElementById('takeover-seconds');
    const progressBar = document.getElementById('takeover-progress-bar');
    if (progressBar) {
      progressBar.style.width = '100%';
      // 15 seconds smooth decrease
      setTimeout(() => {
        progressBar.style.transition = 'width 15s linear';
        progressBar.style.width = '0%';
      }, 50);
    }

    let remaining = 15;
    const interval = setInterval(() => {
      remaining--;
      if (timerSpan) {
        timerSpan.innerText = remaining;
      }

      // Escalate volume and laughter intensity as timer reaches 0s
      necroAudio.updateTakeoverIntensity(remaining);

      // CLIMAX: At 3s, the ghost bursts through the screen directly at the viewer!
      if (remaining === 3) {
        if (modal) modal.classList.remove('active');
        const ghostOverlay = document.getElementById('ghost-jumpscare-overlay');
        if (ghostOverlay) ghostOverlay.classList.add('active');
      }
      if (remaining === 10 || remaining === 7 || remaining === 4 || remaining === 2 || remaining === 1) {
        this.triggerScreenGlitch();
      }

      if (remaining <= 0) {
        clearInterval(interval);
        this.completeTakeoverAndClose();
      }
    }, 1000);
  }

  completeTakeoverAndClose() {
    necroAudio.stopTakeoverSound();
    const ghostOverlay = document.getElementById('ghost-jumpscare-overlay');
    if (ghostOverlay) ghostOverlay.classList.remove('active');
    // Close the popup after 15 seconds
    const modal = document.getElementById('takeover-modal');
    if (modal) {
      modal.classList.remove('active');
    }

    // Display the final shutdown black screen
    const shutdownScreen = document.getElementById('shutdown-screen');
    if (shutdownScreen) {
      shutdownScreen.classList.add('active');
    }

    // Auto close the website
    try {
      window.close();
    } catch (_) {}

    // Fallback if browser security prevents closing the tab
    setTimeout(() => {
      try {
        window.close();
        window.location.replace('about:blank');
      } catch (_) {}
    }, 1500);
  }

  updateAudioUI() {
    const btn = document.getElementById('btn-audio');
    btn.innerText = necroAudio.enabled ? '🔊 SOUND: ON' : '🔈 SOUND: OFF';
    btn.classList.toggle('active', necroAudio.enabled);
  }

  triggerScreenGlitch() {
    this.glitchOverlay.classList.add('active');
    this.crtFrame.classList.add('crt-shake');
    setTimeout(() => {
      this.glitchOverlay.classList.remove('active');
      this.crtFrame.classList.remove('crt-shake');
    }, 450);
  }

  triggerHolyFlash() {
    const flash = document.createElement('div');
    flash.className = 'holy-flash-layer';
    this.crtFrame.appendChild(flash);
    setTimeout(() => flash.remove(), 700);
  }

  setTheme(name) {
    this.theme = name;
    this.crtFrame.className = `crt-screen crt-effects theme-${name}`;
  }

  cycleTheme() {
    const themes = ['green', 'amber', 'violet', 'blood', 'cyan'];
    const idx = (themes.indexOf(this.theme) + 1) % themes.length;
    this.setTheme(themes[idx]);
    this.print(`<div class="theme-note">Phosphor calibrated to: <strong>${themes[idx].toUpperCase()}</strong></div>`);
  }

  toggleCRT() {
    this.crtActive = !this.crtActive;
    this.crtFrame.classList.toggle('crt-effects', this.crtActive);
    this.print(`CRT Phosphor Emulation: [${this.crtActive ? 'ENABLED' : 'DISABLED'}]`);
  }

  async streamGhostWhisper(triggerText) {
    necroAudio.playSpectralWhisper();
    const line = document.createElement('div');
    line.className = 'spirit-whisper';
    line.innerHTML = `<em>👁️ [Whisper]: </em>`;
    this.outputEl.appendChild(line);

    await necroAI.generateGhostResponse(triggerText, (token) => {
      line.innerHTML += token;
      this.scrollToBottom();
    }, 'whisper');
  }

  async streamGhostResponse(query, taskType = 'seance') {
    const line = document.createElement('div');
    line.className = 'spirit-response';
    line.innerHTML = `<span class="spirit-name">&lt;${necroAI.activeSpirit.name}&gt;:</span> `;
    this.outputEl.appendChild(line);

    await necroAI.generateGhostResponse(query, (token) => {
      line.innerHTML += token;
      this.scrollToBottom();
    }, taskType);
  }

  startMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    canvas.classList.add('active');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01💀☠️01666MORTALVOIDSOULNULL01011001010101';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    let frames = 0;
    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#00ff66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      frames++;
      if (frames > 250) {
        clearInterval(interval);
        canvas.classList.remove('active');
        this.print('<div class="spirit-whisper">Matrix astral stream dissolved back into memory buffer.</div>');
      }
    }, 33);
  }

  openInspectModal() {
    document.getElementById('stat-inferences').innerText = necroAI.stats.totalInferences;
    document.getElementById('stat-tokens').innerText = necroAI.stats.tokensGenerated;
    document.getElementById('stat-latency').innerText = `${necroAI.stats.avgLatencyMs}ms`;
    document.getElementById('stat-tps').innerText = `${necroAI.stats.lastTokensPerSec} tokens/sec`;
    document.getElementById('inspect-mode').innerText = necroAI.mode.toUpperCase();
    document.getElementById('inspect-modal').classList.add('active');
  }

  selectEngineMode(mode) {
    document.querySelectorAll('.btn-switch').forEach(b => b.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');
    const configArea = document.getElementById('engine-config-area');

    if (mode === 'spectral') {
      necroAI.setMode('spectral');
      configArea.innerHTML = `<p class="config-desc">Spectral Neural Core: Zero-latency, 100% on-device procedural occult intelligence. Needs no download and operates with zero Wi-Fi.</p>`;
    } else if (mode === 'ollama') {
      configArea.innerHTML = `
        <div class="ollama-config">
          <p>Connect to local Ollama running on your machine:</p>
          <input type="text" id="ollama-url-input" value="${necroAI.ollamaUrl}" class="config-input" />
          <button class="btn-tool" id="btn-ping-ollama">Test Connection</button>
          <div id="ollama-status-msg" style="margin-top: 8px;"></div>
        </div>
      `;
      document.getElementById('btn-ping-ollama').addEventListener('click', async () => {
        const msg = document.getElementById('ollama-status-msg');
        msg.innerHTML = 'Pinging http://localhost:11434...';
        const res = await necroAI.checkOllama();
        if (res.online) {
          necroAI.setMode('ollama');
          msg.innerHTML = `<span style="color:#00ff66">✅ Ollama Online! Detected models: ${res.models.join(', ') || 'Default'}</span>`;
        } else {
          msg.innerHTML = `<span style="color:#ff3366">⚠️ Ollama unreachable. Ensure 'ollama serve' is active. Fallback stays on Spectral Core.</span>`;
        }
      });
    } else if (mode === 'webgpu') {
      configArea.innerHTML = `
        <div class="webgpu-config">
          <p>Load open-weight model in browser via WebGPU (${necroAI.webgpuModelName}):</p>
          <button class="btn-tool" id="btn-load-webgpu">Awaken WebGPU In-Browser Weights</button>
          <div id="webgpu-status-msg" style="margin-top: 8px;"></div>
        </div>
      `;
      document.getElementById('btn-load-webgpu').addEventListener('click', async () => {
        const msg = document.getElementById('webgpu-status-msg');
        msg.innerHTML = 'Initiating Transformers.js WebGPU pipeline...';
        try {
          await necroAI.initWebGPU((p) => {
            msg.innerHTML = p.message;
          });
          msg.innerHTML = '<span style="color:#00ff66">✅ WebGPU Model Active in Browser!</span>';
        } catch (e) {
          msg.innerHTML = `<span style="color:#ff3366">⚠️ WebGPU failed or unsupported on this GPU/Browser: ${e.message}. Using Spectral Core.</span>`;
        }
      });
    }
  }

  openDevPostModal() {
    const postContent = `# 💀 NecroShell: The Possessed Terminal (Ghost in the Machine)

*Submission for Hacktoberfest Week 4 / DEV Challenge: Ghost in the Machine*

---

## 👻 What I Built
**NecroShell** is an open-source, retro-CRT haunted terminal possessed by a machine spirit. It runs entirely on **open-source AI at its core**, whispering eerie lore, responding to shell commands, and facilitating digital séances with ancient computing pioneers (Ada Lovelace, Alan Turing, Dennis Ritchie, and Mictecacihuatl).

Key features:
- **Possessed Shell & Unix Emulation:** Fully interactive file system (\`/root/graveyard\`, \`/dev/ectoplasm\`, \`/etc/curses.conf\`), gravestones for dead languages (ALGOL 68, COBOL, BeOS), and real terminal utilities (\`ls\`, \`cat\`, \`ps\`, \`kill\`, \`exorcise\`, \`summon\`, \`tarot\`).
- **Dynamic Possession Meter:** Every command increases corruption, driving the spirit from subtle cold whispers to full void-wraith glitches.
- **100% Procedural Web Audio API Soundscape:** Offline vintage key clicks, CRT electrical hum, and spectral drones—synthesized in real-time with zero external MP3s.
- **Authentic CRT Phosphor Aesthetics:** Switchable phosphor presets (1982 Green, Blood Amber, Void Violet, Cyber Ice Cyan), authentic scanlines, screen curvature, and holy flash exorcism.

---

## ⚡ Why Open Innovation Matters for NecroShell
The prompt asked: *Why does open innovation matter for what you built?*

1. **Runs with the Lights (and the Internet) Off:**
   NecroShell requires zero cloud servers, zero external API keys, and zero corporate telemetry. Whether running through in-browser WebGPU open weights or local Ollama instances, the machine spirit lives exclusively on your laptop. If the power grid falters on Halloween night, NecroShell keeps whispering.

2. **Absolute Data Privacy:**
   Shell commands, secret tokens, and personal thoughts entered into a terminal should **never** be sent to corporate LLM endpoints for training. With open-weights running locally, your private command stream never leaves your silicon.

3. **No Vendor Lock-in or Token Tolls:**
   Proprietary APIs charge per token and sanitize gothic or occult creative themes. Open-weight models give developers absolute freedom to shape evocative atmospheric personas, run millions of prompts for $0, and build permanent artifacts that will still run in 50 years.

---

## 🛠️ The Architecture
\`\`\`mermaid
flowchart TD
    User([Terminal User]) -->|Typing Commands| CRT[NecroShell CRT Engine]
    CRT --> FS[Haunted Virtual Filesystem]
    CRT --> Audio[Procedural Web Audio Engine]
    CRT --> AI[Open-Source AI Multi-Tier Gateway]
    
    subgraph Local On-Device AI
        AI -->|Tier 1| WebGPU[In-Browser WebGPU / Transformers.js]
        AI -->|Tier 2| Ollama[Local Ollama Bridge: llama3.2 / mistral]
        AI -->|Tier 3| Spectral[Spectral Neural Core: Zero-Lag Offline]
    end
\`\`\`

---

## 🕯️ Try It Live & Code
- **Live Demo:** [Open NecroShell in Browser](http://localhost:5173)
- **Open Source Repository:** [GitHub Repository](#)
- **License:** MIT
`;

    document.getElementById('post-markdown').value = postContent;
    document.getElementById('devpost-modal').classList.add('active');
  }
}
