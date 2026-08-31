# improve-scenes-yt

## The ask (verbatim)

> TASK — improve the 3D scenes and the YouTube labs: look, brainstorm, build.
>
> LOOK first (drive both live): `/imagine/scenes/` (foyer + 4 worlds + gallery room, slot model,
> sprite labels — readme + doc/{slots,grains,atmosphere,observatory}) and `/imagine/youtube/`
> (5 labs on the cues() engine). BRAINSTORM 8-12 ranked improvements each as log lines.
> BUILD the top 2-3 S/M per lab — candidates to weigh: scenes — sound? no (audio autoplay is
> hostile); a camera TOUR (a `tour` page whose cues walk the existing worlds on a timer —
> composing the youtube cues() engine with the 3D pager would be the flagship cross-lab feature),
> clickable-object hover cursor + tooltip affordance polish, a sixth door only if a genuinely
> distinct idea earns it; youtube — a chapter-authoring helper (click "mark chapter" while
> watching → emits the cues array to copy — the course page's hand-typed seconds problem),
> keyboard transport (space/arrows) on the panel, the yield timing editable live.
> The `cues()` engine is shared — an improvement there benefits both (e.g. a pause/resume-aware
> clock); keep it ~20 lines in spirit.
>
> FENCE — `/imagine/scenes/**`, `/imagine/youtube/**`. Perf discipline stands (dispose
> round-trips, rAF stops on leave — re-prove after your changes).
>
> VERIFY: every built feature headless-proven (tour walks 3+ waypoints with url sync if routed;
> chapter helper emits a valid cues array pasted back in and working; keyboard transport drives
> state), dispose/rAF counters clean after, zero console errors (YT's own noise excepted),
> 400/1920/3440. Keepers + `links`.

## Fence

- Write only under `public/imagine/scenes/**` and `public/imagine/youtube/**`, plus this task dir.
- Never touch `/fly/` or `/resume/`. Never kill the :80 dev server; a private one runs on 8098.
- Never commit, never stash.

## Standing constraints

- Dispose round-trips clean; rAF stops on page leave. Re-prove after every change.
- Zero console errors at 400 / 1920 / 3440 (YouTube iframe's own noise excepted).
