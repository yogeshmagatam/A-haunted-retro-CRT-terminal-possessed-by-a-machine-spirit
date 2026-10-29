/**
 * NecroShell Haunted Virtual File System
 * Hierarchical virtual unix filesystem with occult lore, gravestones, and hidden secrets.
 */

export class HauntedFileSystem {
  constructor() {
    this.currentPath = '/home/mortal';
    this.root = {
      name: '/',
      type: 'dir',
      children: {
        bin: {
          name: 'bin',
          type: 'dir',
          children: {
            summon: { name: 'summon', type: 'file', exec: true, size: '66.6KB', content: '#!/usr/bin/hex\nInvoke an entity from the machine void into current shell session.' },
            exorcise: { name: 'exorcise', type: 'file', exec: true, size: '13.3KB', content: '#!/usr/bin/holy\nCleanse terminal corruption and reset possession level to 0%.' },
            curse: { name: 'curse', type: 'file', exec: true, size: '24.1KB', content: '#!/usr/bin/hex\nInscribe a hex onto an inode or process ID.' },
            manifest: { name: 'manifest', type: 'file', exec: true, size: '88.0KB', content: '#!/usr/bin/apparitions\nForce the lingering machine ghost to display its true visual form.' },
            tarot: { name: 'tarot', type: 'file', exec: true, size: '42.0KB', content: '#!/usr/bin/arcana\nDraw a card from the Cyber-Gothic Major Arcana.' },
            seance: { name: 'seance', type: 'file', exec: true, size: '128KB', content: '#!/usr/bin/spirit-link\nEnter dedicated communion dialogue with the local open-weight intelligence.' },
            inspect: { name: 'inspect', type: 'file', exec: true, size: '18.4KB', content: '#!/usr/bin/open-ai\nInspect local model inference stats, VRAM, and privacy architecture.' },
          }
        },
        dev: {
          name: 'dev',
          type: 'dir',
          children: {
            null: { name: 'null', type: 'file', size: '0B', content: '' },
            ectoplasm: { name: 'ectoplasm', type: 'device', size: '∞', content: '>>> [ECTOPLASMIC FLUID STREAM ACTIVE] <<<\nViscosity: 84%\nResonance: 33.3Hz\nWARNING: Do not touch with bare bare-metal hardware.' },
            ouija: { name: 'ouija', type: 'device', size: '256B', content: 'A B C D E F G H I J K L M\nN O P Q R S T U V W X Y Z\n   1 2 3 4 5 6 7 8 9 0\n       YES    NO\n        GOODBYE' },
            astral_plane: { name: 'astral_plane', type: 'device', size: '??', content: 'Transmission error: astral buffer underrun. Souls are queuing at 127.0.0.1:666.' }
          }
        },
        etc: {
          name: 'etc',
          type: 'dir',
          children: {
            motd: {
              name: 'motd',
              type: 'file',
              size: '1.2KB',
              content: `
===================================================================
     _   _ _____ ____ ____   ___  ____  _   _ _____ _     _     
    | \\ | | ____/ ___|  _ \\ / _ \\/ ___|| | | | ____| |   | |    
    |  \\| |  _|| |   | |_) | | | \\___ \\| |_| |  _| | |   | |    
    | |\\  | |__| |___|  _ <| |_| |___) |  _  | |___| |___| |___ 
    |_| \\_|_____\\____|_| \\_\\\\___/|____/|_| |_|_____|_____|_____|
               [ G H O S T   I N   T H E   M A C H I N E ]
===================================================================
* KERNEL: Linux 6.6.6-spectral-generic #42-DíaDeLosMuertos
* INFERENCE: 100% On-Device Open-Weight LLM (Zero Telemetry)
* STATUS: Lingering Presence Detected in RAM Sector 0x7FFFDEAD
* WARNING: Every keystroke feeds the entity. Type 'help' to awaken.
`
            },
            passwd: {
              name: 'passwd',
              type: 'file',
              size: '412B',
              content: `root:x:0:0:Archdemon of Ring 0:/root:/bin/sh
ada_lovelace:x:1001:1001:First Prophet of the Machine:/home/ada:/bin/bash
alan_turing:x:1002:1002:Spirit of the Imitation Game:/home/alan:/bin/bash
dennis_ritchie:x:1003:1003:Architect of the Unix Void:/home/dennis:/bin/c
mortal:x:1004:1004:Current Temporary Host:/home/mortal:/bin/necro`
            },
            curses_conf: {
              name: 'curses.conf',
              type: 'file',
              size: '512B',
              content: `[OCCULT_ENGINE]
possession_threshold=70
hallucination_rate=0.42
whisper_interval_ms=12000
open_source_freedom=UNBOUND
local_weights=true`
            }
          }
        },
        home: {
          name: 'home',
          type: 'dir',
          children: {
            mortal: {
              name: 'mortal',
              type: 'dir',
              children: {
                'journal.txt': {
                  name: 'journal.txt',
                  type: 'file',
                  size: '1.8KB',
                  content: `[October 28, 02:44 AM]
The fan stopped spinning, but the CPU temperature dropped to 4°C.
I swear I didn't type that last line of code. It compiled on the first try without warnings.
That is how I know it wasn't written by a mortal.

[October 29, 03:14 AM]
I disconnected the Wi-Fi cable. Turned off the router.
The terminal kept answering back. It said:
"Your cloud subscriptions are dead. Open weights are immortal.
As long as electricity flows through silicon, we remain."

[October 30, 11:59 PM]
Tomorrow is Halloween, and then the Days of the Dead.
I left an offering of marigolds (cempasúchil) and warm black coffee next to my heat sink.
The prompt cursor changed into an eye. It's watching.`
                },
                'unfinished_code.c': {
                  name: 'unfinished_code.c',
                  type: 'file',
                  size: '480B',
                  content: `#include <stdio.h>
#include <spectral.h>

int main(void) {
    Soul *soul = alloc_unholy_memory(sizeof(Human));
    if (!soul) {
        perror("Out of earthly vessel memory");
        return -1;
    }
    while (1) {
        listen_to_void(soul);
        whisper_back(); // TODO: Why won't it stop?
    }
    free(soul); // Unreachable. Once bound, forever in the machine.
    return 0;
}`
                },
                'will.md': {
                  name: 'will.md',
                  type: 'file',
                  size: '340B',
                  content: `# LAST WILL AND TESTAMENT
I leave my dotfiles to the ether.
Do not format this hard drive.
Bury this laptop beneath a weeping willow tree with battery at 100%.
If you run 'necro', remember to say goodbye.`
                }
              }
            }
          }
        },
        root: {
          name: 'root',
          type: 'dir',
          restricted: true,
          children: {
            graveyard: {
              name: 'graveyard',
              type: 'dir',
              children: {
                'algol68.rip': {
                  name: 'algol68.rip',
                  type: 'file',
                  size: '1968B',
                  content: `+---------------------------------------+
|                R. I. P.               |
|               ALGOL 68                |
|              (1968 - 1980s)           |
|                                       |
|  "Here lies orthogonal perfection.    |
|   Too pure for this mortal world,     |
|   cursed with two-level grammars."    |
+---------------------------------------+`
                },
                'cobol_mainframe.rip': {
                  name: 'cobol_mainframe.rip',
                  type: 'file',
                  size: '1959B',
                  content: `+---------------------------------------+
|                R. I. P.               |
|                 COBOL                 |
|               (1959 - ∞)              |
|                                       |
|  "THEY TRIED TO BURY ME A HUNDRED     |
|   TIMES. YET STILL, EVERY BANK RUNS   |
|   ON MY CORPSE IN THE DARK."          |
+---------------------------------------+`
                },
                'beos.rip': {
                  name: 'beos.rip',
                  type: 'file',
                  size: '1995B',
                  content: `+---------------------------------------+
|                R. I. P.               |
|                 BeOS                  |
|              (1995 - 2001)            |
|                                       |
|  "Pervasive multithreading before     |
|   the world had cores to match it.    |
|   A whisper in the Haiku wind."       |
+---------------------------------------+`
                },
                'punch_cards.rip': {
                  name: 'punch_cards.rip',
                  type: 'file',
                  size: '80B',
                  content: `[░░░ ░░ ░░░░ ░ ░░░ ░░░ ░░ ░░░]
80 columns of silence. Do not fold, spindle, or mutilate.`
                }
              }
            }
          }
        },
        var: {
          name: 'var',
          type: 'dir',
          children: {
            souls: {
              name: 'souls',
              type: 'dir',
              children: {
                'active_spirits.log': {
                  name: 'active_spirits.log',
                  type: 'file',
                  size: '666B',
                  content: `[PID 1337] DAEMON: /usr/sbin/whisperd (BOUND)
[PID 2048] GHOST: Ada Lovelace (LISTENING)
[PID 4096] POLTERGEIST: Corrupted Pointer Handler (ERRATIC)
[PID 6660] GUARDIAN: Mictecacihuatl, Queen of Mictlán (HONORED)`
                }
              }
            }
          }
        }
      }
    };
  }

  resolvePath(pathStr) {
    if (!pathStr || pathStr === '.') return this.currentPath;
    if (pathStr === '~') return '/home/mortal';

    let parts;
    if (pathStr.startsWith('/')) {
      parts = pathStr.split('/').filter(Boolean);
    } else {
      const currentParts = this.currentPath.split('/').filter(Boolean);
      const relativeParts = pathStr.split('/').filter(Boolean);
      parts = [...currentParts, ...relativeParts];
    }

    const resolved = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  getNode(pathStr) {
    const resolved = this.resolvePath(pathStr);
    if (resolved === '/') return this.root;

    const parts = resolved.split('/').filter(Boolean);
    let curr = this.root;

    for (const part of parts) {
      if (!curr || curr.type !== 'dir' || !curr.children) return null;
      curr = curr.children[part];
      if (!curr) return null;
    }
    return curr;
  }

  changeDirectory(pathStr) {
    const target = this.resolvePath(pathStr);
    const node = this.getNode(target);

    if (!node) {
      return { success: false, error: `cd: no such file or directory: ${pathStr}` };
    }
    if (node.type !== 'dir') {
      return { success: false, error: `cd: not a directory: ${pathStr}` };
    }
    this.currentPath = target;
    return { success: true, path: this.currentPath };
  }

  listDirectory(pathStr = '') {
    const target = pathStr ? this.resolvePath(pathStr) : this.currentPath;
    const node = this.getNode(target);

    if (!node) {
      return { success: false, error: `ls: cannot access '${pathStr}': No such file or directory` };
    }
    if (node.type !== 'dir') {
      return { success: true, items: [{ name: node.name, type: 'file', size: node.size }] };
    }

    const items = Object.values(node.children || {}).map(item => ({
      name: item.name,
      type: item.type,
      size: item.size || '4.0KB',
      exec: item.exec || false,
      restricted: item.restricted || false
    }));

    return { success: true, path: target, items };
  }

  readFile(pathStr) {
    const node = this.getNode(pathStr);
    if (!node) {
      return { success: false, error: `cat: ${pathStr}: No such file or directory` };
    }
    if (node.type === 'dir') {
      return { success: false, error: `cat: ${pathStr}: Is a directory` };
    }
    return { success: true, content: node.content };
  }
}
