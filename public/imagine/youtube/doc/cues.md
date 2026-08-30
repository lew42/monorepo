# cues() — the whole timeline engine

```js
player.cues([{ at: 25, fn: () => this.step(1) },
             { at: 65, fn: () => this.step(0) }]);
```

Four of the five labs are built out of nothing else. It is about twenty lines in `youtube.js`
and it is one comparison: **how many cues are behind the playhead.**

```js
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
current(){ return this.marks[this.crossed]; }             // which cue the playhead is inside
```

`course/` asks that once per tick and makes exactly one navigation decision, whatever the
playhead just did. So the engine has two halves, and which one a page wants is the design
question:

- **the fires** (`fn`, `reset`) — for anything whose state lives in the DOM and is cheap to
  rebuild: `chat/`, `yield/`, `split/`.
- **the index** (`current()`) — for anything with a side effect out in the world: `course/`'s
  routing. Idempotent by construction.

## Resolution

The engine is only as fine as the poll, and the poll is 250ms (`Player.tick`) — see
[`api.md`](/imagine/youtube/doc/api.md) for why there is a poll at all. A cue fires within an
eighth of a second of its mark on average, which is under the threshold anyone notices for a
UI change; it is **not** tight enough for anything that must land on a frame.

## Related

- [`api.md`](./api.md) — the poll, and why the getters lie for a moment
- [`yield.md`](./yield.md) — the cue table as a rhythm, not just a list
