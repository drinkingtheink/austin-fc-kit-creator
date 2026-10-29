// Stars for the summer-night sky.
//
// Generated once, from a fixed seed, for the same reason the gradients live in
// stageBackdrops.js: the PNG export has to paint the same sky the screen shows,
// and a second set of random positions would be a different sky. A fixed seed
// also means the stars hold still across re-renders instead of leaping about
// whenever the component remounts.
//
// Coordinates are fractions of the stage, so both renderers can scale them.

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

// Few enough to read as a clear night rather than a planetarium ceiling. The
// sky is backdrop, and the stadium's own lights are the bright thing up there.
const COUNT = 30;

// Stars stop where the stands begin. Below this the stadium roof and floodlit
// haze would be in front of them anyway.
const SKY_DEPTH = 0.54;

// Diameters in px, at a nominal 1440-wide stage. Both renderers scale from here.
const MIN_SIZE = 1.1;
const MAX_SIZE = 3.4;

function build() {
  const random = mulberry32(0x5EED);
  const stars = [];

  for (let i = 0; i < COUNT; i += 1) {
    // Squaring the vertical draw crowds them toward the top of the sky and
    // thins them out near the horizon, which is how a real sky reads.
    const depth = random() ** 2;
    // Brightness and size travel together: a big faint star looks like a smudge.
    const magnitude = random() ** 1.7;

    stars.push({
      x: random(),
      y: depth * SKY_DEPTH,
      size: MIN_SIZE + magnitude * (MAX_SIZE - MIN_SIZE),
      // Faded toward the horizon, where the sky glow would wash them out.
      opacity: (0.28 + magnitude * 0.62) * (1 - depth * 0.45),
      // Only the brighter half is worth animating; the rest are too dim for a
      // twinkle to read, and every animated element costs a frame budget.
      twinkles: magnitude > 0.45,
      // Spread across the cycle so they never blink together.
      delay: -random() * 7,
      duration: 3.4 + random() * 4.6
    });
  }

  return stars;
}

export const STARS = build();

/**
 * Paints the stars onto a canvas, for the PNG export.
 *
 * Twinkle is deliberately not reproduced: a still frame of a twinkling star is
 * just a star, and freezing whatever opacity each one happened to hold would
 * make exports of the same kit differ.
 */
export function paintStars(ctx, width, height) {
  const scale = width / 1440;

  ctx.save();
  ctx.fillStyle = '#FFFFFF';

  STARS.forEach(star => {
    const radius = (star.size * scale) / 2;

    if (radius <= 0) return;

    ctx.globalAlpha = star.opacity;
    ctx.beginPath();
    ctx.arc(star.x * width, star.y * height, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}
