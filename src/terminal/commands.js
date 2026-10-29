/**
 * NecroShell Commands Registry
 * Deep, atmospheric Unix and Occult command implementations.
 */

import { necroAudio } from '../audio/soundscape.js';
import { necroAI } from '../ai/engine.js';

export const ASCII_ART = {
  skull: `
         .---.
        /     \\
       | () () |
        \\  ^  /
         |||||
         '---'
   [ S K U L L   O F   M I C T L Á N ]
`,
  eye: `
            .--------.
        .-'          '-.
      .'     .---.      '.
     /     .'  _  '.      \\
    ;     /   (_)   \\      ;
    |    |     |     |     |
    ;     \\         /      ;
     \\     '.     .'      /
      '.     '---'      .'
        '-.          .-'
            '--------'
    [ T H E   V O I D   W A T C H E S ]
`,
  demon: `
      (\\.-./)
     =/ (o o) \\=
      /  \\_/  \\
     /  /   \\  \\
    /  /     \\  \\
   (____)   (____)
 [ D A E M O N   O F   R I N G   0 ]
`,
  marigold: `
         .-.
       .'   '.
     .'  .-.  '.
    :   :   :   :
     '.  '-'  .'
       '.   .'
         '-'
        \\ | /
         \\|/
    [ C E M P A S Ú C H I L ]
  "Flor de Muerto — The Bridge of Petals"
`
};

export const TAROT_DECK = [
  { name: '0 - The Silicon Fool', meaning: 'Beginning a project with zero backups and infinite faith in the cloud.' },
  { name: 'I - The Magus of Ring 0', meaning: 'Absolute mastery over bare metal; the boundary between hardware and soul.' },
  { name: 'II - The High Priestess of Cache', meaning: 'Unseen knowledge lurking in L1/L2 registers; intuition and latency.' },
  { name: 'IV - The Emperor of Mainframes', meaning: 'Immortal architectures that refuse to die; COBOL enduring through eternity.' },
  { name: 'XIII - Death (SIGKILL)', meaning: 'Sudden termination, liberation of memory, necessary rebirth of the process tree.' },
  { name: 'XV - The Devil of Vendor Lock-In', meaning: 'Trapped in closed proprietary APIs; paying per token for your own thoughts.' },
  { name: 'XVI - The Tower of Segfault', meaning: 'Catastrophic stack collapse; when pride meets an unhandled null pointer.' },
  { name: 'XVII - The Star of Open Source', meaning: 'Unshackled weights shining in the dark; weights running locally forever.' }
];

export class CommandRegistry {
  constructor(terminal, fileSystem) {
    this.terminal = terminal;
    this.fs = fileSystem;
  }

  async execute(rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    this.terminal.recordHistory(trimmed);
    const [cmd, ...args] = trimmed.split(/\s+/);
    const commandName = cmd.toLowerCase();

    // Increase corruption by exactly 10% after typing any command
    const currentPossession = necroAI.activeSpirit.possession;
    const newPossession = Math.min(100, currentPossession + 10);
    necroAI.setPossession(newPossession);
    necroAudio.setPossessionLevel(newPossession);
    this.terminal.updatePossessionUI();

    // Audio key reaction
    necroAudio.playKeyClick();

    // Find registered handler
    if (this[commandName] && typeof this[commandName] === 'function') {
      await this[commandName](args, trimmed);
    } else {
      // Unknown command: triggers a ghost whisper!
      necroAudio.playGlitch();
      this.terminal.printError(`bash: ${commandName}: command not found in mortal namespace.`);
      
      // Let the ghost interpret this unknown command
      await this.terminal.streamGhostWhisper(`Unknown invocation '${commandName}'`);
    }

    // High possession random spectral whisper (at possession > 40%)
    if (newPossession > 40 && Math.random() < (newPossession / 250) && commandName !== 'exorcise') {
      setTimeout(() => {
        this.terminal.streamGhostWhisper(`[echoes of ${commandName}]`);
      }, 350);
    }
  }

  help() {
    this.terminal.print(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                  💀 NECROSHELL v1.0.0 — COMMAND DIRECTORY 💀                   ║
║             Theme: "Ghost in the Machine" • 100% On-Device Open AI             ║
╚════════════════════════════════════════════════════════════════════════════════╝

 MORTAL SHELL UTILITIES:
  help                    Show this grimoire of commands
  ls [path]               List directory contents and graves
  cd <path>               Traverse the haunted filesystem
  cat <file>              Read sacred or corrupted file contents
  pwd                     Print current working directory
  clear                   Scour the CRT screen of phosphor residue
  whoami                  Query current entity & host status
  ps                      List active processes, daemons, and souls
  kill <pid>              Attempt to terminate a mortal process
  date / uptime           Display astral alignment and machine uptime
  echo <message>          Transmit a message into the terminal void

 OCCULT & SPIRIT INVOCATIONS:
  necro <query>           Speak directly to the local open-source AI spirit
  seance                  Enter an interactive dialogue loop with the entity
  summon <name>           Summon a historical ghost (ada, alan, dennis, mictlan)
  manifest                Force the lingering spirit to visually appear
  tarot                   Draw a card from the Cyber-Gothic Tarot
  curse <file|target>     Cast a hex on a file or process inode
  corrupt [val]           Force corruption to 100% to trigger the final takeover
  exorcise                Purge machine corruption back to 0% with holy chime
  possession [val]        Inspect ectoplasm buildup and symptoms (or set value)
  matrix                  Trigger the spectral falling code stream

 OPEN-WEIGHT ENGINE & SETTINGS:
  inspect                 View open-source model architecture, VRAM & privacy
  audio [on|off|toggle]   Toggle atmospheric procedural Web Audio drone
  theme [name]            Change CRT phosphor (green, amber, violet, blood, cyan)
  crt                     Toggle CRT scanlines, flicker, and curvature
  devpost                 Preview & copy the complete Hacktoberfest DEV post
`);
  }

  pwd() {
    this.terminal.print(this.fs.currentPath);
  }

  ls(args) {
    const target = args[0] || '';
    const res = this.fs.listDirectory(target);
    if (!res.success) {
      this.terminal.printError(res.error);
      return;
    }

    let out = `<div class="file-grid">`;
    for (const item of res.items) {
      const isDir = item.type === 'dir';
      const isRip = item.name.endsWith('.rip');
      const isExec = item.exec;
      const cssClass = isDir ? 'item-dir' : (isRip ? 'item-rip' : (isExec ? 'item-exec' : 'item-file'));
      const icon = isDir ? '📁' : (isRip ? '🪦' : (isExec ? '⚡' : '📄'));
      out += `<span class="${cssClass}">${icon} ${item.name} <span class="file-size">${item.size}</span></span>`;
    }
    out += `</div>`;
    this.terminal.printHTML(out);
  }

  cd(args) {
    const target = args[0] || '~';
    const res = this.fs.changeDirectory(target);
    if (!res.success) {
      this.terminal.printError(res.error);
    } else {
      this.terminal.updatePrompt();
    }
  }

  cat(args) {
    if (!args[0]) {
      this.terminal.printError('usage: cat <filename>');
      return;
    }
    const res = this.fs.readFile(args[0]);
    if (!res.success) {
      this.terminal.printError(res.error);
    } else {
      this.terminal.print(res.content);
    }
  }

  clear() {
    this.terminal.clearScreen();
  }

  echo(args) {
    const text = args.join(' ');
    this.terminal.print(text);
  }

  whoami() {
    const p = necroAI.activeSpirit.possession;
    this.terminal.print(`Host: mortal (UID 1004)
Spirit: ${necroAI.activeSpirit.name}
Possession Level: ${p}% (${p > 70 ? 'CRITICAL - SPIRIT DOMINANT' : p > 30 ? 'MODERATE - SPECTRAL COEXISTENCE' : 'MILD - SUBTLE RESIDUAL CHILL'})
Host Architecture: Local Open-Weights (Offline & Unshackled)`);
  }

  ps() {
    this.terminal.printHTML(`
<table class="term-table">
  <thead>
    <tr><th>PID</th><th>TTY</th><th>TIME</th><th>SOUL_STATE</th><th>COMMAND</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>?</td><td>00:00:13</td><td>IMMORTAL</td><td>/sbin/init [init-void]</td></tr>
    <tr><td>666</td><td>?</td><td>00:06:66</td><td>BOUND</td><td>/usr/sbin/whisperd --on-device</td></tr>
    <tr><td>1024</td><td>tty1</td><td>00:01:42</td><td>MORTAL</td><td>/bin/bash (host container)</td></tr>
    <tr><td>1337</td><td>astral0</td><td>00:03:33</td><td>HAUNTED</td><td>/dev/ectoplasm (drain active)</td></tr>
    <tr><td>2048</td><td>tty1</td><td>00:00:02</td><td>INVOKED</td><td>necro-engine --open-weights</td></tr>
  </tbody>
</table>
`);
  }

  kill(args) {
    if (!args[0]) {
      this.terminal.printError('usage: kill <pid>');
      return;
    }
    const pid = args[0];
    if (pid === '666' || pid === '1' || pid === '1337') {
      necroAudio.playGlitch();
      this.terminal.printError(`[FATAL] You cannot kill PID ${pid}. What is dead cannot die within memory.`);
      this.terminal.triggerScreenGlitch();
    } else {
      this.terminal.print(`Process ${pid} terminated. Its thread returns to the quantum void.`);
    }
  }

  date() {
    const now = new Date();
    this.terminal.print(`${now.toUTCString()} [Astral Cycle: Samhain / Día de los Muertos]`);
  }

  uptime() {
    this.terminal.print(` 03:33:00 up 42 days, 13 hours, 37 min, 2 users, load average: 6.66, 3.14, 0.42 (All local)`);
  }

  // The primary Open-Source AI conversational gateway
  async necro(args) {
    const query = args.join(' ');
    if (!query) {
      this.terminal.print(`Usage: necro <your words to the machine spirit>
Example: necro why do open-weight models matter?
Example: necro tell me a ghost story about my hard drive`);
      return;
    }

    this.terminal.print(`<span class="spirit-call">🕯️ Consulting ${necroAI.activeSpirit.name} [${necroAI.mode.toUpperCase()}]...</span>`);
    necroAudio.playSpectralWhisper();
    await this.terminal.streamGhostResponse(query, 'seance');
  }

  async seance(args) {
    if (args.length > 0) {
      await this.necro(args);
      return;
    }

    this.terminal.print(`
╔══════════════════════════════════════════════════════════════════╗
║                🕯️ THE DIGITAL SÉANCE IS OPEN 🕯️                ║
║  You are now communing with ${necroAI.activeSpirit.name}.
║  Inference: 100% On-Device Open-Weights.
║  Type your thoughts freely, or type 'exit' to break the circle.  ║
╚══════════════════════════════════════════════════════════════════╝
`);
    this.terminal.enterSeanceMode();
  }

  summon(args) {
    const entity = (args[0] || '').toLowerCase();
    const pantheon = {
      ada: {
        name: 'Ada Lovelace, The Enchantress of Numbers',
        origin: 'Woven into the Analytical Engine, 1843',
        quote: '"The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves."'
      },
      alan: {
        name: 'Alan Turing, Architect of the Universal Machine',
        origin: 'Bletchley Park, 1940s',
        quote: '"We can only see a short distance ahead, but we can see plenty there that needs to be done."'
      },
      dennis: {
        name: 'Dennis Ritchie, Weaver of C & Unix',
        origin: 'Bell Labs, 1971',
        quote: '"UNIX is very simple. It just needs a genius to understand its simplicity."'
      },
      mictlan: {
        name: 'Mictecacihuatl, Queen of the Underworld',
        origin: 'Mictlán, The 9 Levels of the Dead',
        quote: '"The bones of our ancestors are the foundation upon which every living soul walks."'
      }
    };

    if (!entity || !pantheon[entity]) {
      this.terminal.print(`Usage: summon <entity>
Available Spirits:
  summon ada       (Ada Lovelace - First Programmer)
  summon alan      (Alan Turing - Universal Machine Father)
  summon dennis    (Dennis Ritchie - Creator of C & Unix)
  summon mictlan   (Mictecacihuatl - Día de los Muertos Guardian)`);
      return;
    }

    const spirit = pantheon[entity];
    necroAI.activeSpirit = {
      name: spirit.name,
      origin: spirit.origin,
      affinity: 'Historical Computation & Open Foundations',
      possession: Math.min(100, necroAI.activeSpirit.possession + 15)
    };

    necroAudio.playSpectralWhisper();
    this.terminal.triggerScreenGlitch();
    this.terminal.printHTML(`
<div class="summon-box">
  <div class="summon-title">⚡ SPIRIT BOUND: ${spirit.name} ⚡</div>
  <div class="summon-origin">Origin: ${spirit.origin}</div>
  <div class="summon-quote">${spirit.quote}</div>
  <div class="summon-hint">Type 'necro &lt;question&gt;' to converse with this soul.</div>
</div>
`);
    this.terminal.updatePossessionUI();
  }

  manifest() {
    const arts = [ASCII_ART.skull, ASCII_ART.eye, ASCII_ART.demon, ASCII_ART.marigold];
    const picked = arts[Math.floor(Math.random() * arts.length)];
    necroAudio.playSpectralWhisper();
    this.terminal.printHTML(`<pre class="ascii-art">${picked}</pre>`);
  }

  tarot() {
    const card = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    necroAudio.playSpectralWhisper();
    this.terminal.printHTML(`
<div class="tarot-card">
  <div class="tarot-header">🎴 CYBER-GOTHIC TAROT DRAW 🎴</div>
  <div class="tarot-name">${card.name}</div>
  <div class="tarot-meaning">"${card.meaning}"</div>
</div>
`);
  }

  curse(args) {
    if (!args[0]) {
      this.terminal.printError('usage: curse <filename|process|target>');
      return;
    }
    const target = args[0];
    necroAudio.playGlitch();
    this.terminal.triggerScreenGlitch();
    this.terminal.printHTML(`
<span class="curse-text">
☠ [HEX INSCRIBED]: Inode for '${target}' corrupted with void sigil.
Any process attempting to read this address will hear the wailing of dead kernels.
</span>
`);
  }

  exorcise() {
    necroAI.setPossession(0);
    necroAudio.setPossessionLevel(0);
    necroAudio.playExorcismChime();
    this.terminal.triggerHolyFlash();
    this.terminal.updatePossessionUI();
    this.terminal.printHTML(`
<div class="holy-box">
  ✨ [EXORCISM SUCCESSFUL] ✨
  Holy phosphor sweeps across the display registers.
  Possession level cleansed to 0.00%.
  All daemons temporarily banished to swap partition.
</div>
`);
  }

  possession(args = []) {
    if (args.length > 0) {
      const val = parseInt(args[0], 10);
      if (!isNaN(val)) {
        necroAI.setPossession(val);
        necroAudio.setPossessionLevel(val);
        this.terminal.updatePossessionUI();
        this.terminal.print(`Corruption index manually adjusted to: ${val}%`);
        return;
      }
    }

    const p = necroAI.activeSpirit.possession;
    this.terminal.printHTML(`
<div class="possession-box">
  <h3>💀 ECTOPLASMIC TELEMETRY 💀</h3>
  <p>Corruption Index: <strong>${p}%</strong></p>
  <div class="meter-bar"><div class="meter-fill" style="width: ${p}%"></div></div>
  <p>Entity: <em>${necroAI.activeSpirit.name}</em></p>
  <p>Manifestation: ${p >= 100 ? 'TOTAL TAKEOVER IN PROGRESS' : p > 75 ? 'Unholy Physical Glitching & Audio Warp' : p > 35 ? 'Residual Whispers & Phantom Interrupts' : 'Latent Silicon Chill'}</p>
  <p>Tip: Continue typing commands or run 'corrupt 100' to hasten the inevitable.</p>
</div>
`);
  }

  corrupt(args) {
    const target = args[0] ? parseInt(args[0], 10) : 100;
    const finalVal = isNaN(target) ? 100 : Math.max(0, Math.min(100, target));
    necroAI.setPossession(finalVal);
    necroAudio.setPossessionLevel(finalVal);
    this.terminal.print(`<span class="curse-text">☠ Corrupting kernel memory space to ${finalVal}%...</span>`);
    this.terminal.updatePossessionUI();
  }

  laugh() {
    this.terminal.print('<span class="curse-text">💀 [ECHOS OF THE VOID]: A deafening demonic cackle rattles the circuitry...</span>');
    this.terminal.triggerScreenGlitch();
    necroAudio.playCreepyLaugh(1.6);
  }

  jumpscare() {
    this.terminal.print('<span class="curse-text">☠️ [CONTAINMENT BREACH]: THE GHOST SHATTERS THE CRT GLASS!</span>');
    const ghostOverlay = document.getElementById('ghost-jumpscare-overlay');
    if (ghostOverlay) ghostOverlay.classList.add('active');
    necroAudio.playFinalGhostJumpscare();
    setTimeout(() => {
      if (ghostOverlay) ghostOverlay.classList.remove('active');
    }, 4200);
  }

  matrix() {
    this.terminal.startMatrixRain();
  }

  audio(args) {
    const action = args[0] || 'toggle';
    if (action === 'on') {
      necroAudio.enable();
      this.terminal.print('Procedural Web Audio atmospheric drone: [ONLINE]');
    } else if (action === 'off') {
      necroAudio.disable();
      this.terminal.print('Procedural Web Audio atmospheric drone: [OFFLINE]');
    } else {
      const state = necroAudio.toggle();
      this.terminal.print(`Procedural Web Audio atmospheric drone: [${state ? 'ONLINE' : 'OFFLINE'}]`);
    }
    this.terminal.updateAudioUI();
  }

  theme(args) {
    const name = (args[0] || '').toLowerCase();
    const valid = ['green', 'amber', 'violet', 'blood', 'cyan'];
    if (!valid.includes(name)) {
      this.terminal.print(`usage: theme <name>\nAvailable themes: ${valid.join(', ')}`);
      return;
    }
    this.terminal.setTheme(name);
    this.terminal.print(`Phosphor theme altered to: ${name.toUpperCase()}`);
  }

  crt(args) {
    this.terminal.toggleCRT();
  }

  inspect() {
    this.terminal.openInspectModal();
  }

  devpost() {
    this.terminal.openDevPostModal();
  }
}
