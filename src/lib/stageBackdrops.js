// The four dusk moods behind the kit. Kept here rather than in CSS because the
// PNG export has to paint the same gradient onto a canvas, and two copies of
// these numbers would drift apart.

export const STAGE_BACKDROPS = {
  one: { angle: 165, stops: [['#1B1035', 0], ['#3D2A6B', 48], ['#A8458A', 100]] },
  two: { angle: 165, stops: [['#2A1206', 0], ['#8A3B12', 52], ['#DB9A3C', 100]] },
  three: { angle: 165, stops: [['#04171C', 0], ['#0E4A52', 50], ['#3C8A88', 100]] },
  four: { angle: 165, stops: [['#04150B', 0], ['#0B4A24', 52], ['#00B140', 100]] }
};

export const STAGE_NAMES = Object.keys(STAGE_BACKDROPS);

export function getBackdrop(name) {
  return STAGE_BACKDROPS[name] || STAGE_BACKDROPS.four;
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
