A page's claim on the wall it sits in — **one word now, `"tall"`**.

**Usage** — carried by `nav_for()` and applied by `preview_card()`
(`Page.class.js:181`), which puts the bare word on the card so `Page.css` reads it as
`.page-preview.tall`. Live declarations: `framework/styles/layouts/{shell,mail,chat}/page.js`
(`"tall"`), `framework/ui/stats/page.js` (`"two"`), `framework/ui/timeline/page.js`
(`"tall"`), and a run of them in `framework/styles/sections/page.js`.

**Necessity** — marginal, and honest about it: three declarations. It survives because
the alternative is a parent hand-listing which of its children are wide, which is the
duplication `label` and `icon` were moved to avoid.

**Simplicity** — right-sized as a string, and down to one word:

```
tall   double the thumb's ceiling — a render that only reads whole
two    deleted 2026-08-17 (still parsed, draws nothing)
big    was "both"; now exactly `tall`
```

**`tall` is not a row span.** The wall is `align-items: start`, so a card never fills a
row it was given; doubling `--stage-max` is what "tall" actually meant. Derived from the
token rather than a fourth one, so retuning the wall retunes the exception.

**Why `two` went.** It was `grid-column: span 2` and had exactly one user — Stat tiles,
whose preview draws nothing, so the claim bought a card twice as wide around the same
void. And **spans do not clamp themselves**: `auto-fill` must generate at least as many
tracks as the widest span demands, so one `two` card forced a second track even at one
column, which took a second `@media (max-width: 28em)` rule to undo. Two rules, one
undoing the other, for one empty box —
[`ai/2026-08-17/vision-after/proposal.md`](/framework/ai/2026-08-17/vision-after/proposal.md) #6.
A card that wants the room is a wider `--column` on the wall, which is the container
deciding rather than one item opting out.
