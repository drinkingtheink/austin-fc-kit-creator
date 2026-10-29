// The skies behind the kit.
//
// Kept here rather than in CSS because the PNG export paints the same gradient
// onto a canvas, and two copies of these numbers would drift apart.
//
// Each one is read as a sky: deepest at the top where the toolbar and the kit's
// shoulders sit, warming through the middle where the stadium's horizon falls,
// and settling again at the bottom. That shape is what keeps them lush without
// the backdrop competing with the kit -- the saturated band lands behind the
// stands rather than behind the shirt. The scrim in App.vue darkens the lowest
// third again on top of this.
//
// An earlier pass flattened all four to three dark stops, which was legible but
// drab. These go back to the vivid skies the first version of the app had, with
// enough stops to actually graduate.

export const STAGE_BACKDROPS = {
  // Deep violet night burning down into Texas orange.
  sunset: {
    angle: 168,
    stops: [
      ['#190B2F', 0], ['#3E1A63', 22], ['#8E2F63', 46],
      ['#C9522F', 68], ['#E88C3E', 88], ['#D9833C', 100]
    ]
  },
  // Still, warm, a long way after dark.
  summerNight: {
    angle: 172,
    stops: [
      ['#070B22', 0], ['#17204F', 26], ['#3A2A63', 50],
      ['#6B3A6B', 74], ['#9E566A', 93], ['#8E4D62', 100]
    ]
  },
  // First light: cool overhead, peach along the rim.
  dawn: {
    angle: 160,
    stops: [
      ['#101E36', 0], ['#2C4770', 24], ['#64749F', 48],
      ['#B383A3', 72], ['#DFA38C', 91], ['#CE9480', 100]
    ]
  },
  // The house mood, and the only one that is really green.
  verde: {
    angle: 165,
    stops: [
      ['#04150B', 0], ['#0A3A1F', 28], ['#116B35', 56],
      ['#1C9348', 80], ['#3FC06C', 100]
    ]
  },
  // Hot: the sky the old .two gradient was reaching for.
  ember: {
    angle: 170,
    stops: [
      ['#1E0608', 0], ['#56121A', 26], ['#9E2A22', 52],
      ['#D15C20', 76], ['#E89B32', 94], ['#D88C2E', 100]
    ]
  },
  // Cold blue falling into rose, the dusk end of the day.
  twilight: {
    angle: 158,
    stops: [
      ['#041726', 0], ['#0C3A5E', 26], ['#2A5B8F', 50],
      ['#63559B', 74], ['#9E5A8B', 94], ['#8E5080', 100]
    ]
  }
};

export const STAGE_NAMES = Object.keys(STAGE_BACKDROPS);

export function getBackdrop(name) {
  return STAGE_BACKDROPS[name] || STAGE_BACKDROPS.verde;
}

export function toCssGradient(backdrop) {
  const stops = backdrop.stops.map(([color, pos]) => `${color} ${pos}%`).join(', ');

  return `linear-gradient(${backdrop.angle}deg, ${stops})`;
}

export function toCanvasGradient(ctx, width, height, backdrop) {
  // CSS measures the gradient angle clockwise from "to top", while canvas y
  // grows downward, hence the negated cosine.
  const radians = (backdrop.angle * Math.PI) / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);

  // Length of the gradient line for a box of this size at this angle.
  const length = Math.abs(width * dx) + Math.abs(height * dy);
  const cx = width / 2;
  const cy = height / 2;

  const gradient = ctx.createLinearGradient(
    cx - (dx * length) / 2,
    cy - (dy * length) / 2,
    cx + (dx * length) / 2,
    cy + (dy * length) / 2
  );

  backdrop.stops.forEach(([color, pos]) => gradient.addColorStop(pos / 100, color));

  return gradient;
}
