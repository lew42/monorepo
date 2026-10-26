# One replay: every line in a session's log is applied through `set()` (plan, 2026-10-26, not built)

The owner's rule (2026-10-26): **every line of `session.jsonl` is applied through the replay system, by the item's `set()`, with no special processor per namespace.** Chat V3 is then only a view over the session's `tasks`: a Prompt is a task, and a Prompt can hold other Prompts (that is the summary card). Nothing is built until the owner approves this plan.

## Why V2 is broken (read from the code and a real log, `v-9dvbbrn`)

1. **V2 does not replay the log, it re-folds it.** `ChatV2Model` is a second, hand-written fold (it re-implements `raw`, `paragraphs`, `replies`, `answer`) beside the real `Prompt`, `Question` and `Paragraphs` classes in `core/Task`, which already replay the same lines. Two folds of one file drift apart.
2. **It skips most of the file.** The model returns at once on every `{chat}` line and has no branch for `{place}` or `{refined}`. So the smart seat's reply, which Servex writes as a `{chat}` line (`Sessions.js`, the `result` handler), is never drawn; only a `replies.add` delta is. The smart seat's final text is its normal reply and goes to the chat line, so V2 shows it only if the seat also remembered to write the delta by hand.
3. **The cleaned text never arrives.** `Sessions.assign_prompt` creates the Prompt from the browser's sentence (`raw` and paragraph "a" both hold the same uncleaned string). The voice assistant's improved text is a `{place:{edit:"improve",text}}` line, which V2 never applies, so the card shows the first, uncleaned words.
4. **Three Question cards.** Both seats are told to file Questions: the fast seat for "an obvious ? sentence", the smart seat for "a question you heard" (`session-smart.md`, the Question bullets), and each `?` sentence gets its own card. No rule says one question is one card or who owns filing.

5. **Is anything processed twice? Partly.** `core/Session` replays task lines and then sets "any other key on the session" (`readme.md`, Lines it replays), so each `{chat}`, `{place}` or `{sent}` line is also stored as a meaningless field on the session while `ext/Session`, `chat.js` and `ChatV2Model` each read the same line their own way. V2 reads `session.jsonl` directly (`JSONL` stream, no chat property); nothing double-writes, but one file has four independent readers.

## The fix order

1. **Smart replies show** (one fix): draw the real replies. Until chat lines become replies (step 4), V2 reads the smart seat's `{chat}` line and attaches it to its `prompt` through `re`. Smallest change that makes V2 usable.
2. **One Question card per question**: the smart seat alone files Questions (the owner's 2026-10-25 decision, `chat-shape.md`); the fast seat stops; a duplicate `q` with the same `from` and text is a no-op.
3. **Cleaned text lands where the raw text is**: see "Placement" below.
4. **V3 over the real classes**: replace `ChatV2Model` with `Session` replay (`Session.fold(lines)`), drawn with `TaskView`.
5. **V3 gets the pure deltas; V1 is not touched** (the owner, 2026-10-26: V1 must keep working as is). Servex keeps writing the old `{chat}`, `{place}`, `{sent}` lines for V1, and writes the delta form beside them for V3 (the Prompt lines it already writes for V2). No old family is removed or rewritten while V1 reads it. If dual-writing ever becomes a cost, the alternative is a V1 adapter that derives the old lines from the deltas; it is built only when V1 is retired. Item-list references in deltas (how a delta names a list item) are being planned by @mastermind-list; this plan uses the shapes `Prompt` and `Paragraphs` replay today and adopts theirs when ready.

**Firm rule (the owner, 2026-10-26): do not break anything.** No step lands unless V1 and every current reader are verified unchanged: before and after each step, run the V1 proof (`node ux/Dictate/test/in-place.mjs <site>`), the session-record readers (`Server/SessionRecord.mjs`, `AISession*`, `PromptAudit`) and the Servex session tests on a copy of a real log, and compare. A step that cannot show "unchanged" is not merged.

## The principle, and what it means for each pseudo-property

`session.jsonl` today holds these key families (counts from one voice session): `chat` 83, `place` 55, `sent` 62, `quiet` 31, `nav` 6, `pause` 3, `react` 3, `refined` 1, `backing`, `sessions`, `log`, plus `tasks`/`<id>` delta lines. Each family has its own reader, so the file is not a delta stream. In the target, a line is `{<id>: {…}}` or `{tasks:{add}}`, applied by `target.set(delta)`, and nothing else.

| Pseudo-property | Written by | Read by (today) | Becomes |
|---|---|---|---|
| `chat` (owner line) | `Sessions.say` | `ux/Dictate/chat.js`, `ext/Session/Session.js`, `Server/SessionRecord.mjs`, `ext/Chat/Chat.js`, `AISession*` | `raw.push` on the open Prompt (already written beside it); the `chat` copy stops |
| `chat` (assistant reply) | `Sessions` result handler | same readers | `{<prompt>:{replies:{add:{id,text,by,anchor?}}}}` |
| `place` | voice assistant via the item tool | V1 `Widget.Thread.place`, `SessionRecord` | deltas on the Prompt's paragraphs (below) |
| `sent`, `quiet`, `pause`, `nav`, `react`, `backing` | `Sessions` | `Sessions`, V1 `chat.js`, `ext/Session` | `{<prompt>:{sent:{…}}}` for `sent`; `quiet`, `pause`, `nav` are session events: `{<session>:{events:{push}}}` or a per-session `events.jsonl` that is not replayed; `react` is a reaction on the reply it names |
| `refined` | `Sessions.refine` | `PromptLog`, V1 | `{<prompt>:{refined:…}}` or `title`/`text` on the Prompt (the smart seat's version) |
| `summary` | voice assistant | V1 | a Prompt that holds Prompts (see V3) |

Migration is additive (V1 must keep working): the delta form is written beside the old line, V3 reads only deltas, and the old lines stay until V1 is retired. Existing logs are not rewritten.

## V3: the chat is a view over `tasks`

A Prompt is a Task; a Prompt may hold other Prompts, Questions and Tasks. The summary card is a Prompt whose children are Prompts, so there is no separate summary record. V3 draws `session.tasks` with the existing task view, a Prompt as a group.

## Placement (no `{place}` namespace)

The fast seat writes the delta on the Prompt itself, under the same replay:

```
{"p-<ms>": {"paragraphs": {"add": {"id": "b", "text": "…"}}}}          new paragraph
{"p-<ms>": {"paragraphs": {"append": {"id": "a", "text": " …"}}}}      same paragraph
{"p-<ms>": {"paragraphs": {"replace": {"id": "a", "text": "Cleaned."}}}} improve (raw stays in `raw`)
{"tasks": {"add": {"type": "Prompt", "id": "p-<ms>", …}}}               a new topic card
```

`Prompt` and `Paragraphs` already replay these. A sentence picks its Prompt by `Sessions.assign_prompt`: the open Prompt (`s.prompt`, closed after `prompt_close_ms` of quiet) unless the fast seat says new topic. Nesting (`where: inside / beside / up`) becomes which task the new Prompt is added under. V1 gains: one writer shape, no `place()` special case, the cleaned text beside the raw words in one place. V1 loses: the `{place}` lines it draws today (`Widget.Thread.place`) until V1 reads Prompts, and the `move` edit it records but never draws.

## V1's whisper feed and a List

V1 keeps live words in `lives`, a `Map` of key to `{el, text, timer}` in `ext/Chat/Chat.js` (key `"draft"`, `"sent:n"`, `"stream:who"`). The words are a DOM string rewritten by `live({text, settled, guess})`; the 1.5 s Whisper guesses go to the Servex whisper log, not to the session. When a sentence is sent the bubble is renamed, then replaced by the server's line. So a draft is a temporary place that moves.

**Recommendation: yes, a List, and it is the Prompt's `raw`.** The growing words are a `Prompt.raw` list of chunks (`raw.push` appends, the last chunk is amended in place, a chunk is final once Whisper settles it), written straight to the Prompt in the session log, so the live words land in their final place and nothing is moved later. The existing `Prompt.push_raw` appends only; add one operation, `amend` of the last chunk (the guess), in `Prompt`/`List` rather than a new class. The view then renders chunks, the unfinished one gray.

## Decisions the plan makes (the owner can overturn)

- Fast seat stops filing Questions and tasks; only the smart seat does.
- `quiet`, `pause`, `nav` are events, not replayed state.
- Build order is the fix order above; steps 1 and 2 are small and could ship first.
