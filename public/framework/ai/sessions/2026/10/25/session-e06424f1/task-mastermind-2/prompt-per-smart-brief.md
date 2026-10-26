# Brief: a Prompt (bubble/card) per smart delivery, behind a per-session setting

Load the `minion` skill first. Budget: $4. Worktree: `C:\Code\lew42\worktrees\prompt-per-smart` (branch worktree/prompt-per-smart); work only there. Never touch the main tree, never restart servers, never `git stash`.

## Ask (owner, 2026-10-25, via the smart seat)
Smart should get the owner's words PER SENTENCE (more granular, faster responses), and each sentence delivered to smart opens its own bubble (V1) / card (V2). Build it so it is **off by default, switchable per session** (cost: the week is at ~100% of pace; each sentence is a smart turn). Tell me the setting name.

## Read first
- `chat-live/prompt-boundaries.md` beside this brief (the analysis, with line numbers): today `Sessions.release_thought` (Servex/agents/Sessions.js ~L1134) sets `s.prompt = null` at every FAST pause, and `say()` ~L1014 does the same; smart is fed separately by `WakePolicy` (Servex/agents/WakePolicy.js; defaults gap 12 s / every 6) via `feed_smart` (~L265).
- `Servex/agents/Sessions.js` settings handling (`settings` verb, `/api/session/settings`, how `wake_gap_s`/`wake_every` are stored per session; `ext/Chat/Mic.js` pushes them), `core/Task/doc/prompt-record.md`, `Servex/agents/PromptLines.js`.

## Build
1. A per-session setting (propose `prompt_per_smart`, boolean, default false; reuse the existing settings path so the dictation gear can later show it; document its name in the module readme). `wake_every: 1` already exists as a setting; do NOT change its default.
2. When ON: `release_thought` (and the matching `say()` branch) sends the thought to fast with the SAME open Prompt id but does not clear `s.prompt`; `s.prompt` is cleared in the WakePolicy flush path (`feed_smart`) once the batch is delivered to smart. Combined with `wake_every: 1`, each sentence delivered to smart is its own Prompt. Also write `{sent:{to:"smart"}}` for that Prompt at the flush if `mark_sent` does not already (the client shows a gray 🧠 on it). When OFF: behaviour byte-identical to today.
3. Tests: add to the existing Servex sessions tests (find them: grep for tests of `release_thought` / WakePolicy, e.g. `Servex/agents/*.test.mjs`): ON — two fast pauses before one smart flush produce ONE Prompt id, and the next line after the flush a NEW one; OFF — unchanged. Run the existing sessions/WakePolicy tests; they must stay green.
4. Docs: the sessions readme (where settings are described) and `core/Task/doc/prompt-record.md` get one line each naming the setting and what it changes. Verified against the code.
5. Do NOT restart Servex; a restart goes live later at the owner's chosen time. Commit by exact path; run `node Server/review.mjs <this task dir> C:\Code\lew42\worktrees\prompt-per-smart` is mine, not yours.

## Report
One screen to task-mastermind-2: the setting name, files changed, tests (counts), the commit id, and anything that could not be proven without a live restart.
