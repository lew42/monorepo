verdict: fix
1. [fix] Neither requirements.md nor plan.md says which ask this diff serves. It is the chunk-ack build (chat-live/build-brief.md, branch worktree/chunk-ack, commits 9c570590a and 137d865b4), and the only note that the minion built just the raw/cues addendum is session.jsonl:177. Add a row to requirements.md, or a step to plan.md, that says what was built and what was not: the `{done}`/handled signal, fewer lines per thought, and the Mic.js fixes. Without it, a fresh agent can't pick this up from the task folder.
2. [fix] The brief's main goal, fewer lines per thought (build-brief.md:8-15), is not met. The diff drops one `raw.push` line per continuing chunk and adds one `set_raw` line per Prompt. The `place`, `sent`, `quiet` and `paragraphs.append` lines per chunk are unchanged, and the task folder has no before/after output from `lines-per-thought.mjs` (the brief asked for it in the report).
3. [fix] The new test checks a copy of the code, not the real code. `Servex/agents/PromptLines.say.test.mjs:24-45` re-implements `assign_prompt`/`close_prompt` in `StubSessions`, so `Sessions.js:492-503` and `:1146-1152` could break and the test would still pass. The brief (items 1 and 5) asked for a test of the real write path, and for a check that a reload draws the same chat as the live view.
4. [fix] `Server/lines-per-thought.mjs` is not listed in `Server/readme.md`. The brief says "kept in the repo, readme-listed" (law 10).
5. [fix] Docs that still say `cues` is stored: the comment at `Servex/agents/Sessions.js:952` ("`floor` and `cues` … are stored on the owner's line"), `ext/Session/doc/sessions.md:124` ("`say` stores both on the owner's line"), `ext/Chat/doc/floor.md:26` and `ux/Dictate/doc/widget-notes.md:512`. The brief's item 6 also named three readmes to update with the new line shapes (`Servex/agents/readme.md`, `ext/Chat/readme.md`, `ux/Dictate/readme.md`), and none of them changed.
6. [note] There is a live loss, and it is recorded only in session.jsonl:177. While a Prompt is open, V2's "show raw" is empty until the Prompt closes (about 8 s after the owner goes quiet). A Servex restart while a Prompt is open now loses that Prompt's raw completely (`Sessions.js:515`); before this change it was saved chunk by chunk. That pulls against ask 2's "no lost unsent words".
7. [note] There is a simpler way. `set_raw` (`PromptLines.js:41`) writes the same `{raw:{push:[…]}}` shape as `push_raw`, and both readers already spread an array (`ChatV2Model.js:60`, `core/Task/Prompt.js:62`). So `close_prompt` could call `push_raw(id, raw)` and drop the new function. As it stands, a function named "set" actually appends.
8. [note] Clients still send `cues` on every post (`ux/Dictate/chat.js:182`, `ext/Session/Session.js:84`, `ext/drawer/tabs/ai.js:364`), and `say()` now throws it away. Either stop sending it, or say in `floor.md` that the server ignores it.

## Requirements
- 2 "Live raw whisper text in V2 … no lost unsent words on refresh" — no — this diff adds nothing to the live draft; raw for an open Prompt now shows up only when it closes and is lost on a restart (finding 6)
- chat-live build-brief "fewer lines per thought" — no — only the `raw.push` per chunk is gone (finding 2)
- build-brief "raw/cues byte waste" (the owner's addendum) — yes — raw is written once at close, `cues` is dropped from the chat line; session.jsonl:177 reports 1.79 MB → 1.48 MB on v-sq8y7db
- build-brief "Server/lines-per-thought.mjs, readme-listed" — partly — the script exists but is not in the readme (finding 4)
- build-brief "tests for the new write path" — partly — the stub test only (finding 3); ChatV2 53/53 and resurface 17/17 are reported in session.jsonl:177, and I did not re-run them
- Readers broken by removing `raw` from the chat line? — no — no V1/V2/session reader reads `chat.raw` (searched public/framework and Servex); V2 and `Prompt.js` read the Prompt's own `raw`
- New class with live instances to show? — n/a

## Words
- Comments and doc read plainly — yes — `sessions.md`'s new paragraph explains what moved and why
- Stale wording left behind — no — finding 5
