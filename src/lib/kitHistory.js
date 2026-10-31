// Every Austin FC kit the app can show, oldest first.
//
// Each entry is a name, when it was worn, what it was for, and a kit: the
// same fields kitStorage.js persists, so an entry is something the editor can
// simply be handed. Nothing here is a new kind of object.
//
// These are approximations, and the panel says so. The app's vocabulary is
// fourteen shirt patterns and flat colour slots; a real shirt has sublimated
// graphics, gradients and prints that none of the fourteen is. An entry is
// the closest this app can get, in the same spirit as the comment on the
// default kit in App.vue -- "as close as the parameters get".
//
// `setting` is deliberately absent: the backdrop is a view preference rather
// than part of a kit, and browsing the history should not keep changing the
// sky. `colors` is present, because the palette is what the swatches offer
// and a 2021 kit should offer 2021's colours.
//
// Adding a kit is adding an entry. Nothing else in the app knows how many
// there are.

const VERDE = '#00B140';
const VERDE_DEEP = '#008A4B';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const GREY = '#CCCCCC';

export const KIT_HISTORY = [
  {
    id: 'heartbeat-2025-home',
    name: 'The Heartbeat Kit',
    seasons: '2025-26',
    type: 'home',
    note: 'Tonal verde stripes, black trim standing in for the shoulder stripes and side panels.',
    kit: {
      activeShirtOption: 'stripes',
      shirtFill: VERDE,
      shirtTypeFill: VERDE_DEEP,
      shirtSecondaryFill: BLACK,
      shirtCuffFill: BLACK,
      shirtSleeveFill: VERDE,
      shirtMakerFill: BLACK,
      showLeafMaker: false,
      logoFill: BLACK,
      logoStroke: false,
      logoStrokeFill: WHITE,
      collarFill: BLACK,
      showButtonCollar: false,

      badgeFill: VERDE,
      badgeTextFill: WHITE,
      badgeBGFill: BLACK,
      shortsBadgeFill: VERDE,
      shortsBadgeTextFill: WHITE,
      shortsBadgeBGFill: BLACK,
      showRoundelBadge: false,
      showBadgeDisc: false,

      shortsFill: BLACK,
      shortsCuffsFill: VERDE,
      numberFill: WHITE,

      socksFill: BLACK,
      socksCuffsFill: VERDE,
      socksHoops: false,
      socksHoopsFill: WHITE,
      socksText: '',
      socksTextFill: WHITE,

      colors: [BLACK, VERDE, VERDE_DEEP, WHITE, GREY]
    }
  }
];

/** How a type is written where it is shown. */
export const KIT_TYPE_LABELS = {
  home: 'Home',
  away: 'Away',
  third: 'Third',
  special: 'Special'
};
