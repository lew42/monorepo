# The IFrame Player API — what it gives you, and the two things it does not

[Reference.](https://developers.google.com/youtube/iframe_api_reference) Load
`https://www.youtube.com/iframe_api`, then `new YT.Player(el, { … })`. It is an external
script and the one this lab allows: it is YouTube's own loader and there is no other way in.

## Loading it — a global callback, not a load event

```js
window.onYouTubeIframeAPIReady = () => resolve(window.YT);
```

⚠ **The script's own `load` event fires BEFORE `YT.Player` exists.** The API announces itself
by calling a global, so that global is what resolves the promise. `api()` in `youtube.js` keeps
whatever handler was already there and calls it, so this can never be the thing that breaks
another loader on the page.

⚠ **`new YT.Player(el)` REPLACES `el`** with an iframe. The View you handed it is stale the
moment it returns; `player.getIframe()` is the handle, and the CSS styles `.yt-stage iframe`
rather than anything that was there before.

`host: "https://www.youtube-nocookie.com"` works, and the whole lab uses it.

## THE ONE THING IT DOES NOT HAVE: a time event

There is no `timeupdate`. `onStateChange` tells you play/pause/buffer/end and nothing about
where the playhead is between them. **So the timeline is read back**, and every timeline in
this lab is that read:

```js
this.timer = setInterval(() => this.read(), this.tick);   // tick = 250ms
```

Four times a second, and **only while playing** — `watch()` is the one place that decides
whether a timer exists, called from `onStateChange` and from nowhere else, so there is exactly
one place a leak could come from.

⚠ **The poll must die on `deactivated()`, not on a state change.** A page can be left while
PAUSED, and an orphan interval is invisible. `rest()` pauses the video and clears the timer;
`Player.live` is the document-wide count of running polls and is 0 after you leave (measured:
1 while playing, 0 after navigating to a sibling column).

## THE SECOND THING: the getters answer stale

⚠ **Every setter crosses into the iframe by `postMessage`, so the getter does not see it on the
same turn.** `seekTo(360)` followed immediately by `getCurrentTime()` returns where you *were*.

While playing this is invisible — the poll catches up 250ms later. **While PAUSED nothing would
ever re-read**, and a typed seek looked like it did nothing at all (headless, 2026-08-30: the
readout sat at `0:01.2` after a seek to `6:00`). One delayed read is the whole fix:

```js
settle(){
    clearTimeout(this.later);
    this.later = setTimeout(() => this.read(), 350);
    return this;
}
```

Every setter returns `this.settle()`. One timer, replaced not stacked, and cleared by `rest()`.

## The surface, as `Player` methods

| method | the call underneath |
|---|---|
| `play` `pause` `stop` | `playVideo` `pauseVideo` `stopVideo` |
| `seek(s)` | `seekTo(s, true)` — `true` = seek even while paused |
| `rate()` `rate(r)` `rates()` | `getPlaybackRate` `setPlaybackRate` `getAvailablePlaybackRates` |
| `volume()` `volume(v)` `mute(on)` `muted()` | `getVolume` `setVolume` `mute`/`unMute` `isMuted` |
| `time()` `duration()` `loaded()` | `getCurrentTime` `getDuration` `getVideoLoadedFraction` |
| `state()` `said()` | `getPlayerState`, and its name |
| `swap(id, cue)` | `loadVideoById` (plays) / `cueVideoById` (prepares) |

Events, re-fired by name: `ready` `state` `rate` `error`, plus the engine's own `time` `cue`
`reset`. Every method is null-safe — a control can be pressed before the iframe exists and the
page must not throw at the reader.

## Getting at it by hand

Every player registers itself, which is also how the console explores the API:

```js
const p = (await import("/imagine/youtube/youtube.js")).Player.all.at(-1);
p.seek(360); p.rate(1.5); p.said();
```

## Autoplay

The player is built inside the click on `.yt-start`, and that click is the user gesture — so
`playVideo()` in `onReady` starts with sound. A browser that refuses still shows a player with
its own play button, which is the correct degradation. Headless verification runs muted, which
every autoplay policy allows.

## Related

- [`cues.md`](/imagine/youtube/doc/cues/) — what the poll is for
- [`decisions.md`](/imagine/youtube/doc/decisions/) — the record
