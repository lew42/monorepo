# Edit — source, preview, and a draft that survives a reload

Editing `welcome.md`: a textarea, a live preview, one Save button. [`page.js`](./page.js) is
the whole thing.

## Use

Type — the preview redraws every keystroke, and `page.store()` (core, keyed on this page's
own url) patches the in-progress text after a short pause. Reload mid-edit and it comes back,
with a quiet "draft · restored" note and a Discard button beside it. Save or Discard both
clear the draft; only Save touches the file on disk.

## Watch out

- The draft note reads "restored" even for text you typed and never reloaded — the label
  means "there is an unsaved draft," not literally "this page just loaded it." Simpler than a
  second label for the same state: [`doc/decisions.md`](./doc/decisions.md).
- A draft equal to what's already on disk is treated as no draft — restoring it would be
  restoring nothing.

## More

- [`/imagine/cms/`](/imagine/cms/) — the pipeline this page is one seam of.
- [`page.store()`](/framework/core/Page/doc/method/store.md) — get/set/patch/clear, one call
  each.
