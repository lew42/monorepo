# Layout generator rules — the ask, verbatim

> i have another agent working on the ext/Panel system, so stay way from that.
>
> i want you to work on the LayoutTool, in combination with styles/layouts/space/, which has a layout generator.
>
> we can now generate random layouts, and test the layout tool on them.
>
> create an mcp skill to spawn a new browser tab (if one is available), and add some sort of very visible border around the whole viewport, to indicate that you've claimed it. then, try it out, i should notice immediately, and can then either watch or do something else.
>
> add a simple <--> chaos slider to the layout generator to increase randomness/deviation from our "model".
>
> we're going to build a set of layout rules (there should be a "knowledge base" somewhere in teh layouttool dir...). study the rules, and try to figure out how to get the layout generator to generate great layouts. there's another generator on styles/layouts/space/compose/, which is styled a bit differently, and uses Panels.
>
> i think refining the set of building blocks to select the best layouts, best designs, most useful/interesting... we don't necessarily want to randomly select traditional sections (like a header or footeR) for the wrong area... however some experiementation with that could work...
>
> how do we define patterns? how do we create a self-improving system, so that when you're done, the generator generates stronger layouts?
>
> first, we need to define ideal value ranges for certain things, like padding (as a % of parent width), for example. comfortable reading width. spacing (gap?), repetition vs unique, depth (nesting, and what's "best" inside what?), alignment, etc.. some rules can have more influence than others, some could have a range.
>
> change the color generation to utilize the site's token colors rather than random colors. try to experiment with varying all the layout factors, but trying to hone in on: simpler, better, but also the possibility for exploring.
>
> get the reroll button to use the generator, and try to unify the two generators (let's lean into using panels). the reroll button, for a fixed size area, should try to generate fixed-size layouts? or it could generate long scrolling content.
>
> these are all the decisions we need to figure out.
>
> work autonomously, spawn minions to help work faster. don't stop, keep working through this and the next usage window, keeping an eye on your token consumption pace. begin.

## Scope fence

**`public/framework/ext/Panel/` is OWNED BY ANOTHER SESSION** (900b283a —
`panel-swiss-army`, `panel-icon-buttons`). Read it freely; do not edit it.
Where the work needs a Panel change, land the change on *our* side of the seam
(`styles/layouts/space/`) and leave a one-line proposal for that session.

## Owned by this task

```
.claude/skills/claim-tab/            new — the MCP tab claim
public/framework/dev/Claim/          new — the viewport claim ring (dev tier)
public/framework/ext/LayoutTool/grammar/   new — the rulebook: ideal ranges, weights, fitness
public/framework/styles/layouts/space/     gen.js, spec.js, page.js, space.css, readme.md
public/framework/styles/layouts/space/compose/  page.js
```

## Proposal — the steps

1. **Claim a tab.** An MCP skill that opens a browser tab and rings the whole
   viewport, so Mike can see at a glance which tab an agent is driving.
2. **The rulebook.** `LayoutTool/grammar/rules.js` — the ideal *ranges* the
   generator aims at (padding as a share of width, measure, gap, repetition,
   depth, alignment), each with a weight, each citing the knowledge file it
   came from. This is the knowledge base the ask names.
3. **Roles, not parts.** A `topbar` is not a thing that can appear anywhere. A
   grammar of positions — what may sit at the top, what may nest inside what —
   replaces the flat `LEAVES` pick.
4. **Chaos.** One dial, 0–1, that is the deviation from the model: at 0 the
   generator emits only what the rulebook rates ideal; at 1 it is today's
   uniform random.
5. **Tone from tokens.** The site's own colour tokens replace `--tone: <random
   hue>`.
6. **Fitness.** Score a spec with `ext/LayoutTool` at five widths, and let the
   generator *search* rather than sample.
7. **Self-improvement.** The loop that makes the rulebook better: run the
   search, keep the winners, and write back what the winners have in common.
8. **Unify.** One generator behind the picture, the panels and the reroll
   button.
