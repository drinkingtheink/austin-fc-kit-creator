// The gallery's address, so a kit in it can be linked to.
//
// A hash rather than a path, and that is not a preference. This builds to
// static files served by whatever is hosting them, with nothing rewriting
// requests: /kits/heartbeat-2025-home would 404 the moment anybody opened
// the link cold or pressed reload, where #/kits/heartbeat-2025-home is
// index.html wherever the app is parked -- a root, a sub-path, a file://
// checkout. A shared link that only works if you were already on the page
// is not a shared link.
//
// The entry's `id` does the addressing, not its name. Names are display
// copy and get edited -- "McKalla Kit" could become "The McKalla Kit"
// tomorrow -- and a link that dies because somebody fixed a caption is a
// bad link. The ids in kitHistory are fixed strings for exactly this, and
// they are already lower-case and hyphenated, so nothing has to slugify
// them on the way out.

const PREFIX = '#/kits/';

/** The hash that addresses one catalogue kit. */
export function galleryHash(id) {
  return PREFIX + encodeURIComponent(id);
}

/**
 * Whether a hash is addressing the gallery at all, separately from whether
 * it names a kit we have.
 *
 * The two questions come apart: #/kits/no-such-kit and #/kits/%E0 are both
 * gallery addresses that resolve to nothing, and both want clearing off the
 * bar, but only the first survives idFromHash.
 */
export function isGalleryHash(hash) {
  return typeof hash === 'string' && hash.startsWith(PREFIX);
}

/**
 * The kit id carried by a hash, or null when the hash is not a gallery
 * address at all.
 *
 * Returns the id as written. Whether it names a kit we have is the caller's
 * question -- this one only parses.
 */
export function idFromHash(hash) {
  if (typeof hash !== 'string' || !hash.startsWith(PREFIX)) return null;

  const raw = hash.slice(PREFIX.length);

  if (!raw) return null;

  try {
    return decodeURIComponent(raw) || null;
  } catch {
    // A hand-mangled escape sequence, e.g. #/kits/%E0. decodeURIComponent
    // throws on those, and an address nobody can read is not an address.
    return null;
  }
}

/**
 * The current page's URL wearing `hash`, or wearing none when it is empty.
 *
 * Built from location rather than assumed to be '/', so this keeps working
 * from a sub-path, and keeps any query string that was already there --
 * dropping somebody's ?utm= on the way into the gallery would be rude.
 */
export function urlWithHash(hash) {
  const { origin, pathname, search } = window.location;

  return origin + pathname + search + (hash || '');
}
