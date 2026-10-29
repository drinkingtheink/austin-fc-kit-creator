// What may be printed on a sock, and the one place that decides it.
//
// The rule lives here because two unrelated callers need the same answer: the
// field in the toolbar, where someone is typing it, and the sanitizer in
// kitStorage, where the same string comes back as untrusted input from a
// previous session. Two copies would drift, and a stored kit would stop
// matching what the app lets anyone type.

// Long enough for ATX, 512 or a set of initials; short enough to stay inside
// the sock at a size that reads from the stands. Kit.vue sizes the type to
// fit this many characters and no more.
export const MAX_SOCK_TEXT = 5;

// The two anybody asks for first.
export const SOCK_TEXT_PRESETS = ['ATX', '512'];

/**
 * Narrows anything to what a sock can carry.
 *
 * Upper case, because that is how a sock is lettered and because the presets
 * are. No control characters: this string is drawn into an SVG that the
 * exporter serializes, and XML will not carry most of them, so one pasted in
 * would take the PNG down rather than print as anything.
 *
 * Leading space only is trimmed. Trimming the trailing one too would make a
 * space impossible to type in the middle of a word, since each keystroke is
 * normalized as it lands.
 */
export function normalizeSockText(value) {
  if (typeof value !== 'string') return '';

  return [...value]
    .filter(isPrintable)
    .join('')
    .replace(/^\s+/, '')
    .toUpperCase()
    .slice(0, MAX_SOCK_TEXT);
}

// Written as a code-point check rather than a regular expression, which would
// mean putting literal control characters into the source.
function isPrintable(character) {
  const code = character.codePointAt(0);

  return code > 0x1F && (code < 0x7F || code > 0x9F);
}
