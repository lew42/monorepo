A page's claim on the wall it sits in: `"wide" | "tall" | "big"`.

**Usage** — carried by `nav_for()` and applied by `preview_card()`
(`Page.class.js:181`), which puts the bare word on the card so `Page.css` reads it as
`.page-preview.tall`. Live declarations: `framework/styles/layouts/{shell,mail,chat}/page.js`
(`"tall"`), `framework/ui/stats/page.js` (`"two"`), `framework/ui/timeline/page.js`
(`"tall"`), and a run of them in `framework/styles/sections/page.js`.

**Necessity** — marginal, and honest about it: three declarations. It survives because
the alternative is a parent hand-listing which of its children are wide, which is the
duplication `label` and `icon` were moved to avoid.

**Simplicity** — right-sized as a string. The two words do different jobs, and neither
is a size:

```
wide   a second column
tall   double the thumb's ceiling — a render that only reads whole
big    both
```

**`tall` is not a row span any more.** The wall is `align-items: start`, so a card never
fills a row it was given; doubling `--thumb-max` is what "tall" actually meant. Derived
from the token rather than a fourth one, so retuning the wall retunes the exception.

**`previews()` used to ignore this entirely** — the cards were flat 60px link rows, and
forcing a two-row span onto one left a 72px hole beside it. They are the wall now, so it
applies. One sharp edge: **spans do not clamp themselves.** `auto-fill` must generate at
least as many tracks as the widest span demands, so a `wide` card forces a second track
even at one column unless the wall sets a floor — `Page.css` carries the `28em` guard.
