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
// The brand mark is worn twice, on the chest and down the sock, and the two
// take their colour from different fields: shirtMakerFill and the sock's
// print colour. Where one colour reads against both garments, both wear it,
// so the same mark is not black in one place and white in the other. Where
// no colour does -- a verde shirt over black socks leaves only white -- the
// one that works wins over the one in the photograph.
//
// Adding a kit is adding an entry. Nothing else in the app knows how many
// there are.

// Sampled off the photographs, not taken from a brand guide.
const JADE = '#2CA172';
const JADE_LIGHT = '#43B98A';
const BONE = '#F2EFE6';

const MINT = '#8BD6A1';
const SAGE = '#A6E2A2';
const FOREST = '#12301E';

const VERDE = '#00B140';
const VERDE_DEEP = '#008A4B';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const GREY = '#CCCCCC';

export const KIT_HISTORY = [
  {
    id: 'inaugural-2021-home',
    name: 'The Inaugural Kit',
    seasons: '2021-22',
    type: 'home',
    note: 'Verde and forest in wide vertical bands, white print, black at the collar and cuffs.',
    kit: {
      // Wide bands alternating verde and a green so dark it reads black,
      // which is what `stripes` draws: one gauge, edge to edge.
      activeShirtOption: 'stripes',
      shirtFill: VERDE,
      shirtTypeFill: FOREST,
      shirtSecondaryFill: BLACK,
      // The bands run onto the sleeves on the shirt; a sleeve here takes one
      // colour, and verde is the one that reads as the kit.
      shirtSleeveFill: VERDE,
      shirtCuffFill: BLACK,
      shirtMakerFill: WHITE,
      showLeafMaker: false,
      logoFill: WHITE,
      logoStroke: false,
      logoStrokeFill: FOREST,
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
      shortsCuffsFill: BLACK,
      numberFill: WHITE,

      socksFill: BLACK,
      socksCuffsFill: BLACK,
      socksHoops: false,
      socksHoopsFill: VERDE,
      socksText: '',
      socksMaker: true,
      // White on verde and white on black: one colour for both marks.
      socksTextFill: WHITE,

      colors: [VERDE, FOREST, BLACK, WHITE]
    }
  },
  {
    id: 'mckalla-2021-away',
    name: 'McKalla Kit',
    seasons: '2021-22',
    type: 'away',
    note: 'White throughout, verde over the shoulder and in every print on it.',
    kit: {
      // White shirt, verde stripes over the shoulder: the yoke takes the
      // body's colour so the panel vanishes and the three stripes are all
      // that shows.
      activeShirtOption: 'shoulder-stripes',
      shirtFill: WHITE,
      shirtSecondaryFill: WHITE,
      shirtTypeFill: VERDE,
      shirtSleeveFill: WHITE,
      shirtCuffFill: WHITE,
      shirtMakerFill: VERDE,
      showLeafMaker: false,
      logoFill: VERDE,
      logoStroke: false,
      logoStrokeFill: WHITE,
      // White on white, which is what the shirt does: the collar is there
      // in the cut rather than in the colour.
      collarFill: WHITE,
      showButtonCollar: false,

      badgeFill: VERDE,
      badgeTextFill: WHITE,
      badgeBGFill: BLACK,
      shortsBadgeFill: VERDE,
      shortsBadgeTextFill: WHITE,
      shortsBadgeBGFill: BLACK,
      showRoundelBadge: false,
      showBadgeDisc: false,

      shortsFill: WHITE,
      shortsCuffsFill: WHITE,
      numberFill: VERDE,

      socksFill: WHITE,
      socksCuffsFill: WHITE,
      socksHoops: false,
      socksHoopsFill: VERDE,
      socksText: '',
      socksMaker: true,
      // Verde on white reads on both, so both marks are verde.
      socksTextFill: VERDE,

      colors: [WHITE, VERDE, BLACK]
    }
  },
  {
    id: 'sentimiento-2022-away',
    name: 'The Sentimiento Kit',
    seasons: '2022-23',
    type: 'away',
    note: 'Sage through and through, black at the collar, the cuffs and the hems.',
    kit: {
      // Plain sage: the yoke and the stripes are both the body's colour, so
      // `shoulder-stripes` draws nothing that can be seen and the shirt
      // reads solid. The template stays selected rather than being swapped
      // for the solid shirt, so putting a colour back in the stripes is a
      // colour rather than a different kit.
      activeShirtOption: 'shoulder-stripes',
      shirtFill: SAGE,
      shirtSecondaryFill: SAGE,
      shirtTypeFill: SAGE,
      shirtSleeveFill: SAGE,
      shirtCuffFill: BLACK,
      shirtMakerFill: BLACK,
      showLeafMaker: false,
      logoFill: BLACK,
      logoStroke: false,
      logoStrokeFill: SAGE,
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

      // Shorts and socks in the shirt's own colours, trim and all.
      shortsFill: SAGE,
      shortsCuffsFill: BLACK,
      numberFill: BLACK,

      socksFill: SAGE,
      socksCuffsFill: BLACK,
      socksHoops: false,
      socksHoopsFill: BLACK,
      socksText: '',
      socksMaker: true,
      // Black on sage reads on both garments, so both marks are black.
      socksTextFill: BLACK,

      colors: [SAGE, BLACK, VERDE, WHITE]
    }
  },
  {
    id: 'las-voces-2023-home',
    name: 'Las Voces Kit',
    seasons: '2023-24',
    type: 'home',
    note: 'Verde under black bars of every width, white sponsor, the crest on the chest.',
    kit: {
      // `barcode` is the one pattern that varies its bar widths, which is
      // what this shirt is: not stripes of one gauge but a run of them from
      // hairline to block.
      activeShirtOption: 'barcode',
      shirtFill: VERDE,
      shirtTypeFill: BLACK,
      shirtSecondaryFill: BLACK,
      // Green with black blocks on the real sleeve, and a sleeve here takes
      // one colour. Green is the one there is more of.
      shirtSleeveFill: VERDE,
      shirtCuffFill: BLACK,
      // White, where the shirt has it black: the socks are black, so black
      // is the one colour the mark cannot be in both places. White reads on
      // the verde here and on the black down there, and the sponsor above it
      // is white already.
      shirtMakerFill: WHITE,
      showLeafMaker: false,
      logoFill: WHITE,
      logoStroke: false,
      logoStrokeFill: BLACK,
      collarFill: BLACK,
      showButtonCollar: false,

      // The shield, not the tree on its own: this shirt wears the full crest.
      badgeFill: VERDE,
      badgeTextFill: WHITE,
      badgeBGFill: BLACK,
      shortsBadgeFill: VERDE,
      shortsBadgeTextFill: WHITE,
      shortsBadgeBGFill: BLACK,
      showRoundelBadge: false,
      showBadgeDisc: false,

      // Black shorts and black socks, trim included: a verde hem is the
      // obvious alternative and would stop them reading as plain black.
      shortsFill: BLACK,
      shortsCuffsFill: BLACK,
      numberFill: WHITE,

      socksFill: BLACK,
      socksCuffsFill: BLACK,
      socksHoops: false,
      socksHoopsFill: VERDE,
      socksText: '',
      socksMaker: true,
      socksTextFill: WHITE,

      colors: [VERDE, BLACK, WHITE]
    }
  },
  {
    id: 'armadillo-2024-away',
    name: 'The Armadillo Kit',
    seasons: '2024-25',
    type: 'away',
    note: 'Bone body, jade shoulders and sleeves, tree mark on the chest.',
    kit: {
      // `shoulder-stripes` paints the shoulders in the secondary colour and
      // lays three bars of the type colour over them. Both are jade here, so
      // the shoulder reads as one panel running into the sleeves rather than
      // as stripes at all: the shirt's white stripes sit on a jade sleeve,
      // and nothing in these fourteen patterns puts a stripe on a sleeve.
      // The shape of the shirt is right; the stripes are the part that is
      // left on the table.
      activeShirtOption: 'shoulder-stripes',
      shirtFill: BONE,
      shirtSecondaryFill: JADE,
      shirtTypeFill: JADE,
      shirtSleeveFill: JADE,
      shirtCuffFill: JADE_LIGHT,
      shirtMakerFill: JADE,
      showLeafMaker: false,
      logoFill: JADE,
      logoStroke: false,
      logoStrokeFill: WHITE,
      collarFill: JADE,
      showButtonCollar: false,

      // The tree on the chest, printed straight onto the cloth.
      badgeFill: JADE,
      badgeTextFill: WHITE,
      badgeBGFill: BONE,
      shortsBadgeFill: BONE,
      shortsBadgeTextFill: JADE,
      shortsBadgeBGFill: JADE,
      showRoundelBadge: true,
      showBadgeDisc: false,

      shortsFill: JADE,
      shortsCuffsFill: BONE,
      numberFill: BONE,

      socksFill: BONE,
      socksCuffsFill: JADE,
      socksHoops: false,
      socksHoopsFill: WHITE,
      socksText: '512',
      socksMaker: true,
      socksTextFill: JADE,

      colors: [BONE, JADE, JADE_LIGHT, WHITE]
    }
  },
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
      // White for the same reason as Las Voces above: verde shirt, black
      // socks, and only white reads on both.
      shirtMakerFill: WHITE,
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
      socksMaker: true,
      socksTextFill: WHITE,

      colors: [BLACK, VERDE, VERDE_DEEP, WHITE, GREY]
    }
  },
  {
    id: 'rooted-2026-away',
    name: 'The Rooted Kit',
    seasons: '2026-27',
    type: 'away',
    note: 'White with mint stripes, black print throughout, mint at the collar and cuffs.',
    kit: {
      activeShirtOption: 'stripes',
      shirtFill: WHITE,
      shirtTypeFill: MINT,
      shirtSecondaryFill: BLACK,
      // The sleeves are white under their own black shoulder stripes, which
      // this cannot draw: a shirt wears one pattern here, and the vertical
      // stripes down the body are what the kit is. The sleeves stay white.
      shirtSleeveFill: WHITE,
      shirtCuffFill: MINT,
      shirtMakerFill: BLACK,
      showLeafMaker: false,
      logoFill: BLACK,
      logoStroke: false,
      logoStrokeFill: WHITE,
      collarFill: MINT,
      showButtonCollar: false,

      badgeFill: BLACK,
      badgeTextFill: WHITE,
      badgeBGFill: WHITE,
      shortsBadgeFill: BLACK,
      shortsBadgeTextFill: WHITE,
      shortsBadgeBGFill: WHITE,
      showRoundelBadge: true,
      showBadgeDisc: false,

      shortsFill: WHITE,
      shortsCuffsFill: MINT,
      numberFill: BLACK,

      socksFill: WHITE,
      socksCuffsFill: MINT,
      socksHoops: false,
      socksHoopsFill: MINT,
      socksText: '512',
      socksMaker: true,
      socksTextFill: BLACK,

      colors: [WHITE, MINT, BLACK]
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
