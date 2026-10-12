# @mentions — familiar concepts become icon links everywhere — requirements

Owner's words: `owner-words.md` (read fully). "Everywhere we're referencing the page class, it should be like a little document icon… with the word Page… a link to the core Page class… `@Page` … an automatic mention system where any of those tags automatically get converted to actual references."

## Asks
1. **A registry of concepts**: name → { url, icon } (e.g. `Page` → `/framework/core/Page/`, a document/file icon). Seed it from the systems map on card 2026/09/29/familiar-structure-every-named-system-ge (`systems.md`) and the Concepts tiles; a JSON/JSONL index any page can load cheaply (cached). Capitalised names = classes/systems.
2. **Syntax `@Page`** in any content — markdown (ext/markdown), chat bubbles (ext/Chat), cards, readmes rendered as pages — renders as an ICON ITEM link (icon + name → url; ui/item from item-ui). Unknown `@Name` stays plain text (and gets logged as a candidate).
3. Agents write `@Page` instead of "the page system" — add one line to the content skill via mastermind-servex-8 (skills architect), not directly.
4. First visible use: the AI 2 Needs you / Inbox rows and the chat bubbles show `@Page` etc. as icon items.
5. Keep it tiny: one parser pass after markdown, one registry file; no build step.

## Rules
Pool worktree, smoke (links followed), merge.mjs, one fresh reviewer, shots 400+1920. ≤ 2 minions, budget $8 hard.

## CHANGE OF DESIGN (the owner, 09-30, relayed by servex-mastermind-opus) — this overrides `@Name` above

1. **References use `#`, not `@`:** `#Servex`, `#Page`. `@` is kept for USERS and AGENTS (`@owner`, `@mastermind-page`).
2. **Generalize:** a CONTROL CHARACTER defines a namespace (`#` = references, `@` = users/agents, more later). Each namespace has a MAP: a plain JS object of name → { icon, url, ...any data }. So: `ext/Mention/maps/refs.js` (`#`) and `ext/Mention/maps/people.js` (`@`: owner, and agent roles — mastermind, fast-assistant… may point at /framework/servex/doc/roles.md), and `Mention.js` takes `{ "#": refs, "@": people }`; adding a namespace is adding a map.
3. **Names with spaces** use a bracket form: `#[Page layout]`. Pattern: `/(?<![\w\[])([#@])(\[[^\]\n]+\]|[A-Za-z][\w.-]*[\w])/`. Careful: markdown headings (`# Title`, a `#` then a space) never match; `#` inside a url or a word (`a#b`, `#fff` colours in text are fine to leave as unknown plain text) must not break anything. Lookup is case-insensitive.
4. **The map can be derived** from the site (page titles/icons, Concepts tiles, the systems map) — this task: a hand-written map seeded from those, plus a one-line note in doc/ on how a derived map would plug in. Manual entries for things outside the site.
5. **First targets, all must resolve** (to real docs; this dev server answers 200 even for missing pages, so check the file exists on disk): `#Servex` → /framework/servex/, `#Page` → /framework/core/Page/, `#CLAUDE.md` → the root CLAUDE.md's rendered view or /framework/ (say which), `#skills` → /framework/servex/ skills section or .claude/skills, `#MCP`, `#dev-server` → /Server/, `#mastermind`, `#fast-assistant`, `#smart-assistant` → /framework/servex/doc/roles.md (anchor if one exists). The AI chats must render them as icon links.

