# Edit — source, preview, and a draft that survives a reload

Editing `welcome.md`: a textarea, a live preview, one Save button. `page.js` is the whole
thing.

## Use

Type — the preview redraws every keystroke, and `page.store()` (core, keyed on this page's
own url) patches the in-progress text after a short pause. Reload mid-edit and it comes back,
with the site's amber "Modified" mark and a two-press Reset above the editor (`baseline()`,
2026-09-05 — was a bespoke "draft · restored" span; `Reset`'s second press calls this page's
own `discard()`, so it still returns to disk in place, no reload). Save or Reset both clear
the draft; only Save touches the file on disk.

## Watch out

- A draft equal to what's already on disk is treated as no draft — restoring it would be
  restoring nothing.
- `baseline()`'s default `restore()` clears the draft and reloads — this page passes its own
  `restore` (`discard()`) instead, because there is real typed text worth putting back in
  place rather than re-fetching: [`doc/decisions.md`](/imagine/cms/edit/doc/decisions/).

## More

- [`/imagine/cms/`](/imagine/cms/) — the pipeline this page is one seam of.
- [`page.store()`](/framework/core/Page/doc/method/store.md) — get/set/patch/clear, one call
  each.
