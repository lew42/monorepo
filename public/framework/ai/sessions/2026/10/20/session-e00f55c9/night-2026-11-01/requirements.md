# The owner's dictation before sleep (2026-11-01, about 21:45), and the night's plan

The verbatim prompt is logged by the prompt-relay hook, in this tab's session (e00f55c9) at about 21:45. Below are its essence and the plan. **The owner is asleep. Don't ask them questions:** decide, record the alternative, and keep going.

## What the owner said (the essence)

1. **Chat data.** The pseudo properties (`{chat}`/`{place}`, `core/Session/Chat/doc/pseudo-properties.md`) are why V2 and V3 get none of the smart seat's messages.
   - Go forwards: teach V1 to read the new structure once it exists. Until then V1 keeps its lines and must not break; "V1 works the best we got."
   - Focus on V3 rather than V2: V3 already shows live Whisper.
2. **One list drives the chat.**
   - A List (an array wrapper) is rendered by a list view that listens to insert, remove and sort hooks.
   - Any renderable thing can be a message: a prompt, reply, question, task, card or child session.
   - Things that live elsewhere (tasks, child sessions, prompts) appear through **Refs**, not by being embedded.
   - Resurfacing makes a Ref (or dims the original, or shows an arrow), so the log keeps its history.
   - `session.messages` is fine for now; `chat.messages` could come later, for a chat outside a session.
   - Agents add any kind of message with the item tool. The order is an algorithm, not AI.
   - Shapes: `core/Session/tasks/data-shapes/synthesis.md`, and the Item/List backbone.
3. **Raw transcripts.**
   - Keep the raw Whisper text visible, dim then strong, and timestamp every sentence so the raw prompt can be put back together.
   - **V1 raw transcripts are disappearing,** perhaps moved by the fast seat into questions and tasks. That's alarming: V1 is the raw log.
   - In V3 one card grows into a wall of text. Instead:
     - break it into paragraphs, add simple headers, and add references;
     - upgrade raw prompts to tasks, requests or questions in summary cards;
     - each card expands to its items, and each item to its raw prompt.
4. **Placement and ordering:** a new sentence goes into the right bubble (the last one or a new one). Today that's by a time delay, and the chunking isn't working.
5. **Voice dynamics:**
   - **A "thinking" sound** soon after the owner stops speaking, repeated subtly after a second or two, while the AI works.
   - **Async updates** (a background job finishing) are never spoken in the middle of the owner's idea.
   - **A polite interjection:** "excuse me", wait for a pause or a "go ahead", and only for something directly relevant.
   - **Work in the background while the owner dictates.** The Claude app's voice mode replies at once but can't work while it waits. The owner doubts a second, fast agent is needed: an Opus voice agent at medium effort may be fast enough. Undecided; it's an experiment, not a rewrite.
   - **Send sentence by sentence,** for temporal resolution: research while the owner talks, and drop answers into titled cards the owner taps to hear. Driven by the user, never an annoying interrupt.
   - Interrupts, thresholds and echo will need tuning over time.
6. **Observed:**
   - After switching from Chrome to the Claude app, the site's voice kept reading aloud. Before, the mic stopped within a second or two of switching apps.
   - "Jarring." Record it; decide whether read-aloud should pause when the page is hidden.
7. **Prompt refinement:** a Haiku fan-out to study the prompt refinement system, what the fast seat actually does (placement? refinement? one agent per prompt?), and what's documented. **Better system maps:** the owner "can't even find all the things we've done."
8. **Sessions and tasks:** every session computes its own completion from its open tasks. Agents start things and barely finish them; finish them.
9. **Item/List:** a multi-phase plan of which only about half of phase 0 was done. Continue it, and make sure the tests exist and run properly.
10. **Git strategy:**
    - local `main` matches GitHub's `main`; develop on a branch, not on main;
    - `michael/dev` blocks a `michael` branch (use `michael-dev`?);
    - Cloudflare preview branches;
    - the owner dislikes merges, so pull into main first and browse.
    - Study the notes, research, and recommend. **Major surgery:** propose it, don't switch branches.
11. **The mastermind:** stay awake, use Servex spawns, fresh agents for stale topics, keep usage near 70–80% of pace (under 100%), commit everything, break nothing.

## The plan (one owner per stream)

| # | Stream | Owner |
|---|---|---|
| A | Views and read-aloud: the queue, echo, highlight, tap/replay, V3 on `session.messages` (step 1 running); **plus the V1 disappearing-raw-text bug (urgent)**, the thinking sound, async updates as one line, a polite interjection, and the hidden-page behaviour | `mastermind-dictation-v3` (running) |
| B | The chat data model, next phase: Refs, child sessions and tasks as Refs in `session.messages`, the list-view hooks, prompt-to-card upgrade with expandable raw text, per-sentence timestamps, the V1 switch-over (rendered side by side until proven), session completion from open tasks, and the Item/List phase plan with its tests | `mastermind-chat-model` (Opus: foundational OO) |
| C | A system map of dictation's background work (refine, fast seat, placement, per-prompt agents) plus an index of what has been built (Haiku fan-out) | `mastermind-system-map` (Sonnet plus Haiku) |
| D | The Git branching strategy, as a proposal only | `mastermind-git-strategy` (Sonnet), once memory allows |
| E | Leaked worktree dev servers: 67 `server.js` processes (1.7 GB) from worktrees as old as 10-23, never stopped. Fix the root cause in the worktree/server lifecycle | `mastermind-dev-server-leak` (Sonnet), once memory allows |
