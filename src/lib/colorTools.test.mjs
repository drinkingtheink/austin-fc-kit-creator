/**
 * Checks for the colour maths in colorTools.js.
 *
 *   npm run test:colors        (or: node src/lib/colorTools.test.mjs)
 *
 * Deliberately dependency-free: the project has no test runner, and this needs
 * none. Plain node, exits non-zero if anything fails.
 *
 * One honest limitation. toHex() parses colours by assigning them to a canvas
 * fillStyle, which does not exist outside a browser, so the stub below stands
 * in for it. The stub only understands the handful of forms these checks use —
 * six-digit hex, three-digit hex, and three named colours. So what follows
 * exercises the *maths* built on toHex, not the browser's colour parser. That
 * is where the bugs have actually been: readableInk once picked white for
 * Austin FC's own verde, which scores 2.9 against white and 7.4 against black.
 */

const NAMED = { rebeccapurple: '#663399', white: '#ffffff', black: '#000000' };

globalThis.document = {
  createElement: () => ({
    getContext: () => ({
      set fillStyle(value) {
        if (typeof value !== 'string') return;

        let candidate = value.trim().toLowerCase();

        if (NAMED[candidate]) candidate = NAMED[candidate];

        if (/^#[0-9a-f]{3}$/.test(candidate)) {
          candidate = `#${[...candidate.slice(1)].map(c => c + c).join('')}`;
        }

        // Anything it does not recognise leaves the previous value in place,
        // which is exactly how a real canvas rejects an invalid colour.
        if (/^#[0-9a-f]{6}$/.test(candidate)) this._value = candidate;
      },
      get fillStyle() {
        return this._value;
      }
    })
  })
};

const {
  toHex, toHsl, fromHsl, harmony, ramp, luminance, contrast, readableInk, nearest
} = await import('./colorTools.js');

let failures = 0;
let checks = 0;

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

// ---- toHex ---------------------------------------------------------------
group('toHex');
check('six-digit hex passes through', toHex('#00B140') === '#00B140');
check('named colour resolves', toHex('rebeccapurple') === '#663399', toHex('rebeccapurple'));
check('three-digit hex expands', toHex('#0b1') === '#00BB11', toHex('#0b1'));
check('black is valid, not falsy', toHex('black') === '#000000', toHex('black'));
check('white is valid', toHex('white') === '#FFFFFF', toHex('white'));
check('garbage is rejected', toHex('not-a-colour') === null, String(toHex('not-a-colour')));

// ---- HSL round trip ------------------------------------------------------
group('HSL round trip');
let worstDrift = 0;

for (const hex of ['#00B140', '#663399', '#FFFFFF', '#000000', '#808080', '#EF0107', '#063672', '#F0BC42']) {
  const [h, s, l] = toHsl(hex);
  const back = fromHsl(h, s, l);
  const drift = Math.max(...[1, 3, 5].map(i =>
    Math.abs(parseInt(hex.slice(i, i + 2), 16) - parseInt(back.slice(i, i + 2), 16))));

  worstDrift = Math.max(worstDrift, drift);
}

check('survives a round trip within 1/255', worstDrift <= 1, `worst drift ${worstDrift}`);

// ---- harmony -------------------------------------------------------------
group('harmony');
const complement = harmony('#00B140', 'complement');

check('returns the base first', complement[0] === '#00B140', complement.join(' '));
check(
  'complement sits opposite the base hue',
  Math.abs(((toHsl(complement[1])[0] - 180 + 360) % 360) - toHsl('#00B140')[0]) < 1,
  complement.join(' ')
);
check('triad returns three', harmony('#00B140', 'triad').length === 3);

// Hue is meaningless without saturation, and at the ends of lightness. Both
// get lifted into a visible range first, or every scheme returns one colour
// repeated.
check(
  'a grey base still produces distinct colours',
  new Set(harmony('#808080', 'triad')).size === 3,
  harmony('#808080', 'triad').join(' ')
);
check(
  'a black base still produces distinct colours',
  new Set(harmony('#000000', 'analogous')).size === 5,
  harmony('#000000', 'analogous').join(' ')
);

// ---- ramp ----------------------------------------------------------------
group('ramp');
const verdeRamp = ramp('#00B140');

check('has nine steps', verdeRamp.length === 9);
check(
  'runs dark to light',
  luminance(verdeRamp[0]) < luminance(verdeRamp[4]) && luminance(verdeRamp[4]) < luminance(verdeRamp[8])
);
check(
  'a grey ramp stays grey rather than acquiring a hue',
  ramp('#808080').every(c => c[1] === c[3] && c[3] === c[5]),
  ramp('#808080').join(' ')
);

// ---- contrast ------------------------------------------------------------
group('contrast');
check('black on white is 21:1', Math.round(contrast('#000000', '#FFFFFF')) === 21, String(contrast('#000', '#fff')));
check('a colour against itself is 1:1', Math.round(contrast('#00B140', '#00B140')) === 1);

// The bug this file was written for: a luminance threshold put white here.
check('readable ink on verde is black', readableInk('#00B140') === '#000000', readableInk('#00B140'));
check('readable ink on navy is white', readableInk('#063672') === '#FFFFFF');

// ---- nearest -------------------------------------------------------------
group('nearest');
const dortmund = ['#FDE100', '#000000'];

check('white maps to the yellow', nearest('#FFFFFF', dortmund) === '#FDE100', nearest('#FFFFFF', dortmund));
check('black maps to the black', nearest('#000000', dortmund) === '#000000');
check('verde maps to the black', nearest('#00B140', dortmund) === '#000000', nearest('#00B140', dortmund));
check('an exact match wins', nearest('#FDE100', dortmund) === '#FDE100');
check('mid grey picks one of the two', ['#000000', '#FDE100'].includes(nearest('#CCCCCC', dortmund)));
check('a named target is resolved first', nearest('white', dortmund) === '#FDE100');
check('an empty palette returns the target untouched', nearest('#123456', []) === '#123456');

// Redmean weighting, rather than plain RGB distance, is what keeps these two
// from crossing over.
const arsenal = ['#EF0107', '#063672', '#FFFFFF', '#000000', '#9C824A'];

check('a near red finds the red', nearest('#DD1111', arsenal) === '#EF0107', nearest('#DD1111', arsenal));
check('a near navy finds the navy', nearest('#0A2550', arsenal) === '#063672', nearest('#0A2550', arsenal));

// ---- result --------------------------------------------------------------
console.log(
  failures
    ? `\n${failures} of ${checks} checks FAILED`
    : `\nall ${checks} checks passed`
);

process.exitCode = failures ? 1 : 0;
