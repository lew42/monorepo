# The Prompt record: shape, grouping, and what is wrong today

How a dictated sentence becomes a Prompt in a voice session's `session.jsonl` (the chat is a live view of that list; [Prompt.js](../Prompt.js), [prompt.md](prompt.md), [chat-shape.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-shape.md) Option C). Counts below are from the real voice session `v-sq8y7db` (56 Prompts).

## The record (one line each; the writer stamps `ts` and `by`)

```jsonc
// 1. a Prompt is born with its cleaned, id'd paragraph. `raw` is optional: kept today (cheap, append-only), droppable once cleaning is trusted.
{"tasks":{"add":{"type":"Prompt","id":"p-1761390000000","raw":["okay so the chat goes in session jsonl"],"paragraphs":[{"id":"a","text":"Okay, so the chat goes in session.jsonl."}]}},"ts":"2026-10-25T10:00:00.000Z","by":"fast"}
// 2. same idea goes on:        add to the last paragraph          (sentences a1, a2… are computed, never stored)
{"p-1761390000000":{"raw":{"push":"it has about 150 lines"},"paragraphs":{"append":{"id":"a","text":" It has about 150 lines."}}},"by":"fast"}
// 3. new idea, same topic:     a new paragraph in the same Prompt
{"p-1761390000000":{"paragraphs":{"add":{"id":"b","text":"Then the smart one reads it."}}},"by":"fast"}
// 4. new topic:                a new Prompt (line 1 again)
// 5. a context card:           a Prompt with a title and no words; prompts of that topic are added under it (or carry "from":"c-…")
{"tasks":{"add":{"type":"Prompt","id":"c-1761390100000","title":"Chat shape"}}}
{"c-1761390100000":{"tasks":{"add":{"type":"Prompt","id":"p-1761390100001","paragraphs":[{"id":"a","text":"…"}]}}}}
// 6. the smart seat refines it (title + text; cleaned paragraphs stay) and works from it
{"p-1761390000000":{"title":"Chat goes into session.jsonl","text":"The chat is stored in the session's own log."},"by":"smart"}
{"p-1761390000000":{"tasks":{"add":{"type":"Question","id":"q-1761390200000","text":"Is it append-only?","from":"p-1761390000000"}}},"by":"smart"}
{"p-1761390000000":{"replies":{"add":{"id":"r-1","text":"Yes.","by":"smart","anchor":{"sentence":"a1"}}}},"by":"smart"}
```

Completion is computed, never written: a context card or Prompt is complete when everything under it is. A checked-off item stays in the list; the view folds it.

## The grouping rule (who decides, and when)

- **The fast assistant decides, code writes** (law 7). Per sentence it answers one of: `same` (carry on: append to the last paragraph), `paragraph` (new idea, same topic: new paragraph), `prompt` (new topic: new Prompt), optionally `inside <card>` (a context card). Servex turns the answer into lines 2-5 with `PromptLines.js`; the assistant never writes a Prompt line itself.
- **A pause does not end a Prompt; a topic change does.** A pause (about 2.5 s) only decides when the assistants are woken. The Prompt stays open until the fast assistant says `prompt`, or the session has been quiet for a long time (proposal: 15 min), or Servex restarts.
- **A context card is temporary:** a titled Prompt that groups the Prompts of one topic while it is live. The substance is the tasks and questions made under it and finished; the card completes with them.
- **Raw words:** keep `raw` while raw-to-clean problems are being found; drop it from the writer once none turn up. The cleaned sentences are the record.

## What survives replay

| Field | Node `Prompt` (core) | Chat's fold (`ChatV2Model`) |
|---|---|---|
| `raw` push (`{push}`, string, array) | all three | kept (string, array, or `{push}` of either) |
| `paragraphs` add / append / replace | all three; one paragraph per id | all three; add is a no-op on a repeated id, same as core's `List.insert` |
| sentences | `sentences.js`, ids `a1…` | same splitter (`core/Task/sentences.js`) |
| smart `title` / `text` | kept (was dropped; fixed here) | kept |
| `replies`, `tasks`, `Question` | kept | kept |

## Defects found (evidence, owner, status)

1. **Placement is not by topic.** `Sessions.assign_prompt` groups by quiet/floor only and always grows paragraph `a`; `PromptLines.add_paragraph` has no caller. 56 Prompts, none with a second paragraph. The fast assistant's `{place}` and `(new paragraph)` reach only the V1 chat (`Widget.Thread`), never the Prompt. *Servex: map `place` onto lines 2-5.* Open.
2. **A pause ends the Prompt** (`s.prompt = null` in `release_thought` and `say`), so one topic said in three bursts is three Prompts. Open, same fix.
3. **Two sentence splitters.** Fixed: `ChatV2Model.sentences` now imports `core/Task/sentences.js` instead of its own regex, so a reply anchored to `a2` means the same words in both (`mastermind-dictation-2`).
4. **Refined `text` was lost on node replay** (25 of 56 Prompts have a smart title or text; the node Prompt kept only `title`), so `Prompt.trace` and any item query missed it. Fixed: `text` is a line field, `cleaned` is the paragraph join.
5. **Fixed: the chat's fold now handles `paragraphs.replace` and a repeated paragraph id is a no-op**, same as core's `List.insert`. A cleaned rewrite by the smart seat now shows. `mastermind-dictation-2`.
6. **A rewrite renumbers sentences**, so a reply anchored to `a2` can silently point at other words. Proposal: an anchor may carry a `quote` (the words), checked on read. Open.
7. **A Prompt that needs no task never completes** (greeting, plain answer): it reads idle, so the session tally counts it open. The smart seat should close it as `no-action` (stop with `fair: "noise"` today). To confirm how it is tallied before changing it.
