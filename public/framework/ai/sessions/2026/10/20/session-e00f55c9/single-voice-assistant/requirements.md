# Voice Chat: one voice assistant that does it all, behind a single/dual switch

**In short:** today two voice agents handle your dictation (a fast Haiku seat that files each sentence, a Sonnet seat that answers). This adds a third role that does both, chosen by a setting.

```
setting: dual (default)   fast seat (Haiku) ─ files ┐
                          smart seat (Sonnet) ─ answers ┘
setting: single (new)     single-voice-assistant (Sonnet) ─ files, then speaks only on a pause
```

Findings so far: [investigation.md](investigation.md).

Run as a **build process**: Haiku investigates → plan → Sonnet improves the plan → vscode-mastermind approves → build test-first → index → review → merge.

**The owner (2026-11-02, about 16:00, a long dictation; verbatim in the tab's prompt log).** The essence, in the owner's order.

## What the owner wants
1. **One agent, a new role: "single voice assistant".**
   - Today there are two: `voice-assistant` (Haiku, the fast seat, which places and cleans each sentence) and `session-smart` (Sonnet, which answers). `session-smart`'s brief assumes the fast seat exists, so turning the fast seat off isn't the same thing as one agent.
   - So make a **new role** with its own brief. It runs on Sonnet (a low-effort Opus was the owner's alternative).
   - **A setting picks single or dual,** so nothing that works today breaks. Dual stays the default until single is proven.
   - Settle the id and the name first (law 8). `voice-assistant` is already taken by the fast seat.
2. **It gets every sentence as it ends**, and its first job is minimal cleaning:
   - punctuation, capital letters, misheard known words, filler words;
   - never rewording.

   The brief says plainly what to change and what to leave. The raw words always stay.
3. **Silent work comes first, speaking second.** For each sentence it may, with one-shot item-tool calls:
   - **file it:** default to the last paragraph, or a new paragraph, a new card, or a title above a paragraph;
   - **show the right context card:** a Ref to the task, page or doc being talked about;
   - **amend a card it added earlier,** by id. For example, add the docs once the owner asks how something works.

   It stays hands-free, quick, and never deletes the owner's words.
4. **When to speak.**
   - It doesn't answer each sentence. Servex sends a short **pause cue** after about 1 s of silence (a setting), and that's when it may reply.
   - Find out whether the SDK lets a turn end with no reply at all. If it doesn't, what's the cheapest way to say nothing?
   - Replies are short and on demand. A card on screen beats words.
   - Bigger work goes to a spawned agent.
5. **What the screen shows.**
   - **One check mark per sentence:** grey the moment the sentence with its full stop is sent, green when the assistant has it. No 🧠 in single mode.
   - **Cards absorb long walls of text.** A card holds the paragraphs it summarises, and the card itself expands to show them; no twirl triangles. Text jumping when a sentence moves to a new paragraph is accepted. No animation.
6. **It knows its own system.** It reads the framework readme and its own role readme. Its brief explains the item tool for each move it makes, with the smallest number of changes, for example:
   - move a sentence to a new paragraph;
   - make a card, and give it a title;
   - move several sentences at once;
   - add a Ref to a task.

   Add a tool verb if one is missing; test each one.

## Investigate first (Haiku, in passes; write into `ux/Dictate/doc/` and this folder)
1. **The whole flow today, with real timings from a recent session:**
   - Whisper's text on screen;
   - when a segment closes (`pause_ms` is 700 ms, per `ux/Dictate/doc/silence.md`) and how it's cut into sentences;
   - the POST to Servex: which endpoint, and what it writes;
   - which seat is woken, when, and with what;
   - how a reply gets back to the screen.

   The owner sees replies arrive word by word, or stall then burst out all at once. Find where the delay is. Draw it as one numbered list, with a time per step.
2. **What the fast seat does today,** and who reads it: `{place}` lines, `clean`, Prompt *tasks*, and what V1, V2, V3 and V1.2 draw from each. Then what breaks if it's gone.
3. **What exists for the cards:** `core/Session/Chat` (Prompt, PromptItem, Ref, `Chat.resurface`) and the item tool's list verbs (`add`, move, `push`).
4. **Prior art for "when should a voice agent speak":** turn-taking and endpointing.

## Also, in the plan
- **Where the reply queue stands:** a reply waits while the floor is `speaking`, and Recite queues replies.
- **"Heard-only context":** strip from the agent's context any reply that was never read aloud. It's written in `ux/Dictate/doc/turn-taking.md` and was parked by the owner. Say whether single mode makes it cheap now.
- **Session switching:** dictation outlives the session switcher. Every sentence must go to the session that's selected when it's sent, with no pause needed.

**Fences:**
- Worktree; commit by path; no `python -`.
- Never change dual mode's behaviour.
- `mastermind-dictate-mic-sentences` is changing per-sentence sending in `ux/Dictate` right now ([its brief](../dictate-mic-sentences/requirements.md)). Build on its merge; don't redo it.
- Servex restarts are vscode-mastermind's.

**Budget:** about $20 across all steps.

## Added by the owner, 16:10

**The brief and its own files.**
- The single voice assistant's brief is short but clear.
- It names the brief's own files, so the assistant can read them and improve them for the next agent.

**Answer questions silently, while the owner keeps talking.**
- A question gets a quick, digestible answer on screen first: a short line, or a small set of options. A wall of text, or a thumbs-up to a real question, is wrong.
- Reading aloud is optional. Silent feedback is often the most useful.

**Delegate everything heavy.**
- It doesn't read files or investigate itself. Every question that needs digging, and every task, goes to a spawned agent.
- It reads the mastermind readme so it knows the spawn tools, but it doesn't manage tasks.
- The handoff is programmatic: file the task on the session with the item tool, then `spawn_agent` with `task: {from: <session url>, id: <task id>}`, which moves that task into the child's folder.
- A standing helper spawned automatically for each session (an Opus one, say) is *later*, not now.

**Context cards built step by step.**
- **Does `add` answer with the new id?** It does today: the item tool's reply has `ids`. Make sure every `add`, at any depth, returns its id, so the agent can chain edits: add a card, then add to that card by id.
- **Does the agent's own write come back to it as an update?** If so, it's a wasted turn. A writer shouldn't get its own write back; other agents following the session should.
- **The smallest set of verbs:**
  - add a card;
  - add a paragraph or a string to a card;
  - add a Ref to a task, a child session or a page;
  - move a sentence.
- **An idea to weigh: a `context()` view on every object.** `thing.context()` would render a context card of itself, and the agent then appends content to it by id.
- **No `eval`.** No JavaScript passed through the tool.

## Found by dictate-mic-sentences (604c6f5a1), 16:20

- **Sentences now go out the moment they end.** But a sentence sent early can't be corrected yet when Whisper's final text hears it differently. The early wording stays, and the difference is logged.
- **The missing piece:** a Servex verb (`session/amend`, or the item tool on `sentences.#<id>`) that writes the correction for one of the owner's sentences in place. The display can already patch a line. See `ux/Dictate/doc/upload.md`.
- **Fold it into this build:** the single voice assistant's own cleaning uses the same "correct a sentence by id" path.
