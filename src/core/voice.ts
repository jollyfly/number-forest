export interface SpeechVoiceLike {
  lang: string;
  name: string;
  localService?: boolean;
  voiceURI?: string;
}

const ZH_LANG = /zh([-_](cn|hans))?/i;
const ZH_NAME = /chinese|中文|普通话|tingting|ting-ting|sinji|sin-ji|meijia|yaoyao|lilian/i;

let unlocked = false;
let chosen: SpeechSynthesisVoice | null = null;
let degraded = false;
let voicesReady = false;
const listeners = new Set<(hasChinese: boolean | null) => void>();

export function pickChineseVoice<T extends SpeechVoiceLike>(voices: readonly T[]): T | null {
  const zh = voices.filter((v) => ZH_LANG.test(v.lang) || ZH_NAME.test(v.name));
  zh.sort((a, b) => {
    const score = (v: T) => {
      let s = 0;
      if (/zh[-_]?cn/i.test(v.lang)) s += 4;
      else if (/zh/i.test(v.lang)) s += 2;
      if (v.localService) s += 1;
      return s;
    };
    return score(b) - score(a);
  });
  return zh[0] ?? null;
}

function refreshFromSynth() {
  if (typeof speechSynthesis === 'undefined') {
    degraded = true;
    voicesReady = true;
    return;
  }
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  voicesReady = true;
  chosen = pickChineseVoice(voices);
  degraded = !chosen;
  const has = Boolean(chosen);
  for (const fn of listeners) fn(has);
}

export function onVoiceStatus(fn: (hasChinese: boolean | null) => void): () => void {
  listeners.add(fn);
  fn(voicesReady ? !degraded : null);
  return () => listeners.delete(fn);
}

export function primeVoices(): void {
  if (typeof speechSynthesis === 'undefined') {
    degraded = true;
    voicesReady = true;
    return;
  }
  refreshFromSynth();
  speechSynthesis.addEventListener('voiceschanged', refreshFromSynth);
}

function utter(text: string) {
  if (typeof speechSynthesis === 'undefined') return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    if (chosen) u.voice = chosen;
    u.rate = 0.9;
    u.pitch = 1.12;
    speechSynthesis.speak(u);
  } catch {
    /* synthesis can throw if the engine is missing; the picture still teaches */
  }
}

/**
 * Must be called inside the first tap. Speaks immediately so iOS unlocks audio.
 * If the voice list is already loaded and has no Chinese voice, stays silent.
 */
export function unlockVoice(firstLine: string): void {
  unlocked = true;
  if (typeof speechSynthesis === 'undefined') {
    degraded = true;
    return;
  }
  refreshFromSynth();
  if (!voicesReady) {
    speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        refreshFromSynth();
      },
      { once: true },
    );
  }
  if (voicesReady && !chosen) return;
  utter(firstLine);
}

export function speak(text: string): void {
  if (!unlocked || degraded) return;
  if (typeof speechSynthesis === 'undefined') return;
  if (!chosen) {
    refreshFromSynth();
    if (voicesReady && !chosen) return;
  }
  utter(text);
}

export function speakNow(text: string): void {
  if (!unlocked || degraded) return;
  if (typeof speechSynthesis === 'undefined') return;
  try {
    speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  if (!chosen) {
    refreshFromSynth();
    if (voicesReady && !chosen) return;
  }
  utter(text);
}

export function stopVoice(): void {
  if (typeof speechSynthesis === 'undefined') return;
  try {
    speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export function voiceIsDegraded(): boolean {
  return degraded;
}
