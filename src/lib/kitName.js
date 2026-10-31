// What a kit may be called, and the one place that decides it.
//
// Same reasoning as lib/sockText.js: two unrelated callers need the same
// answer -- the field in the toolbar where somebody types it, and the
// sanitizer in kitStorage where it comes back as untrusted input from a
// previous session. Two copies would drift, and a stored name would stop
// matching what the app lets anyone type.

// Long enough for "Austin FC 2021 Inaugural Home" and a good deal more;
// short enough that it cannot push the toolbar around or make a filename
// nobody can read.
export const MAX_KIT_NAME = 48;

/**
 * Narrows anything to a name a kit can carry.
 *
 * Case is left alone, unlike the sock text: this is a title rather than
 * something printed on cloth, and "The Heartbeat Kit" is not THE HEARTBEAT
 * KIT. Control characters go, because this string is written into the PNG's
 * filename and read back out of storage.
 */
export function normalizeKitName(value) {
  if (typeof value !== 'string') return '';

  return [...value]
    .filter(isPrintable)
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/^\s/, '')
    .slice(0, MAX_KIT_NAME);
}

/**
 * The name as a filename fragment: lower case, words joined by hyphens,
 * nothing a file system has opinions about.
 *
 * Returns '' when there is nothing usable left, so the caller can fall back
 * to the name it used before kits had names at all.
 */
export function toKitSlug(name) {
  return normalizeKitName(name)
    .toLowerCase()
    // Fold accents onto their base letter rather than dropping them: the
    // filter below keeps ASCII only, and without this "Anejo" spelled with
    // an enye comes out as "a-ejo", a word broken in half by its own accent.
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Written as a code-point check rather than a regular expression, which would
// mean putting literal control characters into the source.
function isPrintable(character) {
  const code = character.codePointAt(0);

  return code > 0x1F && (code < 0x7F || code > 0x9F);
}
