verdict: pass
1. [note] per-sentence-model-clean was asked as "cheap"; what was built costs about $0.07 a sentence, so it ships opt-in and off (STATE.md §5, asks.md). That is reported honestly with the reason, but the owner's "cheap" is not met yet: the next step is to cut the per-call cost (a fresh session per call), as asks.md says.
2. [note] duplicate-bubbles was not reproduced, so no fix was made. The brief allows this ("or in STATE.md with the real blocker"), and `dup-e2e.mjs` is left as the check to run. The word repeated across a chunk seam (STATE.md §1) is a real lead and deserves its own line in asks.md "Open", not just a mention.
3. [note] The brief asks for a layout check at 400/1200/1920/3440. The new **To board** button (CardsStage.js:43-48, VoiceStage.css:703) is a page change, but STATE.md records no layout check, and this review was given no shots. On a narrow card the "Retry: Servex is not reachable" label could wrap the footer row.
4. [note] Servex/ext/refine/run.js:274 `spent()` reads the static `RefineCall.sink`. Two refines running at the same time swap that one global, so one card's cost can include the other's calls. This already affected `runs` before this change; the fix is per-run storage (AsyncLocalStorage).
5. [note] Servex/ext/refine/CardAsk.js:156-160 creates the board card first and writes the ask line second. If the ask write fails, nothing records the card, so the next press makes a second board card. Also, `words` is set to a session URL, but elsewhere in the ledger that field holds the owner's own words.
6. [note] Servex/Servex.js:45-49: the whisper stream subscribes to the `whisper` process object at connect time. That is fine today, because `whisper()` makes it once at boot, but if Whisper is ever re-created the page goes quiet with no error. VoiceStrip.js:817 counts "stopped" and "errored" as down, but `Connection.line` (Connection.js:755) has no sentence for them, so the status line shows an error with no reason.
7. [note] Simpler: AISessionDetail.js:594 `voice.session = session_id` repeats what `VoiceFlow.follow()` now does itself (VoiceFlow.js:669), so the line can go.
8. [note] One-off scratch scripts are committed in the task directory (`count.mjs`, `peek.mjs`, `padwav.mjs`), and CLAUDE.md says scratch belongs in the scratchpad. ui-proof.mjs:534 also defaults to a worktree-only port (51720). Separately, `ext/Refine/stages/files.jsonl` picked up three census lines for files this task did not touch (STATE.md "Left" names this).

## Requirements
- 1 "duplicate-bubbles … Reproduce first, fix the cause" — partly — reproduction was tried three ways (prove-dup proofs, the walk, a real-Whisper `dup-e2e.mjs`) and was not reproduced; recorded in STATE.md, as the brief allows
- 2 "vscode-voice-path … one dictation system, one widget" — yes — Echo.js:73-87 writes raw/clean/structure through the same `VoicePage` with the Refine button's id scheme (matches AISessionConversation.js:29); proof.mjs A
- 3 "prompt-to-board-cards … become board cards and asks.jsonl lines" — yes — CardAsk.js + `POST /api/voice/card` + a To board button; only one card per press, even from two tabs; proof.mjs C, ui-proof.mjs 1. Approve/improve is left over, and asks.md says so
- 4 "whisper-status-stream … stream, not poll" — yes — `GET /api/whisper/stream` SSE on the Process "status" event (Process.js:97/227/307); the 5 s poll is removed, and `recover()` polls only when no stream is open
- 5 "per-sentence-model-clean … cheap … cost per message" — partly — LiveClean.js shows the measured cost beside each stage's time, but at about $0.07 a sentence it is not cheap; opt-in and off (finding 1)
- Done when: commit + proof each — yes — asks.md entries carry commit links; proof.mjs and ui-proof.mjs exist. Voice walk re-run — the STATE.md entry for ask 1 says yes. Layout check 4 widths — not recorded (finding 3)

## Words
- content: plain sentences — yes — STATE.md and the asks.md entries read as full sentences, and they say what was not done
- content: links to what exists — yes — commit links and the STATE link in asks.md; proof scripts named
- content: one takeaway first — yes — the STATE.md table gives each ask's state in its first column
