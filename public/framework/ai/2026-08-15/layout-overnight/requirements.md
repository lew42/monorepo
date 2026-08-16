# layout-overnight

## The ask (verbatim excerpts, Mike's overnight brief, 2026-08-15)

> my main focuses, right now, are LAYOUT. scan the entire framework for
> layout related things. Use a minion to identify all these things.
>
> focus on layout. We have styles/layouts/space. it's a random generator
> for layouts... very impressive, don't break it.
>
> we have ext/Panels.. a promising UI/UX for adding, splitting, configuring
> layouts. we have flex and grid layouts.
>
> we need a layout library, based on width. 400px layouts: 1 column, mobile
> friendly. What can we do with 400px? how do they look at 1920, 3440?
>
> we have the LayoutTool. we have core/Page/demos. we have sections, we
> have ext/Panels...
>
> we need to separate "possibilities" from "direction"... we need to
> somehow, via me or you, refine the chaos to the signal.

## Scope — overnight campaign, minion-executed

1. **Census** (Sonnet): inventory every layout asset → `census.md`
2. **Direction** (Opus): possibilities → proposed direction; secondary Opus
   judge if the verdict is questionable
3. **Build** (Sonnet): width-based library entries, 400px-first, additive
4. **Measure**: LayoutTool at 400 / 1280 / 1920 / 3440
5. **Morning report**: one page, clickable evidence

## Fences

- `styles/layouts/space` — READ ONLY ("very impressive, don't break it")
- Census minion writes ONLY `ai/2026-08-15/layout-overnight/census.md`
- Build minions: additive files only; edits to shipped core/ext modules
  become proposals, not commits of fact
- No commits, no pushes, no npm installs (LAW#4, LAW#5)
