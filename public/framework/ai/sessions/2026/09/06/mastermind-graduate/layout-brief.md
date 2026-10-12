# The layout brief (the owner, 2026-09-06 ~10:00) — verbatim, then the deliverables, then the calls

## Verbatim

> I want to be able to logically browse any potential UI, sections, layouts that might be possible, by clicking around.
>
> I think we start at 1 column layouts. basically, no columns, just rows. start with the simplest but most useful examples.
>
> then move to 2+ column layouts.
>
> ok, so here's what I'm thinking. these pages, we want them to be importable and usable, with minimal config, so they should be re renderable, and maybe track their .views[]. it's like a template. maybe one template could import and use another? and then, when you render a new template from another, it stays linked, by default? this is like components in Figma. live updates? or just update on rerender?
>
> not sure if events are the best for this coordination? we get into state machine territory?
>
> the templating system needs a major upgrade. it needs to look better (demos, editor, playground, panels, etc), it needs to be consolidated into one system (not demo, stage, playground, workspace, etc, etc... I like the word demo, but I think we want to keep the components of the demo (viewport, path bar / toolbar, footer, title, and maybe, depending on the last round/results, some multi column section wrappers.
>
> instead of just being a full bleed stack, we experiment with columns. we don't necessarily want to bake these in?
>
> we need a Section core module. this should be like a sub page, could extend Page, so it gets all the features, like individual storage, etc.
>
> the section needs these features:
> - it starts as a default div, min height of 2 or 3 em, and has a minimal overlay on hover, when editing is enabled.
>
> for demo pages, docs, we turn editing on via code. then, you can configure padding. first click turns on default padding, which should ramp with box width. then, the padding button becomes a select, default to "default", but could have alternates?
>
> but maybe having padding schemes isn't the way. maybe we just have pre-approved layout schemes.
>
> yes, this is It. this is what we need:
>
> sections need layouts. approved layouts. have a minion look at ext/Layout, which I believe isn't used anymore? have the minion study ext/Playground and ext/Panel, and compare to ext/Layout. actually, I'm thinking Layout should be core.
>
> here's the idea of Layout. it's more a dev-mode, ai-guidance type thing.
>
> what layouts are acceptable with other layouts?
>
> can layouts stack? like combine multiple layout directives into one? I don't think this is useful. we're not likely to build content with new Layout, I think this is more just an idea, and the Layout module could just be a doc section, with special UI/ux for browsing, filtering layouts.
>
> this is what I was saying earlier - organize layouts. filters default to "all", and there might need to be some paging to avoid rendering 10000 at once.
>
> here's what layout needs to explore:
>
> create layout pages (Layout extends Page?) where each layout can prescribe properties (just page props), and the filters can filter them.
>
> create core/Search with Filters, implement the Omnibox (repositionable with hotkey activation, auto complete, etc. where do filters go? I'm thinking a bottom center Omnibox feels good. it's like the terminal or chat feel. wherever the UI goes, it should be responsive, so multiple columns that properly fill 3440.
>
> for the layout system, here's maybe the most important point we've been missing: we need LayoutRules. what is allowed to go in what? generally, you don't want to overly restrict, or have to manage a massive whitelist. so, the default is, "accepts any", and "allowed in any".
>
> however, I think we'll want layout rules that restrict putting black text on a black bg. it's not terribly important to separate "layout" from "design", let's just get this working. the layout skill will improve dramatically when we can lock in on a handful of approved layouts.
>
> so, on these layout pages, we want to render the docs page properly. putting a mobile layout in a 3440 box doesn't make sense. if a layout is 1-col, default scale, most content should look good at 200-800px? even more, if the padding and flow scale with width (make sure they do, spawn a minion to study the scale gap and flow systems and see if we can collapse into a small standard. maybe --size? and everything else revolves around that?
>
> .size-small { --size:0.75em;}?
>
> and then padding, gap, and --flow all scale fluidly with width, clamped. start with %, maybe containers are worth?
>
> the layout pages can be tree-like, where opening one layout could display additional variations of usage or similar alternatives. let's focus on 3440 layouts. they should probably render in some sort of demo viewport with resize handle.

## The deliverables, numbered — each ticked against the sentence above at harvest

1. **A browsable tree of layouts** you click around: 1-column (rows only) first, simplest-most-useful first; then 2+ columns; opening one shows variations and alternatives; 3440 is the focus.
2. **Layout pages are templates**: importable, minimal config, re-renderable, tracking their `.views[]`; a template can use another; an instance stays linked to its template by default.
3. **One demo system**, named *demo*: viewport with a resize handle, path bar / toolbar, title, footer, optional multi-column section wrappers; stage / playground / workspace consolidated into it or deleted; it looks better.
4. **Columns in demos are an experiment, not baked in.**
5. **core/Section**: a sub page (extends Page, so it gets storage etc.); starts as a default div, min-height 2–3em; minimal hover overlay when editing is enabled; editing enabled by code on demo and doc pages.
6. **Approved layouts, not padding schemes** — a section picks a layout ("yes, this is It").
7. **A minion studies ext/Layout, ext/Playground, ext/Panel and compares**; Layout becomes core.
8. **Layout is dev-mode / AI guidance**: a doc section with UI for browsing and filtering; filters default to *all*; paged so 10,000 never render at once. Layouts do not stack.
9. **Layout extends Page**: each layout prescribes page props; the filters filter on them.
10. **core/Search with Filters, and the Omnibox**: bottom-centre, hotkey, autocomplete, repositionable; responsive, columns that fill 3440.
11. **LayoutRules**: default *accepts any* / *allowed in any*; a short deny list (black text on black); layout and design not separated.
12. **Layout pages render at their natural width** (a 1-col default-scale layout: 200–800px), in a demo viewport with a resize handle — never a mobile layout in a 3440 box.
13. **A minion studies the scale / gap / flow systems** and collapses them into a small standard — the hypothesis is one `--size` knob (`.size-small { --size: .75em }`) with pad, gap and flow scaling fluidly with width, clamped; % first, container units if they earn it.

## The calls the mastermind made (the owner: "make your best decision and document it")

- **Linked templates update on re-render, not live.** An instance keeps `.template` and registers in `template.instances`; `template.update()` re-renders every instance. No event bus, no state machine — a template has no modes, and events hide the coupling this needs to show. Live updates come free later from the dev socket's reload if wanted.
- **Layouts do not stack.** One layout per section; composition is nesting sections.
- **LayoutRules are data on the layout page** (`accepts`, `allowed_in`, `denies`), checked in dev mode by a visible overlay warning. Never blocking.
- **The Omnibox sits bottom-centre**, opens on `/` (outside inputs) and Ctrl+K, can be moved to the top, and remembers the choice — an app preference, so persisting it is right.
- **The size standard lands only after slice 1 of the graduation** has its byte-identical proof; until then it is a study page with the candidate applied by the probe, and `framework.css` is untouched.
- **Order.** Wave A now: the layout study, the size study, core/Search + Omnibox (independent files). Wave B after slice 1 and the study: core/Layout + the tree, core/Section, the demo consolidation, the size standard applied, slice 2 of the graduation. Wave C: templates linked, slice 3 merged (the arrangement word's catalogue IS the layout tree). Then the critics.


## Addendum (the owner, 2026-09-06 ~10:15) — verbatim

> the thing about layout rules - we want to identify the restrictions. if a 3440 section is placed within a column, it probably doesn't fit properly.
>
> this is why I keep feeling we want different sizes of templates. like, 400, 1000, 2000, 3440? everything should be responsive by default, so maybe the trick is to just be careful about content scale. if we have small columns, we shouldn't put large content (write this down, we too frequently make this mistake). if we have a massive container, we should be careful about putting tiny content, how it lays out, etc.
>
> any 400 px layout should still look fine at 1000?
>
> any 2000 layout should still look fine at 400?
>
> the thing is, some layouts we want to preview their responsiveness: how does this respond, at all the interim widths?
>
> strong layouts should never/rarely break. they accommodate 99% of cases flawlessly, no matter the placements (text length, image, color?)

### Deliverables 14–17

14. **The first LayoutRule is size.** A layout declares the range it is proven at; placing it in a box narrower than its floor (a 3440 section inside a column) is the restriction the rules exist to catch, and the overlay says so.
15. **Content scale follows the box** — written down, in the layout skill and on the layout page: small columns never get large content; a massive container is careful with tiny content and how it lays out.
16. **A responsiveness strip.** A layout page previews the layout at the interim widths (400 · 700 · 1000 · 1400 · 2000 · 2800 · 3440) beside the drag-handle viewport, so how it responds is seen, not claimed.
17. **Strong layouts.** A layout is *approved* only when it survives the stress fixtures at every width in the strip — shortest and longest text, no image and a huge image, light and dark tone. 99% of placements, flawlessly; a layout that breaks on a fixture is a draft, shown as one.

### The calls

- **Sizes are proof widths, not separate templates.** One responsive layout with a declared range, proven at 400 / 1000 / 2000 / 3440 and the strip between. Four copies of every layout is the whitelist the owner said not to manage.
- **Above its ceiling a layout holds, never stretches.** A 1-column layout at 1000 keeps its measure and centres (or the box is wrong) — so yes, a 400 layout looks fine at 1000.
- **Below its floor a layout stacks to a named fallback.** Every multi-column layout names the 1-column layout it becomes — so a 2000 layout at 400 is its fallback, and the fallback is the thing being judged there.


## Addendum 2 (the owner, 2026-09-06 ~10:20) — verbatim

> so, we should separate components from layouts? components could basically be the basic building blocks? essentially elements? but maybe more like... templates?
>
> we could stick to Layout only for now, these are all so similar. it's just, we sort of need separation of layout from content? unless layouts are content...

### The call

**Layout only, for now — and a layout is never content.** Three things exist, and only one of them is new:

- **Elements** are the building blocks the site already has (`ui/`, `styles/elements/`): a button, a chip, a card, a code block. No new word, no new module.
- **A Layout** is the arrangement of boxes — named slots, a proven width range, the rules. It owns no content. The stress fixtures ARE the separation: a layout is proven by pouring shortest/longest text, no/huge image, light/dark into its slots, so if it needs particular content to look right it is not a layout, it is a draft page.
- **A template** is a layout with its slots filled and saved — a `page.json`, which Make already writes. Deliverable 2 (linked instances) is about templates, and it comes in wave C, after Layout exists.

So the layout tree shows layouts with fixture content, never real content; a section picks a layout and holds its own content; a template is a section's layout + content remembered together.


## Addendum 3 (the owner, 2026-09-06 ~10:30) — verbatim

> if content scales to container size, (should size use container units? font size then scales with container size? does this compound with our responsive body font size?)
>
> if content scales properly from mobile to massive... maybe the layout rules aren't the problem? maybe it's just the css?

### The call

- **One thing ramps type with width: the root font size** (the viewport clamp). `--size` is a per-box em multiplier, never a function of width, so reading text never shrinks inside a narrow column. Spacing follows the box (`--size` × a container-width term, clamped). Display type is the one exception allowed `cqi`. No compounding: a paragraph three containers deep measures the same as at the top.
- **CSS answers content scale; the rules answer what CSS cannot**: a width range that must stack or refuse, contrast, and nesting that breaks a mechanism. The deny list shrinks to what is true.

## The notes program (the owner, same message)

> I'm going to send a bunch of pictures from the last few weeks. I want you to save each image in /notes/, try to read them, and try to generate UI to match, when possible. if there's something my notes are referencing that we've built, link to it from the note page. create a page for each note, so I can browse them, see the image, click through to productions, etc.

Drop folder: `public/notes/inbox/`. Each image becomes `public/notes/<slug>/` with the image, a page (image · transcription · what it references, linked · UI built to match when possible), registered in `/notes/` `children:`; the notes index becomes a wall of previews.


## Addendum 4 (the owner, 2026-09-06 ~10:25) — verbatim

> quick note on layout: I think the content length thing might be more important. some containers can fit endless content (they just keep growing). but some containers cannot. if you put something big in something small, it doesn't fit.
>
> but for many sections, it's not a problem. you can just keep stacking.
>
> maybe we need to be more proactive about the dynamic (wrapping) layouts. if we use flex with wrap, or auto grid, this forces misalignments at times.
>
> layouts could have a max width? or should they just scale up to compensate?

### The call

- **Every layout says whether it grows.** `grows: true` — a stack; content length can never break it. `grows: false` — a bounded box (a hero, a viewport-height band, a card in an equal-height row, an inner-scroll rail) that must ALSO say what happens when the content is longer than the box: `overflow: "scroll" | "clip" | "truncate"`. A bounded layout that says nothing is a draft. This is the vertical twin of LayoutRule #1: width range across, growth down.
- **The longest-text fixture is that test.** For bounded layouts the checker reads `scrollHeight > clientHeight` and asks whether the declared overflow happened; for growing layouts it only asks that nothing else moved.
- **Wrapping layouts declare it and are proven with awkward counts.** A layout that wraps (`flex wrap`, `grid auto-fill`) gets item-count fixtures — 1, 2, 3, 5, 7 items — at every strip width, and a ragged last row is a finding. Prefer `grid auto-fill` for walls (columns stay aligned, the last row left-aligns); `flex wrap` only for a row of controls, where raggedness is the point.
- **Max width is the ceiling it already declares.** Above it a layout holds and centres; it never scales up to compensate — content scale is CSS's job (the size standard) and it is bounded on purpose.
