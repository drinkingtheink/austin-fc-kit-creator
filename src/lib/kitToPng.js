import { toCanvasGradient } from './stageBackdrops.js';

// Portrait, sized to suit a tall subject and the social posts the app asks for.
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 1600;

// Fraction of the canvas the kit may occupy, leaving a margin on each side.
const FIT_WIDTH = 0.78;
const FIT_HEIGHT = 0.86;

// Matches .stadium-stage in App.vue.
const STADIUM_OPACITY = 0.34;

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
function svgToImage(svgEl, width, height) {
  const clone = svgEl.cloneNode(true);

  inlinePaint(svgEl, clone);

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
 * @returns {Promise<Blob>}
 */
export async function kitToPngBlob(kitSvg, backdrop, stadiumSvg = null) {
  const canvas = document.createElement('canvas');

  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = toCanvasGradient(ctx, OUTPUT_WIDTH, OUTPUT_HEIGHT, backdrop);
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  if (stadiumSvg) {
    await paintStadium(ctx, stadiumSvg);
  }

  paintVignette(ctx, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  await paintKit(ctx, kitSvg);

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
  } catch {
    // The backdrop is decoration. If it will not rasterize, the gradient
    // behind it is still a perfectly good background.
    return;
  }

  ctx.save();
  // Matches .stadium-stage: opacity .34, filter saturate(.7). ctx.filter is
  // unsupported on some older Safari builds, where it is simply ignored.
  ctx.globalAlpha = STADIUM_OPACITY;
  ctx.filter = 'saturate(0.7)';
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
