// geography.js — the real coordinates behind the route map (spec §5).
//
// EVERYTHING IN THIS FILE IS REAL LATITUDE AND LONGITUDE. The Missouri does not
// run in a straight line to the Pacific, and the map must not pretend it does:
// it swings a thousand miles north through the Dakotas before it turns west, and
// that detour is a large part of why the trip took two and a half years. Students
// should be able to lay this map beside an atlas and have it agree.
//
// Sources for the trail geometry are the standard, well-mapped positions of the
// Lewis & Clark National Historic Trail: the Missouri from its mouth to Three
// Forks, the Jefferson to Lemhi Pass on the Continental Divide, north over Lost
// Trail Pass and down the Bitterroot valley to Travelers' Rest, west over the
// Lolo Trail to Weippe Prairie, then the Clearwater, Snake, and Columbia to the
// sea. The twelve graded decisions sit ON this line, not beside it.
//
// PROJECTION: equirectangular with longitude squeezed by cos(43°N), the middle
// latitude of the trail. That keeps north–south and east–west distances in
// roughly honest proportion across the map's range — a plain lon/lat plot would
// stretch the West sideways by about a third.

// The standard parallel: the latitude the map is true along.
export const LAT0 = 43;
export const KX = Math.cos((LAT0 * Math.PI) / 180); // ≈ 0.7314

// Two framings of the SAME geography (spec §5): a wide strip that sits above the
// decision card, and a taller view used on the briefing screen so the Louisiana
// Purchase can be seen whole, down to the Gulf.
export const VIEWS = {
  strip: { n: 50.0, s: 35.5, w: -126.6, e: -86.6 },
  wide:  { n: 50.0, s: 27.4, w: -126.6, e: -86.6 },
};

export function projector(view) {
  const b = VIEWS[view] || VIEWS.strip;
  const width = (b.e - b.w) * KX;
  const height = b.n - b.s;
  const px = (lon) => (lon - b.w) * KX;
  const py = (lat) => b.n - lat;
  return {
    bounds: b,
    width,
    height,
    viewBox: `0 0 ${round(width)} ${round(height)}`,
    px,
    py,
    // A [lat, lon] list → an SVG points/path-friendly [x, y] list.
    line: (pts) => pts.map(([lat, lon]) => [px(lon), py(lat)]),
  };
}

const round = (n) => Math.round(n * 1000) / 1000;

export const toPath = (xy) =>
  xy.map(([x, y], i) => `${i ? 'L' : 'M'}${round(x)} ${round(y)}`).join(' ');

export const toPoly = (xy) => xy.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');

// ---------------------------------------------------------------------------
// THE TRAIL. [lat, lon] in travel order, St. Louis → the Pacific. Dense enough
// that the shape of the Missouri's great northern bend is unmistakable.
//
// The twelve route stops shipped by the server (usCorpsOfDiscovery.js ROUTE)
// are all points ON this list, so a marker placed at a stop always sits exactly
// on the drawn river. `routeIndexFor` below finds each one by coordinate match.
// ---------------------------------------------------------------------------

export const TRAIL = [
  [38.63, -90.20],   // St. Louis — the mouth of the Missouri            ◆ stop 0
  [38.71, -91.44],   // Hermann
  [38.58, -92.18],   // Jefferson City
  [38.75, -93.55],   // the Missouri bend at Waverly
  [39.11, -94.63],   // Kansas City                                       ◆ stop 1
  [39.77, -94.85],   // St. Joseph
  [40.68, -95.40],   // the Nebraska line
  [41.26, -95.93],   // Council Bluffs / Omaha — the first councils
  [42.50, -96.40],   // Sioux City — Sgt. Floyd dies here, August 1804
  [42.87, -97.39],   // Yankton
  [43.80, -99.30],   // Chamberlain
  [44.37, -100.35],  // the Bad River — the Teton Sioux standoff          ◆ stop 2
  [45.54, -100.43],  // Mobridge
  [46.81, -100.78],  // Bismarck
  [47.29, -101.09],  // the Knife River villages                          ◆ stop 3
  [47.29, -101.30],  // Fort Mandan                                       ◆ stop 4
  [47.90, -102.50],  // the Missouri turns west
  [48.00, -104.06],  // the Yellowstone confluence
  [48.09, -105.64],  // Wolf Point
  [47.85, -106.55],  // the squall that nearly took the white pirogue     ◆ stop 5
  [47.60, -107.90],  // the mouth of the Musselshell
  [47.72, -109.65],  // the mouth of the Judith
  [47.95, -110.50],  // the mouth of the Marias — which river is the Missouri?
  [47.50, -111.30],  // the Great Falls                                   ◆ stop 6
  [46.60, -111.90],  // the Gates of the Mountains
  [45.93, -111.50],  // Three Forks — the Missouri begins here
  [45.55, -112.30],  // up the Jefferson
  [45.20, -112.75],  // the Beaverhead
  [44.97, -113.45],  // Lemhi Pass — the Continental Divide, and Cameahwait ◆ stop 7
  [45.69, -113.95],  // Lost Trail Pass, north into the Bitterroot valley
  [46.25, -114.15],  // the Bitterroot valley
  [46.75, -114.09],  // Travelers' Rest
  [46.63, -114.58],  // Lolo Pass — into the Bitterroot snows             ◆ stop 8
  [46.50, -115.30],  // the Lolo Trail ridge
  [46.38, -115.94],  // Weippe Prairie — the Nez Perce                    ◆ stop 9
  [46.50, -116.32],  // Canoe Camp on the Clearwater
  [46.42, -117.02],  // the Snake confluence
  [46.20, -118.00],  // down the Snake
  [46.23, -119.03],  // the Columbia confluence
  [45.65, -121.18],  // Celilo Falls and The Dalles
  [45.62, -122.67],  // the last mountains
  [46.13, -123.88],  // the Pacific — Station Camp and Fort Clatsop       ◆ stop 10
];

// Find a server route stop's index on the trail by matching its coordinates.
// Falls back to nearest point so a small future edit to either list degrades
// gracefully instead of throwing.
export function routeIndexFor(lat, lon) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < TRAIL.length; i++) {
    const d = (TRAIL[i][0] - lat) ** 2 + ((TRAIL[i][1] - lon) * KX) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Context features — everything else on the map. Also real coordinates.
// ---------------------------------------------------------------------------

// The Pacific coast, Cape Flattery down past Baja. It runs the full height of
// both framings so the ocean fill never has to guess where the water ends.
export const PACIFIC_COAST = [
  [50.20, -125.20], [49.00, -124.70], [48.38, -124.72], [47.90, -124.65],
  [47.00, -124.18], [46.28, -124.05], [45.00, -123.97], [44.00, -124.10],
  [43.00, -124.42], [42.00, -124.41], [41.00, -124.10], [40.44, -124.40],
  [39.00, -123.80], [38.30, -123.05], [37.20, -122.42], [36.30, -121.90],
  [35.00, -120.90], [34.45, -120.47], [33.70, -118.30], [32.55, -117.15],
  [31.80, -116.62], [30.40, -115.90], [29.00, -115.30], [28.00, -114.60],
];

// The Gulf coast, Rio Grande to the Florida panhandle. Only the wide framing
// reaches this far south, but the Purchase's southern third makes no sense
// without water under it.
export const GULF_COAST = [
  [25.90, -97.15], [27.80, -97.05], [28.40, -96.40], [29.00, -95.10],
  [29.68, -94.75], [29.75, -93.85], [29.60, -92.20], [29.15, -90.90],
  [28.95, -89.25], [29.70, -89.40], [30.20, -88.90], [30.35, -88.10],
  [30.40, -87.30], [30.15, -86.30],
];

// The Mississippi — the Louisiana Purchase's eastern edge, and the line the
// United States stopped at before 1803.
export const MISSISSIPPI = [
  [47.20, -95.20], [46.30, -94.20], [45.00, -92.80], [44.10, -91.60],
  [43.00, -91.15], [41.50, -90.55], [40.40, -91.15], [39.70, -91.35],
  [38.81, -90.12], [37.90, -89.50], [37.00, -89.17], [35.90, -89.95],
  [35.13, -90.06], [34.00, -91.05], [33.00, -91.15], [31.50, -91.40],
  [30.45, -91.19], [29.95, -90.07], [29.15, -89.25],
];

// The Ohio, for orientation — the road most Americans took west before 1803.
export const OHIO = [
  [39.75, -84.20], [38.70, -85.75], [38.05, -87.55], [37.00, -89.17],
];

// The Continental Divide — the western rim of the Missouri's watershed, and so
// (roughly) the western edge of the Louisiana Purchase.
export const DIVIDE = [
  [49.00, -114.10], [48.00, -113.50], [47.00, -112.60], [46.00, -112.80],
  [45.20, -113.40], [44.60, -110.90], [43.50, -110.00], [42.50, -109.60],
  [41.60, -107.30], [40.80, -106.30], [40.00, -105.85], [39.00, -106.20],
  [38.00, -106.45], [37.20, -106.60],
];

// The Cascades, drawn separately so the Columbia visibly cuts through them.
export const CASCADES = [
  [49.00, -121.00], [47.80, -121.30], [46.85, -121.76], [45.37, -121.70],
  [44.20, -121.80], [42.90, -122.10], [41.40, -122.19],
];

// The Bitterroots — the range that ended the dream of a water route.
export const BITTERROOTS = [
  [47.40, -115.30], [46.85, -114.90], [46.30, -114.45], [45.80, -114.22],
];

// The Louisiana Purchase, closed clockwise: the 49th parallel on the north, the
// Continental Divide on the west, the Red and Sabine rivers and the Gulf on the
// south, the Mississippi on the east. The 1803 treaty described the boundary
// only vaguely — the north was fixed at 49°N in 1818 and the south by treaty in
// 1819 — so this is the standard textbook shape, not a survey.
export const PURCHASE = [
  [49.00, -95.15], [49.00, -114.10],
  ...DIVIDE.slice(1),
  [37.00, -103.00], [36.90, -100.00], [35.00, -100.00], [33.90, -99.30],
  [33.90, -96.90], [33.55, -94.05], [31.50, -93.75], [30.10, -93.70],
  [29.30, -91.30], [29.15, -89.25],
  ...MISSISSIPPI.slice().reverse().slice(1),
];

// Labels for the map itself, placed clear of the trail line.
export const MAP_LABELS = [
  { text: 'PACIFIC OCEAN', lat: 40.5, lon: -125.6, anchor: 'middle', kind: 'water', rotate: -90 },
  { text: 'The Louisiana Purchase', lat: 40.9, lon: -100.4, anchor: 'middle', kind: 'land' },
  { text: 'bought from France, 1803', lat: 39.8, lon: -100.4, anchor: 'middle', kind: 'sub' },
  { text: 'Missouri River', lat: 43.4, lon: -97.3, anchor: 'middle', kind: 'river', rotate: -50 },
  { text: 'Columbia R.', lat: 44.9, lon: -120.2, anchor: 'middle', kind: 'river' },
  { text: 'ROCKY MOUNTAINS', lat: 41.6, lon: -108.8, anchor: 'middle', kind: 'range', rotate: -72 },
  { text: 'Mississippi R.', lat: 38.9, lon: -89.9, anchor: 'middle', kind: 'river', rotate: 78 },
  { text: 'Gulf of Mexico', lat: 28.5, lon: -92.6, anchor: 'middle', kind: 'water', only: 'wide' },
];

// Chevrons that read as mountains along a range line, without pretending to be
// terrain data. Marks are spaced by DISTANCE along the range (not per segment),
// so a densely-sampled stretch does not turn into a solid comb.
export function chevrons(range, proj, size = 0.34, spacing = 0.85) {
  const xy = proj.line(range);
  const out = [];
  let carry = spacing / 2;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1];
    const [x1, y1] = xy[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    for (let d = carry; d < len; d += spacing) {
      const t = d / len;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      out.push(
        `M${round(x - size)} ${round(y + size * 0.55)} L${round(x)} ${round(y - size * 0.6)} L${round(x + size)} ${round(y + size * 0.55)}`
      );
    }
    carry = Math.max(0, spacing - ((len - carry) % spacing));
  }
  return out.join(' ');
}
