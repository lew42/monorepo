# claude-md-minimal — requirements

**Ask (Mike, 2026-08-17, verbatim):**

> claude.md: law#1 and 2 should go somewhere else, someone can violate these if they want... Maybe they're Rules, which should require User approval before violating? However, add workarounds - if an agent wants to npx something, why not?
>
> We don't need to define the law, rule, suggestion hierarchy part, just remove that whole section, the AI will figure it out. Less is more.
>
> New Laws:
>
> Law#1: Less is more. Complete every task in the fastest and best way first, then improve. When possible, get a working demo so I can see it. Show, don't tell. Be careful with every word you write - is this necessary? Summarize, reduce, simplify at nearly all cost. Context matters here - deep documents and readme's can be a bit more verbose. Core files, code, pages, reports should all be absolutely minimal.
>
> Law#2: The one major exception to Law#1 is for Clarity. However, we don't want to explain every caveat in every place. If there's an important distinction, decision, etc - write it in the simplest terms, and reference the longer doc.md. For Clarity vs Minimal: weigh the cost of each additional word, line of code, comment, item, section, etc. Don't let an attempt to clarify obliterate Law#1. However, don't let brevity surpass clarity at all cost. One important place for this is Code Readability. If 5 lines of code reads much clearer than a single line, 5 lines might be better. We're trying to appeal to new users.
>
> Law#3: Prioritize: time, quantity, quality, outcome. Focus on the most important things first. Think about the result and the benefit (in particular, to the user), and try to maximize this, while staying Minimal and Clear. When writing anything, be minimal, clear, but also prioritize the most important things first. Every document, page, etc - should try to read as minimally as possible. A quick scan. A few sections with short descriptions, and if necessary, a link to where you can find a lengthier analysis.
>
> If Law#5 (don't push to main) is impossible (I think it is, blocked by GitHub's configuration) then we can just omit this? Law#6 can just be a suggestion, someone could try to use it in prod if they can figure it out. In claude.md, we want to stay absolutely minimal. We simply want to identify some of the core readme's, and instruct claude to look there.
>
> summarize my new laws.
>
> Can't we fix that CSS layer order problem? Restating them EVERYWHERE is not DRY. If we want to add a layer, we're screwed... now we have this literred all over.
>
> Add to claude.md - "don't edit this file without permission."
>
> Look at all the current skills. I want claude.md to be ABSOLUTELY minimal. I want code-specific things to be in the `/dir/readme.md`. In the past, we've used the readme to be an architectural decision log. We want to move away from that. Each dir's readme should be that "minimal, clear, prioritized" set of most important things. Often, a simple reference to something within is enough to trigger the AI's awareness.
>
> That's the biggest thing for claude.md and readme's. Note this in claude: The core documentation (claude.md and each dir's readme.md) should mostly be able bringing the topic to the attention of the AI or human, not explaining it in full detail. We've gotten overwhelmed with detail, and we need to retreat, strongly. Details are ok, buried in the `./docs/`. Btw, does the Doc system use `./doc/` or `./docs/`? MAke sure this is consistent.
>
> But, this is an important thing to bring to the AI awareness: that there are docs.
>
> The claude.md shouldn't need to even reference skills.. the skill's declaration should properly identify itself. when looking at the skills, consider the skills usefulness (when should it be used?) and the description (will it be used?). Are these appropriate?
>
> Consider the code-architecture skill, vs the layout-design and css-strategy. These are somewhat different skills, but all often are being utilized at once. I'm wondering if we should condense these into a single skill?
>
> Analyze all skills based on these new laws. Consider declarations that are too strong, and should be more like suggestions. Read instructions-audit, I'm not sure what it's talking about.
>
> do skills get re-invoked every time they're invoked? are these in the logs?
>
> maybe we should have something as simple as a "new-stylesheet" skill, which helps determine whether it's necessary, where it should go, whether we need to declare the layers, etc. also, it could declare a namespace, and add that namespace to some sort of registry, so we have a record of all CSS?
>
> or, maybe we have a single `code` skill? part of the reason i like breaking it out, is that instead of having a huge bucket of instructions, which get diluted as the context window grows, we could have specific skills, so we know where to go.
>
> look into it, first, propose a new claude.md before we rewrite it

## Steps

1. Investigate — current CLAUDE.md, audit file, all skills, CSS layer usage, doc/ vs docs/, hooks, main protection
2. Write proposal.md — proposed CLAUDE.md + skill analysis + decisions for Mike
3. Mike approves / edits
4. Rewrite CLAUDE.md
5. Merge code skills; retune descriptions
6. CSS: single @layer statement (framework.css); strip the 91 restatements
7. Readme retreat plan (separate task)
