// What the tour says, and what it points at.
//
// Data, not markup, so the wording can be rewritten without opening
// GuidedTour.vue — and so the two can be worked on at the same time without
// touching the same file.
//
// Every `target` is a selector against a hook the app already had: the stage,
// the palette strip, a tool section's own heading button, the design grid,
// and the two buttons in the toolbar header. Nothing here needed a `data-tour`
// attribute adding to App.vue, which is the whole reason the step list can
// live out here.
//
// `before` runs on entering a step and may return a promise. It drives the
// app the way a person would — by clicking its real controls — rather than
// reaching into App.vue's internals, for the same reason.

/** Open a tool section by its heading, if it is not already open. */
function openSection(title) {
  const heading = [...document.querySelectorAll('.tool-section-heading button')]
    .find(button => button.textContent.trim().toLowerCase().startsWith(title));

  if (heading && heading.getAttribute('aria-expanded') !== 'true') {
    heading.click();
  }

  // The section animates open. Placement has to wait for it or the bubble
  // measures a drawer that is still a few pixels tall.
  //
  // 340ms, not 260: ToolSection's height transition is .3s and its fields
  // stagger in over .34s, so the old wait expired while the drawer was still
  // growing and the ring was measured against a part-open section. The scroll
  // that ToolSection then runs from after-enter is caught by the tour's own
  // scroll listener rather than waited out here — it is smooth-scrolled, so
  // there is no honest number to wait for.
  return new Promise(resolve => setTimeout(resolve, 340));
}

export const TOUR_STEPS = [
  {
    id: 'kit',
    target: '#kit-stage .kit-display',
    placement: 'right',
    title: 'This is your kit',
    body: 'Click any part of it — shirt, sleeve, shorts, socks — to paint that part with the colour you have selected.'
  },
  {
    id: 'palette',
    target: '.palette-strip',
    placement: 'left',
    title: 'Your palette',
    body: 'Every colour here is one click away in all seventeen fields. Open Colors to add your own, borrow a club’s, or build a set from one colour.'
  },
  {
    id: 'drawers',
    target: '.tool-section-heading',
    placement: 'left',
    title: 'Four drawers',
    body: 'Shirt, badge, shorts, socks. One opens at a time, so you are never scrolling past things you are not changing.',
    before: () => openSection('shirt')
  },
  {
    id: 'designs',
    target: '.design-grid',
    placement: 'left',
    title: 'Twenty-two designs',
    body: 'Stripes, hoops, sashes, checks and the rest. Each one previews in your own colours before you pick it.'
  },
  {
    id: 'lucky',
    target: '.toolbar-actions .btn-primary',
    placement: 'bottom',
    title: 'Or let it decide',
    body: 'Feeling Lucky rolls a whole kit at once. Enter, Space and the arrow keys do the same thing from anywhere.'
  },
  {
    id: 'download',
    target: '.download-kit, #kit-stage .btn-primary',
    placement: 'top',
    title: 'Take it with you',
    body: 'Download PNG saves your kit as an image on the stadium backdrop. Post it with #AustinFCKitCreator.'
  }
];
