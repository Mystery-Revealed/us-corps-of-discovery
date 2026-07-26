// engine.test.js — pins the VARIABLE-LENGTH CHAPTER machinery added to the
// step-game factory for Ratify It! (chapters used to be exactly two steps).
// Uses tiny synthetic games so the guarantees hold for every future adapter,
// not just this repo's content.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStepGame } from '../src/games/_stepGame.js';

const CHOICES = [
  { label: 'right', verdict: 'right', effects: { m: 5 }, feedback: 'fb-right' },
  { label: 'partial', verdict: 'partial', effects: {}, feedback: 'fb-partial' },
  { label: 'wrong', verdict: 'wrong', effects: {}, feedback: 'fb-wrong' },
];

function makeGame(chapterShapes, { variants } = {}) {
  return createStepGame({
    id: 'synthetic',
    title: 'Synthetic',
    sides: ['x'],
    variants,
    modes: ['solo'],
    soloRival: false,
    startMeters: () => ({ m: 50 }),
    phasesFor: (key) => chapterShapes(key).map((n, ci) => ({
      title: `C${ci}`,
      date: `D${ci}`,
      image: null,
      event: `event ${ci}`,
      steps: Array.from({ length: n }, (_, si) => ({
        kind: 'decision',
        prompt: `p${ci}.${si}`,
        choices: CHOICES.map((c) => ({ ...c })),
      })),
    })),
    meta: { meters: { m: { name: 'M' } } },
    scoreMeters: (m) => m.m,
    endingFor: (score) => ({ key: 'e', title: 'E', text: 't' }),
    debriefFor: () => 'd',
  });
}

test('chapterOf maps cursors through uneven chapters (1/3/2)', () => {
  const game = makeGame(() => [1, 3, 2]);
  assert.equal(game.totalActions, 6);
  assert.equal(game.chapterCount, 3);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(game.chapterOf), [0, 1, 1, 1, 2, 2, 3],
    'cursor === TOTAL maps past the last chapter, like floor(TOTAL/2) used to');
});

test('chapterOf matches the old floor(cursor/2) exactly for 2-step games', () => {
  const game = makeGame(() => [2, 2, 2]);
  for (let c = 0; c <= 6; c++) assert.equal(game.chapterOf(c), Math.floor(c / 2));
});

test('chapterDone fires only at real chapter boundaries; prompts carry stepInChapter/chapterSteps', () => {
  const game = makeGame(() => [1, 3, 2]);
  const state = game.initMatch({ mode: 'solo', soloSide: 'x' });

  const expectPos = [ // [stepInChapter, chapterSteps, chapter.index] per step
    [0, 1, 0], [0, 3, 1], [1, 3, 1], [2, 3, 1], [0, 2, 2], [1, 2, 2],
  ];
  const boundaries = [];
  for (let i = 0; i < 6; i++) {
    game.chapterEvent(state, 'x');
    const prompt = game.currentPrompt(state, 'x');
    assert.equal(prompt.stepInChapter, expectPos[i][0], `step ${i} stepInChapter`);
    assert.equal(prompt.chapterSteps, expectPos[i][1], `step ${i} chapterSteps`);
    assert.equal(prompt.chapter.index, expectPos[i][2], `step ${i} chapter index`);
    const res = game.resolve(state, 'x', game.aiMove(state, 'x'));
    if (res.chapterDone) boundaries.push(i);
  }
  assert.deepEqual(boundaries, [0, 3, 5], 'done after steps 1, 4, and 6 — not every 2');
  assert.ok(game.isComplete(state));
});

test('chapter events fire once per chapter, at the uneven boundaries', () => {
  const game = makeGame(() => [1, 3, 2]);
  const state = game.initMatch({ mode: 'solo', soloSide: 'x' });
  const seen = [];
  for (let i = 0; i < 6; i++) {
    const ev = game.chapterEvent(state, 'x');
    if (ev) seen.push(ev.chapter.index);
    game.resolve(state, 'x', game.aiMove(state, 'x'));
  }
  assert.deepEqual(seen, [0, 1, 2], 'each chapter announced exactly once');
});

test('variants with mismatched shapes fail loudly at startup', () => {
  assert.throws(
    () => makeGame((key) => (key === 'a' ? [2, 2] : [2, 1]), { variants: ['a', 'b'] }),
    /chapter 1 has 1 steps; expected 2/,
    'a drifted step count is a startup error, not a silent desync'
  );
  assert.throws(
    () => makeGame((key) => (key === 'a' ? [2, 2] : [2]), { variants: ['a', 'b'] }),
    /has 1 chapters; expected 2/,
    'a drifted chapter count too'
  );
});
