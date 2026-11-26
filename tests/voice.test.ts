import { describe, expect, it } from 'vitest';
import { pickChineseVoice, type SpeechVoiceLike } from '../src/core/voice';

const v = (lang: string, name: string, localService = false): SpeechVoiceLike => ({
  lang,
  name,
  localService,
});

describe('pickChineseVoice', () => {
  it('prefers a local zh-CN voice over a generic Chinese voice', () => {
    const picked = pickChineseVoice([
      v('en-US', 'Samantha'),
      v('zh-HK', 'Sinji', true),
      v('zh-CN', 'Tingting', true),
      v('zh-CN', 'Remote', false),
    ]);
    expect(picked?.name).toBe('Tingting');
  });

  it('returns null when nothing is Chinese', () => {
    expect(pickChineseVoice([v('en-US', 'Alex'), v('fr-FR', 'Amelie')])).toBeNull();
  });

  it('recognizes a voice that only says Chinese in the name', () => {
    const picked = pickChineseVoice([v('und', 'Chinese China')]);
    expect(picked?.name).toBe('Chinese China');
  });
});
