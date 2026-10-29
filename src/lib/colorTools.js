// Color math for the palette tools: normalizing what a person types, turning
// one color into a set that holds together, and judging whether two of them
// can sit on top of each other.

/**
 * Resolves anything CSS understands to #RRGGBB — "rebeccapurple", "#0b1",
 * "rgb(0 177 64)". The palette has always accepted named colors, but the
 * harmony math needs channels, so everything funnels through here first.
 *
 * Canvas does the parsing: assigning an invalid fillStyle leaves the previous
 * value in place, which doubles as the validity check.
 */
let probe = null;

export function toHex(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  if (!probe) {
    probe = document.createElement('canvas').getContext('2d');
  }

  // Two different sentinels, so a color that genuinely *is* one of them still
  // reads as valid rather than looking like a rejected assignment.
  probe.fillStyle = '#000000';
  probe.fillStyle = value;
  const first = probe.fillStyle;

  probe.fillStyle = '#FFFFFF';
  probe.fillStyle = value;

  if (probe.fillStyle !== first) return null;

  // Canvas yields #rrggbb for opaque colors, rgba(...) when there is alpha.
  return first.startsWith('#') ? first.toUpperCase() : null;
}

export function isValidColor(value) {
  return toHex(value) !== null;
}

function toRgb(hex) {
  const n = parseInt(hex.slice(1), 16);

  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fromRgb(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const hex = (clamp(r) << 16) | (clamp(g) << 8) | clamp(b);

  return `#${hex.toString(16).padStart(6, '0').toUpperCase()}`;
}

/** @returns {[number, number, number]} hue 0-360, saturation and lightness 0-1. */
export function toHsl(hex) {
  const [r, g, b] = toRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const span = max - min;
  const l = (max + min) / 2;

  if (!span) return [0, 0, l];

  const s = l > 0.5 ? span / (2 - max - min) : span / (max + min);
  let h;

  if (max === r) h = ((g - b) / span) % 6;
  else if (max === g) h = (b - r) / span + 2;
  else h = (r - g) / span + 4;

  return [((h * 60) + 360) % 360, s, l];
}

export function fromHsl(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(1, s));
  const light = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;

  const seg = Math.floor(hue / 60) % 6;
  const [r, g, b] = [
    [c, x, 0], [x, c, 0], [0, c, x],
    [0, x, c], [x, 0, c], [c, 0, x]
  ][seg];

  return fromRgb((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/**
 * Sets built by rotating hue around the base. Each returns the base first, so
 * a caller can show the whole set as a strip and still know where it started.
 */
export const HARMONIES = [
  { id: 'complement', name: 'Complement', offsets: [0, 180] },
  { id: 'analogous', name: 'Analogous', offsets: [0, -30, 30, -60, 60] },
  { id: 'triad', name: 'Triad', offsets: [0, 120, 240] },
  { id: 'split', name: 'Split', offsets: [0, 150, 210] },
  { id: 'tetrad', name: 'Tetrad', offsets: [0, 90, 180, 270] }
];

export function harmony(baseHex, id) {
  const set = HARMONIES.find(h => h.id === id);
  const hex = toHex(baseHex);

  if (!set || !hex) return [];

  const [h, s, l] = toHsl(hex);

  // A rotation off a grey or a near-black returns the same color every time,
  // because hue means nothing without saturation or at the ends of lightness.
  // Lift it into a range where the rotation is actually visible.
  const useS = s < 0.12 ? 0.62 : s;
  const useL = l < 0.12 || l > 0.9 ? 0.5 : l;

  return set.offsets.map(offset => fromHsl(h + offset, useS, useL));
}

/**
 * A ramp from near-black to near-white through the base color's hue. Stops at
 * 0.06 and 0.94 rather than the extremes, where every hue collapses to the
 * same black and the same white.
 */
export function ramp(baseHex, steps = 9) {
  const hex = toHex(baseHex);

  if (!hex) return [];

  const [h, s] = toHsl(hex);
  const useS = s < 0.08 ? 0 : s;

  return Array.from({ length: steps }, (_, i) =>
    fromHsl(h, useS, 0.06 + (0.88 * i) / (steps - 1))
  );
}

/**
 * The entry in `candidates` that looks closest to `target`.
 *
 * Uses the "redmean" weighting rather than plain RGB distance: it costs two
 * multiplications more and is far better at not calling a saturated red the
 * nearest match for a mid grey.
 */
export function nearest(target, candidates) {
  const hex = toHex(target);

  if (!hex || !candidates.length) return target;

  const [r1, g1, b1] = toRgb(hex);
  let best = candidates[0];
  let bestDistance = Infinity;

  candidates.forEach(candidate => {
    const other = toHex(candidate);

    if (!other) return;

    const [r2, g2, b2] = toRgb(other);
    const rMean = (r1 + r2) / 2;
    const dR = r1 - r2;
    const dG = g1 - g2;
    const dB = b1 - b2;
    const distance =
      (((512 + rMean) * dR * dR) / 256) +
      4 * dG * dG +
      (((767 - rMean) * dB * dB) / 256);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  });

  return best;
}

/** WCAG relative luminance. */
export function luminance(hex) {
  const [r, g, b] = toRgb(hex).map(v => {
    const c = v / 255;

    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function contrast(a, b) {
  const hexA = toHex(a);
  const hexB = toHex(b);

  if (!hexA || !hexB) return 1;

  const lumA = luminance(hexA);
  const lumB = luminance(hexB);

  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

/**
 * Black or white, whichever is actually readable on the given background.
 *
 * Decided by comparing both contrast ratios rather than by a luminance
 * threshold. A guessed threshold is easy to get wrong -- at 0.45 this picked
 * white for Austin FC's own verde, which scores 2.9 against white and 7.4
 * against black.
 */
export function readableInk(hex) {
  const resolved = toHex(hex);

  if (!resolved) return '#FFFFFF';

  return contrast(resolved, '#000000') >= contrast(resolved, '#FFFFFF')
    ? '#000000'
    : '#FFFFFF';
}
