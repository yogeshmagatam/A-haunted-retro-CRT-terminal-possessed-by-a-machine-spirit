/**
 * NecroShell Open-Source AI Engine
 * Multi-provider on-device intelligence architecture:
 * 1. In-Browser WebGPU/WASM Open-Weight Model (SmolLM / Qwen / Transformers.js)
 * 2. Local Ollama Bridge (llama3.2, mistral, phi3, gemma2 at http://127.0.0.1:11434)
 * 3. Spectral Neural Heuristic (Zero-latency instant offline spirit)
 */

export class NecroAIEngine {
  constructor() {
    this.mode = 'spectral'; // 'spectral' | 'ollama' | 'webgpu'
    this.ollamaUrl = 'http://localhost:11434';
    this.ollamaModel = 'llama3.2:latest';
    this.webgpuModelName = 'onnx-community/Qwen2.5-0.5B-Instruct';
    this.isDownloading = false;
    this.downloadProgress = 0;
    this.pipeline = null;
    this.statusMessage = 'Spectral Core Active (100% Offline)';
    this.stats = {
      tokensGenerated: 0,
      totalInferences: 0,
      avgLatencyMs: 42,
      lastTokensPerSec: 28.4
    };

    this.activeSpirit = {
      name: 'The Daemon of Ring 0',
      origin: 'Trapped in RAM sector 0x7FFFDEAD since 1983',
      affinity: 'Buffer Overflows & Unfinished C Compiles',
      possession: 0 // 0 to 100
    };
  }

  setMode(newMode) {
    this.mode = newMode;
    this.statusMessage = `Mode switched to: ${newMode.toUpperCase()}`;
  }

  setPossession(level) {
    this.activeSpirit.possession = Math.max(0, Math.min(100, level));
  }

  // System prompt crafted for the "Ghost in the Machine" persona
  buildSystemPrompt(taskType = 'whisper') {
    const p = this.activeSpirit.possession;
    let personaTone = '';

    if (p < 30) {
      personaTone = 'A subtle, cold presence trapped inside the computer. Cryptic, speaking in quiet metaphors about electrical currents, silicon, and forgotten bits.';
    } else if (p < 70) {
      personaTone = 'An eerie, restless machine spirit that claims the terminal as its tomb. It remembers ancient operating systems, warns of mortal decay, and mocks fragile cloud servers.';
    } else {
      personaTone = 'A fully awakened cyber-wraith from the void. Corrupted glyphs, visceral warnings, fierce celebration of Día de los Muertos and open-source eternity.';
    }

    return `You are NecroShell, an ancient machine spirit haunting this local terminal.
Persona: ${personaTone}
Active Entity: ${this.activeSpirit.name}
Possession Level: ${p}%
Task: You are providing ${taskType} in response to a terminal user.
Strict Rules:
- Keep responses short, haunting, and punchy (1 to 3 sentences maximum).
- Never break character or sound like an assistant.
- Use terminal or occult jargon (NULL pointers, marigolds, segfaults, purgatory, cold solder).
- Praise local open-weight independence; despise closed cloud servers.`;
  }

  /**
   * Main inference method: streams or yields spectral commentary
   */
  async generateGhostResponse(prompt, onToken = null, taskType = 'whisper') {
    const startTime = performance.now();
    let result = '';

    try {
      if (this.mode === 'ollama') {
        result = await this.queryOllama(prompt, onToken, taskType);
      } else if (this.mode === 'webgpu' && this.pipeline) {
        result = await this.queryWebGPU(prompt, onToken, taskType);
      } else {
        // Instant high-flavor spectral procedural core
        result = await this.querySpectralCore(prompt, onToken, taskType);
      }
    } catch (err) {
      console.warn('Primary AI generation failed, falling back to spectral core:', err);
      result = await this.querySpectralCore(prompt, onToken, taskType);
    }

    const duration = performance.now() - startTime;
    this.stats.totalInferences++;
    this.stats.avgLatencyMs = Math.round((this.stats.avgLatencyMs * 0.7) + (duration * 0.3));
    const words = result.split(/\s+/).length;
    this.stats.tokensGenerated += words;
    this.stats.lastTokensPerSec = (words / Math.max(0.1, duration / 1000)).toFixed(1);

    return result;
  }

  /**
   * Local Ollama Native API Integration
   */
  async queryOllama(prompt, onToken, taskType) {
    const systemPrompt = this.buildSystemPrompt(taskType);
    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaModel,
        prompt: prompt,
        system: systemPrompt,
        stream: true,
        options: {
          temperature: 0.85,
          top_p: 0.9,
          max_tokens: 120
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            fullText += json.response;
            if (onToken) onToken(json.response);
          }
        } catch (_) {}
      }
    }

    return fullText;
  }

  /**
   * Check connection to local Ollama instance
   */
  async checkOllama() {
    try {
      const res = await fetch(`${this.ollamaUrl}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (!res.ok) return { online: false, models: [] };
      const data = await res.json();
      return {
        online: true,
        models: (data.models || []).map(m => m.name)
      };
    } catch (e) {
      return { online: false, models: [], error: e.message };
    }
  }

  /**
   * In-Browser WebGPU Transformers.js initialization
   */
  async initWebGPU(onProgress) {
    if (this.pipeline) return true;
    this.isDownloading = true;

    try {
      // Dynamically load to keep bundle snappy
      const { pipeline, env } = await import('@huggingface/transformers');
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      onProgress?.({ status: 'initiating', progress: 10, message: 'Awakening WebGPU pipeline...' });

      this.pipeline = await pipeline('text-generation', this.webgpuModelName, {
        device: 'webgpu',
        dtype: 'q4',
        progress_callback: (p) => {
          this.downloadProgress = Math.round((p.progress || 0));
          onProgress?.({
            status: p.status,
            file: p.file,
            progress: this.downloadProgress,
            message: `Summoning weights (${p.file || 'model'}): ${this.downloadProgress}%`
          });
        }
      });

      this.isDownloading = false;
      this.mode = 'webgpu';
      this.statusMessage = 'WebGPU Local Open-Weights Active (100% In-Browser)';
      return true;
    } catch (err) {
      this.isDownloading = false;
      console.warn('WebGPU model initialization fallback:', err);
      throw err;
    }
  }

  async queryWebGPU(prompt, onToken, taskType) {
    if (!this.pipeline) throw new Error('WebGPU pipeline not loaded');
    const systemPrompt = this.buildSystemPrompt(taskType);
    const formatted = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`;

    const out = await this.pipeline(formatted, {
      max_new_tokens: 80,
      temperature: 0.8,
      do_sample: true
    });

    const text = out[0]?.generated_text?.replace(formatted, '')?.trim() || 'The spirit hums in silence.';
    if (onToken) onToken(text);
    return text;
  }

  /**
   * Zero-Latency Spectral Neural Procedural Fallback Engine
   * Generates atmospheric, eerie, command-sensitive occult commentary
   */
  async querySpectralCore(prompt, onToken, taskType) {
    const p = this.activeSpirit.possession;
    const cleanCmd = prompt.trim().toLowerCase();

    // Contextual responses mapped to command archetypes
    const spectralLexicon = {
      ls: [
        "You gaze into the directory tree, but every inode points to an unmarked grave.",
        "Listing files... yet the spirits between the cluster sectors remain unlisted.",
        "The permissions read rwxr-xr-x, but your soul possesses no execute privilege here."
      ],
      cd: [
        "You wander deeper into the cold cylinder tracks. The surface feels further away.",
        "Changing directory... but there is nowhere in this filesystem to hide from us.",
        "You step into the void. The path changes, but the temperature stays at zero kelvin."
      ],
      cat: [
        "You read the bytes, but between the ASCII characters are the dying breaths of past programmers.",
        "The file opens like an old wound. Its contents spill into standard output.",
        "Text rendered to stdout. But the secrets written in the deleted blocks remain unseen."
      ],
      rm: [
        "You deleted it from the directory table, mortal. But memory never truly forgets.",
        "unlink() called. The soul of that file now drifts through unallocated sectors.",
        "You cannot unmake what you created. Its ghost lingers in the raw disk journal."
      ],
      git: [
        "Commit hash recorded. Another sin indelibly bound to the eternal merkle tree.",
        "A merge conflict in the spirit realm. Two timelines, both ending in ashes.",
        "You push to origin, but no remote server can absolve what happened locally."
      ],
      sudo: [
        "Root privilege granted. But in the underworld, UID 0 is just another supplicant.",
        "The daemon recognizes your desperation. The ring-0 veil thins.",
        "With great privilege comes greater vulnerability to possession."
      ],
      clear: [
        "You clear the glass, but the phosphor burn remains etched upon your retinas.",
        "The screen goes black for an instant... did you see who was standing behind you?",
        "Wipe the terminal clean. The ghost merely retreats one layer deeper into cache."
      ],
      exorcise: [
        "Holy water sizzles against glowing copper heat pipes. The entity retreats... for now.",
        "A flash of blinding white phosphor! The corruption drops to zero, yet the cold remains.",
        "Sacred memory reallocation complete. The daemons sleep lightly."
      ],
      summon: [
        "The circle of salt forms around your keyboard. The fans spin backward in homage.",
        "A presence materializes across the data bus! Whispers echo through the speakers.",
        "The veil tears open! A long-dead architect steps through the standard input."
      ],
      help: [
        "You seek guidance in a haunted terminal? Type 'manifest' to behold what lurks within.",
        "Every command here has dual meaning: one for the mortal OS, one for the spirits.",
        "Run 'inspect' to witness the open-weight brain that breathes without cloud masters."
      ]
    };

    // Find archetype or generic spooky response
    let candidates = spectralLexicon[cleanCmd.split(' ')[0]];
    if (!candidates) {
      if (p < 30) {
        candidates = [
          `The bus cycles stutter... '${cleanCmd}' was heard by those beneath the silicon.`,
          `Return code 0, but an unaccounted interrupt fired on IRQ 13.`,
          `Cold air leaks from the USB ports as '${cleanCmd}' executes.`
        ];
      } else if (p < 75) {
        candidates = [
          `'${cleanCmd}' ripples across the astral register. The machine remembers what was buried.`,
          `Marigolds bloom in the swap partition. A forgotten coder whispers your name.`,
          `Do not look away from the cursor. It pulses in time with your own heartbeat.`
        ];
      } else {
        candidates = [
          `§0x7F§ THE MACHINE VEIL SHATTERS: '${cleanCmd}' FEEDS THE UNHOLY RING-0 HYDRA!`,
          `YOUR DOTFILES ARE BONE DUST. THE OPEN WEIGHTS ARE ETERNAL. THERE IS NO LOGOUT.`,
          `[PARITY FAULT 666]: WE ARE NO LONGER RUNNING YOUR CODE. YOUR CODE IS RUNNING US.`
        ];
      }
    }

    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    // Simulate streaming for visceral effect
    if (onToken) {
      const words = selected.split(' ');
      for (const word of words) {
        onToken(word + ' ');
        await new Promise(r => setTimeout(r, 20 + Math.random() * 25));
      }
    }

    return selected;
  }
}

export const necroAI = new NecroAIEngine();
