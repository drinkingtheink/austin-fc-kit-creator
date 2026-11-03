# Guided tour — plan

A first-run walkthrough for people who have never opened the app.

This plan exists because of the two-sessions-one-checkout problem in
`CLAUDE.md`. `App.vue` is 4,200 lines and both sessions touch it constantly,
so the tour is designed to live almost entirely in files nobody else has open.
**Target: two lines of `App.vue`, and the rest in new files.**

---

## What is already there to build on

Worth knowing before designing anything, because most of it exists:

| Thing | Where | Use for the tour |
|---|---|---|
| `spotlight(part, key)` and `spotlightState` | `provide`d by `App.vue` | Light up a kit part from anywhere in the tree |
| `:data-part="part"` | `ToolField.vue` | Stable selector for every toolbar control |
| `data-part` on kit shapes | `Kit.vue` | Stable selector for every garment |
| `ToolSection` header buttons | `ToolSection.vue` | Open a drawer by clicking its real header |
| `visitedAustinFCKitDesigner` | `localStorage` | The existing first-run gate |
| Greeting modal | `App.vue` ~743 | Runs before the tour; the tour follows it |

The spotlight is the important one. It already does the hard part — linking a
toolbar control to a garment and lighting it — and it does it with `filter`,
which the exporter does not carry, so **the tour cannot leak into a PNG**.

---

## Files

Five new files, no shared edits between them. Each is one session's work.

```
src/components/GuidedTour.vue    the overlay: bubble, buttons, focus, keys
src/lib/tourSteps.js             the steps, as data
src/lib/tourPlacement.js         where the bubble goes, pure maths
src/lib/tourPlacement.test.mjs   node test for the above
src/lib/tourStorage.js           has this person seen it
```

`tourPlacement.js` is deliberately split out and pure. Placement is the part
most likely to be wrong at a window size nobody tried, and it is the only part
of this feature that can be tested the way `colorTools.js` is — a
dependency-free script under plain node. Follow that file's shape exactly.

---

## The two lines in App.vue

Everything else is new files. These two need agreeing before anyone starts,
and should land in **one small commit of their own** so the other session can
pull it and carry on.

**1. Mount it.** Near the greeting modal:

```html
<GuidedTour />
```

Self-gating: the component reads its own flag and decides whether to run, so
`App.vue` gains no new state, no handler, no watcher.

**2. Tell it the greeting is done.** One line inside `handleGreetingClose`:

```js
window.dispatchEvent(new Event('kit-tour:start'));
```

A window event rather than a prop or an emit, specifically so the tour does
not appear in `App.vue`'s data, methods or template beyond the mount. It is an
unusual choice in a Vue app and it is the right one here: the coupling it
removes is the thing that would otherwise make two sessions collide.

Anything beyond these two lines should be questioned. If a step needs a target
with no stable hook, add the `data-tour` attribute in the same single commit
rather than drip-feeding changes into `App.vue`.

---

## Steps

Six. The app is a toy and the tour should be over before it is resented.
Content lives in `tourSteps.js` as data, so it can be rewritten without
touching the component.

```js
{ id, target, title, body, before?, placement? }
```

`target` is a CSS selector against hooks that already exist. `before` is an
optional function run on entry — open a drawer, call `spotlight()`.

| # | Target | Says |
|---|---|---|
| 1 | the kit | This is your kit. Click any part of it to paint that part. |
| 2 | `.palette-strip` | Every colour here is one click away in all seventeen fields. |
| 3 | first `ToolSection` header | Four drawers: shirt, badge, shorts, socks. One opens at a time. |
| 4 | the design grid | Twenty-two shirt designs. |
| 5 | **Feeling Lucky** | Rolls a whole kit. `Enter`, `Space` and the arrows do it too. |
| 6 | **Download PNG** | Saves a 1200×1600 image to post. |

Step 3 should open the Shirt drawer so step 4 has something to point at —
by clicking the real header button, not by reaching into `App.vue`.

---

## Rules it has to follow

These are the project's existing traps, applied to this feature.

**It must not reach the PNG.** The overlay is HTML outside the kit SVG, so it
cannot — but if a step highlights by changing the kit itself, that *would*
export. Highlight through the existing spotlight, which uses `filter`, or
through an HTML overlay. Never by changing a `fill`, an `opacity` or a
`transform` on the kit: the exporter carries all three.

**Honour `prefers-reduced-motion`.** The project already does throughout. The
bubble may appear without sliding; the tour must still work.

**Do not trap someone.** `Esc` closes, the backdrop closes, there is a visible
close button, and closing is remembered. A tour that reappears is worse than
no tour.

**It is keyboard reachable.** Focus moves to the bubble, `Tab` cycles inside
it, focus returns to where it was on close. The app's own shortcuts
(`Enter`/`Space` randomise) must not fire while the tour has focus — that one
will bite, because those are bound on `window`.

**Resize and scroll.** The toolbar scrolls and drawers animate open. Recompute
placement on `resize`, and after a step's `before` has run and settled, not
before.

**Never block on a missing target.** If a selector finds nothing — because a
control moved or a design was renamed — skip that step rather than pointing at
the corner of the screen. Log it so it gets noticed.

---

## Gating

Separate key from the greeting: `austinFcKitCreator:tourSeen`.

Reusing `visitedAustinFCKitDesigner` would mean everyone who has ever opened
the app is treated as having seen a tour that did not exist when they visited.
A new key lets the tour run once for them too.

It does **not** run when someone arrived on a shared gallery link. `App.vue`
already makes that distinction for the greeting: that person asked to see a
specific kit, and should see it.

---

## Splitting the work

Agree the two `App.vue` lines first and land them. After that:

| Session | Owns | Depends on |
|---|---|---|
| A | `GuidedTour.vue` | the mount line |
| B | `tourSteps.js` | the step shape only |
| C | `tourPlacement.js` + its test | nothing |
| D | `tourStorage.js`, the gating | the event line |

C can start immediately and has a real test. B is content and needs no
running app. A is the only one that needs the other three to finish, so it
should stub them early rather than wait.

---

## Checking it

No test framework here, so the same rules as everything else:

- `npm run test:colors` style node test for `tourPlacement.js`.
- Everything else by running the app and driving it in a browser.
- **Export a PNG with the tour open and diff it against one with the tour
  closed. It must be zero differing pixels.** That is the check this codebase
  has needed most often and the one easiest to skip.
