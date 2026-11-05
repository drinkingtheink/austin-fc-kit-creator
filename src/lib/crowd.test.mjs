/**
 * Checks for the generated crowd in crowd.js.
 *
 *   npm run test:crowd         (or: node src/lib/crowd.test.mjs)
 *
 * Dependency-free, like colorTools.test.mjs and tourPlacement.test.mjs:
 * plain node, exits non-zero if anything fails. crowd.js needs no browser
 * stub -- it is arithmetic over a seeded stream that happens to come out as
 * circles.
 *
 * What is worth checking here is not that the crowd looks right; nothing in
 * node can tell you that. It is the invariants that are invisible on screen
 * and expensive to lose:
 *
 *   - Determinism. The PNG exporter repaints this same markup, so a crowd
 *     that reshuffled between renders would export a different stand than
 *     the one on screen. stars.js is seeded for the same reason.
 *   - The shifts staying inside the bargain they were written under: only
 *     the unfiltered decks, never two on one person, never a change into the
 *     colour that person already is.
 *   - The verde majority surviving. It is the one aesthetic property that
 *     can be stated as a number, and the thing most easily lost by editing
 *     the weights in TONES.
 */

import { CROWD_DECKS, CROWD_FLASHES, CROWD_SHIFTS } from './crowd.js';

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

const VERDE = ['#124E2A', '#0B6B36', '#1B7A4E', '#0E8C42', '#00B140', '#06C455',
  '#3E9E2E', '#6ECB3C'];

const lit = CROWD_DECKS.filter(deck => deck.flashes);
const litIds = lit.map(deck => deck.id);
const people = CROWD_DECKS.flatMap(deck => deck.people);
const share = (list, test) => list.filter(test).length / list.length;

// ---- the crowd ------------------------------------------------------------
group('the crowd');

check('every deck is populated', CROWD_DECKS.every(deck => deck.people.length > 0));
check(
  'every person has a finite position and a positive radius',
  people.every(p => Number.isFinite(p.cx) && Number.isFinite(p.cy) && p.r > 0)
);
check('every person has a fill', people.every(p => /^#[0-9A-F]{6}$/i.test(p.fill)));

// Three in five, give or take. The band is wide on purpose: this is here to
// catch the weights being rewritten into a grey crowd or a lime one, not to
// pin the exact figure, which is allowed to drift as tones are tuned.
const crowdVerde = share(people, p => VERDE.includes(p.fill));
check(
  'the crowd is a verde crowd',
  crowdVerde > 0.5 && crowdVerde < 0.72,
  `${(crowdVerde * 100).toFixed(1)}% verde`
);

// ---- determinism ----------------------------------------------------------
group('determinism');

// A second import is served from the module cache, so the real check is that
// the generator is a pure function of its seed: rebuilding has to agree with
// what was built at load. Re-importing with a cache-busting query gives a
// genuinely fresh evaluation of the module.
const again = await import('./crowd.js?fresh');

check(
  'the crowd rebuilds identically',
  JSON.stringify(again.CROWD_DECKS) === JSON.stringify(CROWD_DECKS)
);
check(
  'the flashes rebuild identically',
  JSON.stringify(again.CROWD_FLASHES) === JSON.stringify(CROWD_FLASHES)
);
check(
  'the shifts rebuild identically',
  JSON.stringify(again.CROWD_SHIFTS) === JSON.stringify(CROWD_SHIFTS)
);

// ---- camera flashes -------------------------------------------------------
group('camera flashes');

check('flashes only on decks that can carry one',
  CROWD_FLASHES.every(flash => litIds.includes(flash.deck)));
check('every flash starts part-way through its cycle',
  CROWD_FLASHES.every(flash => flash.delay <= 0));
check('a flash is wider than the person holding the phone',
  CROWD_FLASHES.every(flash => flash.r > 0));

// ---- the bustle -----------------------------------------------------------
group('the bustle');

check('there is a crowd to shift', CROWD_SHIFTS.length > 0);

// The front and spill decks render inside #front-blur. Animating anything in
// there re-runs a large blur every frame, which is the floodlight regression
// in a different costume.
check(
  'shifts stay off the filtered decks',
  CROWD_SHIFTS.every(shift => litIds.includes(shift.deck)),
  [...new Set(CROWD_SHIFTS.map(s => s.deck))].join(',')
);

// Two on one person cross-fade over each other and read as a flicker.
const seats = CROWD_SHIFTS.map(shift => `${shift.deck}:${shift.cx},${shift.cy}`);
check(
  'no two shifts share a person',
  new Set(seats).size === seats.length,
  `${seats.length - new Set(seats).size} duplicated`
);

// A shift into the colour they already are is a shift nobody can see. The
// generator drops those, so none should survive to here.
const litPeople = new Map(
  lit.flatMap(deck => deck.people.map(p => [`${deck.id}:${p.cx},${p.cy}`, p.fill]))
);
check(
  'nobody changes into the colour they already are',
  CROWD_SHIFTS.every(shift => litPeople.get(`${shift.deck}:${shift.cx},${shift.cy}`) !== shift.fill)
);

check(
  'every shift lands on somebody who is actually there',
  CROWD_SHIFTS.every(shift => litPeople.has(`${shift.deck}:${shift.cx},${shift.cy}`))
);

// Negative, and never further back than one cycle: a delay past the duration
// is the same frame as a smaller one, and hides a count being mis-scaled.
check(
  'every shift starts part-way through its own cycle',
  CROWD_SHIFTS.every(shift => shift.delay <= 0 && -shift.delay <= shift.duration)
);

// One shared duration beats across the stand however random the delays are.
check(
  'durations vary',
  new Set(CROWD_SHIFTS.map(shift => shift.duration)).size > CROWD_SHIFTS.length / 2
);
check(
  'durations are slow enough to read as people',
  CROWD_SHIFTS.every(shift => shift.duration >= 14 && shift.duration <= 26)
);

// The tone comes from the same weighted table the crowd does, so the bowl
// stays a verde bowl however long it is watched. This is the check that
// stops the bustle being decorative.
const shiftVerde = share(CROWD_SHIFTS, shift => VERDE.includes(shift.fill));
check(
  'the bustle is drawn from the same verde-majority palette',
  shiftVerde > 0.5 && shiftVerde < 0.72,
  `${(shiftVerde * 100).toFixed(1)}% verde`
);

// Density per deck should follow population, or the near corner reads as a
// busier crowd rather than a nearer one.
const litTotal = lit.reduce((sum, deck) => sum + deck.people.length, 0);
lit.forEach(deck => {
  const expected = deck.people.length / litTotal;
  const actual = share(CROWD_SHIFTS, shift => shift.deck === deck.id);

  check(
    `the ${deck.id} deck shifts in proportion to its population`,
    Math.abs(actual - expected) < 0.08,
    `${(actual * 100).toFixed(1)}% of shifts for ${(expected * 100).toFixed(1)}% of people`
  );
});

// The effect is meant to be glanced, not watched. Roughly a quarter of each
// cycle is spent visible (38%-62% of the keyframes, plus the fades), so this
// bounds how much of the stand can be mid-change at once.
const midChange = CROWD_SHIFTS.length * 0.24 / litTotal;
check(
  'the bustle stays sparse',
  midChange < 0.01,
  `about ${(midChange * 100).toFixed(2)}% of the stand mid-change`
);

// ---- result ---------------------------------------------------------------
console.log(
  failures
    ? `\n${failures} of ${checks} checks FAILED`
    : `\nall ${checks} checks passed`
);

process.exitCode = failures ? 1 : 0;
