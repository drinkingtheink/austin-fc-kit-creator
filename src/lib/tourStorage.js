// Whether somebody has been shown the way round yet.
//
// One flag covers the greeting and the tour together, because they are one
// first run: the greeting says what the app is, the tour says where things
// are, and seeing one without the other is not a state worth keeping.
//
// Replaces 'visitedAustinFCKitDesigner', which lived loose in the storage
// root and recorded only that the greeting had been dismissed. Everyone is
// deliberately starting again: that flag marked people as having seen a
// greeting, and carrying it over would have hidden the tour from exactly the
// people likeliest to have missed what has been added since they last came.

const KEY = 'austinFcKitCreator:onboarded';

// Cleared on the first read, so the dead key does not sit in people's
// browsers forever waiting to confuse somebody reading devtools.
const RETIRED_KEY = 'visitedAustinFCKitDesigner';

let retired = false;

function retireOldKey() {
  if (retired) return;

  retired = true;

  try {
    localStorage.removeItem(RETIRED_KEY);
  } catch {
    // Private browsing, or storage turned off. Nothing to clean up there.
  }
}

/**
 * Has this person already been through the first run?
 *
 * Treats a throwing or empty localStorage as "no". Showing the greeting twice
 * to somebody with storage disabled is a far smaller failure than never
 * showing it at all.
 */
export function hasOnboarded() {
  retireOldKey();

  try {
    return localStorage.getItem(KEY) === 'true';
  } catch {
    return false;
  }
}

/** Remember that they have. Called once the greeting closes, by any route. */
export function markOnboarded() {
  retireOldKey();

  try {
    localStorage.setItem(KEY, 'true');
  } catch {
    // Nothing to do. They will see the first run again next time, which is
    // the right way round to fail.
  }
}
