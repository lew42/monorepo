# Dictation v3: handover (2026-11-02, 04:30)

Tonight's dictation work is all on `michael/dev`, and nothing is running. The full record is [session.jsonl](session.jsonl).

## What landed tonight

- **V2 shows the live guess, and the 👤 icon has a tooltip:** merge `c4022f1b8`.
- **What the green check and the brain icon mean**, written up in [ux/Dictate/doc/status-icons.md](/framework/ux/Dictate/doc/status-icons.md): `84be8a34a`.
- **V1 keeps its bubbles in order** (v1-order): merge `3b1fae8d3`.
- **V1 shows the raw dictation** (v1-raw): `84671a9fb`.
- **Read-aloud resumes, queues replies and takes turns** with the owner: merge `4779bc843`.
- **ChatV2 extends ChatV3:** `bc5e17255`.
- **Read-aloud ignores its own echo**, near-silent lines and Whisper's phantom phrases: `c5e44389f`.
- **Read-aloud plays a thinking cue** while a reply is on its way: `733c921cf`.
- **The highlighted word no longer drops out:** `9a8f8627b`, with its CSS fixed in `abba4f3b5`.
- **The chat model, steps 1 to 8:** one stored list (`session.messages`) that Servex writes beside the old chat lines. Last merge `d10a91a95`.
- **V2 draws the sent and smart marks from the Prompt message** (v2-marks): `cd7e25872`.
- **All 12 Dictate browser tests pass:** merge `ec0890d48`.
- **Read-aloud no longer floods:** updates from agents wait behind the answer and are spoken as one line, and a tap on the bubble pauses or resumes it. Merge `40706ab4b`.

## What's open

- **Read-aloud, the next three items** in the agreed order: resumable bubbles, the bubble toolbar, and highlighting words as they are read. They are under "Open, by the agreed build order" in the [Recite readme](/framework/audio/Recite/readme.md).
- **Recite follow-ups**, in [audio/Recite/improvements.jsonl](/framework/audio/Recite/improvements.jsonl):
  - the spoken "tap to hear it" does not match what a tap does;
  - only agent updates are put in order of relevance;
  - Recite records an error report every time the sheet opens.
- **Phantom and echo lines still get sent:** a phantom phrase ("Thank you.") or an echoed line still reaches the chat as a sent bubble. It is the task "Gate Dictate's send path on the echo/phantom guards" in [session.jsonl](session.jsonl).
- **Switching V1 to the new list:** the prep brief is written, and nobody has started it ([v1-switch-prep/requirements.md](../v1-switch-prep/requirements.md)).
- **The smart seat should write `working` onto the Prompt message.** It is what remains of views step 3.
- **Dictate and Chat follow-ups:** [ux/Dictate/improvements.jsonl](/framework/ux/Dictate/improvements.jsonl) has 5 and [ext/Chat/improvements.jsonl](/framework/ext/Chat/improvements.jsonl) has 2.
- **Tooling problems seen tonight** (logged in [session.jsonl](session.jsonl) on 2026-11-02 at 03:56):
  - `merge.mjs` leaves files staged when the main tree has other staged files. It blocked a merge tonight, and vscode-mastermind had to unstage 144 stray files.
  - New worktrees lack the gitignored test fixtures (jfk.wav, tasks.json, page-work.json).
  - `core/Page` work.js throws when cards() returns something other than an array.
- **The Refine browser tests are still red**, in [core/Test/browser-scripts.mjs](/framework/core/Test/browser-scripts.mjs).

## The owner's next decisions

From [owner-decisions.md](owner-decisions.md):

1. **When V1 switches to the new list.** The prep can run first; it compares the two and expects zero differences.
2. **One view showing both the raw dictation and the cards** (the end goal). For now V3 keeps the raw dictation behind each card.
3. **Settings that apply on every device**, instead of per browser as today. The owner marked this "later".
4. **What the brain icon's "done" means:** the smart assistant *received* the line (V1 today) or *answered* it (V2). See [status-icons.md](/framework/ux/Dictate/doc/status-icons.md).
