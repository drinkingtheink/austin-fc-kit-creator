// Where the tour's bubble goes, given what it is pointing at.
//
// Split out of GuidedTour.vue and kept free of the DOM so it can be checked
// under plain node, the way colorTools.js is. Placement is the part of a tour
// most likely to be wrong at a window size nobody tried, and the part least
// likely to be noticed when it is: a bubble half off the bottom of a laptop
// screen still looks like a bubble in a screenshot taken on a desktop.
//
// Everything here takes plain rectangles — { top, left, width, height } — so
// the caller does the getBoundingClientRect and this does the arithmetic.

// How far the bubble sits from the thing it points at, and from the edges of
// the window. The gap leaves room for the arrow; the margin stops a bubble
// touching the edge, which reads as clipped even when it is not.
const GAP = 14;
const MARGIN = 12;

/** Sides to try, in order, for a given preference. First that fits wins. */
const FALLBACKS = {
  bottom: ['bottom', 'top', 'right', 'left'],
  top: ['top', 'bottom', 'right', 'left'],
  right: ['right', 'left', 'bottom', 'top'],
  left: ['left', 'right', 'bottom', 'top']
};

function clamp(value, low, high) {
  // When the bubble is wider than the space, low can exceed high. Returning
  // low rather than high keeps it against the left or top edge, where the
  // text starts, instead of the right or bottom where it would be cut off.
  if (low > high) return low;

  return Math.min(Math.max(value, low), high);
}

/** The bubble on one side of the target, centred along it, before clamping. */
function place(side, target, bubble) {
  const midX = target.left + target.width / 2 - bubble.width / 2;
  const midY = target.top + target.height / 2 - bubble.height / 2;

  switch (side) {
    case 'top':
      return { top: target.top - bubble.height - GAP, left: midX };
    case 'bottom':
      return { top: target.top + target.height + GAP, left: midX };
    case 'left':
      return { top: midY, left: target.left - bubble.width - GAP };
    default:
      return { top: midY, left: target.left + target.width + GAP };
  }
}

function fits(pos, bubble, view) {
  return (
    pos.top >= MARGIN &&
    pos.left >= MARGIN &&
    pos.top + bubble.height <= view.height - MARGIN &&
    pos.left + bubble.width <= view.width - MARGIN
  );
}

/**
 * Decide where to put the bubble.
 *
 * Tries the preferred side, then the opposite, then the two perpendicular
 * ones, and takes the first that fits the viewport whole. If none do — a
 * target in a corner of a short window, say — it keeps the preferred side and
 * clamps, which is the least-bad answer: the bubble stays on the side the
 * step was written for and slides along rather than jumping somewhere
 * unrelated.
 *
 * Returns the side actually used as well as the position, because the arrow
 * has to point back at the target and cannot work that out for itself.
 */
export function placeBubble(target, bubble, view, preferred = 'bottom') {
  const order = FALLBACKS[preferred] || FALLBACKS.bottom;
  const chosen = order.find(side => fits(place(side, target, bubble), bubble, view));
  const side = chosen || preferred;
  const pos = place(side, target, bubble);

  return {
    side,
    // Clamped whether or not a side fitted. A side that "fits" by the test
    // above is already inside the margins, so clamping is a no-op for it.
    top: Math.round(clamp(pos.top, MARGIN, view.height - bubble.height - MARGIN)),
    left: Math.round(clamp(pos.left, MARGIN, view.width - bubble.width - MARGIN)),
    fitted: Boolean(chosen)
  };
}

/**
 * Where the arrow sits along the bubble's edge, as a fraction from 0 to 1.
 *
 * The bubble gets clamped away from the target to stay on screen, and when it
 * does the arrow has to move the other way or it points at nothing. This is
 * the difference between the target's centre and the bubble's, expressed
 * along whichever edge faces the target.
 *
 * Held back from the very corners, where an arrow overlaps the bubble's own
 * rounded edge and stops looking like it is attached to anything.
 */
export function arrowOffset(side, target, bubble, pos) {
  const along = side === 'top' || side === 'bottom'
    ? (target.left + target.width / 2 - pos.left) / bubble.width
    : (target.top + target.height / 2 - pos.top) / bubble.height;

  return +clamp(along, 0.12, 0.88).toFixed(4);
}

/**
 * Is the target worth pointing at?
 *
 * A step whose target has been scrolled out of the toolbar, or collapsed to
 * nothing by a closed drawer, should be skipped rather than pointed at. Zero
 * sizes come back from display:none and from elements inside a collapsed
 * section, both of which happen here.
 */
export function isUsableTarget(target, view) {
  if (!target || target.width <= 0 || target.height <= 0) return false;

  return (
    target.top < view.height &&
    target.left < view.width &&
    target.top + target.height > 0 &&
    target.left + target.width > 0
  );
}
