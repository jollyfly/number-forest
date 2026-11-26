export interface AudioApi {
  unlock(): void;
  pop(): void;
  ok(): void;
  oops(): void;
  star(): void;
  hop(): void;
  place(): void;
}

let singleton: AudioApi | null = null;

export function getAudio(): AudioApi {
  if (!singleton) singleton = createAudio();
  return singleton;
}

function createAudio(): AudioApi {
  let ctx: AudioContext | null = null;

  function ac(): AudioContext | null {
    if (typeof AudioContext === 'undefined') return null;
    if (!ctx) ctx = new AudioContext();
    return ctx;
  }

  function tone(freq: number, when: number, dur: number, type: OscillatorType, gain: number) {
    try {
      const c = ac();
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, when);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(when);
      o.stop(when + dur + 0.03);
    } catch {
      /* a missing audio device must not freeze the question */
    }
  }

  return {
    unlock() {
      try {
        const c = ac();
        if (!c) return;
        if (c.state === 'suspended') void c.resume();
        const o = c.createOscillator();
        const g = c.createGain();
        g.gain.value = 0;
        o.connect(g);
        g.connect(c.destination);
        o.start();
        o.stop(c.currentTime + 0.02);
      } catch {
        /* ignore */
      }
    },
    pop() {
      const c = ac();
      if (!c) return;
      tone(540, c.currentTime, 0.08, 'sine', 0.12);
    },
    ok() {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      tone(523, t, 0.12, 'sine', 0.13);
      tone(659, t + 0.1, 0.12, 'sine', 0.13);
      tone(784, t + 0.2, 0.24, 'triangle', 0.11);
    },
    oops() {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      tone(330, t, 0.1, 'sine', 0.07);
      tone(262, t + 0.09, 0.16, 'sine', 0.06);
    },
    star() {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      [880, 1174, 1568].forEach((f, i) => tone(f, t + i * 0.07, 0.18, 'sine', 0.09));
    },
    hop() {
      const c = ac();
      if (!c) return;
      tone(480, c.currentTime, 0.07, 'triangle', 0.1);
    },
    place() {
      const c = ac();
      if (!c) return;
      tone(360, c.currentTime, 0.06, 'sine', 0.1);
    },
  };
}
