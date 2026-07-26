// usCorpsOfDiscovery.js — Unit 4 U.S. History adapter: "Corps of Discovery:
// Mission West" (SOLO, single class group, NO variant, NO branch, NO AI rival).
//
// The student co-commands the real 1804–1806 expedition. TWELVE decisions follow
// the actual route and the actual dilemmas — 12 graded actions in all. A choice
// is "right" when it matches what Lewis and Clark really did, and what they did,
// again and again, was PREPARE, HOLD DISCIPLINE, and TRUST THE NATIVE NATIONS
// whose land this already was (spec §1). Crossing the Louisiana Purchase mile by
// mile is how the game teaches its scale and its purpose (8.5C, 8.6B).
//
// SHAPE (spec §3.2, §6): six legs of the route × two decisions each = 12 steps.
// A "chapter" in the engine IS a leg, so the mapping is exact and the engine's
// chapter bookkeeping is untouched. Two client flourishes ride along in `meta`
// and never touch scoring: the ROUTE MAP (12 stops at real latitude/longitude,
// spec §5) and the JOURNAL PAGES that unlock at real milestones (spec §3.2).
//
// METERS ARE DRAMA. Supplies 🎒, Crew 💪, Trust 🤝 decide only the ENDING TIER
// (their sum at journey's end, spec §3.3). ACCURACY — verdict-only, right = 1 /
// partial = 0.5 / wrong = 0 — is the grade, and it never depends on meter state.
// Nothing in this file gates a choice on a meter: there are no soft-locks, ever
// (spec §10 checklist).
//
// Reading level (Common Standards §3): 8th-grade content at a 5th-grade reading
// level, in the voice of a seasoned sergeant's journal — plain, warm, unsentimental.
//
// SENSITIVITY (spec §11, Common Standards §10):
//  • Native nations are HOSTS, DIPLOMATS, and RESCUERS, because the record says
//    so. The Teton Sioux standoff is two powers negotiating passage, not an
//    ambush. The Shoshone and the Nez Perce save the expedition, and the text
//    says it plainly.
//  • York was ENSLAVED. The voting scene names it — he voted while enslaved.
//    Never softened to "Clark's servant."
//  • Sacagawea is a skilled expert, not a mascot — and a teenager, married young.
//    Facts, no romance.
//  • The debrief looks forward honestly: the nations that fed, guided, and saved
//    the Corps would within decades face broken treaties and removal.

import { createStepGame } from './_stepGame.js';

// ---------------------------------------------------------------------------
// Meters (shipped to clients at match:begin — display info only). Start 50 each
// (spec §3.1). Their SUM at the end picks the ending tier; never the accuracy.
// ---------------------------------------------------------------------------

export const METERS = {
  supplies: { name: 'Supplies', icon: 'supplies', blurb: 'Food, trade goods, powder, and medicine. Out here, goods are words — they buy friendship as well as dinner.' },
  crew:     { name: 'Crew',     icon: 'crew',     blurb: 'The health and spirit of the roughly three dozen people in the party.' },
  trust:    { name: 'Trust',    icon: 'trust',    blurb: 'Your standing with the Native nations whose lands you cross. It is the only thing that gets you through them.' },
};

export const START_METERS = { supplies: 50, crew: 50, trust: 50 };

// One class-wide group (spec §1: "Pick: none"). Roster and Command Center group
// every student under this single side.
export const SIDE = 'class';

// The five required vocabulary terms (spec §2), at a 5th-grade reading level.
// The client underlines these wherever they appear and shows a tap bubble.
export const VOCAB = {
  expedition:  'A long journey with a mission.',
  keelboat:    'A big flat river boat, pushed and pulled upstream.',
  portage:     'Carrying boats and cargo overland around water you cannot sail.',
  interpreter: 'A person who translates between two languages.',
  pirogue:     'A large canoe-style boat.',
};

// ---------------------------------------------------------------------------
// Decisions. Every choice carries an EXPLICIT effects object: spec §4 names the
// meter change for each option, and where it names none the effect is `{}` — a
// verdict with no meter cost. Verdicts, effects, and feedback are transcribed
// from spec §4; the sergeant's voice and the 5th-grade reading level are
// authored here.
//
// v: 'right' | 'partial' | 'wrong'   fx: explicit meter effects   fb: feedback
// ---------------------------------------------------------------------------

const V = { R: 'right', P: 'partial', W: 'wrong' };

function choice(label, verdict, fx, feedback) {
  return { label, verdict, effects: fx, feedback };
}

// A decision is a prompt (the call you must make) + three choices, one graded step.
// `place` and `art` are display-only: the route stop this decision happens at,
// and the scene image above the card.
function decision(prompt, place, art, a, b, c) {
  return {
    kind: 'decision',
    prompt,
    place,
    art,
    choices: [
      choice(a.label, a.v, a.fx, a.fb),
      choice(b.label, b.v, b.fx, b.fb),
      choice(c.label, c.v, c.fx, c.fb),
    ],
  };
}

// ---------------------------------------------------------------------------
// The six legs. Each is a scene card (title / date-place plate / image /
// scene-setting text) plus two decisions, in true route order.
// ---------------------------------------------------------------------------

export const LEGS = [
  // ===== Leg 1 — St. Louis and the Lower Missouri (1804) ====================
  {
    title: 'St. Louis and the Lower Missouri',
    date: 'May–August 1804 · Missouri River',
    place: 'St. Louis',
    image: 'scene_stlouis.webp',
    scene:
      'President Jefferson has just bought Louisiana from France — about 828,000 square miles, doubling the country overnight. Almost no one in Washington knows what is out there. Your orders: find a water route to the Pacific, map the land, write down every plant and animal, and make peace with the Native nations who already live there. The keelboat waits at the levee.',
    steps: [
      decision(
        'How do you load the boat for a journey of thousands of miles?',
        'St. Louis',
        'scene_stlouis.webp',
        { label: 'Load heavy on trade goods, gifts, medicine, and tools.',
          v: V.R, fx: { supplies: 10, trust: 5 },
          fb: 'Lewis spent months packing gifts and trade stock — beads, mirrors, cloth, kettles, and peace medals. Out there, goods are words. You cannot talk to a nation you have nothing to offer.' },
        { label: 'Load heavy on whiskey and fine dress uniforms.',
          v: V.W, fx: { crew: 5, supplies: -10 },
          fb: 'The men will cheer tonight and starve in a month. Neither barrel nor braid gets you past a river you cannot trade your way up.' },
        { label: 'Load nothing but food. You can make friends later.',
          v: V.P, fx: { supplies: 5, trust: -5 },
          fb: 'You can hunt food. You cannot hunt friendship. Half right — a full larder is real — but you have packed away the mission itself.' },
      ),
      decision(
        'The men are hard workers and hard drinkers. How do you run the crew?',
        'Lower Missouri',
        'scene_river.webp',
        { label: 'Army discipline: standing watches, daily drills, and courts-martial when they are earned.',
          v: V.R, fx: { crew: 10 },
          fb: 'The captains ran it military-tight — real trials, real punishments, early and in the open. Loose crews die on rivers. After the first few sentences, the party held together for two years.' },
        { label: 'Let the men govern themselves. They are volunteers, not regulars.',
          v: V.W, fx: { crew: -10 },
          fb: 'Volunteers still need rules. Without watches, the boat gets robbed, the powder gets wet, and a quarrel at mile 300 becomes a killing at mile 900.' },
        { label: 'Punish nothing until there is real trouble.',
          v: V.P, fx: { crew: -5 },
          fb: 'By the time it is real trouble, it is too late to teach. Discipline set early is kindness; discipline set late is just anger.' },
      ),
    ],
  },

  // ===== Leg 2 — Up the Missouri (1804) ====================================
  {
    title: 'Up the Missouri',
    date: 'September–November 1804 · Great Plains',
    place: 'Bad River',
    image: 'scene_teton.webp',
    scene:
      'The prairie opens out — grass to the horizon, herds of bison, animals no one back east has ever written down. This is not empty country. It is the home of powerful nations, and the Teton Sioux (Lakota) control this stretch of the river the way a nation controls a highway. Nothing goes up the Missouri without their say.',
    steps: [
      decision(
        'September 1804. Lakota warriors block the river and demand a steep toll. Bows are strung. Clark has drawn his sword.',
        'Bad River',
        'scene_teton.webp',
        { label: 'Hold steady. No firing. Let the chiefs talk it down, and offer respect and some gifts.',
          v: V.R, fx: { trust: 10 },
          fb: 'That is what happened — both sides lowered their weapons and the boats went on. One volley would have ended the expedition right there and poisoned the plains against every American who came after.' },
        { label: 'Fire the swivel gun. Show them what the United States can do.',
          v: V.W, fx: { trust: -20, crew: -5 },
          fb: 'You are about forty people, two thousand miles from help, facing a nation on its own ground. That shot kills the mission and buys a war you cannot win.' },
        { label: 'Hand over a whole boatload of goods and move on quickly.',
          v: V.P, fx: { supplies: -15, trust: 5 },
          fb: 'Paying a heavy toll buys you one mile. Empty hands cannot make allies upriver — and there are a thousand miles of upriver left.' },
      ),
      decision(
        'October. The nights are freezing and the river will soon lock up with ice. Where do you spend the winter?',
        'Knife River',
        'scene_mandan.webp',
        { label: 'Build a fort beside the Mandan and Hidatsa villages, and trade and learn all winter.',
          v: V.R, fx: { supplies: 10, trust: 10 },
          fb: 'They built Fort Mandan across from the villages. Those towns were the great market of the plains — thousands of people, corn in the storage pits, traders from everywhere. The Corps wintered as neighbors and left in the spring far smarter than it arrived.' },
        { label: 'Push on. Every mile made now is a mile you do not make in spring.',
          v: V.W, fx: { crew: -20 },
          fb: 'Forty degrees below zero on an open river. There is no mile out there worth what that winter would cost you.' },
        { label: 'Winter alone, far from the villages, so no one bothers you.',
          v: V.P, fx: { crew: -5, trust: -5 },
          fb: 'You survive, cold and hungry and ignorant. Everything the Corps learned that winter — the maps, the languages, the road ahead — came from the neighbors you decided to avoid.' },
      ),
    ],
  },

  // ===== Leg 3 — Fort Mandan and the Spring Rise (1804–05) ==================
  {
    title: 'Fort Mandan and the Spring Rise',
    date: 'November 1804 – May 1805 · North Dakota to Montana',
    place: 'Fort Mandan',
    image: 'scene_mandan.webp',
    scene:
      'Winter at Fort Mandan. Forty below zero, and the men trade iron work for corn while Clark draws the first real map of the upper Missouri from what the Mandan and Hidatsa tell him. In April the ice breaks. Ahead is country no one at this fire has ever seen.',
    steps: [
      decision(
        'Two interpreters ask to join: Toussaint Charbonneau, a French trader, and his wife Sacagawea, a young Shoshone woman expecting a baby.',
        'Fort Mandan',
        'scene_sacagawea.webp',
        { label: 'Take them both. Her languages and her knowledge are worth more than another rifle.',
          v: V.R, fx: { trust: 15 },
          fb: 'The best hire of the age. Sacagawea spoke Shoshone and Hidatsa — the chain that let the captains talk to the mountain nations. She found food, she knew the country, and a woman traveling with a baby told every nation they met that this was not a war party.' },
        { label: 'No. A journey like this is no place for a mother and an infant.',
          v: V.W, fx: { trust: -10 },
          fb: 'Her son Jean Baptiste was born at the fort in February and crossed the continent on her back. Turning her away throws out the one person who can speak to the nation that has the horses.' },
        { label: 'Hire only Charbonneau. One interpreter is enough.',
          v: V.P, fx: {},
          fb: 'He was hired FOR her. Half the value, and none of the trust — Charbonneau alone could not have spoken a word to the Shoshone.' },
      ),
      decision(
        'May 1805. A squall throws the white pirogue on its side. Papers, instruments, and medicine are washing away.',
        'Missouri River, Montana',
        'scene_squall.webp',
        { label: 'Steady the boat, and trust the calm hands already fishing the journals out of the water.',
          v: V.R, fx: { supplies: 5 },
          fb: 'Those calm hands were Sacagawea, her baby on her back, catching the expedition\'s brain as it floated past. Lewis wrote that she showed "equal fortitude and resolution" as anyone aboard, and later named a river for her.' },
        { label: 'Save the personal baggage first. The men will need their kit.',
          v: V.W, fx: { supplies: -10 },
          fb: 'Shirts can be replaced. The journals, the maps, and the instruments are the whole mission — lose those and you have taken a very long walk for nothing.' },
        { label: 'Cut everything loose and save only the people.',
          v: V.P, fx: { crew: 5, supplies: -10 },
          fb: 'Lives first is never wrong. But the boat did not sink, and the cool heads aboard proved you could have had both.' },
      ),
    ],
  },

  // ===== Leg 4 — The Falls and the Shoshone (1805) =========================
  {
    title: 'The Falls and the Shoshone',
    date: 'June–August 1805 · Montana',
    place: 'Great Falls',
    image: 'scene_falls.webp',
    scene:
      'The Missouri narrows and the mountains come up out of the plain. The Hidatsa spoke of a great waterfall ahead — that is how you will know you are on the right river. What they did not say is that there are five of them in a row.',
    steps: [
      decision(
        'Five waterfalls block the Missouri. The boats cannot pass and the water cannot be run.',
        'Great Falls',
        'scene_falls.webp',
        { label: 'Portage. Build carts from cottonwood and haul the boats and tons of cargo overland.',
          v: V.R, fx: { crew: -5, supplies: 5 },
          fb: 'About a month of brutal hauling over prickly pear, through hail, with grizzlies for neighbors. There was no shortcut, and the Corps simply did it.' },
        { label: 'Try to run the falls. You have run bad water before.',
          v: V.W, fx: { supplies: -20, crew: -10 },
          fb: 'These are eighty-foot falls. You would lose the boats, the cargo, and the people in them in about a minute.' },
        { label: 'Abandon the boats here and walk the rest of the way.',
          v: V.P, fx: { supplies: -10 },
          fb: 'Above the falls the river runs on for hundreds of miles. You will need boats again — and you just left them at the bottom of a cliff.' },
      ),
      decision(
        'You must have horses to cross the Rockies. A Shoshone band appears on the ridge.',
        'Lemhi Pass',
        'scene_shoshone.webp',
        { label: 'Let Sacagawea speak for you.',
          v: V.R, fx: { trust: 15, supplies: 10 },
          fb: 'The chief was Cameahwait — her own brother, whom she had not seen since she was taken as a child. Lewis wrote that she "proved to be a sister of the Chif Cameahwait." One of history\'s great reunions, and the horses followed. Without them the story ends here.' },
        { label: 'Take the horses. You have guns and they do not.',
          v: V.W, fx: { trust: -25 },
          fb: 'Steal from the Shoshone and you cross the Rockies with a nation behind you and a nation ahead of you, all of them warned. That is not a mountain crossing, that is a funeral.' },
        { label: 'Offer rifles in trade. Nothing else will move them.',
          v: V.P, fx: { trust: 5, supplies: -10 },
          fb: 'Desperate, dangerous, and not the deal that was actually struck. You get horses and hand away the guns you may need to eat with.' },
      ),
    ],
  },

  // ===== Leg 5 — Over the Mountains (1805) =================================
  {
    title: 'Over the Mountains',
    date: 'September 1805 · Bitterroot Mountains',
    place: 'Lolo Trail',
    image: 'scene_bitterroot.webp',
    scene:
      'From the top of the pass, Lewis looks west for the easy river down to the sea — and sees mountains. Range after range of them, snow already falling. There is no Northwest Passage. There is only a trail over the Bitterroots, and it is September.',
    steps: [
      decision(
        'Eleven days of snow on the Lolo Trail. No game, no fish, and the men are eating candle wax.',
        'Bitterroot Mountains',
        'scene_bitterroot.webp',
        { label: 'Push through behind your Shoshone guide, toward Nez Perce country.',
          v: V.R, fx: { crew: -10 },
          fb: 'The worst stretch of the whole trail. Clark wrote that he was "wet and as cold in every part as I ever was in my life." They ate three colts and the last of the candles — and the only way out was through.' },
        { label: 'Stop and hunt until the party has its strength back.',
          v: V.W, fx: { crew: -20 },
          fb: 'There is nothing up here to hunt. On this ridge, waiting is just a slower word for starving.' },
        { label: 'Turn back to the Shoshone and try again next year.',
          v: V.P, fx: { crew: -5 },
          fb: 'Alive — and the mission dies in the snow behind you. Some doors only open once.' },
      ),
      decision(
        'You come down out of the mountains starving and barely able to stand. The Nez Perce find you, and offer food and help.',
        'Weippe Prairie',
        'scene_nezperce.webp',
        { label: 'Trust them: take the food and the rest, learn to burn out dugout canoes, and leave the horses in their care.',
          v: V.R, fx: { trust: 15, crew: 15 },
          fb: 'They could have ended the expedition with a shrug — the Corps was too weak to stop anyone. Instead they fed it, taught it to burn out canoes, and kept the horse herd safe for a whole year until the Corps came back for them. Remember who the Corps owed.' },
        { label: 'Camp apart from them and keep a guard up. Trust no one out here.',
          v: V.P, fx: { crew: 5, trust: -10 },
          fb: 'Careful is not the same as wise. You insult the one nation standing between you and the ocean, and you learn nothing they were ready to teach.' },
        { label: 'Push straight on to the river. Every day here is a day lost.',
          v: V.W, fx: { crew: -15 },
          fb: 'You are too weak to paddle and too weak to walk. Rest is not a delay right now; it is the only thing keeping people alive.' },
      ),
    ],
  },

  // ===== Leg 6 — The Ocean and the Long Way Home (1805–06) =================
  {
    title: 'The Ocean and the Long Way Home',
    date: 'November 1805 – September 1806 · Pacific Coast to St. Louis',
    place: 'Mouth of the Columbia',
    image: 'scene_pacific.webp',
    scene:
      'Down the Clearwater, the Snake, and the Columbia — past falls, past villages, past the last mountains. On November 7, 1805, Clark scrawls in his field notes: "Ocian in view! O! the joy." It is really the wide mouth of the river, and the ocean is still miles off. Nobody cares. Rain is coming, and winter with it.',
    steps: [
      decision(
        'November 24, 1805. Winter is here and you must choose a camp. How is the choice made?',
        'Station Camp',
        'scene_pacific.webp',
        { label: 'Put it to a vote of the whole Corps — including York and Sacagawea.',
          v: V.R, fx: { crew: 10, trust: 5 },
          fb: 'It really happened, on November 24, 1805. York — a Black man Clark held as a slave — voted. Sacagawea voted, asking for a place with plenty of roots to dig. Decades before United States law let either of them vote anywhere. They chose the south shore, and built Fort Clatsop.' },
        { label: 'The captains decide alone. That is what captains are for.',
          v: V.P, fx: { crew: -5 },
          fb: 'It would have been the ordinary thing to do — which is exactly why the real choice is worth remembering.' },
        { label: 'Start for home right now. Better to travel than to sit.',
          v: V.W, fx: { crew: -15 },
          fb: 'The mountain passes are shut with snow until June. Leave in December and the Bitterroots kill you on the way back.' },
      ),
      decision(
        'September 1806. St. Louis fires three rounds to welcome you home. What do you lay on Jefferson\'s desk?',
        'St. Louis',
        'scene_return.webp',
        { label: 'The truth: maps, journals, plants and animals, word of dozens of nations — and the honest news that there is no all-water route to the Pacific.',
          v: V.R, fx: { supplies: 5, crew: 5, trust: 5 },
          fb: 'The mission was never the imaginary river. It was knowledge, and you brought back a continent\'s worth. The first accurate maps of the West. Hundreds of plants and animals no scientist had ever described. And the names of the nations who live out there.' },
        { label: 'Tell him the water route exists. It is what he hoped to hear.',
          v: V.W, fx: { trust: -10 },
          fb: 'Lies drawn on maps kill the people who follow them. Jefferson could take the bad news; a family in a wagon could not.' },
        { label: 'Report the geography and skip the diplomacy. The land is what he paid for.',
          v: V.P, fx: {},
          fb: 'Half the mission. The nations you met WERE the mission — Jefferson\'s orders named peaceful relations first, before a single mountain.' },
      ),
    ],
  },
];

// ---------------------------------------------------------------------------
// Assembly. A chapter IS a leg: 6 legs × 2 decisions = 12 graded steps (spec §3.2).
// ---------------------------------------------------------------------------

export function phasesFor() {
  return LEGS.map((l) => ({
    title: l.title,
    date: l.date,
    place: l.place,
    image: l.image,
    event: l.scene,
    eventEffects: l.eventEffects || null,   // no leg charges a toll on arrival
    steps: l.steps,
  }));
}

// ---------------------------------------------------------------------------
// THE ROUTE MAP (spec §5, §6) — client-only display data, keyed to STEP index,
// not chapter: the marker inches west with every decision, so the map reads as
// 8,000 miles of ground covered rather than six jumps.
//
// `lat`/`lon` are REAL coordinates of the real places, so the drawn route is a
// true map and not a decorative squiggle. The client projects them; the engine
// never touches them.
//
// Step 10 (the twelfth decision) is the RETURN — the marker travels back east to
// St. Louis, which is why the westernmost point of the whole map is only ever
// reached at step 10 (decision 11, the Pacific), exactly as the build checklist
// requires.
// ---------------------------------------------------------------------------

export const ROUTE = [
  { step: 0,  key: 'stlouis',    place: 'St. Louis',        date: 'May 1804',   lat: 38.63, lon: -90.20, note: 'The keelboat sets out up the Missouri.' },
  { step: 1,  key: 'lower',      place: 'Lower Missouri',   date: 'Summer 1804', lat: 39.11, lon: -94.63, note: 'Poling and pulling upstream, mile after mile.' },
  { step: 2,  key: 'badriver',   place: 'Bad River',        date: 'Sept 1804',  lat: 44.37, lon: -100.35, note: 'The Teton Sioux control this stretch of the river.' },
  { step: 3,  key: 'mandan',     place: 'Knife River',      date: 'Oct 1804',   lat: 47.29, lon: -101.09, note: 'The Mandan and Hidatsa villages — the market of the plains.' },
  { step: 4,  key: 'fortmandan', place: 'Fort Mandan',      date: 'Winter 1804–05', lat: 47.29, lon: -101.30, note: 'Forty below zero, and the maps get drawn.' },
  { step: 5,  key: 'squall',     place: 'Missouri, Montana', date: 'May 1805',  lat: 47.85, lon: -106.55, note: 'The white pirogue goes over in a squall.' },
  { step: 6,  key: 'falls',      place: 'Great Falls',      date: 'June 1805',  lat: 47.50, lon: -111.30, note: 'Five waterfalls, and a month of hauling.' },
  { step: 7,  key: 'lemhi',      place: 'Lemhi Pass',       date: 'Aug 1805',   lat: 44.97, lon: -113.45, note: 'The Continental Divide — and the Shoshone.' },
  { step: 8,  key: 'bitterroot', place: 'Lolo Trail',       date: 'Sept 1805',  lat: 46.63, lon: -114.58, note: 'Eleven days of snow in the Bitterroots.' },
  { step: 9,  key: 'weippe',     place: 'Weippe Prairie',   date: 'Sept 1805',  lat: 46.38, lon: -115.94, note: 'The Nez Perce find the Corps and feed it.' },
  { step: 10, key: 'pacific',    place: 'The Pacific',      date: 'Nov 1805',   lat: 46.13, lon: -123.88, note: '"Ocian in view! O! the joy."' },
  { step: 11, key: 'home',       place: 'St. Louis',        date: 'Sept 1806',  lat: 38.63, lon: -90.20, note: 'Home — 8,000 miles, and back again.', returning: true },
];

// ---------------------------------------------------------------------------
// JOURNAL PAGES (spec §3.2, §5, §10 checklist) — the money moment. A page
// unlocks after the graded decision at these step indexes; the checklist
// requires 3, 5, 7 and 10 at minimum (decisions 4, 6, 8, 11), and the set is
// bookended with the departure and the homecoming.
//
// `quote` is the real journal wording, ORIGINAL SPELLING PRESERVED. `gloss` is
// the kid-level plain-words translation that sits under it, so Clark's spelling
// is a delight and never a barrier. Aged paper belongs INSIDE the illustration
// frame — never as the UI's skin (spec §5, Common Standards §2).
// ---------------------------------------------------------------------------

export const JOURNAL = {
  0: {
    author: 'Captain William Clark',
    date: 'May 14, 1804',
    place: 'Camp Dubois, mouth of the Missouri',
    quote: 'I Set out at 4 oClock P.M. … and proceeded on under a jentle brease up the Missourie',
    gloss: 'We left at four in the afternoon and went on up the Missouri with a gentle breeze. ("We proceeded on" becomes the most-written line in the whole journal — 8,000 miles of it.)',
    image: 'title_hero.webp',
    alt: 'A loaded keelboat on the wide Missouri at dawn, mist on the water, the crew at the poles',
  },
  3: {
    author: 'Captain William Clark',
    date: 'Winter 1804–05',
    place: 'Fort Mandan',
    quote: 'a verry Cold day … the Thermometer Stood at 45° below 0',
    gloss: 'A very cold day — forty-five degrees below zero. The Corps spent that winter as neighbors to the Mandan and Hidatsa, trading iron work for corn and copying down everything they were told about the road west.',
    image: 'scene_mandan.webp',
    alt: 'A log fort glowing at dusk beside earth-lodge villages, deep snow, northern lights above',
  },
  5: {
    author: 'Captain Meriwether Lewis',
    date: 'May 16, 1805',
    place: 'The Missouri, in Montana',
    quote: 'the Indian woman to whom I ascribe equal fortitude and resolution, with any person onboard at the time of the accedent, caught and preserved most of the light articles which were washed overboard',
    gloss: 'The Shoshone woman — Sacagawea — was as steady and as brave as anyone on that boat, and she caught and saved most of the things floating away. Those "light articles" were the journals, the papers, and the instruments: the whole point of the trip.',
    image: 'scene_sacagawea.webp',
    alt: 'A young Shoshone woman with an infant in a cradleboard, calm and capable, mountains beyond',
  },
  7: {
    author: 'Captain Meriwether Lewis',
    date: 'August 17, 1805',
    place: 'Camp Fortunate, near Lemhi Pass',
    quote: 'the Indian woman, who proved to be a sister of the Chif Cameahwait',
    gloss: 'The Shoshone woman turned out to be the sister of Chief Cameahwait. Sacagawea had been taken from this band as a child. She walked into the council, recognized her brother, and the Corps got the horses that made the mountains possible.',
    image: 'scene_shoshone.webp',
    alt: 'A Shoshone camp high in the mountains, horses on the slope, riders meeting the expedition',
  },
  10: {
    author: 'Captain William Clark',
    date: 'November 7, 1805',
    place: 'The lower Columbia',
    quote: 'Ocian in view! O! the joy.',
    gloss: 'Ocean in view! Oh, the joy! (Clark spelled it his own way — spelling was not standard yet.) They were actually looking at the wide mouth of the Columbia, and the real ocean was still about twenty miles off. Nobody minded.',
    image: 'scene_pacific.webp',
    alt: 'Gray breakers and sea stacks under storm light, small figures on the shore with arms raised',
  },
  11: {
    author: 'Captain William Clark',
    date: 'September 23, 1806',
    place: 'St. Louis',
    quote: 'we … came in Sight of St. Louis fired three Rounds as we approached the Town and landed oposit the center of the Town, the people gathered on the Shore and Huzzared three cheers',
    gloss: 'We came in sight of St. Louis, fired three rounds as we came up, and landed in the middle of town. People crowded the shore and gave three cheers. Most of the country had assumed they were dead.',
    image: 'scene_return.webp',
    alt: 'Dugout canoes reaching the St. Louis riverfront in 1806, townspeople crowding the bank',
  },
};

// ---------------------------------------------------------------------------
// Endings by the METER SUM at journey's end (spec §3.3), not by accuracy. Max
// sum is 300. A fully accurate run lands at 270; an all-partial run lands near
// 90; an all-wrong run near 10. Every debrief lands the SAME facts — 8,000+
// miles, one death, no water route — and the same honest closing note.
// ---------------------------------------------------------------------------

export const CAPTAINS_MIN = 200;   // "Captains of Discovery"
export const HARD_ROAD_MIN = 85;   // "Hard Road Home"; below this is "Lost in the High Country"

export const ENDINGS = {
  captains: {
    key: 'captains',
    title: 'Captains of Discovery',
    text: 'You did it the way the Corps did it: packed for diplomacy, held the crew together, and trusted the nations whose country this was. Nobody fired on the Bad River. The Mandan winter made you smarter. Sacagawea walked into a Shoshone council and came out with horses. The Nez Perce fed you when you could not stand up. You crossed a continent and came back with the truth about it — which is worth more than the river Jefferson wanted to hear about.',
  },
  hardroad: {
    key: 'hardroad',
    title: 'Hard Road Home',
    text: 'You got there and you got back, thinner and colder and with less to show than you should have had. Every shortcut cost something later: goods you gave away too early, a winter spent alone, help you were too proud or too hurried to take. The country was crossed. It just did not have to be this hard, and the record shows a party that did it better.',
  },
  lost: {
    key: 'lost',
    title: 'Lost in the High Country',
    text: 'The real Corps of Discovery survived on preparation, discipline, and the goodwill of the nations it met — and every one of those was something you could spend. Spend them, and there is no rescue coming: no horses at Lemhi Pass, no food at Weippe Prairie, no way back over the Bitterroots. In the real world, choices like these would have ended this expedition somewhere on the west side of the mountains, and no one would have known where.',
  },
};

export function endingFor(score) {
  if (score >= CAPTAINS_MIN) return ENDINGS.captains;
  if (score >= HARD_ROAD_MIN) return ENDINGS.hardroad;
  return ENDINGS.lost;
}

// The report's "score" is the three meters added (max 300) — it decides the tier.
export function journeyScore(meters) {
  return (meters.supplies || 0) + (meters.crew || 0) + (meters.trust || 0);
}

// ---------------------------------------------------------------------------
// The debrief (spec §3.3) — SAME facts under every tier, including the honest
// closing note the checklist requires (spec §10, §11).
// ---------------------------------------------------------------------------

export const DEBRIEF =
  'Here is what really happened. From 1804 to 1806 the Corps of Discovery traveled more than 8,000 miles, from St. Louis to the Pacific and back. Only one person died — Sergeant Charles Floyd, of a burst appendix, in 1804 — which nobody expected on a journey like that. ' +
  'They did not find what Jefferson sent them for. There is no all-water route across North America; the Rocky Mountains are in the way, and always were. But they came back with the first accurate maps of the West, descriptions of hundreds of plants and animals no scientist had written down — grizzly bear, prairie dog, pronghorn — and firsthand contact with dozens of Native nations. That is what doubled the country in Americans\' minds: not the paperwork of the Louisiana Purchase, but knowing what was actually out there. ' +
  'And they only survived it because of the people who already lived there. The Mandan and Hidatsa kept them through a forty-below winter. Sacagawea got them the Shoshone horses. The Nez Perce fed a starving party and guarded its horse herd for a year. ' +
  'Here is the hard part, and it is true too: within a few decades, many of those same nations would face broken treaties, land taken, and forced removal from their homelands by the United States government. The Corps of Discovery came west as guests. What came behind them did not.';

export function debriefFor() {
  return DEBRIEF;
}

// ---------------------------------------------------------------------------

export default createStepGame({
  id: 'us-corps-of-discovery',
  title: 'Corps of Discovery: Mission West',
  sides: [SIDE],                 // one class-wide group — no pick
  modes: ['solo'],
  soloRival: false,              // you co-command the expedition alone — no AI rival
  startMeters: () => ({ ...START_METERS }),
  phasesFor,
  // Display data only. `route` and `journal` are the two client flourishes
  // (spec §6); neither is ever read by the engine or the scorer.
  meta: { meters: METERS, route: ROUTE, journal: JOURNAL, vocab: VOCAB },
  scoreMeters: journeyScore,
  endingFor,
  debriefFor,
});
