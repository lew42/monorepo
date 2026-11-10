# Past work: page templates and instant page operations

Budget: $1. Load the `minion` skill first, then the `past-work` skill (`.claude/skills/past-work/SKILL.md` and its minion part).

**The question.** The owner asked on 2026-11-09 (relayed by voice-app) for two things:
- **instant page operations**: a new page, add tabs, go full screen, add cards, each showing on the open page immediately;
- **a template system**: an experiment that works on one page becomes a named template other pages can adopt. The owner says "I kept asking for a template system. I don't know if we ever figured out how to do that."

Find what already exists. Read only; change nothing.

## Search (one `git grep` per term; rg is not installed)

Terms, run separately:
- `template system`
- `page template`
- `make_default`
- `page.use(`
- `Template extends Page`
- `BigCard`
- `full screen` / `fullscreen` / `full-screen`
- `tabs.add`
- `pages: {add` / `pages":{"add`
- `preset`

Where to look:
1. `public/framework/core/Page/Template/` (readme, Template.js, tasks) and `public/framework/core/Page/doc/templates.md`.
2. `public/framework/core/Plugin/` (readme, doc/design-notes.md) and `public/framework/core/Settings/`.
3. The owner's own words: `git grep -n -i "template" -- 'public/framework/ai/sessions/**/prompts*.jsonl' 'public/framework/ai/asks.jsonl'`. Also see `public/framework/ai/indexing-past-work.md` for where else the owner's words live. List each dated quote, at most 15, newest first.
4. Session and task records that planned or built templates: `git grep -l -i "template" -- 'public/framework/ai/sessions/**/requirements*.md'`.
5. `git log --oneline -i --grep=template | head -40`.
6. Page operations the item tool already has: `Servex/agents/page_tools.js` (`pages: {add`, `tabs`, `layout`, `width`, `navigation`). Is there any `fullscreen` word? Also check `core/Page/doc/ai-api.md`.

## Deliverable

Write `past-work.md` in this folder (`public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/page-templates/`), one screen long:
1. **What exists**, one row each: name, path, what it does, and whether it is live (used by a page today: give one `git grep` hit count as proof).
2. **The owner's words on templates**: dated quotes with their file:line.
3. **Past plans**: each file:line, and whether it was built.
4. **Instant page ops today**: which of new page, add tab, full screen and add card the item tool can already do, each with the exact delta and file:line. Say "none found" when that is the result; that is a success.

Prove a thing is missing before you say so: name the search that found nothing. Then reply in under five lines.
