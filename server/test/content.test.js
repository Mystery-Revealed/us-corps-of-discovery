// content.test.js — structure, scoring-reachability, route, journal, and
// sensitivity checks on Corps of Discovery: Mission West content. The core
// promises (spec §3, §4, §10 checklist): 6 legs × 2 decisions = 12 graded
// actions with exactly one right answer each (so all-right = 100%); the right
// answer is always what Lewis and Clark actually did; endings tiered by the
// METER SUM and never by accuracy; the Trust meter gating nothing; journal pages
// unlocking at steps 3, 5, 7 and 10 at minimum with Clark's spelling preserved;
// and the honest closing note about the nations who helped.
import test from 'node:test';
import assert from 'node:assert/strict';
import game, {
  METERS, START_METERS, LEGS, SIDE, VOCAB, ROUTE, JOURNAL,
  phasesFor, journeyScore, endingFor, debriefFor, ENDINGS, CAPTAINS_MIN, HARD_ROAD_MIN,
} from '../src/games/usCorpsOfDiscovery.js';

const stepsOf = () => phasesFor().flatMap((p) => p.steps);
const pointsFor = (v) => (v === 'right' ? 1 : v === 'partial' ? 0.5 : 0);

test('one class group, solo, no rival, three meters at 50, 12 actions', () => {
  assert.equal(game.id, 'us-corps-of-discovery');
  assert.deepEqual(game.sides, ['class']);
  assert.equal(SIDE, 'class');
  assert.equal(game.soloRival, false, 'you co-command the expedition — no AI rival');
  assert.deepEqual(Object.keys(METERS), ['supplies', 'crew', 'trust']);
  assert.deepEqual(START_METERS, { supplies: 50, crew: 50, trust: 50 });
  assert.equal(game.meta.positions, undefined, 'no map board');
  assert.equal(game.totalActions, 12);
  assert.equal(game.chapterCount, 6, 'six legs of the route');
});

test('six legs, each with a scene card and two decisions, in route order', () => {
  assert.equal(LEGS.length, 6);
  for (const [i, l] of LEGS.entries()) {
    assert.ok(l.title?.length > 2, `leg ${i} title`);
    assert.ok(l.scene?.length > 20, `leg ${i} scene card`);
    assert.ok(l.image?.length > 4, `leg ${i} scene image`);
    assert.equal(l.steps.length, 2, `leg ${i}: two decisions`);
  }
  // Route order, west and back: St. Louis → the plains → Mandan → the falls →
  // the mountains → the Pacific.
  assert.match(LEGS[0].title, /St\. Louis/);
  assert.match(LEGS[2].title, /Fort Mandan/);
  assert.match(LEGS[4].title, /Over the Mountains/);
  assert.match(LEGS[5].title, /Ocean/);
});

test('twelve decisions, each with three choices and all fields present', () => {
  const steps = stepsOf();
  assert.equal(steps.length, 12, 'twelve graded actions');
  for (const [c, s] of steps.entries()) {
    assert.equal(s.kind, 'decision', `decision ${c} is a decision`);
    assert.equal(s.choices.length, 3, `decision ${c}: three choices`);
    assert.ok(s.place?.length > 2, `decision ${c} names its route stop`);
    assert.ok(s.art?.length > 4, `decision ${c} has scene art`);
    for (const ch of s.choices) {
      assert.ok(ch.label?.length > 5, `decision ${c} label`);
      assert.ok(['right', 'partial', 'wrong'].includes(ch.verdict), `decision ${c} verdict`);
      assert.ok(ch.feedback?.length > 10, `decision ${c} feedback`);
      assert.equal(typeof ch.effects, 'object', `decision ${c} effects object`);
    }
  }
});

test('exactly one right, one partial, one wrong per decision (this makes 100% and 0% reachable)', () => {
  for (const [c, s] of stepsOf().entries()) {
    const count = (v) => s.choices.filter((ch) => ch.verdict === v).length;
    assert.equal(count('right'), 1, `decision ${c}: exactly one right`);
    assert.equal(count('partial'), 1, `decision ${c}: exactly one partial`);
    assert.equal(count('wrong'), 1, `decision ${c}: exactly one wrong`);
  }
});

test('the right answer is always what Lewis and Clark actually did (spec §1)', () => {
  const rights = stepsOf().map((s) => s.choices.find((c) => c.verdict === 'right'));
  const expect = [
    /trade goods, gifts, medicine/i,          // 1  pack for diplomacy
    /Army discipline/i,                        // 2  military-tight crew
    /Hold steady\. No firing/i,                // 3  Bad River standoff talked down
    /fort beside the Mandan and Hidatsa/i,     // 4  Fort Mandan
    /Take them both/i,                         // 5  Charbonneau AND Sacagawea
    /trust the calm hands/i,                   // 6  Sacagawea saves the papers
    /Portage/i,                                // 7  a month of hauling, no shortcut
    /Let Sacagawea speak/i,                    // 8  Cameahwait, and the horses
    /Push through behind your Shoshone guide/i,// 9  the only way out was through
    /Trust them/i,                             // 10 the Nez Perce save the Corps
    /Put it to a vote/i,                       // 11 York and Sacagawea vote
    /The truth/i,                              // 12 no water route, honestly reported
  ];
  for (const [i, re] of expect.entries()) {
    assert.match(rights[i].label, re, `decision ${i + 1}: the historical action is the right one`);
  }
});

test('every force-first / distrust option is graded wrong or partial — never right (spec §11)', () => {
  const steps = stepsOf();
  const checks = [
    [2, /Fire the swivel gun/i, 'wrong'],
    [4, /No place|No\. A journey like this is no place/i, 'wrong'],
    [7, /Take the horses/i, 'wrong'],
    [9, /Camp apart/i, 'partial'],
  ];
  for (const [idx, re, verdict] of checks) {
    const ch = steps[idx].choices.find((c) => re.test(c.label));
    assert.ok(ch, `decision ${idx}: option present (${re})`);
    assert.equal(ch.verdict, verdict, `decision ${idx}: graded ${verdict}`);
  }
});

test('key explicit meter effects match spec §4', () => {
  const steps = stepsOf();
  const right = (i) => steps[i].choices.find((c) => c.verdict === 'right').effects;
  assert.deepEqual(right(0), { supplies: 10, trust: 5 });       // pack trade goods
  assert.deepEqual(right(1), { crew: 10 });                      // army discipline
  assert.deepEqual(right(2), { trust: 10 });                     // stand down at Bad River
  assert.deepEqual(right(3), { supplies: 10, trust: 10 });       // Fort Mandan
  assert.deepEqual(right(4), { trust: 15 });                     // hire them both
  assert.deepEqual(right(6), { crew: -5, supplies: 5 });         // the portage costs the crew
  assert.deepEqual(right(7), { trust: 15, supplies: 10 });       // Cameahwait's horses
  assert.deepEqual(right(8), { crew: -10 });                     // the Bitterroots cost, even played right
  assert.deepEqual(right(9), { trust: 15, crew: 15 });           // the Nez Perce rescue
  assert.deepEqual(right(11), { supplies: 5, crew: 5, trust: 5 });// the honest report
  assert.deepEqual(steps[2].choices.find((c) => /swivel gun/i.test(c.label)).effects, { trust: -20, crew: -5 });
  assert.deepEqual(steps[7].choices.find((c) => /Take the horses/i.test(c.label)).effects, { trust: -25 });
});

// --- Playthrough helpers: drive the adapter directly, honoring the shuffle ----
function playRun(pick = 'right') {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  for (let c = 0; c < game.totalActions; c++) {
    game.chapterEvent(state, SIDE);
    const ss = state.sides[SIDE];
    const step = stepsOf()[c];
    const real = step.choices.findIndex((ch) => ch.verdict === pick);
    const choiceIndex = ss.shuffles[c].indexOf(real);
    const res = game.resolve(state, SIDE, { kind: 'decision', choiceIndex });
    assert.ok(!res.error, `decision ${c}: ${res.error}`);
  }
  return game.report(state).perSide[SIDE];
}

test('all-right = 100% accuracy and "Captains of Discovery"', () => {
  const r = playRun('right');
  assert.equal(r.accuracy, 100);
  assert.equal(r.ending.key, 'captains');
  assert.ok(r.score >= CAPTAINS_MIN, `meter sum ${r.score} lands in the top band`);
});

test('all-wrong = 0% accuracy and "Lost in the High Country"', () => {
  const r = playRun('wrong');
  assert.equal(r.accuracy, 0);
  assert.equal(r.ending.key, 'lost');
  assert.ok(r.score < HARD_ROAD_MIN, `meter sum ${r.score} lands in the bottom band`);
});

test('all-partial = 50% accuracy and the middle tier', () => {
  const r = playRun('partial');
  assert.equal(r.accuracy, 50, 'twelve half-points out of twelve');
  assert.equal(r.ending.key, 'hardroad');
});

test('endings tier by the METER SUM, not accuracy (spec §3.3)', () => {
  assert.equal(endingFor(300).key, 'captains');
  assert.equal(endingFor(CAPTAINS_MIN).key, 'captains');
  assert.equal(endingFor(CAPTAINS_MIN - 1).key, 'hardroad');
  assert.equal(endingFor(HARD_ROAD_MIN).key, 'hardroad');
  assert.equal(endingFor(HARD_ROAD_MIN - 1).key, 'lost');
  assert.equal(ENDINGS.captains.title, 'Captains of Discovery');
  assert.equal(ENDINGS.hardroad.title, 'Hard Road Home');
  assert.equal(ENDINGS.lost.title, 'Lost in the High Country');
});

test('NO SOFT-LOCKS: the Trust meter gates nothing — a zero-trust run still plays all 12 (spec §10)', () => {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  const steps = stepsOf();
  for (let c = 0; c < game.totalActions; c++) {
    game.chapterEvent(state, SIDE);
    const ss = state.sides[SIDE];
    // Always take the trust-cheapest option available, then verify the engine
    // still offers a full three-choice prompt no matter how low trust falls.
    const prompt = game.currentPrompt(state, SIDE);
    assert.equal(prompt.choices.length, 3, `decision ${c}: three choices offered regardless of meters`);
    const worst = steps[c].choices
      .map((ch, i) => [i, ch.effects.trust ?? 0])
      .sort((a, b) => a[1] - b[1])[0][0];
    const res = game.resolve(state, SIDE, { kind: 'decision', choiceIndex: ss.shuffles[c].indexOf(worst) });
    assert.ok(!res.error, `decision ${c} still resolvable at trust ${ss.meters.trust}`);
  }
  const r = game.report(state).perSide[SIDE];
  assert.equal(r.meters.trust, 0, 'trust bottoms out');
  assert.ok(r.ending, 'and the journey still reaches an ending');
});

test('meters clamp to 0..100 and never leak outside that range', () => {
  for (const pick of ['right', 'partial', 'wrong']) {
    const r = playRun(pick);
    for (const [k, v] of Object.entries(r.meters)) {
      assert.ok(v >= 0 && v <= 100, `${pick} run: ${k} = ${v} stays inside 0..100`);
    }
  }
});

test('the accurate run still takes real losses — accuracy and hardship diverge (spec §3)', () => {
  // Playing the Bitterroots exactly right still costs the crew: the record says
  // the only way out was through, and it nearly killed them.
  const bitterroot = stepsOf()[8];
  const right = bitterroot.choices.find((c) => c.verdict === 'right');
  assert.equal(pointsFor(right.verdict), 1, 'pushing through scores a full point');
  assert.ok(right.effects.crew < 0, 'and still costs the crew');
  assert.match(right.feedback, /wet and as cold in every part as I ever was in my life/,
    "Clark's own words on the worst day of the trail");
});

test('SENSITIVITY: York is named as enslaved, and voting (spec §11 — never "Clark\'s servant")', () => {
  const vote = stepsOf()[10];
  const right = vote.choices.find((c) => c.verdict === 'right');
  assert.match(right.label, /York and Sacagawea/, 'both are named in the choice itself');
  assert.match(right.feedback, /held as a slave|enslaved/i, 'his enslavement is named plainly');
  assert.match(right.feedback, /November 24, 1805/, 'the real date of the real vote');
  const all = stepsOf().flatMap((s) => s.choices.map((c) => c.feedback)).join(' ');
  assert.doesNotMatch(all, /servant/i, 'never softened to "servant"');
});

test('SENSITIVITY: Native nations are hosts, diplomats and rescuers (spec §11)', () => {
  const steps = stepsOf();
  // The Bad River standoff is two powers negotiating passage, not an ambush.
  assert.match(steps[2].choices.find((c) => c.verdict === 'right').feedback,
    /both sides lowered their weapons/i);
  // The Nez Perce save the expedition, and the text says so plainly.
  assert.match(steps[9].choices.find((c) => c.verdict === 'right').feedback,
    /Remember who the Corps owed/);
  // Sacagawea is an expert, not a mascot: her languages and knowledge are the reason.
  assert.match(steps[4].choices.find((c) => c.verdict === 'right').feedback,
    /spoke Shoshone and Hidatsa/);
});

test('all five vocabulary terms appear in student-visible text (spec §2 bubbles)', () => {
  const text = [
    ...LEGS.map((l) => l.scene),
    ...stepsOf().flatMap((s) => [s.prompt, ...s.choices.map((c) => `${c.label} ${c.feedback}`)]),
  ].join(' ');
  assert.deepEqual(Object.keys(VOCAB), ['expedition', 'keelboat', 'portage', 'interpreter', 'pirogue']);
  for (const re of [/expedition/i, /keelboat/i, /portage/i, /interpreter/i, /pirogue/i]) {
    assert.match(text, re, `vocabulary term present: ${re}`);
  }
});

test('the debrief lands the same facts every tier, plus the honest closing note (spec §3.3, §10)', () => {
  const d = debriefFor();
  assert.match(d, /8,000 miles/, 'the scale of the journey');
  assert.match(d, /Charles Floyd/, 'the one death, named');
  assert.match(d, /no all-water route/i, 'no Northwest Passage existed');
  assert.match(d, /maps/i, 'the maps that came back');
  assert.match(d, /grizzly|prairie dog|pronghorn/i, 'the species that came back');
  assert.match(d, /broken treaties/i, 'the honest closing note');
  assert.match(d, /removal/i, 'names removal plainly');
});

test('the route runs St. Louis → the Pacific → home, one stop per decision (spec §5, §6)', () => {
  assert.equal(ROUTE.length, 12, 'one route stop per graded decision');
  ROUTE.forEach((r, i) => {
    assert.equal(r.step, i, `route entry ${i} is keyed to its step index`);
    assert.ok(r.lat > 35 && r.lat < 50, `stop ${i} latitude is a real western latitude`);
    assert.ok(r.lon < -89 && r.lon > -125, `stop ${i} longitude is a real western longitude`);
    assert.ok(r.place?.length > 2 && r.date?.length > 2, `stop ${i} labelled`);
  });
  assert.equal(ROUTE[0].place, 'St. Louis');
  assert.equal(ROUTE[10].place, 'The Pacific');
  assert.equal(ROUTE[11].place, 'St. Louis');
  assert.equal(ROUTE[11].returning, true, 'the last stop is the way home');
  assert.deepEqual(game.meta.route, ROUTE, 'shipped to the client in meta');
});

test('THE MAP REACHES THE PACIFIC ONLY AT STEP 10 / decision 11 (spec §10 checklist)', () => {
  const west = Math.min(...ROUTE.map((r) => r.lon));
  assert.equal(ROUTE[10].lon, west, 'the Pacific is the westernmost stop on the whole route');
  for (let i = 0; i < 10; i++) {
    assert.ok(ROUTE[i].lon > west, `stop ${i} is still east of the ocean`);
  }
  // And the route only ever moves west up to that point — no early arrival.
  for (let i = 1; i <= 10; i++) {
    assert.ok(ROUTE[i].lon <= ROUTE[i - 1].lon, `stop ${i} is west of (or at) stop ${i - 1}`);
  }
  assert.ok(ROUTE[11].lon > ROUTE[10].lon, 'and the twelfth stop turns back east for home');
});

test('journal pages unlock at steps 3, 5, 7 and 10 at minimum, bookended by departure and homecoming', () => {
  const keys = Object.keys(JOURNAL).map(Number).sort((a, b) => a - b);
  for (const required of [3, 5, 7, 10]) {
    assert.ok(keys.includes(required), `journal page at step ${required} (spec §10 checklist)`);
  }
  assert.ok(keys.includes(0) && keys.includes(11), 'departure and homecoming pages');
  for (const k of keys) {
    const p = JOURNAL[k];
    assert.ok(k >= 0 && k < game.totalActions, `journal key ${k} is a real step index`);
    assert.match(p.author, /Clark|Lewis/, `journal ${k} attributed`);
    assert.ok(p.date?.length > 4 && p.place?.length > 2, `journal ${k} dated and placed`);
    assert.ok(p.quote?.length > 10, `journal ${k} quotes the record`);
    assert.ok(p.gloss?.length > 20, `journal ${k} has a kid-level plain-words gloss`);
    assert.ok(p.image?.length > 4 && p.alt?.length > 10, `journal ${k} illustrated and alt-texted`);
  }
  assert.deepEqual(game.meta.journal, JOURNAL, 'shipped to the client in meta');
});

test('"Ocian in view!" keeps Clark\'s spelling and carries a kid gloss (spec §10 checklist)', () => {
  const p = JOURNAL[10];
  assert.equal(p.quote, 'Ocian in view! O! the joy.', "Clark's spelling preserved exactly");
  assert.match(p.gloss, /Ocean in view/, 'the plain-words translation sits under it');
  assert.match(p.gloss, /spelling was not standard/i, 'and explains why it looks odd');
});

test('journeyScore adds the three meters; it is what decides the tier', () => {
  assert.equal(journeyScore({ supplies: 50, crew: 50, trust: 50 }), 150);
  assert.equal(journeyScore({ supplies: 95, crew: 75, trust: 100 }), 270);
});

test('currentPrompt never leaks the answer key (labels only)', () => {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  game.chapterEvent(state, SIDE);
  const prompt = game.currentPrompt(state, SIDE);
  assert.equal(prompt.kind, 'decision');
  assert.equal(prompt.choices.length, 3);
  for (const c of prompt.choices) assert.equal(typeof c, 'string');
  assert.ok(!('verdict' in prompt), 'no verdict leaks');
  assert.ok(!JSON.stringify(prompt).includes('effects'), 'no effects leak');
});

test('no leg charges a meter toll on arrival — every meter change is a consequence of a choice', () => {
  for (const p of phasesFor()) assert.equal(p.eventEffects, null);
});

test('reading level: no student-visible sentence runs past ~30 words (Common Standards §3)', () => {
  const blocks = [
    ...LEGS.map((l) => l.scene),
    ...stepsOf().flatMap((s) => [s.prompt, ...s.choices.map((c) => c.label), ...s.choices.map((c) => c.feedback)]),
  ];
  for (const b of blocks) {
    // Split on sentence-ending punctuation, allowing a closing quote mark after
    // it — otherwise a quoted sentence glues itself to the next one.
    for (const sentence of b.split(/(?<=[.!?]["'”’]?)\s+/)) {
      const words = sentence.trim().split(/\s+/).filter(Boolean).length;
      assert.ok(words <= 30, `sentence too long (${words} words): "${sentence.slice(0, 70)}…"`);
    }
  }
});
