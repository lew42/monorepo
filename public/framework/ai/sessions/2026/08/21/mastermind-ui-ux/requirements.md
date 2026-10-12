# mastermind-ui-ux — run task

The supervising mastermind's run task for the 2026-08-21 autonomous ui/ux + Playground program.
Owner is away (packing/moving); full autonomy granted. Budget at launch: session 0%, weekly 2–3%.

## The ask (owner, verbatim)

> hey mastermind, i'm packing/moving, so i can't babysit. you're on your own.
>
> spawn minions, manage usage (i think we're pretty fresh at this point), and build autonomously! you're fable, so use lesser token models when possible.
>
> spawn a minion to look at our current ui/. assess how many of the ui elements have behaviors. i'm thinking: "ui/*" should generally be html+css templates, not behavioral. once something needs behaviors, it should probably become a ux, a class, so it's extendable, and we can have extensions as variants.
>
> create a fable ux mastermind, and have it plan out these ui/* and ux/* systems. instruct it to be a mastermind, spawn minions, watch usage, etc. it should continue to work, stay under the token window pace, and keep adding asking minions to improve ui/ and ux/ variants. We're creating a library, so we want to focus on typical workflows. We want to focus on responsive (mobile <--> mega) resolutions, so we want layouts that expand and contract well. These are the "ux". Workflows, steps, lessons, chapters, guides, wizards, game UX, team UX, signup, reset, login, social login, etc.
>
> also, ask the fable ux mastermind to plan different reusable ui themes. explore concepts like high contrast (`.ac("ui-contrast")` could be a ui-specific "theme"), compact (maybe micro, mini, small?)? we want an adaptive ui/ux system where a small set of config words (CSS classes) can manipulate the entire section. Look at the DevBar, and it's whole styling. We want unified systems, whatever they are. Instead of writing a bunch of fresh classes, we lean on the core framework. UI cards, with different spacing, colors, etc.
>
> As the fable ux mastermind to focus on ui card systems. different types of cards, and different types of content. toolbars. file explorers. mega layouts that still work on mobile (stacking, hiding, drawers, sheets, etc).
>
> ui could be js classes too... especially if we want variants. maybe try different ways. class Thing2 extends Thing is probably the best way to change something, while still inheriting the base. typically, I would call this a "class progression", where Thing3 extends Thing2, etc. However, I had claude make 0-9 in another repo, and it got confusing... Numbers aren't so helpful. Especially when each is a single feature that could be named. Thing<Name> might be a better name.
>
> Another approach to modular classes would be Class.prototype.assign(mixin1, mixin2, method3, etc). This basically is class extension, but mixins do allow some additional capability (mixing and matching modular features). Remember, simplicity is gold, but i'm open to exploration on these, and different ui/ and ux/ could try different patterns.
>
> Ask the fable ux mastermind to look at the ui-test skill, see how it works. I'm thinking we might want a ui-design skill? and a ux-design skill? ask fable ux mastermind to ask minions to recommend in ui/skill-suggestions.md and ux/skill-suggestions.md important lessons, and what would be useful, while keeping the skills minimal and not overly restrictive.
>
> the ui-test skill is for screenshotting multiple stages of a ui, to make sure it works correctly. i'm not sure how it works, if it's useful. maybe the default treatment is fine.
>
> ask the fable ux mastermind to thoroughly explore large screen layouts, where the entire 3440 screen space is utilized. this often means different regions need to coordinate with each other. often the best way to do this, is to use a left sidebar for navigation or previews. or use filters. also, ux/ could be entire systems. like ux/Course could be a whole ui/ux system for courses. again, focus on generalizing the ui. most ux would probably need it's own css class and stylesheet, in order to make adjustments, however, we want to try and reduce the amount of customization necessary. the ux views can simply use ui templates, when possible. I think all ui css should have that `ui-` css class prefix, so we know where to find it.
>
> lastly, spawn a fable ext/Playground mastermind to manage this project. really test the zero-to-hero playground experience. think about the minimal number of steps or the best ux to get from any state/layout to any other. the +FLEX, +GRID, and +BOX buttons work, but sometimes it's unclear (maybe inconsistent?) whether we're adding a sibling or a child. I think a placeholder + button inside any box could be useful. show it on hover only, and clicking it should add a box with default styling. instead of having to reach to the top toolbar to click +flex or +grid, or +box, there should be one + button, and then while selected, via the right sidebar, you could switch to flex or grid. and when you switch to flex or grid, a modular panel section for flex config or grid config should appear. let's keep the right sidebar as minimal as possible. you should be able to find anythign you need, but not have a wall of empty form fields.
>
> have the Playground mastermind look at the ui-test skill as well, in terms of Playground ui. i'd really like "hug" and "fill" options, for both height and width, even though i know the flex/grid mechanisms will be a little complicated.
>
> we need resize handles for split columns, that should probably use flex-grow for distribution, but could use flex basis for fixed sidebar, or potentially grid.
>
> here's the thing, we want the Playground to be able to produce ANY type of layout, as quickly as possible. We need class toggles in the right sidebar for "flex", "grid", "auto", etc (make those modular, so activating flex produces a whole section of "flex" utilities). gap and pad are outside flex/grid. wrap is flex specific. in the playground, make the "0" padding actually like 0.25em, so that we can see parent-child separation a little. and then make "pad" like 1em or even 2em default, so we can quickly add it, and see how it changes.
>
> we might want bg color selections. stick to tokens, use the dropdown ui, and put this in the right sidebar.
>
> when adding a new box, if we have the + button placeholder, the + button should resemble the new box. so if you hover a parent, a + button appears, and upon clicking, the new child box is exactly in that place. if you're hovering that new child, it should have a + button, but you're still hovering the parent, so it should have a + button. maybe you automatically add the button to new boxes, so it props them open? the one place where this backfires, is when it causes a strange void at the bottom of containers.
>
> anyway, i gotta get back to work. you make the calls. inform your fable masterminds to be token conscious. you can, once you launch them, just sit back (set a wakeup to check on them to make sure they don't quit, you can answer their questions, etc). tell them to work autonomously, so they don't stop and ask too many questions. generally, they'll do most of the work here, but you're in charge of supervising, restarting them if they get stuck, etc.
>
> begin!

## Orchestration plan

Three parallel efforts, each with its own task dir and brief:

1. `ui-behaviors-audit/` — Sonnet minion, read-only assessment of ui/* behaviors. Feeds #2.
2. `ux-mastermind/` — Fable sub-mastermind: ui/ ↔ ux/ system plan, themes/config words, cards, workflows library, large screens, skill suggestions. Owns `ui/` + `ux/`.
3. `playground-mastermind/` — Fable sub-mastermind: ext/Playground zero-to-hero UX. Owns `ext/Playground/`.

Fences: ux-mastermind owns `public/framework/ui/**` + `public/framework/ux/**`; playground-mastermind owns `public/framework/ext/Playground/**`; no overlap. Supervisor refreshes usage.json ~15 min, harvests, restarts stuck agents, answers escalations, smoke-tests the seams.
