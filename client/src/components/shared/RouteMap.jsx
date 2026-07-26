// RouteMap.jsx — the route map (spec §5): a real map of the West with the real
// trail on it, and a marker that inches west with every decision the student
// makes. Purely presentational — it reads `meta.route` (server-shipped display
// data, usCorpsOfDiscovery.js ROUTE) and never touches scoring.
//
// WHY IT IS A REAL MAP. The point of the game is the SCALE of the Louisiana
// Purchase and the shape of the problem (spec §1: "crossing the Purchase mile by
// mile teaches its scale and purpose"). A decorative left-to-right progress bar
// would teach the opposite — that the West is a straight line. So every
// coordinate here is genuine (see geography.js), the Missouri makes its real
// thousand-mile swing north through the Dakotas before it turns west, and the
// Rockies sit exactly where they blocked the water route that Jefferson hoped for.
//
// The marker walks the TRAIL, so the westernmost point of the whole map is only
// reached at step 10 — decision 11, the Pacific — and step 11 walks it home
// again (spec §10 checklist).
//
// Two framings, same geography: `view="strip"` above the decision card, and
// `view="wide"` on the briefing screen, where the Purchase is shown whole.

import { useEffect, useRef, useState } from 'react';
import {
  TRAIL, PACIFIC_COAST, GULF_COAST, MISSISSIPPI, OHIO, DIVIDE, CASCADES,
  BITTERROOTS, PURCHASE, MAP_LABELS, projector, toPath, toPoly, chevrons,
  routeIndexFor,
} from './geography.js';

const TRAVEL_MS = 950;

// Cumulative distance along a projected polyline, so the marker can be placed
// at any fraction of the journey and the travelled portion drawn behind it.
function measure(xy) {
  const cum = [0];
  for (let i = 1; i < xy.length; i++) {
    const dx = xy[i][0] - xy[i - 1][0];
    const dy = xy[i][1] - xy[i - 1][1];
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  return cum;
}

// Point at distance `d` along the polyline, plus the polyline clipped to d.
function walk(xy, cum, d) {
  const total = cum[cum.length - 1];
  const dist = Math.max(0, Math.min(total, d));
  let i = 1;
  while (i < cum.length - 1 && cum[i] < dist) i++;
  const span = cum[i] - cum[i - 1] || 1;
  const t = (dist - cum[i - 1]) / span;
  const point = [
    xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * t,
    xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * t,
  ];
  return { point, travelled: [...xy.slice(0, i), point] };
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function RouteMap({ route = [], stepIndex = 0, view = 'strip', showLegend = false }) {
  const proj = projector(view);
  const trail = proj.line(TRAIL);
  const coast = proj.line(PACIFIC_COAST);
  const gulf = proj.line(GULF_COAST);
  const cum = measure(trail);
  const total = cum[cum.length - 1];

  // Where each of the twelve decisions sits on the trail, as a distance. The
  // last stop is the RETURN — the marker walks all the way back to St. Louis.
  const stopDistance = route.map((r) =>
    r.returning ? 0 : cum[routeIndexFor(r.lat, r.lon)]
  );
  const target = stopDistance[Math.min(stepIndex, stopDistance.length - 1)] ?? 0;

  // Animate the marker from wherever it was to the new stop. Deliberately a
  // hand-rolled rAF walk rather than a CSS transition: SVG geometry attributes
  // do not transition consistently, and this way the marker's position is a
  // plain number we can trust and test.
  const [dist, setDist] = useState(target);
  const distRef = useRef(target);
  const rafRef = useRef(0);
  const snapRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(snapRef.current);
    const from = distRef.current;
    if (from === target || prefersReducedMotion()) {
      distRef.current = target;
      setDist(target);
      return undefined;
    }
    const started = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - started) / TRAVEL_MS);
      // easeInOutQuad — a boat setting off and coming to rest, not a jump cut.
      const e = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
      const next = from + (target - from) * e;
      distRef.current = next;
      setDist(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    // If rAF is frozen (a backgrounded tab), still land on the right spot.
    snapRef.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      distRef.current = target;
      setDist(target);
    }, TRAVEL_MS + 400);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(snapRef.current); };
  }, [target]);

  const { point, travelled } = walk(trail, cum, dist);
  const here = route[Math.min(stepIndex, route.length - 1)];
  const heading = here?.returning ? 'east, for home' : 'west';

  // Only label the stops that have been reached, so the map is a record of
  // where you have been rather than a spoiler of where you are going.
  const reachedThrough = here?.returning ? route.length - 2 : stepIndex;

  return (
    <div className={`route-map ${view}`}>
      <svg
        viewBox={proj.viewBox}
        className="route-map-svg"
        role="img"
        aria-label={`A map of the American West. The expedition has travelled ${Math.round((dist / total) * 100)} percent of the way out, and is at ${here?.place || 'St. Louis'}, heading ${heading}.`}
      >
        <defs>
          <linearGradient id="rm-ocean" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#20406e" />
            <stop offset="100%" stopColor="#2b5384" />
          </linearGradient>
        </defs>

        {/* Land, then ocean over the western edge. The coast runs off both the
            top and the bottom of the frame, so the fill closes along the bottom
            edge and up the left — no guessing where the water ends. */}
        <rect x="0" y="0" width={proj.width} height={proj.height} className="rm-land" />
        <path
          className="rm-ocean"
          fill="url(#rm-ocean)"
          d={`${toPath(coast)} L${coast[coast.length - 1][0]} ${proj.height} L0 ${proj.height} L0 0 Z`}
        />
        {view === 'wide' && (
          <path
            className="rm-ocean"
            fill="url(#rm-ocean)"
            d={`${toPath(gulf)} L${gulf[gulf.length - 1][0]} ${proj.height} L${gulf[0][0]} ${proj.height} Z`}
          />
        )}

        {/* The Louisiana Purchase — the reason any of this happened. */}
        <polygon className="rm-purchase" points={toPoly(proj.line(PURCHASE))} />

        {/* Ranges, drawn as chevrons rather than fake terrain. */}
        <path className="rm-range" d={chevrons(DIVIDE, proj, 0.3, 0.48)} />
        <path className="rm-range" d={chevrons(CASCADES, proj, 0.26, 0.46)} />
        <path className="rm-range rm-range-key" d={chevrons(BITTERROOTS, proj, 0.3, 0.42)} />

        {/* Rivers. */}
        <path className="rm-river" d={toPath(proj.line(MISSISSIPPI))} />
        <path className="rm-river" d={toPath(proj.line(OHIO))} />

        {/* The trail: the whole route dimmed, the travelled part lit. */}
        <path className="rm-trail" d={toPath(trail)} />
        <path className="rm-trail-done" d={toPath(travelled)} />

        {/* Stops. Reached ones get a filled dot; the rest stay hollow. */}
        {route.map((r, i) => {
          if (r.returning) return null;              // the return shares stop 0's dot
          const [x, y] = trail[routeIndexFor(r.lat, r.lon)];
          const reached = i <= reachedThrough;
          return (
            <circle
              key={r.key}
              cx={x}
              cy={y}
              r={i === stepIndex && !here?.returning ? 0.36 : 0.24}
              className={`rm-stop ${reached ? 'reached' : ''} ${i === stepIndex ? 'current' : ''}`}
            />
          );
        })}

        {/* The expedition itself. */}
        <g className="rm-marker" transform={`translate(${point[0]} ${point[1]})`}>
          <circle r="0.62" className="rm-marker-halo" />
          <circle r="0.3" className="rm-marker-dot" />
        </g>

        {/* Map labels. */}
        {MAP_LABELS.filter((l) => !l.only || l.only === view).map((l) => (
          <text
            key={l.text}
            x={proj.px(l.lon)}
            y={proj.py(l.lat)}
            className={`rm-label rm-label-${l.kind}`}
            textAnchor={l.anchor}
            transform={l.rotate ? `rotate(${l.rotate} ${proj.px(l.lon)} ${proj.py(l.lat)})` : undefined}
          >
            {l.text}
          </text>
        ))}
      </svg>

      <div className="route-map-caption">
        <span className="rm-where">
          <b>{here?.place || 'St. Louis'}</b> · {here?.date || 'May 1804'}
        </span>
        <span className="rm-note">{here?.note}</span>
      </div>

      {showLegend && (
        <ul className="route-map-legend">
          <li><span className="swatch purchase" aria-hidden="true" /> The Louisiana Purchase — about 828,000 square miles, bought from France in 1803</li>
          <li><span className="swatch trail" aria-hidden="true" /> The route out: about 4,000 miles up the Missouri, over the Rockies, and down the Columbia</li>
          <li><span className="swatch range" aria-hidden="true" /> The Rocky Mountains — the reason there is no all-water route to the Pacific</li>
        </ul>
      )}
    </div>
  );
}
