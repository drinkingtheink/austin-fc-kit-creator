import { toCanvasGradient } from './stageBackdrops.js';
import { paintStars } from './stars.js';

// Portrait, sized to suit a tall subject and the social posts the app asks for.
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 1600;

// Fraction of the canvas the kit may occupy, leaving a margin on each side.
const FIT_WIDTH = 0.78;
const FIT_HEIGHT = 0.86;

// Matches .stadium-stage in App.vue. Both values are repainted here rather
// than read off the element, because the exporter strips the root's own style
// before serializing it, so they have to be stated twice. Change one and
// change the other.
const STADIUM_OPACITY = 0.34;
const STADIUM_FILTER = 'saturate(0.7)';

// The caption along the foot of the download.
//
// 'Bungee Inline' is --font-display in App.vue, the face the wordmark and the
// modal title are set in. The stack behind it matches that variable, so a
// browser without the web font falls back the same way the page does.
//
// The kit lands 112px clear of the bottom edge (FIT_HEIGHT against the
// canvas), which is the room this has to sit in.
const CAPTION_TEXT = 'AUSTIN FC KIT CREATOR';
const CAPTION_STACK = "'Bungee Inline', system-ui, sans-serif";
const CAPTION_SIZE = 42;
const CAPTION_BASELINE_GAP = 54;
const CAPTION_MAX_WIDTH = 0.8;

// Everything that decides how a shape is painted. Most of the kit sets `fill`
// inline, but ~124 elements take theirs from Kit.vue's *scoped* classes, which
// do not survive serialization — the shapes would come out unpainted.
const PAINT_PROPS = [
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'display',
  'transform'
];

// Values worth omitting: they are the default, so writing them only bloats the
// markup.
const SKIP_VALUES = new Set(['', 'none', 'normal', 'auto']);
const OPACITY_PROPS = new Set(['opacity', 'fill-opacity', 'stroke-opacity']);

function shouldSkip(prop, value) {
  if (!value) return true;

  // A paint server reference, e.g. fill="url(#kitRound)" on the shading layer.
  // The element already carries it as an attribute, and round-tripping it
  // through a style attribute means serializing nested quotes for no gain.
  if (value.includes('url(')) return true;

  // `display` is the one property where "none" is the whole point: v-show hides
  // the twelve unselected shirt patterns and the sock hoops that way, and this
  // function's caller overwrites the inline style that carried it. Dropping it
  // renders every pattern stacked on top of the selected one.
  if (prop === 'display') return value !== 'none';

  // `transform: none` as an inline style would override an element's own
  // transform="..." attribute, so only carry a real one.
  if (prop === 'transform') return value === 'none';

  if (SKIP_VALUES.has(value)) return true;
  if (OPACITY_PROPS.has(prop) && value === '1') return true;

  return false;
}

function inlinePaint(source, clone) {
  const sourceNodes = [source, ...source.querySelectorAll('*')];
  const cloneNodes = [clone, ...clone.querySelectorAll('*')];

  sourceNodes.forEach((node, i) => {
    const target = cloneNodes[i];

    if (!target) return;

    // Never restyle the contents of <defs>. Gradients, their stops, patterns
    // and clip paths are definitions rather than drawn output, and computing a
    // style for something that is never rendered can hand back `display: none`
    // — which, written back as an inline style, silently empties the gradient.
    // Both lists stay full so the index pairing holds.
    if (node.closest('defs')) return;

    const computed = window.getComputedStyle(node);
    const declarations = [];

    PAINT_PROPS.forEach(prop => {
      const value = computed.getPropertyValue(prop);

      if (!shouldSkip(prop, value)) {
        declarations.push(`${prop}:${value}`);
      }
    });

    // Computed style already accounts for whatever was inline, so this replaces
    // rather than merges.
    if (declarations.length) {
      target.setAttribute('style', declarations.join(';'));
    } else {
      target.removeAttribute('style');
    }
  });
}

/**
 * Rasterizes a live SVG element at a given pixel size, carrying across the
 * styling it inherits from scoped CSS.
 */
/**
 * Drops comment nodes from a clone before it is serialized.
 *
 * XML forbids a double hyphen inside a comment, and this codebase writes `--`
 * as a dash everywhere. Vue keeps template comments in the DOM in development
 * and strips them in a production build, so one em-dash in an SVG comment
 * takes down every export in dev and none in prod -- a difference nobody
 * should have to find twice. Comments do not render, so the PNG loses nothing
 * and the data URL gets shorter.
 */
function stripComments(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments = [];

  while (walker.nextNode()) comments.push(walker.currentNode);

  comments.forEach(comment => comment.remove());
}

/**
 * Drops anything marked as belonging to the screen alone.
 *
 * The escape hatch for decoration that must not be in the PNG. `filter` is
 * already outside PAINT_PROPS, which covers an effect built purely on a
 * drop-shadow, but it does not cover one that has to turn an element on to
 * have something to light: the crowd's camera flashes animate opacity, and
 * opacity the exporter does carry. The stadium is not covered by the freeze
 * the kit gets, so without this a capture landing inside a flash would bake a
 * lit figure in, and two exports of one kit would differ.
 */
function stripScreenOnly(root) {
  root.querySelectorAll('[data-screen-only]').forEach(node => node.remove());
}

function svgToImage(svgEl, width, height) {
  const clone = svgEl.cloneNode(true);

  // Before the pairing below, though it would hold either way: comments are
  // never returned by querySelectorAll('*').
  stripComments(clone);

  inlinePaint(svgEl, clone);

  // After the pairing above, and it has to be: inlinePaint walks the source
  // and the clone by index, so dropping a node from one list first would
  // shift every element after it onto the wrong fill.
  stripScreenOnly(clone);

  // The root's own computed style describes how the element sits on the page —
  // drop shadow, scale, the float animation, the stadium's 34% opacity. None of
  // that should be baked into the bitmap; the canvas composites it instead.
  clone.removeAttribute('style');
  clone.removeAttribute('class');

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('width', width);
  clone.setAttribute('height', height);

  const markup = new XMLSerializer().serializeToString(clone);

  // A data URL rather than a blob URL: Safari has historically been unreliable
  // about drawing blob-backed SVGs to a canvas.
  return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);
}

/** Scales to cover the box, cropping the overflow, and centers the result. */
function coverRect(srcWidth, srcHeight, boxWidth, boxHeight) {
  const scale = Math.max(boxWidth / srcWidth, boxHeight / srcHeight);
  const width = Math.round(srcWidth * scale);
  const height = Math.round(srcHeight * scale);

  return {
    width,
    height,
    x: Math.round((boxWidth - width) / 2),
    y: Math.round((boxHeight - height) / 2)
  };
}

/** Mirrors the .stage-scrim vignette so exports read like the app. */
function paintVignette(ctx, width, height) {
  const radial = ctx.createRadialGradient(
    width * 0.38, height * 0.45, 0,
    width * 0.38, height * 0.45, Math.max(width, height) * 0.72
  );

  radial.addColorStop(0, 'rgba(4, 6, 5, 0)');
  radial.addColorStop(1, 'rgba(4, 6, 5, 0.55)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  const bottom = ctx.createLinearGradient(0, height, 0, height * 0.68);

  bottom.addColorStop(0, 'rgba(4, 6, 5, 0.5)');
  bottom.addColorStop(1, 'rgba(4, 6, 5, 0)');
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 0, width, height);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not rasterize the kit SVG'));
    img.src = src;
  });
}

/**
 * Renders the live kit to a PNG blob on the current stage backdrop.
 *
 * @param {SVGSVGElement} kitSvg       the mounted kit
 * @param {object} backdrop            an entry from STAGE_BACKDROPS
 * @param {SVGSVGElement} [stadiumSvg] the stadium, drawn behind the kit
 * @param {boolean} [withStars]        paint the summer-night sky's stars
 * @returns {Promise<Blob>}
 */
export async function kitToPngBlob(kitSvg, backdrop, stadiumSvg = null, withStars = false) {
  const canvas = document.createElement('canvas');

  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = toCanvasGradient(ctx, OUTPUT_WIDTH, OUTPUT_HEIGHT, backdrop);
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  // Above the sky, behind the stands, exactly as the page stacks them.
  // Positions come from stars.js rather than being re-rolled here, so the
  // export cannot end up painting a different sky from the one on screen.
  if (withStars) {
    paintStars(ctx, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  }

  if (stadiumSvg) {
    await paintStadium(ctx, stadiumSvg);
  }

  paintVignette(ctx, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  await paintKit(ctx, kitSvg);
  await paintCaption(ctx, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      blob ? resolve(blob) : reject(new Error('Could not encode the PNG'));
    }, 'image/png');
  });
}

async function paintStadium(ctx, stadiumSvg) {
  const viewBox = stadiumSvg.viewBox.baseVal;
  const rect = coverRect(viewBox.width, viewBox.height, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  let image;

  try {
    image = await svgToImage(stadiumSvg, rect.width, rect.height);
  } catch (err) {
    // The backdrop is decoration. If it will not rasterize, the gradient
    // behind it is still a perfectly good background.
    //
    // Say so, though. Swallowing this silently once hid a stadium that had
    // stopped exporting entirely: an XML comment containing a doubled hyphen
    // made the serialized SVG unparseable, and the only symptom was a PNG
    // with no stands in it.
    console.warn('[kit-export] stadium backdrop skipped', err);
    return;
  }

  ctx.save();
  // ctx.filter is unsupported on some older Safari builds, where it is simply
  // ignored; there the exported backdrop comes out brighter than the screen.
  ctx.globalAlpha = STADIUM_OPACITY;
  ctx.filter = STADIUM_FILTER;
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

async function paintKit(ctx, kitSvg) {
  const viewBox = kitSvg.viewBox.baseVal;

  // How large the kit will be drawn, so the SVG can be decoded at exactly that
  // size. Decoding at its natural size and letting drawImage scale up would
  // cost resolution for no reason.
  const scale = Math.min(
    (OUTPUT_WIDTH * FIT_WIDTH) / viewBox.width,
    (OUTPUT_HEIGHT * FIT_HEIGHT) / viewBox.height
  );
  const width = Math.round(viewBox.width * scale);
  const height = Math.round(viewBox.height * scale);
  const image = await svgToImage(kitSvg, width, height);

  ctx.save();
  // Lifts the kit off the backdrop, as .kit-display does on the page.
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = Math.round(OUTPUT_WIDTH * 0.04);
  ctx.shadowOffsetY = Math.round(OUTPUT_HEIGHT * 0.015);
  ctx.drawImage(
    image,
    Math.round((OUTPUT_WIDTH - width) / 2),
    Math.round((OUTPUT_HEIGHT - height) / 2),
    width,
    height
  );
  ctx.restore();
}

/**
 * Writes the app's name across the foot of the image.
 *
 * The font has to be asked for before it can be drawn. A canvas given a web
 * font it has not loaded does not fail: fillText quietly paints the fallback
 * and the PNG comes out in the wrong face, with nothing anywhere to say so.
 * document.fonts.load settles that, and the check afterwards is there because
 * the only other way to find out is to look at the file.
 */
async function paintCaption(ctx, width, height) {
  const face = `${CAPTION_SIZE}px 'Bungee Inline'`;

  try {
    await document.fonts.load(face, CAPTION_TEXT);
  } catch {
    // Not fatal. The fallback stack still puts the words on the image.
  }

  if (!document.fonts.check(face, CAPTION_TEXT)) {
    console.warn('[kit-export] Bungee Inline unavailable; caption fell back');
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // Chrome and recent Safari only; elsewhere it is ignored and the caption
  // simply sits tighter. measureText below accounts for it where it applies.
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0.06em';

  // Shrink to fit rather than run off the edge. Bungee Inline is wide, the
  // fallback faces are not, and a caption that overflows on one machine and
  // not another is worse than one a point smaller everywhere.
  let size = CAPTION_SIZE;

  ctx.font = `${size}px ${CAPTION_STACK}`;

  while (size > 12 && ctx.measureText(CAPTION_TEXT).width > width * CAPTION_MAX_WIDTH) {
    size -= 1;
    ctx.font = `${size}px ${CAPTION_STACK}`;
  }

  // The vignette already darkens this edge, but the sky behind it is a
  // different colour in each of the six settings, so the caption carries its
  // own shadow rather than trusting any one of them.
  ctx.shadowColor = 'rgba(4, 6, 5, 0.55)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillText(CAPTION_TEXT, width / 2, height - CAPTION_BASELINE_GAP);
  ctx.restore();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Give the download a tick to start before the URL goes away.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
