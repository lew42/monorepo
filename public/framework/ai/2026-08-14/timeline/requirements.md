# timeline — the ask (verbatim, 2026-08-14)

> here's what i'm thinking: i need to see a timeline that shows when everything
> is happening. the timeline could either go vertically or horizontally. either
> way, the 5h token window progress bar should span an actual 5 hour region of
> the timeline.
>
> make this the framework/ai/page.js. maybe we just need AITask page rather
> than "AISession" page?
>
> let's test our new new-task skill. create a task to design an ext/Timeline, a
> general purpose timeline view. this is a full/fill type layout. we'll want
> horizontal/vertical rendering, control over the scales (both horizontal and
> vertical), which most video editor timelines have these days.
>
> in terms of the parallel and sequential nature of these ai tasks, think about
> how to display them on the timeline.
>
> the timeline view should be responsive. this framework/ai/ page should try to
> use split screen paging, where the framework/ai/ timeline stays on the left,
> and when you click on a task, the view splits and you see the task on the
> right.

## Scope

This task's deliverable is the **design** (`design.md`) — the ext/Timeline
API, the lane model for parallel/sequential work, the 5h-window band, the
split-screen mechanism for `framework/ai/`, and the AITask-vs-AISession call.
The build is a follow-up wave, gated on Mike's read of the design.
