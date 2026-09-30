# icon — one frame, one button, one rail

The owner's own words: too many one-off pieces of CSS building "icon layout" across the site,
and vertical and horizontal alignment kept breaking. `ui/icon` is three classes that answer it,
built around the `icon()` the site already has — nothing new to draw the glyph itself.

## Use

```js
import { icon, button, div } from "/app.js";
import "/framework/ui/icon/icon.js";   // registers the three classes; ui.js wiring is next

div.c("ui-icon-frame", () => icon("star"));                       // framed, centred both ways
button.c("ui-icon-btn", () => icon("favorite")).attr("type", "button");   // flush, clickable
button.c("ui-icon-btn ui-icon-btn-bg", () => icon("home")).attr("type", "button"); // backed
```

A toggle button is the same `.ui-icon-btn`, with `aria-pressed` carrying the on/off state —
"true" lights the background, "false" dims the icon. A rail is `.ui-icon-rail` around any mix of
flush and backed buttons; it only supplies the gap between them. All three are sized in `em`,
off the one token `--icon-frame` (declared beside `.icon` in `framework.css`), so raising a
container's `font-size` scales the icon, the frame and the button together — see it live at
three sizes on the page below.

## Watch out

- **Are Material Icons fixed width? Yes.** Every glyph in the font sits in the same 24×24
  advance box, so two icons already line up horizontally with no help from a frame. A frame
  earns its place for a click target, for vertical centring against something taller than the
  glyph's own line box, or for a row where every slot — icon or not — has to measure the same.
  [doc/icons.md](doc/icons.md) has the full reasoning.
- **`.icon` is untouched.** An icon riding inline with text still just wears `.icon` — nothing
  here renames or replaces it; `.ui-icon-frame` and `.ui-icon-btn` are additive.
- **Icon items in a list are `ui/item`, not this module.** `ui.item({ icon, name, … })` already
  has the row, the 1.3em tree-row frame and the `.boxed` background-with-padding look; this
  page's list demo reuses it rather than building a second one.
- **`ui.js` is not wired up yet.** This task's fence is this module, `framework.css`'s icon
  block and `ui/page.js`'s `children:` — the one-line addition to `ui.js` that makes `ui.icon`
  importable the way `ui.item` is happens in the next pass (the mastermind's migration step).
  Until then, import `icon.js` directly, as the page itself does.

## More

- [Overview](/framework/ui/icon/) — the rail, the button range, the list, all three sizes side
  by side.
- [doc/icons.md](doc/icons.md) — fixed width or not, when a frame earns its place, the token.
- Back to [UI](/framework/ui/).
