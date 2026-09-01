# system-proposal — the layout system that doesn't fail

## The ask (verbatim, owner)

> spawn a minion to look at the ext/DesignTool. it hasn't been used in a while. I think it
> needs improvement. the method of creating its feedback might have been flawed, we're still
> getting a lot of broken layouts (cramped, missing padding, etc). I want you to design a
> layout system that doesn't fail. part of that is identifying when/where it fails, and how
> to improve it. I think a big key to that, right now, is utilizing the space properly. if
> it's 3440, and we have only a few things, they don't need to be small. layout is scale,
> visual hierarchy, etc. I think part of the problem, was that we don't have a clearly
> defined 'proper' design, to follow.

## Deliverables

- (a) A critique: why the current feedback method still yields broken layouts.
- (b) The written design of a layout system that doesn't fail, as `/imagine/design/system/`.

## Scope + fences

- Fence: `public/imagine/design/system/` and this task dir ONLY.
- FORBIDDEN tonight: any change to `framework/core/` or `framework/ext/DesignTool/` code.
  Major surgery is PROPOSED, never executed.
- Do NOT edit `/imagine/page.js` or `/imagine/design/page.js` (the hub already declares
  `system`).
- Never commit, never push, never `git stash`. Dev server at :8080 stays running.
- Page must be readable in 5 minutes; final report <= 15 lines.

## Inputs (tonight's landed evidence — read, do not re-measure)

- `../layout-study/` — 3 real page shells; every failure is dead space, never overflow.
- `../scale-study/` — mode font-size is smaller than body everywhere; one viewport-scaled element site-wide.
- `../padding-study/` — comfortable band 0.5em floor to min(6% width, 3em); zero of 2178 boxes over 20%.
- `ext/DesignTool/` — readme, doc/decisions.md, doc/learned.md, knowledge/ (10), taste/ (11 bands), rules.js, polish.js, library/.
