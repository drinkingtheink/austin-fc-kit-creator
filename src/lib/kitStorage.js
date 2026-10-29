// Saves the kit being designed so a reload does not throw the work away.
//
// Stored values are treated as untrusted input, not as component state waiting
// to be spread back in. A hand-edited or half-written entry should leave the
// app on its defaults rather than render a kit with missing parts.

import { normalizeSockText } from './sockText.js';

const STORAGE_KEY = 'austinFcKitCreator:kit';

// Bump when the shape below changes; entries written by an older version are
// discarded rather than half-applied.
const VERSION = 1;

const COLOR_FIELDS = [
  'shirtFill',
  'shirtTypeFill',
  'shirtSecondaryFill',
  'shirtCuffFill',
  'shirtMakerFill',
  'shirtSleeveFill',
  'logoFill',
  'logoStrokeFill',
  'badgeFill',
  'badgeTextFill',
  'badgeBGFill',
  'collarFill',
  'shortsFill',
  'shortsCuffsFill',
  'socksFill',
  'socksCuffsFill',
  'socksHoopsFill',
  'socksTextFill',
  'numberFill'
];

const FLAG_FIELDS = ['showButtonCollar', 'socksHoops', 'logoStroke'];

const MAX_PALETTE = 64;

// Every field a saved kit carries, and the only list of them. Both halves of
// persistence read it: the component watches these for changes, and writeKit
// below copies exactly these out.
export const PERSISTED_FIELDS = [
  ...COLOR_FIELDS,
  ...FLAG_FIELDS,
  'activeShirtOption',
  'socksText',
  'setting',
  'colors'
];

// Hex, with or without alpha, or a CSS named color. Matches what the palette
// editor tells people they may enter.
const COLOR_PATTERN = /^(#[0-9a-f]{3,8}|[a-z]+)$/i;

function isColor(value) {
  return typeof value === 'string' && value.length <= 32 && COLOR_PATTERN.test(value);
}

/**
 * localStorage throws rather than returning null when a browser is in a
 * privacy mode that blocks it, so every access goes through here.
 */
function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Narrows a parsed entry to the fields this app knows about, dropping anything
 * malformed. Exported so it can be tested without a browser.
 *
 * @param {unknown} raw            parsed JSON from storage
 * @param {string[]} shirtOptions  the designs currently offered
 * @param {string[]} stageNames    the backdrops currently offered
 * @returns {object|null}          only valid, known keys, or null
 */
export function sanitizeKit(raw, shirtOptions, stageNames) {
  if (!raw || typeof raw !== 'object' || raw.v !== VERSION) return null;

  const kit = {};

  COLOR_FIELDS.forEach(field => {
    if (isColor(raw[field])) kit[field] = raw[field];
  });

  FLAG_FIELDS.forEach(field => {
    if (typeof raw[field] === 'boolean') kit[field] = raw[field];
  });

  // The one free-text field. Normalized rather than trusted: what is on
  // disk was last written by this app, but nothing says it still is.
  if (typeof raw.socksText === 'string') {
    kit.socksText = normalizeSockText(raw.socksText);
  }

  // null is a real value here: it means the solid shirt.
  if (raw.activeShirtOption === null || shirtOptions.includes(raw.activeShirtOption)) {
    kit.activeShirtOption = raw.activeShirtOption;
  }

  if (stageNames.includes(raw.setting)) {
    kit.setting = raw.setting;
  }

  // An empty palette would leave every swatch row blank with no way back.
  if (Array.isArray(raw.colors)) {
    const colors = raw.colors.filter(isColor).slice(0, MAX_PALETTE);

    if (colors.length) kit.colors = colors;
  }

  return Object.keys(kit).length ? kit : null;
}

export function readKit(shirtOptions, stageNames) {
  const store = storage();

  if (!store) return null;

  try {
    const stored = store.getItem(STORAGE_KEY);

    return stored ? sanitizeKit(JSON.parse(stored), shirtOptions, stageNames) : null;
  } catch {
    // Unparseable entry; fall back to defaults rather than breaking startup.
    return null;
  }
}

export function writeKit(state) {
  const store = storage();

  if (!store) return;

  const kit = { v: VERSION };

  // PERSISTED_FIELDS, not a second copy of the same list. There used to be
  // one here, and the two drifted the first time a field was added: the new
  // one reached the watcher that decides when to save and never reached the
  // thing that saves it, so it was written nowhere and came back as its
  // default on every reload.
  PERSISTED_FIELDS.forEach(field => {
    kit[field] = state[field];
  });

  try {
    store.setItem(STORAGE_KEY, JSON.stringify(kit));
  } catch {
    // Out of quota or blocked. Persistence is a convenience, not a feature the
    // app depends on, so a failed save is not worth interrupting anyone over.
  }
}

export function clearKit() {
  const store = storage();

  if (!store) return;

  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do.
  }
}

