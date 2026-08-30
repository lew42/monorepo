# youtube-lab — the YouTube lab at /imagine/youtube/

## The ask, verbatim

"make a YouTube sub page on our imagine page. explore the YouTube playback API. if I wanted
to create navigation around the YouTube video, consider a course-like experience. consider
interactive timeline-triggered UI. consider these setups: the video hides, and instead of
showing a video of the UI, we just show the actual interactive UI. the video is mostly there
for audio. consider a split screen video + UI (could be a form, UI controls, etc). create a
YouTube playback control panel, so I can explore the API options. create some demos that show
what could be possible for timeline-based interactions. you could have time-based chat, for
example."

## Priority

The **course-mode** and **video-yields-to-UI** experiences are the heart; the control panel
serves exploration.

## Five child pages, verdict each

1. `panel/` — the API explorer: video beside a full control surface (play/pause/seek bar +
   typed seek, rate, volume/mute, load-by-id, state + time readouts live). Every exposed
   method a labeled control; every event logged to a small feed.
2. `course/` — chapters as real pages (the framework IS the chapter nav). Click a chapter →
   seek. Playhead crossing a boundary → that chapter's page activates. Both directions proven.
3. `yield/` — at cue points the video STEPS ASIDE (shrinks to a corner thumbnail, keeps
   playing, audio continues — never `display:none` a playing player) and the real interactive
   UI takes the stage; at segment end the video returns.
4. `split/` — video one side, live UI the other; fields highlight/prefill at timeline cues.
5. `chat/` — time-based chat replay keyed to timestamps; scrubbing back replays, forward
   fast-forwards.

The compaction: one `cues([{at, fn}])` engine, written once, shared by 3–5 pages.

## Fence

`public/imagine/youtube/**` only.

## Hard rules

- Never kill/restart the :80 dev server; never drive owner tabs; never stash; never commit.
- Don't touch ext/Playground, dev/DevBar, ext/grip.
- Probe screenshots to the session scratchpad (`yt-*`); keepers to this task dir.

## Technical base

YouTube IFrame Player API — load `https://www.youtube.com/iframe_api`, `new YT.Player(el, {})`,
events onReady/onStateChange/onPlaybackRateChange, methods playVideo/pauseVideo/seekTo/
getCurrentTime/getDuration/setPlaybackRate/mute/setVolume/loadVideoById/cueVideoById/
getPlayerState. **There is no `timeupdate` event** — poll `getCurrentTime()` ~4x/s while
playing. Works with the `youtube-nocookie.com` host.
