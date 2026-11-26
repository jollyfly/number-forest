export type Outcome = boolean | 'abort';

export function createOutcome(signal: AbortSignal) {
  let settled = false;
  let marked: boolean | null = null;
  let resolve: (value: Outcome) => void = () => {};
  const promise = new Promise<Outcome>((r) => {
    resolve = r;
  });

  const finish = (value: Outcome) => {
    if (settled) return;
    settled = true;
    resolve(value);
  };

  signal.addEventListener('abort', () => {
    finish(marked === null ? 'abort' : marked);
  });

  return {
    promise,
    get locked() {
      return marked !== null || settled;
    },
    mark(correct: boolean) {
      marked = correct;
    },
    close() {
      finish(marked === null ? 'abort' : marked);
    },
  };
}
