// The crowd in the stands.
//
// Plain <circle> elements, placed across the decks. No tiling: a tiled
// pattern is cheaper, but a small tile repeats and the repeat is visible on
// the upper deck once you have seen it. These are just people, each at its
// own spot, so there is nothing to repeat.
//
// The cost of that is node count, which was measured rather than guessed.
// Frame rate is flat at 61fps from 256 nodes to 34,000: the floodlight
// regression that halved it came from drop-shadow, which is costed per
// element per frame, and a circle that never animates costs nothing per
// frame. What node count does cost is the export, because inlinePaint() in
// kitToPng.js calls getComputedStyle on every descendant of the stadium:
// roughly +40ms per 1,000 circles, against a 147ms baseline.
//
// So the count is set by what is visible, not by what is cheap. The stadium
// draws at about 0.59 screen pixels per viewBox unit, which makes the radii
// below between four and seven pixels on screen. Smaller buys nothing the
// eye can resolve, and each halving of the radius quadruples the count.
//
// Generated from a fixed seed, for the reason stars.js is: the PNG export
// repaints this same markup, and a crowd that reshuffled on re-render would
// be a different crowd every time the component remounted.

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

// A distant crowd is mostly dark, with a scatter of bright specks that read
// as faces and white shirts. An even spread of mid-tones has no sparkle and
// flattens into gravel, so the extremes have to be genuine black and
// near-white to survive the stand beneath (#AEAEAF) and the 34% composite.
//
// The club plays in '#00B140', '#000000', '#FFFFFF' (clubPalettes.js) and a
// home crowd wears it. Both families spread across hue as well as lightness:
// a ramp that only changes lightness reads as one shirt under eight lamps.
const TONES = [
  { fill: '#0B0D0B', weight: 11 },
  { fill: '#151A16', weight: 9 },
  { fill: '#1A1614', weight: 6 },
  { fill: '#232A24', weight: 6 },
  { fill: '#2A2A32', weight: 5 },
  { fill: '#333B34', weight: 4 },

  { fill: '#124E2A', weight: 6 },
  { fill: '#0B6B36', weight: 7 },
  { fill: '#1B7A4E', weight: 5 },
  { fill: '#0E8C42', weight: 7 },
  { fill: '#00B140', weight: 10 },
  { fill: '#06C455', weight: 5 },
  { fill: '#3E9E2E', weight: 4 },
  { fill: '#6ECB3C', weight: 3 },

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

// How often someone wears what the person beside them is wearing. Picking
// every tone independently gives a statistically even field, which is
// confetti: people arrive together and sit together, so colour comes in
// short runs along a row.
const RUN_CHANCE = 0.34;

function pickTone(random) {
  let roll = random() * TONE_TOTAL;

  for (const tone of TONES) {
    roll -= tone.weight;
    if (roll <= 0) return tone.fill;
  }

  return TONES[0].fill;
}

// A loose box around each deck, and the spacing to fill it with.
//
// These boxes do not have to be exact and are not a second home for the
// stand geometry. The real shape comes from the clip paths in Stadium.vue,
// which are built with <use> from the polygons that already draw the decks,
// so a box only has to be big enough to contain its deck. Circles landing
// outside are clipped away; the cost of a loose box is a few wasted nodes,
// not a visible seam.
//
// rake is the slope of the deck's rows. The far deck's top edge drops 90
// units over 1283, hence 0.07. Applied as maths rather than a transform,
// because a transform on the group would fight the clip path.
const DECKS = [
  { id: 'far',  x: 137, y: 554, width: 1441, height: 224, step: 9.7,  size: 3.6, rake: 0.070 },
  { id: 'mid',  x: 20,  y: 813, width: 1630, height: 200, step: 12.2, size: 4.5, rake: -0.044 },
  { id: 'near', x: 1842, y: 690, width: 993, height: 198, step: 15.7, size: 5.8, rake: 0 }
];

function build() {
  // One stream for the whole crowd, so adding a deck does not reshuffle the
  // ones before it.
  const random = mulberry32(0xC0FFEE);

  return DECKS.map(deck => {
    const people = [];
    const rows = Math.ceil(deck.height / deck.step);
    const seats = Math.ceil(deck.width / deck.step);

    for (let row = 0; row <= rows; row += 1) {
      // Alternate rows sit half a seat over, the way real seating staggers.
      const stagger = (row % 2) * deck.step * 0.5;
      // Runs do not cross rows: the person behind you is a stranger.
      let neighbour = null;

      for (let seat = 0; seat <= seats; seat += 1) {
        // A few seats are empty, and an empty one ends whatever run was
        // going, which is what keeps runs short.
        if (random() < 0.07) {
          neighbour = null;
          continue;
        }

        const x = deck.x + stagger + seat * deck.step + (random() - 0.5) * deck.step * 0.5;
        const y = deck.y + row * deck.step + (random() - 0.5) * deck.step * 0.4
          + (x - deck.x) * deck.rake;

        neighbour = (neighbour && random() < RUN_CHANCE) ? neighbour : pickTone(random);

        people.push({
          cx: +x.toFixed(1),
          cy: +y.toFixed(1),
          r: +(deck.size * (0.78 + random() * 0.44)).toFixed(2),
          fill: neighbour
        });
      }
    }

    return { id: deck.id, people };
  });
}

export const CROWD_DECKS = build();
