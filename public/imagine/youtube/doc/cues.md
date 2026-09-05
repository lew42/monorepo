# cues() — the whole timeline engine

```js
player.cues([{ at: 25, fn: () => this.step(1) },
             { at: 65, fn: () => this.step(0) }]);
```

Five of the six labs are built out of nothing else. It lives in its own file — `cues.js`, two
small classes and no mention of video anywhere in it — and it is one comparison: **how many
marks are behind the playhead.**

```js /imagine/youtube/cues.js
run(time){
    let to = -1;
    while (this.marks[to + 1] && this.marks[to + 1].at <= time) to++;
    if (to === this.crossed) return this;

    let from = this.crossed;
    if (to < from){ this.fire("reset"); from = -1; }      // going BACK

    this.crossed = to;
    for (let i = from + 1; i <= to; i++) this.marks[i].fn?.(this.marks[i], this);
}
```

## The rule, and the three behaviours it buys

**Forward runs what was crossed. Backward fires `reset` and replays from the start.** That is
the entire specification, and the three things the ask named all fall out of it:

| what you do | what happens | why |
|---|---|---|
| play through | one cue at a time, in order | each tick crosses one mark |
| scrub FORWARD | every cue in between runs at once | the room catches up, it does not skip |
| scrub BACK | `reset`, then every cue up to the new position | you see the screen that position had |

`chat/` is the clearest reading of it: 18 messages, one cue each, and `reset` empties the log.
Measured headless — seek to 0s → 0 messages, 60s → 7, 180s → 18, back to 30s → 3.

## The one rule a cue must obey

**A cue's `fn` sets an ABSOLUTE state, never a delta.** `step(2)` is fine; `step(current + 1)`
is not. That is what makes the replay correct, and it is why no cue ever needs an undo.

## The consequence that bit

**A backward scrub replays EVERY cue, so a side effect outside the DOM fires N times.**
`course/`'s first draft navigated from a cue's `fn`, and scrubbing back across three chapters
fired three `router.go()`s in a row, racing each other for which page won.

The fix is not a debounce — it is to use the engine's **index** instead of its fires:

```js
current(){ return this.marks[this.crossed]; }             // which mark the playhead is inside
```

`course/` asks that once per tick and makes exactly one navigation decision, whatever the
playhead just did. So the engine has two halves, and which one a page wants is the design
question:

- **the fires** (`fn`, `reset`) — for anything whose state lives in the DOM and is cheap to
  rebuild: `chat/`, `yield/`, `split/`, and the tour's narration.
- **the index** (`current()`) — for anything with a side effect out in the world: `course/`'s
  routing, `marks/`'s readout. Idempotent by construction.

## The engine is not a video player

`Cues` has no events of its own. The **owner supplies `fire` by assign**, so a page keeps
listening to the one object it already holds:

```js
this.timeline = new Cues({ fire: (...args) => this.fire(...args) });   // Player does this
```

`Player` is then three lines of delegation — `cues()`, `run()`, `current()` — and everything
else in `youtube.js` is the IFrame API. Two more verbs exist for callers that are not a video:

- `set(list)` — REPLACE the marks. An authoring tool edits its list while the clock runs, and
  appending is the wrong verb for that. `marks/` is the page that needs it.
- `rewind()` — forget the crossings, so the next read replays. `Player.swap()` calls it.

## Clock — a time source that is not YouTube

`performance.now()` never stops, so a timeline built straight on it jumps forward by however
long you were paused. `Clock` banks the elapsed seconds on every pause:

```js /imagine/youtube/cues.js
time(){ return this.since === null ? this.at : this.at + (performance.now() - this.since) / 1000; }
```

`start` · `pause` · `toggle` · `seek` · `running` · `time`. ⚠ `seek` moves `since` as well as
`at` — without that, a seek taken while running is undone by the elapsed time still hanging off
the old mark.

## What the extraction bought

[`/imagine/scenes/tour/`](/imagine/scenes/tour/) imports `Cues` and `Clock` from this file
unchanged and walks a 3D world's urls with them: ten waypoints, `router.go()` at each mark,
the narration read from `current()` every beat. It is the same engine that fires `chat/`'s
messages, driven by wall time instead of by `getCurrentTime()`. Welded to a `Player`, it could
only ever have done the first job.

⚠ The formatters — `clock(seconds)` and `seconds(text)` — live here too, and not in
`youtube.js`, because importing the player just to print `"1:32"` would have pulled a
stylesheet and Google's loader into a 3D scene.

## Resolution

The engine is only as fine as whatever drives it. `Player` reads at 250ms (`Player.tick`) — see
[`api.md`](/imagine/youtube/doc/api/) for why there is a poll at all — and the tour beats at
the same 250ms on purpose. A cue fires within an eighth of a second of its mark on average,
which is under the threshold anyone notices for a UI change; it is **not** tight enough for
anything that must land on a frame.

## Related

- [`api.md`](/imagine/youtube/doc/api/) — the poll, and why the getters lie for a moment
- [`yield.md`](/imagine/youtube/doc/yield/) — the cue table as a rhythm, not just a list
- [`marks.md`](/imagine/youtube/doc/marks/) — where a cue table comes from in the first place
