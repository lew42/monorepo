# Voice Chat: one voice assistant that does it all, behind a single/dual switch

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
