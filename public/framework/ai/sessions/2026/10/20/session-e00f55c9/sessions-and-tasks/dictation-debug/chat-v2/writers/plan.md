# Plan: the assistants write the conversation

## Look-first finding

A voice session's `session.jsonl` (`Servex/agents/Sessions.js`, `kind: "voice"`, id like `v-abc123`) is **never**
touched by `Server/PromptsToSession.mjs` / `PromptRecords.mjs`. Both only mirror a VS Code tab's `prompts.jsonl`:
`Servex/agents/PromptTasks.js`'s `record_for()` requires `first.kind === "vscode-tab"` and returns `null` otherwise
(line 89). A voice session's own id is not a transcript uuid `PromptAudit` could look up either. So **nothing writes
a Prompt for a voice session today** — this build is the first and only writer there, and there is no risk of a
second Prompt for one utterance (CLAUDE.md law 6): there is no first one to collide with.

This means the brief's own line shapes (`p-<ms>` ids, built fresh) are the right call for THIS path, not
`PromptsToSession.mjs`'s `prompt_delta()` (that helper is for folding an *existing* `prompts.jsonl` row, which a
voice session never has).

## The `/api/voice` mismatch (a second finding)

The brief points the kind-tagged POST at `Servex/Servex.js`'s `router.post("/api/voice", …)` (line ~812). That route
is real, but it belongs to a **different** system: `Servex/ext/refine/VoicePage.js`, the Live-Refine demo's staged
display (raw → clean → structured → notes), keyed by a Claude **transcript uuid** (`/^[0-9a-f-]{36}$/`), not by a
voice session's own id (`v-…`). It is not "the same POST as speech" for the real dictation/Chat-v2 session.

Decision: extend that exact route anyway (the fence names it, and kind="speech" is left byte-for-byte unchanged, so
nothing regresses). For `kind` other than `speech`, `session` is read as a **voice session id** instead of a uuid,
looked up in `this.sessions.map`; a miss answers `{ok:false, why}` instead of throwing. Alternative considered: add a
new route under `Sessions.js`'s own router section instead — rejected because the fence only allows touching the
`/api/voice` route in `Servex.js`, not adding a new one, and the brief is explicit about the line.

## Files and functions

- **`Servex/agents/PromptLines.js`** (new): one pure function per line shape — `add_prompt`, `push_raw`,
  `add_paragraph`, `append_paragraph`, `refine_prompt`, `add_reply`, `add_task`, `add_question`, `answer_question` —
  each returns a plain delta object `{tasks:{add:…}} | {[id]:{…}}`, stamped `ts`/`by` the same way
  `PromptsToSession.mjs` already does. No fs here; callers append through their own writer.
- **`Servex/agents/Sessions.js`**, `voice_say(s, fresh)` only: before sending the fast agent its text, writes ONE new
  Prompt (via `this.write`, the existing single writer — same one `say()`/`nav()`/`react()` already use) with
  `raw` = each fresh line's pre-cleanup text (`l.raw ?? l.text`) and one paragraph "a" = the fresh lines' cleaned
  text joined. One Prompt per `voice_say` call: that call already represents one coherent "thought" (either a single
  `say()` line, or a whole `release_thought()` batch held until the owner paused) — the simplest mapping that is
  "one per idea" most of the time, left open for improvement (chat-shape.md flags this exact question as undecided).
- **`Servex/agents/session-smart.md`**: a new short section telling the smart seat which lines to write (refine,
  reply, question, answer) and through which tool — the `item` tool directly (it has no JS writer to call; it is an
  LLM, not code), with one example of each.
- **`Servex/Servex.js`**, the `/api/voice` route only: add `kind` (default `speech`, unchanged behavior). `error` →
  `this.sessions.write(s, {log:{at, text}})` into that voice session's own file (the existing `log` top-level verb
  sessions already use for progress, not a chat bubble). `click`/`context` → pushed onto `s.notes.smart` (the same
  queue `nav()`/`react()` already use to tell the smart seat about something that is not itself a new thought), read
  on the smart seat's next turn.
- **`public/framework/ext/Chat/v2/report.js`** (new): `window.onerror`/`unhandledrejection` → POST `kind:"error"`;
  an opt-in `report.click(el)` → POST `kind:"click"`. Needs a session id passed to `report.init(sessionId)` — it does
  not go hunting for one inside `ux/Dictate` (out of fence; another agent owns that folder), so wiring it to a live
  session is left to whoever wires it up next, written as a sentence in `readme.md`'s "Who writes" section.
- **`Servex/agents/PromptLines.test.mjs`** (new): writes each shape into a temp `session.jsonl` through the module,
  folds it with `ChatV2Model.js`, asserts the Prompt, raw, paragraphs, reply, question and answer all read back.

## Restart

Servex must restart to pick up the `Sessions.js`/`Servex.js`/`PromptLines.js` changes (dev-server-only code, no
runtime import). `session-smart.md` and `report.js` need no restart (the first is read fresh per spawn/wake; the
second is a static browser file, picked up on next page load) but `session-smart.md` only matters once a smart seat
is (re)spawned after it changes.
