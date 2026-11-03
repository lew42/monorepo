# Blog program — mastermind run (job-prospecting)

## The ask (owner, verbatim, 2026-08-30)

> yea, let's keep working.
>
> I need a blog.  I'm not sure the best layout for it.  not sure if there should be a sidebar?  not sure the best file structure.  I'd like it to be 3440 friendly, and mobile friendly.  I'm not sure if a centered layout is best.  I don't like the narrow center column of text centered on my 3440 monitor, it feels like a waste.
>
> spawn minions to explore blog layouts.  focus on utilization of the full 3440.  focus on above-the-fold experience.  focus on a simple overview with navigation for additional modular on demand content.
>
> let's experiment with left sidebar designs: multi level, active states, maybe a dynamic left nav that changes as you dig deeper.
>
> try to design some multi part posts.
>
> I like the idea of demos, but our demo system needs compaction.  I don't like the source expando in demos.  I feel like the demos should be more configurable.  anyway, using responsive demos (utilize the full 3440, probably by using a column for code and a column for render)..  there are too many demos that have fixed heights that cut off the demo.  there's still too many variants of the demos.  there's the split screen version (twin?), there's a black border version (like a device), sometimes we display the width below the viewport, sometimes not (I think we always should).
>
> I like the demo app mode, with the path rendered above, so we can see how the routing works.  we recently leaned into the page system.  I kind of feel like the demo system could be merged into the page system?  we don't want all pages to be forced into demo mode, but if the page class had a demo method, we could render a consistent ux, any page could be imported and rendered as a demo, so the page could be the basic unit of control for these layouts, navigation systems, templates, UI, etc.
>
> I haven't had a chance to check out the last work cycle, but I want to stress the need for presentational layouts (think slide deck designs), that utilize the space better.  try slicing the 3440 in various ratios, and trying to figure out what kind of content (content as navigation) works in each region.  for navigation, we want to explore persistent navigation (the navigation stays, a different region switches) vs switching/swapping: when you click, the whole area swaps.
>
> the page columns system, do we have control over how this renders?  explore different styles, layouts, for the column pages, and how they interact with each other.
>
> do an audit of the whole site, all framework pages, etc:  take screenshots at the major resolutions (400, 1920, 3440), and pay attention to: above the fold experience (give a strong overview with navigation above the fold).  I know I've asked for "show don't tell", "give me a demo".  I think a compact demo that actually shows something important is fine.   we don't want 3 demos when 1 would work.
>
> I need to get my website ready for job prospecting.  write a blog post about the layout and page generators.  write a blog post about the ext/Panel and ext/Playground.  write a blog post about the AI dashboard, write a blog post about the MCP and playwright and Claude skills.  list the blog posts on my homepage.  keep the posts simple, visual, link to the things.  write a blog post about the whole framework, try to introduce it better.
>
> blog posts should probably have their own index.html, so we can add meta tags that actually work?
>
> anyway, don't stop.  instead of going into sleep mode, spawn minions to look at these systems and make recommendations.  you're the mastermind, you make the decisions.  begin.

## Waves

1 (explore + recommend, parallel): R1 blog architecture (index.html/meta/SPA hybrid, file structure, un-centered 3440 reading) · E2 blog layout lab (above-fold, left sidebars incl dynamic, multi-part posts) · D3 demo audit + Page.demo() prototype + merge proposal · A4 site-wide audit (400/1920/3440, above-fold, demo economy) · P5 presentational decks lab (3440 slicing, persistent vs swap nav) · C6 column render-control exploration.
2 (build, after R1+E2): /blog/ real + 5 posts (parallel writers) + homepage listing + per-post index.html.
3: audit-driven fixes + demo compaction rollout per D3's accepted proposal.

## Fences (wave 1)

- R1 owns /blog/** (prototype). E2 owns /imagine/blogx/**. D3 owns ext/demo/**. A4 read-only. P5 owns /imagine/decks/**. C6 owns /imagine/vary/colstyles/** (+ may add its name to vary/page.js children). Mastermind wires any other children lines.
- Standing rules: never kill/restart the :80 dev server (private PORT=809x instance if down); never drive owner tabs; never stash; never commit; screenshots to the scratchpad during probes (LiveReload trap), keepers to task dirs; ext/Playground+DevBar+grip belong to another session's polish task — hands off unless the brief says otherwise.
