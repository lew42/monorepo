# The video steps aside

The ask, verbatim: *"the video hides, and instead of showing a video of the UI, we just show
the actual interactive UI. the video is mostly there for audio."*

[/imagine/youtube/yield/](/imagine/youtube/yield/) — at 0:25 the player shrinks into the corner
and a real three-step form takes the stage. At 1:05 the video comes back. Three times.

## The shape

One box, two absolutely-positioned layers, and **one class on the box**:

```
.yt-yield-stage            16:9, min-height 20em, position: relative
  .yt-yield-video          inset 0, z-index 2   ← the player
  .yt-yield-ui             inset 0, z-index 1   ← the real UI
```

```css
.yt-yield-stage.yt-aside .yt-yield-video {
    transform: translate(-2.5%, -3.5%) scale(var(--yt-aside, 0.3));
    transform-origin: 100% 100%;
    box-shadow: 0 0 0 4px var(--surface), 0 1.5em 4em rgba(0,0,0,0.4);
}
.yt-yield-stage.yt-aside .yt-yield-ui { opacity: 1; visibility: visible; }
```

Measured headless at 1920: the video box is **1021 × 573** on stage and **306 × 172** aside,
`iframe` computed `display: block` at both, and `player.said()` reads `playing` throughout.

## ⚠ Never `display: none` a playing player

That was the first thing tried and it is the reason this page exists. A `display: none` iframe
is torn out of layout; the browser is free to stop it, the sound goes, and the position is
lost. **A transform is a paint, not a re-attach** — the element never leaves the box tree, so
the video keeps playing and the audio never breaks. Nothing is destroyed and nothing is rebuilt.

The same reasoning rules out re-creating the player small, or moving the iframe in the DOM: an
iframe that is re-parented reloads.

⚠ **`visibility`, not `display`, for the UI layer too** — but for the opposite reason. A hidden
step must be out of the tab order, and `opacity: 0` alone leaves every field focusable.

## The rhythm is a table

```js
const BEATS = [
    { at: 0,   step: 0, say: "video on stage" },
    { at: 25,  step: 1, say: "step 1 — the video stepped aside" },
    { at: 65,  step: 0, say: "video back on stage" },
    …
];
```

Aside, back, aside, back, aside, back — the return is as much of the design as the departure.
Every beat sets an absolute step number, so a backward scrub replays the table and lands on the
right screen ([`cues.md`](/imagine/youtube/doc/cues/)).

## The data is yours, the step is the timeline's

Type your name at 0:30, scrub to 2:20, come back — it is still there. **The cues decide which
step is on screen and nothing else.** `split/` takes the same rule further: a value the
timeline offered is taken back on a rewind, a value you typed is not (`this.auto` is the set it
remembers).

## Honest about the audio

The narration is a real TED talk, so it is not describing this form. **The mechanism is what
the page shows.** Record narration for your own UI, change the seven numbers in `BEATS`, and
nothing else on the page moves.

## Related

- [`cues.md`](/imagine/youtube/doc/cues/) — the engine
- [`decisions.md`](/imagine/youtube/doc/decisions/) — what was cut
