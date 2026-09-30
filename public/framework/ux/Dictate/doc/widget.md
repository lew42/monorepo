# Widget — the one dictation widget, configured

`Widget.js` is the ✦ sheet's own compact widget (a framed card: bubbles on top, a composer
row — typed box, mic, Send — at the bottom) pulled into its own class, so the sheet, the
drawer and this Overview all build the SAME thing instead of three copies of similar markup.

```js
import Widget from "/framework/ux/Dictate/Widget.js";

new Widget();                                   // just bubbles + the composer row
new Widget({ level: true, source: true });       // + a small level meter, + a compact mic picker
new Widget({ debug: true });                     // + the "Debug ▾" bar below the card
new Widget({ revision: "edit" });                 // ux/Revise tidies each sentence too
```

Four plain properties, every one `false`/off by default:

- **`level`** — a small level meter right beside the mic button. The button already has its
  own built-in bar (`Dictate.css`'s `--ux-dictate-level`); this adds a second, easier-to-see
  one, driven by the same smoothed number (`Dictate`'s `on_meter`).
- **`source`** — a compact `<select>` of audio input devices (width capped, ellipsis, never
  a full-width dropdown), remembered the same way every `Dictate` on the site remembers one.
- **`debug`** — a small "Debug ▾" toggle under the card, collapsed by default. Opening it
  mounts the [playground](/framework/ux/Dictate/playground/)'s own widget (`pg.widget()`)
  right there — the same raw/clean/Chunks/Corrections/Live/Side-by-side tabs, reused whole.
  `pg` is one shared singleton, so a sentence said into this widget's own mic also settles
  into that debug session. Used on this Overview (ON); left off on the ✦ sheet.
- **`revision`** — `"clean" | "edit" | "summary" | false`, forwarded to `Dictate`'s own
  `revise` option: a tidied version of each sentence becomes a second bubble, a moment later.

**The live, still-moving guess is `Dictate`'s own caption, not a second copy of it** — the
same trick `ext/drawer/rail.css` already uses for the sheet: `mode: "open"` makes `Dictate`
draw one line per settled sentence plus one muted line for the guess; `Widget.css` hides the
settled lines (the bubbles above already show them) and leaves the muted guess line, right
under the mic button.

**Not wired into the ✦ sheet or the drawer yet** — both (`ext/drawer/rail.js`,
`ux/Dictate/floor.js`) were mid-merge with a sibling task (voice-sessions-2) as this landed,
so `Widget` was built in new files and used here first, per that task's own fence. Swapping
the sheet's hand-built mic/thread for `new Widget({...})` is the next step, once that merge
lands — see `readme.md`'s own "Widget" section for the short version, and `Widget.js` itself
for the full doc comment on every part (`Thread`/`Composer`/`Debug`).
