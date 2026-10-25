# Chat v2 writers, round 2: fix the review, and use the real speech path

Budget: $6. Same worktree (`C:\Code\lew42\worktrees\chat-v2-writers`, branch `worktree/chat-v2-writers`). Your parent is `mastermind-chat-v2`. First merge current michael/dev into the branch. If a dev-server `files.jsonl` blocks the merge, commit those files first; never stash.

The review is in `review.jsonl` in this folder (findings 1–11). Each item below names the findings it settles. When you're done, answer every finding in this folder's `session.jsonl` as `{"review":{"answer":{"n":N,"reply":"fixed|declined|noted: …"}}}`.

## 1. A Prompt starts when the owner starts speaking (findings 2, 3, 4)

- Move the Prompt write out of `voice_say`. On the first `say()` line of a new thought, write `add_prompt` and keep its id on the session (for example `s.prompt`). Do this whatever the seat is, so it doesn't depend on `voice_seat()`.
- Each `say()` line pushes its raw words (`push_raw`) and appends its cleaned text to the open paragraph (`append_paragraph`, paragraph `"a"`).
- The Prompt is finished when the thought is handed to a seat (`release_thought`, or the direct `send` paths). Then clear `s.prompt`, so the next line starts a new Prompt.
- The respawn path (`Sessions.js:385`, re-sending `last_owner`) never writes a Prompt.
- Put your choice of where a Prompt ends into the readme's Decisions, with the alternative.

## 2. The smart seat knows which Prompt it answers (finding 1)

Each message to a seat that comes from a thought carries the Prompt's id, for example `(prompt p-1761383000000)`. `session-smart.md` tells the smart seat to read the id from there.

## 3. `kind` goes on the real speech path, not `/api/voice` (the parent's correction; findings 5, 7, 8, 10)

- **Revert the `/api/voice` change in `Servex/Servex.js` completely.** That route belongs to the Live-Refine demo and stays as it was. The `now_ms` import goes too, if nothing else uses it.
- The real dictation path is Servex's `/api/session/say` (Dictate → `ux/Dictate/chat.js` deliver → `Sessions.say()`). Give it `kind`: `speech` (the default, unchanged), `error`, `click` or `context`.
  - A non-speech line is written to `session.jsonl` tagged with its kind: `error` as a `log` line, `click`/`context` as a line the smart seat reads as context on its next turn.
  - It never wakes a seat as a sentence, and it never starts or extends a Prompt.
- Validate the input: the session must be an own key of the map (`Object.hasOwn`), the text a non-empty string, and the kind one of the four. Wrap the handler in try/catch the way its neighbours are.
- `log` lines use an ISO `at`, like the rest of the repo's logs.
- `public/framework/ext/Chat/v2/report.js` posts to `servex_url("/api/session/say")` (`public/framework/dev/servex_url.js`) with `kind`. It still isn't wired into any page: `ux/Dictate` belongs to another agent until it merges.

## 4. Docs and proof (findings 6, 9, 11)

- `ext/Chat/v2/readme.md`: put every decision under Decisions with its alternative, and keep "Who writes" true. Say which seats get Prompts, and that `/api/session/say` takes `kind`.
- Check, with one run, that an item-tool write with `path` set to the session folder lands in that folder's `session.jsonl`, not in a `page.jsonl` beside it. Say how you checked.
- Add a test with a stub `Sessions` (no live Servex, no model calls). It calls `say()` twice in one thought, releases it, then goes through the respawn path once. It asserts:
  - exactly one Prompt, holding both raw lines and one paragraph;
  - the seat message carries the Prompt id;
  - the respawn adds no Prompt;
  - a `kind: "error"` line becomes a `log` line and doesn't reach a seat.
  
  Fold the result with `public/framework/ext/Chat/v2/ChatV2Model.js`.

## Fence

You may change only these:
- `Servex/agents/Sessions.js`: the `say`, thought-holding and `voice_say` paths, and the `/api/session/say` handler.
- `Servex/Servex.js`: the revert only.
- `Servex/agents/PromptLines.js` and its tests.
- `Servex/agents/session-smart.md`.
- `public/framework/ext/Chat/v2/report.js`.
- `public/framework/ext/Chat/v2/readme.md`: the "Who writes" section and Decisions.

## Rules

As in `requirements.md` in this folder:
- `node --check` every file you touch, and commit after each piece.
- Never restart Servex or the dev server, never drive the owner's tabs, never stash.
- Log progress as `log` lines in this folder's `session.jsonl`.
- Don't merge.

Your last message is one screen: what writes what now, the commit, the test counts, the finding answers, and what the Servex restart switches on.
