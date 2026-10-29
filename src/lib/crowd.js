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
//
// The club plays in '#00B140', '#000000', '#FFFFFF' (clubPalettes.js), and a
// home crowd wears it, so verde and black carry the stand between them and
// white is the sparkle on top. Neither family is one colour: a single verde
// repeated 80 times reads as polka dots, so each runs from near-black through
// to a floodlit highlight, and the eye reads that spread as depth.
const TONES = [
  // Black: the structural family. The gaps between people are this colour
  // too, not just the clothing. Spread across hue as well as lightness --
  // all-neutral blacks go flat, and a warm one next to a cool one reads as
  // two different coats rather than one colour used twice.
  { fill: '#0B0D0B', weight: 11 },
  { fill: '#151A16', weight: 9 },
  { fill: '#1A1614', weight: 6 },
  { fill: '#232A24', weight: 6 },
  { fill: '#2A2A32', weight: 5 },
  { fill: '#333B34', weight: 4 },

  // Verde, the club's, and the largest family. Again spread across hue: a
  // ramp that only changes lightness reads as one shirt under eight
  // different lamps. Teal through lime is the range a stand of replica
  // kits, old kits and merch actually covers.
  { fill: '#124E2A', weight: 6 },
  { fill: '#0B6B36', weight: 7 },
  { fill: '#1B7A4E', weight: 5 },
  { fill: '#0E8C42', weight: 7 },
  { fill: '#00B140', weight: 10 },
  { fill: '#06C455', weight: 5 },
  { fill: '#3E9E2E', weight: 4 },
  { fill: '#6ECB3C', weight: 3 },

  // White and greys sit between the families. Kept scarce: this is the
  // sparkle, and sparkle stops reading as sparkle once it is common.
  { fill: '#8A938B', weight: 6 },
  { fill: '#B9C0B8', weight: 4 },
  { fill: '#D7DBD5', weight: 5 },
  { fill: '#F2F4EF', weight: 3 },

  // Faces. At this size a warm speck is a face above a dark coat, and a
  // crowd with none in it is a crowd of hoods.
  { fill: '#C98A5E', weight: 3 },
  { fill: '#8C5A3C', weight: 3 },
  { fill: '#E3B591', weight: 2 }
];

const TONE_TOTAL = TONES.reduce((sum, tone) => sum + tone.weight, 0);

// How often a figure wears what the one beside it is wearing. Picking every
// tone independently gives a statistically even field, which is confetti, not
// a crowd: people arrive together and sit together, so colour comes in short
// runs. Runs stay short on purpose. The decks are tiled patterns, and a clump
// large enough to have a shape of its own would hand the eye a landmark to
// spot the tile repeat by.
const RUN_CHANCE = 0.34;

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
//
// size is set close to half the pitch on purpose, so that with jitter the
// figures crowd each other and sometimes overlap. Smaller, and the colour
// filling the deck is the grey of the empty stand between them rather than
// the crowd itself, which is what makes a stand read as speckled concrete
// however varied the speckles are.
const DECKS = [
  { id: 'far',  seats: 13, rows: 8, pitch: 5.6, gap: 5.6, size: 2.0, rake: 4 },
  { id: 'mid',  seats: 12, rows: 7, pitch: 7.0, gap: 7.0, size: 2.5, rake: -2.5 },
  { id: 'near', seats: 11, rows: 6, pitch: 9.6, gap: 9.6, size: 3.3, rake: 0 }
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
      // Runs do not cross rows: the person behind you is a stranger.
      let neighbour = null;

      for (let seat = 0; seat < deck.seats; seat += 1) {
        // A few seats are empty. Without them every row is a solid bar and the
        // tile's edges line up into visible columns. An empty seat also ends
        // whatever run was going, which is what keeps runs short.
        if (random() < 0.07) {
          neighbour = null;
          continue;
        }

        const size = deck.size * (0.72 + random() * 0.58);
        // Aspect varies per figure rather than sitting at one ratio. Some
        // people are stood, some are sat, some have a scarf up; at this size
        // that difference is just how tall the blob is, and a deck of
        // identical blobs is the thing that reads as a pattern swatch.
        const aspect = 0.95 + random() * 0.6;

        neighbour = (neighbour && random() < RUN_CHANCE) ? neighbour : pickTone(random);

        figures.push({
          // Jitter is nearly half a seat: enough to break the lattice, not so
          // much that the rows stop reading as rows.
          cx: +(stagger + seat * deck.pitch + (random() - 0.5) * deck.pitch * 0.45).toFixed(2),
          cy: +(deck.gap * 0.5 + row * deck.gap + (random() - 0.5) * deck.gap * 0.3).toFixed(2),
          rx: +size.toFixed(2),
          // Taller than wide: a head over shoulders, not a ball bearing.
          ry: +(size * aspect).toFixed(2),
          fill: neighbour
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
