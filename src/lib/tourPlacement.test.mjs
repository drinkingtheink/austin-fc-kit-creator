/**
 * Checks for the tour's placement maths in tourPlacement.js.
 *
 *   npm run test:tour          (or: node src/lib/tourPlacement.test.mjs)
 *
 * Dependency-free, like colorTools.test.mjs: plain node, exits non-zero if
 * anything fails. This one needs no browser stub at all, which is the reason
 * the maths was split out of the component in the first place.
 *
 * What is worth checking here is the awkward cases, not the happy one. A
 * bubble below a target in the middle of a big window is never the bug. The
 * bug is the bubble that runs off the bottom of a short window, or the arrow
 * still pointing at the middle after the bubble has been shoved sideways.
 */

import { placeBubble, arrowOffset, isUsableTarget } from './tourPlacement.js';

let checks = 0;
let failures = 0;

function check(label, passed, detail = '') {
  checks += 1;

  if (!passed) {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? `  (${detail})` : ''}`);
  }
}

function group(name) {
  console.log(`\n${name}`);
}

const VIEW = { width: 1200, height: 800 };
const BUBBLE = { width: 320, height: 160 };
const rect = (left, top, width, height) => ({ left, top, width, height });

// A target in open space, well away from every edge.
const MIDDLE = rect(500, 350, 100, 50);

// ---- the preferred side ---------------------------------------------------
group('preferred side');

const below = placeBubble(MIDDLE, BUBBLE, VIEW, 'bottom');
check('takes the side asked for when it fits', below.side === 'bottom', below.side);
check('reports that it fitted', below.fitted === true);
check('sits under the target', below.top === 350 + 50 + 14, below.top);
check('centres along it', below.left === 500 + 50 - 160, below.left);

const right = placeBubble(MIDDLE, BUBBLE, VIEW, 'right');
check('right means right', right.side === 'right', right.side);
check('clears the target horizontally', right.left === 500 + 100 + 14, right.left);

// ---- falling back ---------------------------------------------------------
group('falling back');

// Hard against the bottom: below has nowhere to go, above does.
const low = rect(500, 760, 100, 30);
const flipped = placeBubble(low, BUBBLE, VIEW, 'bottom');
check('flips to the opposite side', flipped.side === 'top', flipped.side);
check('and that one fitted', flipped.fitted === true);
check('sits above the target', flipped.top + BUBBLE.height <= 760 - 14 + 1, flipped.top);

// Hard against the right: neither left nor right has room for 320px, so it
// should come to rest on one of the perpendicular sides instead.
const far = rect(1150, 350, 40, 40);
const sideways = placeBubble(far, BUBBLE, VIEW, 'right');
check('gives up on a side with no room', sideways.side !== 'right', sideways.side);
check('stays inside the window', sideways.left + BUBBLE.width <= VIEW.width - 12, sideways.left);

// ---- nowhere fits ---------------------------------------------------------
group('when nothing fits');

const tiny = { width: 360, height: 200 };
const corner = rect(10, 10, 20, 20);
const squeezed = placeBubble(corner, BUBBLE, tiny, 'bottom');
check('keeps the side it was asked for', squeezed.side === 'bottom', squeezed.side);
check('says it did not fit', squeezed.fitted === false);
check('clamps to the top margin rather than going negative', squeezed.top >= 12, squeezed.top);
check('clamps to the left margin', squeezed.left >= 12, squeezed.left);

// A bubble wider than the window at all: low > high inside the clamp. It
// should pin to the near edge, where the text begins, not the far one.
const narrow = { width: 200, height: 600 };
const pinned = placeBubble(corner, BUBBLE, narrow, 'bottom');
check('pins to the near edge when wider than the window', pinned.left === 12, pinned.left);

// ---- the arrow ------------------------------------------------------------
group('arrow');

check(
  'points at the middle when the bubble is centred',
  Math.abs(arrowOffset('bottom', MIDDLE, BUBBLE, below) - 0.5) < 0.001,
  arrowOffset('bottom', MIDDLE, BUBBLE, below)
);

// Target near the left edge: the bubble clamps right of centre, so the arrow
// has to travel left to keep pointing at it.
const leftish = rect(30, 350, 60, 40);
const clamped = placeBubble(leftish, BUBBLE, VIEW, 'bottom');
const offset = arrowOffset('bottom', leftish, BUBBLE, clamped);
check('moves toward the target when the bubble is clamped', offset < 0.5, offset);
check('never reaches the corner', offset >= 0.12, offset);

const rightish = rect(1130, 350, 60, 40);
const clampedRight = placeBubble(rightish, BUBBLE, VIEW, 'bottom');
const offsetRight = arrowOffset('bottom', rightish, BUBBLE, clampedRight);
check('and the other way', offsetRight > 0.5, offsetRight);
check('still short of the corner', offsetRight <= 0.88, offsetRight);

// ---- usable targets -------------------------------------------------------
group('usable targets');

check('a normal target is usable', isUsableTarget(MIDDLE, VIEW));
check('nothing is not', isUsableTarget(null, VIEW) === false);
check(
  'a collapsed drawer gives zero height, which is not usable',
  isUsableTarget(rect(500, 350, 120, 0), VIEW) === false
);
check(
  'display:none gives zero on both, also not usable',
  isUsableTarget(rect(0, 0, 0, 0), VIEW) === false
);
check(
  'scrolled off the top is not usable',
  isUsableTarget(rect(500, -80, 100, 40), VIEW) === false
);
check(
  'scrolled off the bottom is not usable',
  isUsableTarget(rect(500, 900, 100, 40), VIEW) === false
);
check(
  'half on screen still counts',
  isUsableTarget(rect(500, -10, 100, 40), VIEW) === true
);

// ---- result ---------------------------------------------------------------
console.log(
  failures
    ? `\n${failures} of ${checks} checks FAILED`
    : `\nall ${checks} checks passed`
);

process.exitCode = failures ? 1 : 0;
