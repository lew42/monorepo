# doc-system — the ask, verbatim

> first, modify the classdoc system to be a general "Doc" system for classes and
> non classes alike. make a skill "documentation" that should be invoked before
> finishing any task, that explains how to create/audit the docs to make sure
> everythign is up to date, including the module's main `readme.md`, the
> `page.js`, which should implement the Doc system (make it a class so it's
> extendable), so we can have `./doc/*` to document all the things.
>
> i want you to spawn many Sonnet minions to audit every framework/* directory,
> and test the new documentation skill.
>
> spawn one minion for each module (ext/*, core/*, etc)
>
> first, analyze all the files, update the docs:
>
> - do not modify any code (besides readmes, docs, pages)
> - read all files/dir in the assigned directory
> - consider the purpose, current state, simplicity, complexity, and future of the module
> - consider how well the readme.md documents the module. the readme should start
>   with a conceptual overview that touches on the most important aspects of the
>   module, and has a short section for each. if a readme section needs more than
>   a paragraph or two, it should breakout into its own `.md`, summarized and
>   mentioned from the main readme. if it's a class, use the classdoc system so
>   the page.js can browse all the docs.
> - consider how well the `page.js` demos the module. can we see how it works? can
>   we see the code that produces it? can we see the basic options or variants, how
>   how they affect the outcome? showing is better than telling... however, demos
>   need to be organized in a browsable way. a wall of demos means you can only see
>   one at a time. using the page catalog system seems to be a decent way to
>   document variants.
> - consider improvements (to the code itself). think outside the box. even
>   abstract or unusual recommendations can be recorded and deranked if not
>   appreciated.
> - rank all recommendations by priority (simple + important first)
> - do a framework-wide search for users of the module, and document how they're
>   using it, link to the page, etc.
>
> ask each agent for recommendations to improve the `documentation` skill. use the
> top tabs for page sections, and then an inner left sidebar nav for sub sections.
>
> each agent should report back and summarize its audit. then, it's your job to
> create framework/audit/ with a readme.md and a page.js report summarizing the
> findings. determine the highest priority (simple + important) fixes across all
> modules, and depending on the current token usage window, have the agents go
> ahead and implement the changes.
>
> in your analysis, consider how to improve the organization of the modules.
> consider similar things (Editor, Panels, ext/Layout, DevBar, demos, are all
> similar things, and I've been trying to unify them). we need simplicity,
> simplification, condensing, refining, pruning...
>
> work autonomously, begin!

## Proposal — the steps

1. **Build `ext/doc`** — `Doc extends Page`, generalized from `ext/classdoc`:
   a `subject` that may be a class, a function-with-members, a namespace object,
   or nothing at all. Retire `ext/classdoc`, update every call site.
2. **Write the `documentation` skill** — how to create and audit a module's
   `readme.md`, `doc/*.md` and `page.js`; invoked before finishing any task.
3. **Fan out** — one Sonnet agent per module under `framework/` (core/*, ext/*,
   plus dev, styles, ui, util). Read everything, rewrite the docs, report.
4. **Collect** — every agent reports an audit summary + ranked recommendations
   + skill feedback.
5. **Build `framework/audit/`** — `readme.md` + `page.js` reporting the findings
   across all modules, ranked by simple + important.
6. **Organization analysis** — where the module set should condense
   (Editor / Panel / ext/layout / DevBar / demo are all the same shape).
7. **Implement the top fixes**, budget permitting, by sending the agents back in.
8. **Land** — link everything, refresh the skill from agent feedback.

## Scope + file-ownership fences

**Each agent owns exactly one directory** under `public/framework/` and may write
ONLY inside it:

- `<dir>/readme.md`
- `<dir>/doc/**/*.md`
- `<dir>/page.js` and page.js files in its own subdirectories
- new `.md` files inside its own dir

**No agent may:**

- edit any `.js` that is not a `page.js` (no behaviour changes — recommendations
  are written down, not applied)
- edit any `.css`
- touch a file outside its assigned directory
- touch `app.js`, `CLAUDE.md`, `.claude/**`, or another module's dir
- run the dev server, install anything, or commit

The orchestrator (this session) owns `ext/doc/`, `.claude/skills/documentation/`,
`framework/audit/`, `app.js`, and every cross-module edit.
