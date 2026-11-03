## What this file is

Nine named starting points, as spec text. Nothing else — no functions, no
classes, one exported object of strings.

## Every name is a directory

`document docs shell split mail dashboard landing gallery masonry` are all real
paths under `/framework/styles/layouts/`, so a preset button and the rail's own
worked page are the same layout said two ways: one as a string, one as a
`page.js`. That is the claim this whole directory makes, and the preset list is
where it is easiest to check — open the preset, open the directory, compare.

They are ordered by how much frame they carry (one column, then rails, then
panes), so reading down the row is itself the lesson.

## Four presets became nine

It shipped with `docs mail landing wall`, which reached two of the rail's
shapes. The five added ones each buy a shape the format could not otherwise
show: `document` (a `measure` column), `shell` (a column *inside* a rail —
the one shape `gen()` has no move for), `split` (two independent scrollers),
`dashboard` (two walls at two `--column`s) and `masonry` (the only ragged
part). `wall` was renamed `gallery` so that every name is a directory.

## Improvements

1. **`feed` and `chat` are still unreachable.** `feed` is close enough to
   `docs` that a tenth entry would be noise; `chat` needs a composer pinned by
   its transcript, and there is no part for it in `web.js`. Adding one is a
   change to the shared content object, which is a bigger call than this file.
   *(low — the format's reach, not this file's)*
