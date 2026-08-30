# E2 — blog layout lab (`/imagine/blogx/`)

## The ask (owner, verbatim, 2026-08-30 — the parts that are this task's spec)

> I need a blog. I'm not sure the best layout for it. not sure if there should be a sidebar?
> I'd like it to be 3440 friendly, and mobile friendly. I'm not sure if a centered layout is
> best. I don't like the narrow center column of text centered on my 3440 monitor, it feels
> like a waste.
>
> spawn minions to explore blog layouts. focus on utilization of the full 3440. focus on
> above-the-fold experience. focus on a simple overview with navigation for additional modular
> on demand content.
>
> let's experiment with left sidebar designs: multi level, active states, maybe a dynamic left
> nav that changes as you dig deeper.
>
> try to design some multi part posts.
>
> ... give a strong overview with navigation above the fold.

Full ask: `../blog-program/requirements.md`.

## Scope

A browsable tree of blog SHELL candidates at `/imagine/blogx/`, each a full working mock
(believable post list + one open post), each with a one-line verdict, previews as nav.

1. **Above-the-fold candidates** — 3-4 distinct shells, judged at 3440 first, then 1920/400.
2. **Left sidebar designs** — multi-level, active/in-path states, and a DYNAMIC rail whose
   contents change with depth (prototyped for real on the page/columns machinery).
3. **Multi-part posts** — parts as columns opening rightward vs parts swapped in place with a
   persistent part-nav; verdict on when each wins.

Every candidate: content-as-navigation above the fold, no accidental scrollbars, theme tokens only.

## Fence

`public/imagine/blogx/**` only. The mastermind wires `blogx` into `/imagine/`'s children.

## Steps

1. Read spec + prior art (screens, shells, columns docs); code/layout/css skills
2. Fake-but-believable post data + blogx shell page
3. Above-the-fold candidates (magazine, columns-first, deck, dashboard)
4. Left sidebar designs, incl. the dynamic rail
5. Multi-part post treatments (columns vs swap)
6. Headless verify: 400/1920/3440 + above-fold crops, zero console errors
7. Verdicts, readme + doc pass
8. finish-task
