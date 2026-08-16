# devbar — $BLOCKRELOAD checkbox + ✕ hard right

## The ask (verbatim)

> add window.$BLOCKRELOAD as a boolean checkbox control in header of the devbar.
> also, make the X slide to the right of the header

## Scope

`public/framework/dev/DevBar/` only — `DevBar.js` (the head builder) and
`devbar.css` (the head's flex). Nothing in `dev/Socket/` changes: it already
reads `window.$BLOCKRELOAD` in both `reload()` and `changed()`, and that global
stays the single source of truth (RULE#8 — no second copy of the state).

## Proposal

1. Read the head + the `$BLOCKRELOAD` call sites in `Socket.js`.
2. Add the checkbox to `.dev-head`, writing `window.$BLOCKRELOAD` directly.
3. Move the auto margin off `.dev-hint` onto `.dev-x` so the ✕ pins to the
   inline end whatever else lands in the head.
4. Verify in the browser at rail widths 17rem and the 200px floor — the head
   must not wrap or clip.
5. Update `DevBar/readme.md` if the head's contract changed.

## Notes

Deliberately NOT persisted through `settings.js`'s `knob()`: a knob is a class
on `<html>`, and this is a window global. Two stores for one boolean is exactly
the black magic RULE#8 forbids, and a block that silently survived a reload
would read as "live reload is broken". Off on every load; the checkbox says so.
