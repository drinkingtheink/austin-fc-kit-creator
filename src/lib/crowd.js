// The crowd in the stands.
//
// A packed deck is thousands of people, and thousands of SVG nodes would be
// paid for twice: once per frame by the renderer, and once per export by
// inlinePaint() in kitToPng.js, which calls getComputedStyle on every
// descendant of the stadium. So the crowd is three tiled <pattern>s instead.
// A pattern's contents are rasterized once and blitted, and they sit inside
// <defs>, which the exporter skips entirely.
//
// The cost of a tile is that it repeats. Hand-placed dots on a neat grid read
// as halftone, not as people, so the tiles below are deliberately large and
// every figure is jittered off its seat. Three decks sit at three distances
// from the camera, and each gets its own tile and figure size -- that is the
// whole of the perspective.
//
// Generated from a fixed seed, for the reason stars.js is: the PNG export
// repaints the same markup, and a crowd that reshuffled on re-render would be
// a different crowd every time the component remounted.

/** Small, fast, fully deterministic. Any seed gives the same stream forever. */
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;

    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A distant crowd is mostly dark -- shadow between bodies and dark clothing --
// with a scatter of bright specks that read as faces and white shirts. Getting
// this weighting wrong is what makes a crowd look like a texture: an even
// spread of mid-tones has no sparkle and flattens into gravel. The stand
// beneath is #AEAEAF and the whole stadium composites at 34%, so the extremes
// have to be genuine black and near-white to survive the wash.
const TONES = [
  { fill: '#14110F', weight: 20 },
  { fill: '#241F1C', weight: 18 },
  { fill: '#3B3732', weight: 16 },
  { fill: '#5A5651', weight: 12 },
  { fill: '#807B74', weight: 8 },
  { fill: '#D7DBD5', weight: 9 },
  { fill: '#F2F4EF', weight: 5 },
  { fill: '#01AF4C', weight: 8 },
  { fill: '#0C6B38', weight: 4 }
];

const TONE_TOTAL = TONES.reduce((sum, tone) => sum + tone.weight, 0);

function pickTone(random) {
  let roll = random() * TONE_TOTAL;

  for (const tone of TONES) {
    roll -= tone.weight;
    if (roll <= 0) return tone.fill;
  }

  return TONES[0].fill;
}

// seats/rows are how many figures the tile holds; gap/pitch are the spacing
// between them in viewBox units. rake tilts the rows to follow the deck's own
// slope -- the far deck's top edge drops 90 units over 1283, hence 4 degrees.
const DECKS = [
  { id: 'far',  seats: 13, rows: 8, pitch: 5.6, gap: 5.6, size: 1.65, rake: 4 },
  { id: 'mid',  seats: 12, rows: 7, pitch: 7.0, gap: 7.0, size: 2.05, rake: -2.5 },
  { id: 'near', seats: 11, rows: 6, pitch: 9.6, gap: 9.6, size: 2.75, rake: 0 }
];

function build() {
  // One stream for the whole crowd, so adding a deck does not reshuffle the
  // ones before it.
  const random = mulberry32(0xC0FFEE);

  return DECKS.map(deck => {
    const figures = [];

    for (let row = 0; row < deck.rows; row += 1) {
      // Alternate rows sit half a seat over, the way real seating staggers.
      const stagger = (row % 2) * deck.pitch * 0.5;

      for (let seat = 0; seat < deck.seats; seat += 1) {
        // A few seats are empty. Without them every row is a solid bar and the
        // tile's edges line up into visible columns.
        if (random() < 0.07) continue;

        const size = deck.size * (0.78 + random() * 0.44);

        figures.push({
          // Jitter is nearly half a seat: enough to break the lattice, not so
          // much that the rows stop reading as rows.
          cx: +(stagger + seat * deck.pitch + (random() - 0.5) * deck.pitch * 0.45).toFixed(2),
          cy: +(deck.gap * 0.5 + row * deck.gap + (random() - 0.5) * deck.gap * 0.3).toFixed(2),
          rx: +size.toFixed(2),
          // Taller than wide: a head over shoulders, not a ball bearing.
          ry: +(size * 1.3).toFixed(2),
          fill: pickTone(random)
        });
      }
    }

    return {
      id: deck.id,
      width: +(deck.seats * deck.pitch).toFixed(2),
      height: +(deck.rows * deck.gap).toFixed(2),
      rake: deck.rake,
      figures
    };
  });
}

export const CROWD_DECKS = build();
