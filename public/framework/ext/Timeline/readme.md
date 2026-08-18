# Timeline — a general h/v timeline (CSS-var positioning, greedy lanes, window bands) for anyone plotting dated items

## Use

```js
import { Timeline } from "/framework/ext/Timeline/Timeline.js";

new Timeline({ orientation: "h", zoom: 6, items: [
	{ from, to, label, kind: "task", url },   // a bar; omit `to` = open, runs to now
	{ at, label, kind: "log" },                 // a dot
]});
```

`kind` is a CSS class (`task agent log action window day`); `url` makes the item a real `<a>`; `children` nest inside a bar.

## Watch out

- `lane` means two things — an item's `lane: "name"` pins a shared track; the constructor's `lane` is em per lane. [doc/property/lane.md](./doc/property/lane.md)
- `zoom`/`orientation`/`reverse` are read once at `render()`, no live setters — write `--em-per-hour` yourself or build a second one. [doc/decisions.md](./doc/decisions.md)
- An item's end time lives in `end()` only; `lay()` and `item()` once computed it separately and drifted. [doc/method/end.md](./doc/method/end.md)
- `day` markers pack like ordinary items and can take a lane they never visually use; `window` skips the packer. [doc/decisions.md](./doc/decisions.md)
- Not [`ui.timeline()`](/framework/ui/timeline/) — a dated list with no time axis, same English name. [doc/decisions.md](./doc/decisions.md)

## More

- Page: [/framework/ext/Timeline/](/framework/ext/Timeline/) · [doc/decisions.md](./doc/decisions.md) the design record and history · [doc/phase-2.md](./doc/phase-2.md) deferred, not built
- `doc/method/*.md`, `doc/property/*.md` — one per API name · `doc/file/*.md` — one per file
- Files that matter: `Timeline.js` (the class), `Timeline.css` (skin per `kind`), `ai.js` (AI-log adapter, no callers)
