# devbar-drawer-naming

## The ask, verbatim

> the inspector (white) sidebar, not the devbar, is called what? where does it live?
>
> btw, the Dev rail (on the nav).. why "Dev rail" when the thing is clearly called DevBar?

Answered: the white inspector sidebar is `ext/drawer` (the shell) filled by
`ext/Panel/properties.js` (the inspector) via `ext/Panel/tools.js`. The nav label
comes from `label: "Dev rail"` in `dev/DevBar/page.js`, with no recorded reason —
and it collides with `ext/drawer`, whose own readme calls itself "the right rail".

Then:

> yes, and add notes in both readme's about the other's existence, because they
> can be open at the same time.

## Scope

1. `public/framework/dev/DevBar/page.js` — `label: "Dev rail"` → `label: "DevBar"`.
2. `public/framework/dev/DevBar/readme.md` — a line naming `ext/drawer`: both dock
   at the inline end, both can be open at once, and the drawer offsets itself by
   `--devbar` so it sits beside this rail rather than under it.
3. `public/framework/ext/drawer/readme.md` — the same fact from the other side,
   naming `dev/DevBar`.

## Fences

- No agents. One session, three files.
- Do NOT rename the module, the CSS classes, or `--devbar`. Label + two readme
  lines only.
- Do NOT restate the docking mechanics in the readmes — one line each, pointing
  at the doc that already carries the detail (`drawer/doc/decisions.md`,
  `DevBar/doc/docking.md`).
