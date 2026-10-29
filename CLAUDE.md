# Austin FC Kit Creator

Vue 3 + Vite single-page app for designing an Austin FC kit and exporting it as
a PNG. One component tree, no router, no store.

```
npm run dev     # vite on port 8080 (set in vite.config.js, not the default)
npm run build   # production build
npm run lint    # eslint
```

There is no test runner. Changes are verified by running the app and driving it
in a browser.

## Where things live

`src/App.vue` holds all kit state and most of the styling. The rest is:

| | |
|---|---|
| `components/Kit.vue` | the kit artwork — one large hand-traced SVG |
| `components/Stadium.vue` | the backdrop artwork, also a large SVG |
| `components/ColorPanel.vue` | palette / club palettes / harmony, slides over the toolbar |
| `components/ToolField.vue` | one labelled control; carries the hover spotlight |
| `components/ShirtThumb.vue` | the 14 design previews, painted from the live palette |
| `lib/colorTools.js` | hex parsing, HSL, harmony, ramps, WCAG contrast, nearest-match |
| `lib/stageBackdrops.js` | the six sky gradients |
| `lib/stars.js` | star positions for the summer-night sky |
| `lib/kitToPng.js` | the PNG exporter |
| `lib/clubPalettes.js` | 87 club palettes, generated; Houston Dynamo is deliberately absent |
| `lib/kitStorage.js` | localStorage persistence |

Three tables in `App.vue` drive most behaviour, and adding a colour usually
means touching all three: `FILL_PARTS` (which colour paints which part),
`PART_MODELS` (its inverse, for click-to-paint), and `LEGIBILITY` (what sits on
what, for the contrast guards).

## Things that will cost you an afternoon

**The exporter reads computed styles off the live DOM.** `kitToPng.js`
snapshots `fill`, `opacity`, `display` and `transform` from the real elements.
So a capture taken mid-animation bakes in a half-interpolated colour. The kit
is frozen with an `is-frozen` class — which kills every transition and
animation — before the exporter looks. Anything new that animates a captured
property has to respect that freeze.

`filter` is *not* in `PAINT_PROPS`, which is why effects built on
`drop-shadow` never reach the PNG. That is deliberate and occasionally useful:
the randomize flash and the spotlight halo both use `filter` precisely so they
stay off the exported image.

**Zoom and pan live on a wrapper, not on the kit.** `.kit-display` already
animates `transform` for the float, and an animation beats an inline style on
the same property. The wrapper also keeps the zoom out of the export for free,
since the exporter serializes the SVG and sets its width and height explicitly.
Verified: zero differing pixels between an export at rest and one at 260% zoom
dragged 260px.

**`#kit-stage` padding is asymmetric** — `28px 28px 76px`, the extra at the
bottom to clear the download button. The kit therefore rests *above* the centre
of the stage and has further to travel down than up. Any geometry that assumes
it is centred will be wrong by about 24px.

**Do not read a rect back to derive state you just set.** Several wheel events
can arrive inside one frame. Reading a `getBoundingClientRect()` Vue has not
re-rendered yet, while using the state value it has not applied yet, makes
bounds drift further every call. The pan clamp ran away to five figures this
way. Derive from layout (padding, sizes) instead; width and height are safe to
read during a pan because panning does not change them.

**The stadium's floodlight ellipses carry `transform="matrix(...)"`** from the
source artwork. A CSS `transform` on them overrides the attribute and scatters
the bulbs across the sky. Animate opacity and filter only.

**A `drop-shadow` is costed per element per frame.** Putting one on all 96
floodlights halved the frame rate — 28fps against 61. Only one bulb in four
carries a filter now. Measure before and after when adding effects to anything
that exists in bulk; the stadium and the crest are both hundreds of nodes.

**Vue 3.5 unwraps injected refs in the Options API.** `App.vue` provides a
computed ref as `spotlightState`; `ToolField` reads `this.spotlightState`
directly, with no `.value`. Getting this wrong fails silently.

**Numbers the export repaints must have exactly one home.** The sky gradients
and the star positions are each defined once and consumed by both the screen
and the canvas. Two copies would drift, and the exported sky would stop
matching the one on screen. Stars are generated from a fixed seed for the same
reason.

## Conventions

Comments explain *why*, especially where the code looks odd — the asymmetric
padding, the wrapper transform, the filter choices above are all commented at
their sites. Prefer extending a declarative table over adding another branch to
a chain of `if`s; the legibility guards were five hand-ordered comparisons that
could undo one another before becoming a table.

The randomizer and club-palette swaps run `enforceLegibility()`, which keeps
every element distinguishable from what it sits on. Direct edits — picking a
swatch, or clicking a part of the kit to paint it — deliberately do **not**:
someone choosing a specific colour for a specific part has said what they want.

## Two sessions, one checkout

This project is sometimes worked on by two Claude sessions at once. They share
one working tree and one `HEAD`, so:

- **Never `git add -A` or `git commit -a`.** Stage explicit paths. A blanket
  commit once swept 264 lines of another session's half-finished work into an
  unrelated commit.
- **Do not switch branches.** There is one HEAD for both sessions; changing it
  pulls the checkout out from under the other one. Work on `master`.
- **Re-read before editing.** Files change underneath you. Check `git log` and
  re-read a file if your copy predates recent commits.

Commit incrementally as work lands rather than batching it all at the end.
