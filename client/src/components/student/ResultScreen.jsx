// ResultScreen.jsx — the journey's end (build spec §5 "Ending", §3.3): the
// ending tier from the three meters summed (Captains of Discovery / Hard Road
// Home / Lost in the High Country), the completed route map all the way to
// the Pacific and home again, the final meters, the accuracy grade that
// matters, and the shared debrief — which must land IN FULL, honest closing
// note about broken treaties and removal included (build spec §10 checklist;
// never soften or trim it).

import { Art } from '../../services/assets.jsx';
import RouteMap from '../shared/RouteMap.jsx';

const TIER_CLASS = { captains: 'win', hardroad: 'mid', lost: 'low' };
const ENDING_ART = {
  captains: 'scene_pacific.webp',
  hardroad: 'scene_nezperce.webp',
  lost: 'scene_bitterroot.webp',
};
const ENDING_ALT = {
  captains: 'Gray breakers and sea stacks under storm light, small figures on the shore with arms raised',
  hardroad: 'Nez Perce hosts sharing food with weary explorers at a river camp',
  lost: 'A thin file of explorers and horses on a snowy ridgeline in the Bitterroots',
};

export default function ResultScreen({ state, dispatch }) {
  const end = state.matchEnd;
  const meta = end.meta || state.match?.begin?.meta;
  const you = end.you;
  const ending = you.ending;
  const score = you.score ?? 0;
  const tierCls = TIER_CLASS[ending.key] || 'mid';
  const route = meta?.route || [];

  return (
    <div className="card result-screen">
      <div className="event-kicker">St. Louis · September 1806</div>
      <h1 className={`result-headline ${tierCls}`}>{ending.title}</h1>

      <Art
        name={ENDING_ART[ending.key] || 'scene_pacific.webp'}
        alt={ENDING_ALT[ending.key]}
        className="result-art"
      />

      {route.length > 0 && (
        <RouteMap route={route} stepIndex={11} view="wide" showLegend={true} />
      )}

      <p className="fall-note">
        This was never about reaching the Pacific — the real Corps did that
        either way. It was about <b>whether your calls were the ones Lewis and Clark actually made</b>.
        Your accuracy shows exactly that.
      </p>

      <div className={`ending-block ${tierCls}`}>
        <p>{ending.text}</p>
      </div>

      <div className="score-block" aria-label="Expedition Strength">
        <div className="score-head">
          <span className="score-title">🧭 Expedition Strength</span>
          <span className="score-num">{score}<span className="muted"> / 300</span></span>
        </div>
        <span className="score-bar-track">
          <span className={`score-bar ${tierCls}`} style={{ width: `${Math.min(100, (score / 300) * 100)}%` }} />
        </span>
        <div className="meter-final-row">
          {Object.entries(you.meters || {}).map(([k, v]) => (
            <span key={k} className="meter-final">{meta?.meters?.[k]?.name || k}: <b>{v}</b></span>
          ))}
        </div>
      </div>

      <div className="accuracy-block">
        <div className="accuracy-number">{you.accuracy}%</div>
        <div>
          <b>Your accuracy — the score your teacher sees.</b>
          <p>How many of your twelve calls were the moves the real Corps made — preparation, discipline, and trust over shortcuts. The meters were drama; this is the grade.</p>
        </div>
      </div>

      <div className="debrief">
        <h3>What really happened</h3>
        <p>{you.debrief}</p>
      </div>

      <div className="btn-col">
        <button className="btn big" onClick={() => dispatch({ type: 'play-again' })}>
          Play again — lead the whole expedition
        </button>
      </div>
    </div>
  );
}
