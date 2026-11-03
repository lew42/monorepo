# DevShell — Ctrl + \ opens a dark shell around the whole site: page tree left, the dev bar's own tabs right

## Use

```js /app.js
import devshell from "./framework/dev/DevShell/DevShell.js";

render(){ …; devbar(this); devshell(this); },   // both mount; only one is ever open
navigated(){ devbar.refresh(); devshell.refresh(); },
```

Nothing else to call — it is `Ctrl + \` by default, the owner's own ask (2026-09-30: "I want a
dark mode shell around the entire site… let's use the dev bar and kind of merge that in").

## Watch out

- **It is `new Shell({ frame: true, dark: ["head", "left", "right", "foot"], … })`, not a second rail system** —
  [`core/Shell`](/framework/core/Shell/) does the grid, the resizable rails, the 34em stack and the
  four `--shell-*` push tokens; this module only supplies what goes in each region and its own thin
  CSS. Read `core/Shell`'s own readme first if the grid itself looks wrong — it is almost certainly
  not this file.
- **The right side reuses `dev/DevBar`'s own tabs by import, never a copy** — `tools.js`'s `tabs`
  array is the same one the old rail renders; a section added there shows up in both rails with no
  DevShell edit. The left side is the `page` tab's own sections (`structure`, route, etc.), always
  shown, not behind a tab.
- **Only one of `dev/DevShell` and `dev/DevBar` is ever open** — Ctrl + \ opens this one by default;
  the "v1" button in this shell's header (or the "shell" button in the old rail's header) switches,
  remembered in `pref.js`'s one `localStorage` flag. Neither file imports the other's whole module
  — that would be an import cycle — so the reverse direction (old rail asking the shell to open)
  is a `window` event, `dev-open-shell`: [`doc/decisions.md`](./doc/decisions.md).
- **Closing it is `display: none`, nothing torn down** — same pattern `dev/DevBar` already uses:
  mounted once at boot, a class on `<html>` (`dev-shell-open`) is the whole open/closed state. A
  hidden `frame` region reports zero size to `core/Shell`'s own `ResizeObserver`, which is why
  `.app`'s padding (`framework.css`, this same task) needs no extra "closed" rule of its own — off
  really is exactly as before: [`doc/decisions.md`](./doc/decisions.md).

## More

- [`doc/decisions.md`](./doc/decisions.md) — why left is fixed content and right is a tab switcher,
  the `pref.js` / event-not-import trick, what a fresh mastermind should check
- [`core/Shell`](/framework/core/Shell/) — the grid this is built on · [`dev/DevBar`](/framework/dev/DevBar/) —
  v1, still there, and where the right side's tabs actually live
- Files that matter: `DevShell.js` (mount, toggle, the header/left/right/footer content) ·
  `DevShell.css` (open/closed, the head line, the tab row — everything else is `core/Shell`'s or
  framework.css's own) · `pref.js` (the one "which rail does Ctrl + \\ open" flag, shared with
  `dev/DevBar`)
