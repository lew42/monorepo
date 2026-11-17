# Figma lint: the build rules, checked by code (2026-11-16)

**What it is.** [lint.js](./lint.js) is a read-only Plugin API script that walks a frame, a master or a whole page in Lew42 v2 and lists every place it breaks the [build checklist](./build-checklist.md). Agents kept repeating the same mistakes even with the rules written down, and a screenshot can't show some of them: a light gray padded box on a light gray ground just looks like empty padding. So every agent runs the lint before reporting, and reports with zero errors.

## Run it

Paste the whole of `lint.js` as the `code` of a `use_figma` call, and add one last line with the ids you changed:

```js
return await lint(['109:15', '48:4568']);   // frames, masters or page ids; pages may differ
```

It changes nothing. It answers:

```js
{ roots, scanned, errors: 3, warnings: 0,
  counts: { 'same-on-same': [1, 0], ... },          // [errors, warnings] per rule
  findings: [['error', '110:1015', 'Group · …', 'child-drives', 'Hug width set by …'], ...] }  // first 20, errors first
```

## The rules

| Rule | Level | What it catches | Fix |
|---|---|---|---|
| same-on-same | error | A padded frame whose fill, resolved in its own modes, looks the same as the ground under it (white on white, light gray on light gray, a card that took its ground's Scheme). | Wrappers are 5% black; cards set Scheme White (Light gray on a white ground). |
| pad-token | error | Padding bound to anything but `pad-x`, `pad-y`, `section-pad-x`, `section-pad-y`, `layout-padding` (or `button-pad-*`). | Rebind; `text-gap` and `radius` are never padding. |
| text-gap | error | A gap bound to `text-gap` between blocks. Allowed: a text stack (text, inline pieces up to 48 tall, frames of those) and a label or heading above the one thing it names. | Bind the gap to `gap`. |
| raw-value | error | Padding or a gap above 0 that isn't bound. | Bind to the Scale token. |
| raw-fill | error | A visible solid fill not bound to a colour variable. Black at 10% or less is allowed: it is the wrapper shade. | Bind to Scheme (`text`, `fill`, …). |
| unstyled-text | error | A text layer with no text style (icon glyphs excepted). | Apply the style its size matches. |
| line-length | error | `body` or `small` text wider than `measure` (720). | Fill + max width 720 on the text, or bind max width to `measure` on its frame. |
| child-drives | error | A Hug parent whose width comes from a Fixed child. Not counted: a child named "fixed …" or "sets width", a region that sets its own Scale mode, a width bound to a variable, a master in a folder frame. | The parent sets the width (Fixed or Fill); the child Fills. |
| mode-mismatch | warn | A Fixed width more than 1.6× its Scale mode's width, or a frame that sets its own mode at under 0.6× of it. | Set the mode nearest the width. |
| hidden-in-master | warn | A hidden layer or slot inside a master that no boolean property controls. | Delete it, or give it a boolean. |
| padded-no-fill | warn | A padded page or doc frame with no fill. | Give it the wrapper shade or a Scheme fill. |

**Not checked, still yours:** instances and the layers inside them get only same-on-same (their other findings belong to the master: lint the master); the screenshot check for overlap, clipping and empty space; whether the thing makes sense.

**Exceptions** live in `ALLOW` at the top of `lint.js`, one line each with its reason; today only `Example · Button by scheme`, a grid that shows the bad combinations on purpose. Add one only for a frame that is wrong on purpose.

## First run (2026-11-16)

On the AI page, Live, Showcase, the 360 XS and 1000 Default benches and Elements: 215 errors at first. About a third were false positives that shaped the rules above (component sets' default padding, layers hidden by a boolean, label-above-thing gaps, regions that set their own width and mode). The real ones were fixed:

- **Showcase:** the root was light gray on the light gray canvas (now 5% black, renamed "Showcase"); the Scheme block's cards took their ground's Scheme and vanished on Prime and Dark (each card now sets its own Scheme; its "Needs work" note was rewritten); the Surface cards were light gray on light gray (now White); two "What breaks" paragraphs ran 1312 wide (max 720); the Swap and Layout groups had a Fixed child driving a Hug parent (the parent now sets the width).
- **Live:** 39 titles had raw black text (now bound to Scheme `text`).
- **Elements:** raw black titles bound to `text`; 11 unstyled labels in Example · Button by scheme styled; raw 16 gaps bound to `text-gap`; the Specimen instance sets its own Scale mode.
- **AI page:** one unstyled bullet styled.

**Read-only run, after the stop on Figma edits (2026-11-16, nothing fixed):** 2600 XL had 132 errors (90 same-on-same, mostly white cards on white regions; 22 unstyled text; 14 child-drives; 4 pad-token), plus an 18840-wide wrapper and 4 loose connectors up to 13476 px long. 1920 Desktop had 48 errors (20 raw-fill, 16 raw-value, 12 same-on-same). Lint does not see floating layouts or connectors; a proposed extra rule: a page has one root auto-layout frame, no connectors and nothing else at top level.

**Left open, 1 error:** the Button master's hidden `Icon` frame (`23:508`) has a raw white fill, and no white colour variable exists to bind it to. The Button master is the owner's. Also seen: card-like layout masters (`360 / App bar`, `360 / Profile`) carry their own fill and padding, so inside a Card they double up; the Showcase instances got a contrasting Scheme, and the master question is logged as an improvement in this folder.
