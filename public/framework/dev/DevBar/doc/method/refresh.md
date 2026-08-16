> If this page shows a "Replaced at runtime" banner above the source: it's
> wrong. `devbar.refresh` was never patched — see this audit's top
> recommendation in `framework/audit/modules/dev.md` for why `Doc`'s patch
> detector false-positives on every method of a non-class subject.

## Usage

Two callers, both outside this file:

- `public/app.js` — `navigated(){ devbar.refresh(); }`, Router's documented
  post-navigation hook.
- `DevBar.js` itself — the `resize` listener, and once after `restore()`
  settles on boot.

## Necessity

Essential. Everything the rail shows — the route, the socket state, which
preset is lit — is read **at render time**, and nothing in this module
listens for those things changing on its own. A navigation with no call to
`refresh()` would leave the rail showing the previous page's crumbs and title
forever.

`if (open())` is the whole guard: a closed rail never rebuilds, so a page
with the DevBar shut pays nothing extra per navigation beyond one class check.

## One section is no longer free to rebuild

`layout` runs an analysis of the page, and `refresh()` fires on **every resize
event** — so a one-second drag builds sixty of them. The section carries its
own generation counter for exactly this: only the newest readout's timer,
observer and import callback do any work, and the other fifty-nine notice they
have been replaced and stop.
[Measuring](/framework/dev/DevBar/docs/measuring/) has the mechanism. Anything
else added to `sections` that costs more than reading a value should assume the
same treatment, or debouncing this listener stops being optional.

## Simplicity

Right-sized — one line. `$body?.empty(() => sections.forEach(...))` rebuilds
the entire body from `tools.js`'s array every time, rather than patching a
diff. That is the correct amount of machinery for a panel that redraws on a
handful of discrete events (navigate, resize, open) rather than continuously —
seven small sections, `empty()`+rebuild included, cost nothing a human notices.

The `?.` guards the boot ordering: `refresh` can be called (by the `resize`
listener) before `devbar(app)` has run and set `$body`, and a plain `.empty`
would throw instead of silently no-oping.
