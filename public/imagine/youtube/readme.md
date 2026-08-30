# YouTube — the IFrame Player API, and five things a timeline can drive

Five labs at [/imagine/youtube/](/imagine/youtube/). One shared module — `youtube.js` — holds
the api loader, a `Player` wrapper, and the `cues()` engine four of the five pages are built
out of. Nothing loads a Google iframe until you press play.

## Use

```js
import { Player, clock, TALKS } from "../youtube.js";

content(){
    div.c("yt-lab", () => {
        this.player = new Player({ video: TALKS.jobs });          // the stage builds itself here

        this.player.cues([{ at: 25, fn: () => this.aside(true) },
                          { at: 65, fn: () => this.aside(false) }]);

        this.player.on("reset", () => this.aside(false));         // a backward scrub
        this.player.on("time", t => this.$clock.text(clock(t)));
    });
},

deactivated(){ this.player?.rest(); },                            // the poll dies with the page
```

## Watch out

- **There is no `timeupdate` event.** The timeline is `getCurrentTime()` polled four times a
  second, and the poll only exists while something is playing — [`doc/api.md`](./doc/api.md).
- **`rest()` on `deactivated()`, always.** Without it the interval outlives the page. `Player.live`
  is the document-wide count of running polls; it must be 0 after you leave.
- **Every setter crosses into the iframe by postMessage**, so the getters answer with the OLD
  value on the same turn. `settle()` re-reads once, 350ms later; without it a typed seek while
  paused looked like it did nothing at all — [`doc/api.md`](./doc/api.md).
- **Never `display: none` a playing player.** It is torn out of layout and the sound stops.
  `yield/` scales and translates it instead — [`doc/yield.md`](./doc/yield.md).
- **A backward scrub replays every cue from the start**, so a cue's `fn` must set an ABSOLUTE
  state and anything with a side effect outside the DOM has to be derived per tick instead —
  [`doc/cues.md`](./doc/cues.md).
- **Under 32em of row the columns page one at a time**, so `course/` stands its automatic
  navigation down there rather than scrolling its own video off screen.
- The chapter marks are approximate seconds in one array per page. Retuning a page is editing
  five numbers.

## More

- [`doc/cues.md`](./doc/cues.md) — the engine: one comparison, and why backward is a replay
- [`doc/api.md`](./doc/api.md) — what the IFrame API gives you, and the two things it does not
- [`doc/yield.md`](./doc/yield.md) — the video steps aside: the shape, and what was rejected
- [`doc/decisions.md`](./doc/decisions.md) — the record: widths, `bleed`, the two directions, what was cut
- Files that matter: `youtube.js` (the whole engine), `youtube.css` (one sheet, `yt-` prefix)
- The column shape these pages sit in: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/)
- The lazy-embed pattern they inherit: [/imagine/feeds/video/](/imagine/feeds/video/)
