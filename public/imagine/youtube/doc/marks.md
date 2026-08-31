# marks/ — where a cue table comes from

Every other lab here carries a table of numbers somebody watched a video with a stopwatch to
write: `course/`'s five chapters, `yield/`'s seven beats, `chat/`'s eighteen lines. This page
is the stopwatch. [/imagine/youtube/marks/](/imagine/youtube/marks/)

Press play, press **M** at each boundary, name them, copy the array out.

## The shape, and why there is no Apply button

**The marks you are making ARE the live timeline.** The page owns a `Cues` of its own
([`cues.md`](./cues.md)) and runs it off the player's clock, so the "now showing" line under
the video is derived from the very array in the box below it:

```js /imagine/youtube/marks/page.js
sync(){
    this.marks.set(this.rows.map(row => ({ at: row.at, name: slug(row.title), title: row.title })));
    this.$out.text(this.emit());
}
```

One source, two readings. There is no preview that could disagree with the output, and nothing
to press to make the edit take effect — which is the whole reason `Cues` grew `set()`.

It reads the engine's **index** (`current()`), never a cue's `fn`: editing a time re-sorts the
list under a running playhead, and one derived answer per tick cannot be confused by that.

## Measured

Marked 0 / 82 / 360 / 585 by keypress while the talk played, named each, then edited `9:45` to
`9:00` — the row re-sorted and the array re-emitted at `540`. The emitted source, parsed and
pushed into a **fresh** `Cues`, answers `current()` identically to the page's own live line at
30s, 200s, 400s and 700s: 4 of 4.

## Watch out

- **A row holds two text inputs**, so `M` has to stand down while you are naming a mark — the
  same `closest("input, textarea, select, [contenteditable]")` guard the panel's transport uses.
- **The list is redrawn whole on add, delete and re-sort — never on a keystroke.** Rebuilding
  it while you type takes the caret out from under you mid-word; a title edit updates the model
  and re-emits, nothing more.
- **The clipboard is permissioned and can simply refuse.** The button says `Select it` rather
  than throwing at a reader who can select the text perfectly well.
- The starting video is Steve Jobs at Stanford **on purpose** — it is what `course/` is built
  on, so what you copy out is pasteable straight into that page's `CHAPTERS`.

## What this does not do

YouTube publishes real chapters for videos that have them, but not through the IFrame API — it
would need the Data API and a key, which is a server, which production does not have. This is
the answer that fits a static site: a human watches once and the machine writes the numbers
down.
