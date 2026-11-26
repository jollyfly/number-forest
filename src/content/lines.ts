const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'] as const;

export function numCN(n: number): string {
  if (Number.isInteger(n) && n >= 0 && n < CN.length) return CN[n]!;
  return String(n);
}

const PRAISE = ['真棒！', '对啦！', '太好了！', '你真厉害！'];

export function linePraise(rng: () => number = Math.random): string {
  return PRAISE[Math.floor(rng() * PRAISE.length)]!;
}

export const lines = {
  hello: '你好！我是团团。我们一起去数字森林玩吧！',
  map: '点一个地方，开始玩吧。',
  count: '数一数，有几颗松果？',
  countAfterFlash: '有几颗呢？',
  recount: '我们再数一遍。',
  tryAgain: '再试试。',
  look: '看一看这里。',
  levelUp: '哇，我们来玩难一点点的！',
  cart: (n: number) => `装上${numCN(n)}颗松果。`,
  cartMore: '再装几颗吧。',
  cartLess: '拿掉几颗吧。',
  add: (a: number, b: number) => `先有${numCN(a)}个苹果，又来了${numCN(b)}个。一共有几个？`,
  frogForward: (start: number, delta: number) =>
    `呱呱在${numCN(start)}，往前跳${numCN(delta)}下。落到哪一片？`,
  frogBack: (start: number, delta: number) =>
    `呱呱在${numCN(start)}，往后跳${numCN(delta)}下。落到哪一片？`,
  frogAdd: (start: number, delta: number) => `${numCN(start)}加${numCN(delta)}等于几？`,
  frogSub: (start: number, delta: number) => `${numCN(start)}减${numCN(delta)}等于几？`,
  pattern: '下一颗是什么样子？',
  patternNum: '下一个数是几？',
  treehouse: '这是团团的树屋。星星果越多，树屋就越漂亮。',
  reward: (n: number) => {
    if (n >= 3) return '太棒了，三颗星星果送给你！';
    if (n === 2) return '很好，两颗星星果送给你！';
    return '完成啦，一颗星星果送给你！';
  },
  noVoice: '这台设备没有中文语音，看画面一样可以玩。',
};
