# drawer — the right rail, for anything that needs a place beside the page: one per document, opened by any caller, shut only by its own ✕; it pushes the page, never covers it.

## Use

```js
import { drawer } from "/app.js";

drawer(($slot, $body) => {
    $slot.empty(() => { span("What this is about"); });   // pinned head, beside the ✕
    $body.empty(() => { /* the controls */ });            // scrolls
});
drawer.refresh();     // the same content again, for a subject that changed
drawer.close();       // what the ✕ calls
drawer.showing();     // is it open
```

## Watch out

- Mount inside `.app`, never on `<body>` — colour-scheme and `--drawer` are read there · [doc/decisions.md](./doc/decisions.md)
- `rem`, not `em`: an `em` width reserves the wrong strip · [doc/decisions.md](./doc/decisions.md)
- `position: fixed` opts out of the push — `.page.layout-full` restates the reservation on its own `inset-inline-end`; a shared `--rail-push` token is proposed, not applied · [doc/decisions.md](./doc/decisions.md)
- Below `26rem` the rail is the whole sheet; that breakpoint mirrors `--rail-floor`'s default by hand · [doc/decisions.md](./doc/decisions.md)
- `drawer()` runs on every redraw — a listener on the returned rail is wired once, behind a flag · [doc/decisions.md](./doc/decisions.md)
- `z-index: 40`: over `.demo.max` (30), under the mode button (60); it docks beside the dev rail (`--devbar`), not under it · [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/ext/drawer/) · [doc/decisions.md](./doc/decisions.md) — the split from `ext/layout`, why only the ✕ closes it, every trap in full · [doc/file/](./doc/file/) — one note per file
- Files that matter: `drawer.js` (shell, push, ✕), `drawer.css` (strip, sheet, z-index), `page.js` (live demo)
