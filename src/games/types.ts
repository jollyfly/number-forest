import type { AudioApi } from '../core/audio';
import type { Expr } from '../art/characters';

export interface PlayCtx {
  stage: HTMLElement;
  dock: HTMLElement;
  signal: AbortSignal;
  setFace: (expr: Expr) => void;
  setLine: (line: string) => void;
  speak: (line: string) => void;
  speakNow: (line: string) => void;
  audio: AudioApi;
  extraHint: boolean;
  setOnSpeak: (fn: (() => void) | null) => void;
}
