# Next: make the phone sheet the sidebar's collapsed form (brief, 2026-10-13) — DONE: section 1 landed in commit 4cb0adf91 (`DrawerRailSheetChat.state()` mounts the drawer tab row in `full`; mic proof passes, 400 px shot in the dictate-sheet task dir)

**Owner's design:** on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sidebar (chat plus the AI, sessions, … tabs). Findings and what is already shared: [asks.md](asks.md#2026-10-13--does-it-work-today-and-is-the-phone-sheet-the-sidebars-small-form).

**Change (one afternoon, Sonnet, in a worktree):**
1. In `ext/drawer/rail.js`, `DrawerRailSheetChat`: when the state is `full`, mount `DrawerTabs` content (the tab row and the active tab body; `tabs.js` already builds it for the desktop drawer) in the sheet instead of the `links()` buttons that call `this.close().then(() => tabs.open(tab))`.
2. The collapsed `open` state stays as it is (chat box + mic).
3. Keep the mic running across the open to full change (`start_mic` / `stop_mic`); the sheet already does so for `keep_mic`.

**Proof:** `dictate-check/mic-proof.mjs` still passes; a 400 px shot of the full state shows the tab row; 400, 1200, 1920, 3440 through `Server/layout-check.mjs`. Fence widens to `ext/drawer/**`; ask its coordinator first.

# Next 2: live bubble order, and one mic for Refine (2026-10-13)

1. **Order — done (e7533ddfc, `Chat.js` `place()`):** in `ext/Chat/Chat.js` (coordinate with its owner), insert a drawn bubble before the first existing bubble with a later `at`, and re-place a bubble when `retag_piece` changes its id/time. Proof: a headless run with a scripted Whisper sends four sentences with replies in between; assert DOM order equals the session file order. Replay tool: `dictate-check/replay.mjs`.
2. **One mic — done (ab15125f7, Refine `VoiceFollow.js`):** the VoiceStrip half was already gone (2026-10-12, composer); the page now also shows what the ✦ chat heard. Original ask: Refine's page takes its raw text from the `chat()` session instead of `VoiceStrip`'s own mic, so desktop, phone and Refine give one result. Details: [asks.md](asks.md#2026-10-13-later--bubble-order-and-how-dictate--chat--refine-nest).

# Next 3: from the surfaces page (2026-10-13)

Recommendations; evidence in [surfaces.md](surfaces.md). Done 2026-10-13 (voice-dedupe): Echo and the Refine buttons share `run_refine` (9b25b1a80); `ext/Ask/chat.js` checked and kept (ten-plus importers); the Dev shell chat tab traced (a fourth surface, recommendation on surfaces.md). Still open: measure luna vs Claude for the fast assistant (the 30-second first reply); one "New session" button; Echo and the Refine buttons share one call; retire `ext/Ask/chat.js`; trace the Dev shell chat tab.

# Next 4: what the 2026-10-13 end-to-end walk left (measured, [review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md))

Walked headless through real Whisper (a spoken WAV as the fake mic) at 400 and 1200. Fixed in the same task: New session resumed the old session; the first sentence after a session start could vanish from the sheet; the phone sheet's title was the class name; New session needed two taps on the phone; the full sheet repeated its tab row as links; a refused-mic message ran off a 400 px screen.

1. **The fast assistant answers when it is not addressed (Servex, `session-fast.md`).** The owner's rule: fast "does NOT reply in chat unless addressed by name". Measured: it replied 2.3-2.7 s after 4 of the 8 "Smart assistant, …" sentences across four runs, with a guess ("probably the /framework/ home page") the smart one then corrected. Change: in `Servex/agents/session-fast.md`, reply only when the sentence names "fast"; a sentence that names "smart" is a skip.
   **DONE (dictate-next-4):** prompt plus a gate in `Servex/agents/Sessions.js` (`FAST_NAMED`): a fast reply is dropped unless the heard sentence says "fast". Replay [replay-step1.json](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-next-4/replay-step1.json): 0 of 8 (was 4 of 8).
2. **The smart assistant's first answer is slow when cold: 23.6 s and 11.0 s (phone runs), 11.4 s and 6.2 s (desktop runs); warm 4.3-5.8 s.** Each new smart agent starts with about 60,000 tokens of context and costs $0.38-0.48 per four-sentence session. Halving that prompt is the lever; measure with `first-reply/measure.mjs`.
   **DONE, target nearly met:** the smart agent starts with no user/project settings and no claude.ai connectors; context after 8 sentences 68,417 to 44,204 tokens (-35 percent, not half), first reply 46.2 s to 6.8 s ([replay-step2a.json](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-next-4/replay-step2a.json)); hiding unused Servex tools saved only 1.3k, so it was dropped.
3. **A smart assistant took a test sentence ("the sheet should show every bubble in order") as a task and started `task-mastermind`** (stopped at 0 turns). It should confirm before spawning work from a statement that is not a request.
   **DONE:** `session-smart.md` says a statement is not a request; replay [replay-step3.json](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-next-4/replay-step3.json): 0 task-masterminds (baseline 1).
4. **`/framework/page.jsonl` 404 on every sheet or drawer open** (`core/Page/ext/Inbox/Inbox.js` fetches a page's `page.jsonl` that most pages do not have). Harmless, but a console error on every open.
   **DONE:** `Inbox.js` reads a folder's `page.jsonl` only when the parent's file list calls it a jsonl page; the 404 on `/framework/page.jsonl` is gone (probe `dictate-next-4/shots.mjs`).
5. **The status line can say "Mic: on, level ok" just after the mic was stopped** (phone, step "new-session"): it updates on the next level tick.
   **DONE:** `Dictate.js` logs `Mic: idle` on stop and ignores late level ticks; the probe shows "Mic: idle" right after stop (was "on, level ok").
6. **The half sheet shows about two bubbles** (thread ~190 px of a 400 px sheet). Dragging to full fixes it; a taller default is the alternative.
   **DONE:** with no dragged height `rail.js` sizes the sheet to 60dvh; at 400 the thread is 209 px of 480 (was 110 of 382); shots `dictate-next-4/shots/` (pictures are not committed).
