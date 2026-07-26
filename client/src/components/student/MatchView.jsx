// MatchView.jsx — one leg of the real 1804–1806 route at a time: a scene card
// sets up the leg → the route map inches west above the decision card → two
// graded decisions per leg, each with a verdict flash and a sergeant's-journal
// feedback → at real milestones (steps 0, 3, 5, 7, 10, 11) a JOURNAL PAGE
// unlocks — the money moment (build spec §3.2, §5). Single class-wide group,
// no pick, no branch: every student co-commands the same expedition through
// the same six legs (build spec §1, §6).
//
// HEADER-CHIP / MAP RACE (documented shared-engine quirk — see Washington's
// War's MatchView and server/src/games/_stepGame.js): GameManager pushes the
// NEXT leg's chapter:event/turn:begin synchronously with the CURRENT leg's
// LAST turn:resolution, so `eventCard` AND `turn` have both already raced
// ahead by the time this feedback renders. The "Leg X of 6" chip is pinned
// with settledChapterRef, copied verbatim from Washington's War's pattern.
//
// The route map's stepIndex is pinned differently, because it doesn't need to
// be: `feedback.stepIndex` is written ONCE by resolve() and is never
// overwritten by the race (only `eventCard`/`turn` get clobbered with the next
// leg's payloads — `feedback` itself isn't re-pushed until the next decision
// resolves). So reading `feedback.stepIndex` straight through is already
// immune to the exact same race the chapter chip has to guard against; a
// small ref still backs it up for the moment feedback briefly toggles.
//
// PER-STEP ART (build spec, "the 13 image filenames"): the adapter's
// decision() records a `place`/`art` pair per step — the scene for THAT
// decision, distinct from the leg's overall image — but createStepGame's
// currentPrompt()/resolve() payloads do not forward `place`/`art` across the
// wire; only the LEG's overall `chapter.image` crosses (see _stepGame.js
// chapterMeta()). Rather than touch the shared engine (out of scope here),
// STEP_ART below is a small client-side mirror of those filenames — display
// data only, never scored, kept in the same order as usCorpsOfDiscovery.js's
// LEGS[].steps[].art so the two stay easy to eyeball against each other.

import { useEffect, useRef, useState } from 'react';
import { emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import MetersBar from '../shared/MetersBar.jsx';
import RouteMap from '../shared/RouteMap.jsx';
import JournalPage from '../shared/JournalPage.jsx';
import VocabText from './VocabText.jsx';

const journeyScore = (m) => (m ? (m.supplies || 0) + (m.crew || 0) + (m.trust || 0) : 0);

// Mirrors usCorpsOfDiscovery.js LEGS[].steps[].art, index === stepIndex.
const STEP_ART = [
  'scene_stlouis.webp',    // 0  St. Louis — pack the keelboat
  'scene_river.webp',      // 1  Lower Missouri — running the crew
  'scene_teton.webp',      // 2  Bad River — the Teton Sioux standoff
  'scene_mandan.webp',     // 3  Knife River — where to winter
  'scene_sacagawea.webp',  // 4  Fort Mandan — the interpreters
  'scene_squall.webp',     // 5  Missouri, Montana — the squall
  'scene_falls.webp',      // 6  Great Falls — the portage
  'scene_shoshone.webp',   // 7  Lemhi Pass — the Shoshone
  'scene_bitterroot.webp', // 8  Bitterroot Mountains — the snow
  'scene_nezperce.webp',   // 9  Weippe Prairie — the Nez Perce
  'scene_pacific.webp',    // 10 Station Camp — the winter vote
  'scene_return.webp',     // 11 St. Louis — home
];

export default function MatchView({ state, dispatch }) {
  const { match } = state;
  const { begin, eventCard, turn, feedback } = match;
  const meta = begin.meta;
  const route = meta.route || [];
  const journal = meta.journal || {};

  // "Leg X of 6" chip — settled against the race described above.
  const settledChapterRef = useRef(null);
  if (!feedback) settledChapterRef.current = eventCard?.chapter || turn?.chapter || settledChapterRef.current;
  const leg = feedback ? (settledChapterRef.current || eventCard?.chapter || turn?.chapter) : (eventCard?.chapter || turn?.chapter);

  // Route-map marker position — see the header note on why feedback.stepIndex
  // is already race-proof; the ref is just a defensive fallback.
  const settledStepRef = useRef(0);
  if (!feedback && turn) settledStepRef.current = turn.stepIndex;
  const mapStepIndex = feedback ? feedback.stepIndex : (turn?.stepIndex ?? settledStepRef.current);

  const lowMeter = Object.entries(match.meters || {}).find(([, v]) => v <= 15);

  // Journal unlock: one-time, purely presentational, tracked locally (never a
  // server field — build spec explicitly asks for local/component state).
  const [journalStep, setJournalStep] = useState(null);
  const shownJournalRef = useRef(new Set());

  function continueFeedback() {
    const idx = feedback.stepIndex;
    const hasJournal = Object.prototype.hasOwnProperty.call(journal, idx) && !shownJournalRef.current.has(idx);
    if (hasJournal) {
      shownJournalRef.current.add(idx);
      setJournalStep(idx);
    } else {
      dispatch({ type: 'dismiss-feedback' });
    }
  }

  function continueJournal() {
    setJournalStep(null);
    dispatch({ type: 'dismiss-feedback' });
  }

  return (
    <div className="match">
      <header className="match-header">
        <div className="nation-chip class">🧭 Corps of Discovery</div>
        <div className="hold-chip" title="Your three meters added up (max 300) — decides the ending's tier">
          Expedition Strength <b>{journeyScore(match.meters)}</b><span className="muted"> / 300</span>
        </div>
        {leg && (
          <div className="chapter-chip">
            Leg {leg.index + 1} of {leg.count} · {leg.date}
          </div>
        )}
      </header>

      <p className="rule-one">The whole class commands one expedition — every order moves the Corps forward.</p>

      <div className="meters-row solo">
        <MetersBar meters={match.meters} meta={meta} title="The Corps" />
      </div>

      {lowMeter && !feedback && !journalStep && (
        <div className="banner danger" role="alert">
          ⚠️ Your {meta.meters[lowMeter[0]]?.name || lowMeter[0]} is running very low.
        </div>
      )}

      {route.length > 0 && (
        <RouteMap route={route} stepIndex={mapStepIndex} view="strip" />
      )}

      <div className="match-body single">
        <section className="action-panel" aria-live="polite">
          {journalStep != null ? (
            <JournalPage entry={journal[journalStep]} onContinue={continueJournal} />
          ) : feedback ? (
            <FeedbackPanel
              feedback={feedback}
              meta={meta}
              matchEnded={!!state.matchEnd}
              onContinue={continueFeedback}
            />
          ) : eventCard ? (
            <SituationCard eventCard={eventCard} meta={meta} onContinue={() => dispatch({ type: 'dismiss-event' })} />
          ) : turn?.yourTurn && turn.kind === 'decision' ? (
            <DecisionPanel turn={turn} route={route} />
          ) : (
            <div className="waiting-panel"><div className="pulse-dot" aria-hidden="true" /><p>Steady…</p></div>
          )}
        </section>
      </div>
    </div>
  );
}

/* -------- panels -------- */

function SituationCard({ eventCard, meta, onContinue }) {
  const ch = eventCard.chapter;
  return (
    <div className="event-card">
      <div className="event-kicker">Leg {ch.index + 1} of {ch.count} · {ch.date}</div>
      <h2>{ch.title}</h2>
      <Art name={ch.image} alt={ch.title} className="event-art" />
      <p className="event-text"><VocabText text={eventCard.text} /></p>
      {eventCard.eventEffects && (
        <div className="effects-row">
          {Object.entries(eventCard.eventEffects).map(([k, v]) => (
            <span key={k} className={`effect-chip ${v > 0 ? 'up' : 'down'}`}>
              {meta.meters[k]?.name} {v > 0 ? `+${v}` : v}
            </span>
          ))}
        </div>
      )}
      <button className="btn big" onClick={onContinue}>Press on</button>
    </div>
  );
}

function DecisionPanel({ turn, route }) {
  const [busy, setBusy] = useState(false);
  // Synchronous double-tap lock. State alone can't stop two taps landing in
  // the same render frame (both read the stale `busy === false`), and the
  // server acks before pushing turn:resolution — so the second submit would
  // be graded against the NEXT decision (server cursor already advanced). The
  // ref engages immediately; `busy` still drives the disabled styling.
  const busyRef = useRef(false);
  const [err, setErr] = useState('');

  // A new decision arriving always releases the lock — covers a post-reconnect
  // sync replacing the turn in place without remounting this panel.
  useEffect(() => {
    busyRef.current = false;
    setBusy(false);
  }, [turn.stepIndex]);

  async function choose(choiceIndex) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const res = await emitAck('student:submit_move', { move: { kind: 'decision', choiceIndex } });
    // Deliberately NOT unlocked on success: the ack arrives BEFORE the
    // turn:resolution push. The panel unmounts when feedback arrives, or the
    // stepIndex effect above releases the lock.
    if (!res.ok) { setErr(errorText(res.error)); busyRef.current = false; setBusy(false); }
  }

  const art = STEP_ART[turn.stepIndex];
  const stop = route[turn.stepIndex];

  return (
    <div className="move-panel">
      {art && <Art name={art} alt={stop?.place ? `A scene at ${stop.place}` : 'A scene from the trail'} className="event-art" />}
      {stop && <div className="event-kicker">{stop.place} · {stop.date}</div>}
      <h2>🧭 What is your call?</h2>
      <p className="prompt"><VocabText text={turn.prompt} /></p>
      <div className="choice-list">
        {(turn.choices || []).map((label, i) => (
          <button key={i} className="choice-btn" disabled={busy} onClick={() => choose(i)}>
            {label}
          </button>
        ))}
      </div>
      <p className="err" role="alert">{err}</p>
    </div>
  );
}

const VERDICT_UI = {
  right: { label: "The Captains' call", className: 'right', icon: '✓' },
  partial: { label: 'A half-measure', className: 'partial', icon: '≈' },
  wrong: { label: 'That cost the expedition', className: 'wrong', icon: '✗' },
};

function FeedbackPanel({ feedback, meta, matchEnded, onContinue }) {
  const v = VERDICT_UI[feedback.verdict] || VERDICT_UI.partial;
  return (
    <div className="feedback-panel">
      <div className={`verdict-badge ${v.className} flash`}>
        <span aria-hidden="true">{v.icon}</span> {v.label}
      </div>
      <p className="feedback-text"><VocabText text={feedback.feedback} /></p>
      <div className="effects-row">
        {Object.entries(feedback.effects || {}).map(([k, val]) => (
          <span key={k} className={`effect-chip ${val > 0 ? 'up' : 'down'}`}>
            {meta.meters[k]?.name} {val > 0 ? `+${val}` : val}
          </span>
        ))}
      </div>
      <button className="btn big" onClick={onContinue}>
        {matchEnded ? 'See how it ends' : 'Next order'}
      </button>
    </div>
  );
}
