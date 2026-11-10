verdict: fix
1. [fix] `call: "place"` is refused by the item tool ("place" is not a method on "this item"); only `delta: {place: …}` works, because the item tool handles `place` itself and no class has it as a method. The voice assistant's one write per sentence now teaches the refused form: `.claude/skills/voice-assistant/SKILL.md:15`, `Servex/agents/single-voice-assistant.md:10`, `:16` and `:31`, `public/framework/ux/Dictate/doc/voice-assistant.md:18`. Once merged, every sentence the fast seat places would fail. Put these back to `delta: {place: …}`.
2. [fix] `call: "help"` is refused on /live/ (the known methods there are set, unset, remove, tab, place), while `delta: {help: {}}` works. `public/live/readme.md:9` and `:16` now teach the refused form; restore `delta: {"help": {}}`.
3. [fix] `set: {messages: {"<id>": {title}}}` is refused ("messages" is a list), at `Servex/agents/single-voice-assistant.md:22`. The form that works is the dotted key `set: {"messages.<message>.title": "…"}`, or keep `delta`.
4. [fix] `call: "pages.add"` is refused on a page ("no such path: pages"), because the item tool handles `pages` itself (`apply_pages`). It is taught at `public/framework/core/Session/tasks/data-shapes/seats/delta-flow/delta-flow.md:76`; restore `delta: {pages: {add: …}}`.
5. [fix] `get: "summary"` on the doc's own example session (session-e00f55c9) answers a 4 KB truncated preview string, not the summary, because `get` answers go through `cap_read`. Measured: 4682 bytes, `{"truncated":true,"preview":…}`, while `delta: {summary: {}}` answers the full object. `Servex/doc/item-tool.md:37` should keep the delta form for `summary`, or say that `get` cuts it off.
6. [fix] Stale text next to the new examples. `Servex/doc/item-tool.md:34` still says "there is no `get` key" right above the `get:` examples. `public/framework/core/Session/readme.md:150` now shows `get: "completion"` but still says it answers `{ok: true, answer: {completion}}`; `get` actually answers `{ok, read, value}`.
7. [fix] The checks in `manifest.md` (doc-check, the two tests, `node --check`) never ran a rewritten example, so none of findings 1–4 was caught. Each rewritten shape should be run once against a scratch session and a scratch page before landing: a probe like that took under a minute and found all four. The brief's rule "when unsure, keep `delta`" covered `place`, `help` and `pages`: none of them is in the class's method list (`instructions.methods`).
8. [note] `manifest.md` says `Servex/ProcessRunner.js` had 2 lines changed and 1 kept; the diff changes 1 line. The kept `{"<id>":{"wait":…}}` fragment is correct.
9. [note] The census counts (45 files and 92 lines before, 13 files and 25 lines after) match a re-run in the worktree (25 lines). The 7 kept `run_item(...)` calls in `Server/*.mjs` are real logic, so leaving them alone was right under the brief.
10. [note] The other rewrites I ran against the real tool all work: `tasks.add` (with an object or a string), `p-1.tasks.add`, `p-1.replies.add`, `<id>.start`, `<id>.complete`, `messages.add`, `stop`, and `content.add` / `set title` / `get content` on a page. So did the prompt strings in `Servex/Servex.js:308`, `Servex/ProcessRunner.js:200` and `core/Task/Process.js:60`. `get: "completion"`, `"rates"` and `"unread"` answer correctly.
11. [note] A fresh agent can continue from here: `session.jsonl` has the assign line, the log and a `complete` with evidence, and `census.txt` and `manifest.md` are committed in worktree `C:/Code/lew42/worktrees/item-docs-switch` (commits up to d6563dfea). Unmerged, as the brief says.

## Requirements
- "rewrites the examples that teach agents the tool so new calls use the verbs" — partly. Most are rewritten and work; 9 examples across 5 files now teach a call the tool refuses (findings 1–4), and 1 teaches a truncated read (finding 5).
- "wording only: no code behaviour changes" — yes. The only .js edits are prompt strings (`Servex.js:308`, `ProcessRunner.js:200`, `Process.js:60`) and a comment (`Message.js:26`).
- "When you're unsure, keep `delta`" — no for `place`, `help` and `pages`, which are not methods.
- Step 1, census saved as `census.txt` — yes, 92 lines.
- Step 2, skip list — yes: `page_tools.js`, the `owner-2026-*` docs and `core/List/page.js` were left alone.
- Step 4, `manifest.md` with one row per file — yes; one count is off (finding 8).
- Step 5, checks plus census before and after — yes, they ran; they could not catch findings 1–4 (finding 7).
- Step 6, commits by area, not merged — yes, 6 commits in the worktree.
- Class question — n/a (no class added or changed).

## Words
- The rewritten lines read clearly and match the surrounding prose — yes.
- The text beside the changed examples is still true — no, see finding 6.
