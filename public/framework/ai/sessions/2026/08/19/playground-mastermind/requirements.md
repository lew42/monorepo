# playground-mastermind — run 5 (2026-08-19, afternoon)

The owner's ask, verbatim:

> Hello mastermind. You are fable, you use the most tokens, so spawn minions to reduce usage.
>
> You're going to have Opus minions read the ext/Panel system. We're not going to modify it, we're going to try and create a simpler version, because this one, while it's getting better, isn't quite there yet.
>
> First, have a minion launch a ui/tree, where each item is an icon + text row, and each nesting level indents by a certain amount. I suppose the icon could be optional. We'll want this tree to work as a sidebar for layers, navigation, etc.
>
> Let's call this ext/Playground
>
> We do need persistence, so use Item/List as the base for the tree items. We'll need "documents" and the ability to create a new one (each document gets its own tree, like figma).
>
> We want different types of Items for our tree. Btw, the tree is the left sidebar, and there should be a workspace in the middle, and a properties panel on the right.
>
> The column dividers should be resizable (i believe there's a "grip" ext).
>
> Brainstorm different item/layer types. Maybe we need a toolbar to activate/add them.
>
> I really want to focus on LAYOUT. Flex and Grid. And creating the best UX for exploring how they work. This means, we need flex and grid items, we need to be able to add/remove items, etc. And maybe we'll want to be able to copy+paste layers as json?
>
> Have a minion or 2 read over the current ext/Panel system, to gather insight from how they do it. But I don't want to just redo that. So have fresh minions design the new system. The old one is a little wonky, kind of broken, doesn't work as well as it should...
>
> What I really want, more than anything, is to be able to create reusable layouts, that I can load into the playground, see how they respond, put different content in them, etc. Don't worry about the content part right now, we'll figure that out later. Focus on the layout part right now.
>
> Anyway, I'm going for a run. You're the mastermind, watch your token usage. In a few hours, our weekly resets, so plan around the reset to keep working.
>
> Try to make a ui-test skill, for things like drag and drop interactions. The basic gist is, get a minion to launch the page, give them the instructions, ask them to take screenshots after every ui command, etc. mousedown, mousemove, etc.. If that's not possible, at least force the app to whatever ui state would have happened, to test what the ui looks like, detect broken layouts, etc.
>
> Ok, begin!

## Budget at launch

session 9% (resets 19:29 local) · weekly_all 90% (resets 21:59 local, ~6 h) · weekly_scoped 61%.
Weekly elapsed ≈ 96% → ~6 points of room before the reset. Plan: read + design + the two
small builds (ui/tree, ui-test skill) before the reset; the ext/Playground build waves after it.

## Plan

| wave | task dir | model | what |
|---|---|---|---|
| 1 | ui-tree | Sonnet | ui/tree — icon + text rows, indent per level, nav + layers demos |
| 1 | ui-test-skill | Opus | .claude/skills/ui-test — drive a page headless, screenshot per gesture, or force the state |
| 1 | panel-insight | Opus | read-only: what ext/Panel does well / badly; insight.md |
| 1 | playground-design | Opus, fresh | design.md for ext/Playground: shell, documents, item types, toolbar, flex/grid UX, JSON, reusable layouts; fenced build order |
| 2 (after reset) | playground-* | Sonnet/Opus | the build, per design.md |

## Fences

Every minion: never kill or restart the dev server, never drive the owner's tabs, never `git stash`,
never edit `ext/Panel/**`. Each task dir lists its own file ownership.
