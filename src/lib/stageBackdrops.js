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
// Three game days, and all three deliberately stay off green. The stadium
// composites at 34%, so most of what fills the screen is this gradient: a
// green sky made the whole frame green, and a kit is mostly shown off by what
// it is not. Azure, then magenta burning to gold, then indigo -- each a long
// way round the wheel from verde, so a verde kit reads against any of them and
// a red or a white one does too.
//
// There were six before, including a green one called `verde` that was the
// house mood and the reason the app looked tinted.

export const STAGE_BACKDROPS = {
  // Kick-off under a hard noon sky: azure overhead, bleaching toward the
  // horizon the way a bright day does. The lightest of the three, and the one
  // that tests whether the kit is still the brightest thing on screen -- the
  // pale band is kept low, behind the stands, for that reason.
  midday: {
    angle: 168,
    stops: [
      ['#0C58AE', 0], ['#2E8AD8', 22], ['#62AEE8', 45],
      ['#9ED3F2', 68], ['#D6EDFA', 90], ['#C3E2F3', 100]
    ]
  },
  // Violet into magenta into Texas gold. Magenta sits opposite green, which
  // is what makes a verde kit sing against it.
  sunset: {
    angle: 168,
    stops: [
      ['#2B0B4E', 0], ['#631571', 20], ['#B02A6D', 42],
      ['#E64A33', 64], ['#FF8E2A', 86], ['#F07A1C', 100]
    ]
  },
  // Spring, not deep summer: light still in it rather than a flat black, and
  // violet rather than blue. Blue would be the obvious night sky and the
  // wrong one here -- the midday above is already azure, and two skies that
  // are both blue are two skies nobody can tell apart from across the room.
  // Violet also leaves the pitch, which the stadium lays over all three in
  // green at 34%, reading as something other than teal. The only one with
  // stars.
  springNight: {
    angle: 172,
    stars: true,
    stops: [
      ['#0A0A2E', 0], ['#1A1559', 22], ['#341E8C', 46],
      ['#5A2E9E', 68], ['#7B3FA8', 90], ['#6A3598', 100]
    ]
  }
};

export const STAGE_NAMES = Object.keys(STAGE_BACKDROPS);

export function getBackdrop(name) {
  return STAGE_BACKDROPS[name] || STAGE_BACKDROPS.midday;
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
