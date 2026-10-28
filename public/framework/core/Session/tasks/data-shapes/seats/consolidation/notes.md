# Consolidation notes (seat c)

2026-10-28. The table is in [shape.md](shape.md). Here: what I verified, what the prior docs got right or wrong, and the cost of folding. Counts came from scripts (a registry count by role; `wc -l`; `rg` for importers), not memory. I changed no code and moved nothing.

## 1. Chat: what I found

- **Four families, three line shapes, one default.** V1 (`ux/Dictate/chat.js`:440 + `Widget.js`:920 over `ext/Chat/Chat.js`:963) reads the old `{chat}/{place}/{summary}/{refined}/{react}` lines and is the default. V2 (`ext/Chat/v2/ChatV2.js`:320 + `ChatV2Model.js`:175) and V3 (`v3/ChatV3.js`:167) both read the task-shape `tasks` lines, behind chips. The session page's "Chat" chip (`ai/AISession/AISessionConversation.js`:94) is a fourth thing: it draws an SDK agent's Claude transcript, not a voice session.
- **The chip is the only seam.** `ext/drawer/ChatView.js:20-37` stores `v2`/`v3`/`null` in localStorage and mounts the chosen view in the Sheet and the AI tab; `AISessionDetail.js:294-304` does the same with `?chat_view=`. So the v1/v2/v3 "difference" is a switch the owner flips by hand, not a migration in progress.
- **Chat.js has five real importers** (`Widget.js`, `CardChat.js`, `ChatView.js`, `ext/Session/page.js`, `AISessionConversation.js`), so it cannot be deleted; it is the shared helper layer. `Composer.js` has five (`Widget`, `Compose.js`, `RefineDemo`, `tabs/ai.js`, the Dictate demo). `Mic.js` is used by `Composer`, `Refine`, and the Whisper log.
- **Dead or demo-only:** `ChatPanel.js` is imported only by `ai/local/page.js` (the local-model chat page); `Drill.js` has no importer outside `ext/Chat/`. `ai2/chat.js` is a 3-line re-export left from the ai2 merge; its one reference is a text link on the surfaces demo page.
- **Not chat, easy to mistake for it:** `Servex/Stream.js` (76 lines) is the dashboard's server-sent-events wire. It carries Servex events to the dashboard page; no chat line travels on it. Skip it in any chat move.
- **Writers:** only Servex writes voice-session lines (`Sessions.js` 1607 lines for the wake/say flow, `PromptLines.js` 61 for task-shape lines). That keeps the "one writer" rule true, so consolidation is a reader-side and agent-side job, not a data race.

**What works:** V2's behaviours are the most tested (53 checks; resurface, cursors, "open bubble last" documented in `ext/Chat/readme.md`). The input half (Composer, Mic, chunks, cursors) is shared and has no rival.

**What does not:** V1 and V2 each have their own bubble-merge and cursor logic (shared only for the cursor maker), so a bug fixed in one reappears in the other. V3 is a rough draft with 19 checks.

**Recommendation.** Do what the 2026-10-27 decision says (the chat is one stored list, "the spine") and write ONE view for it. Base it on the V3 idea (a view over a list of things that can draw themselves, which is the owner's direction 4) and port V2's behaviours and tests into it. Keep `Chat.js`/`Composer`/`Mic` as helpers. Only after the one view is the default do V1, V2 and V3 get the legacy mark. Marking V1 legacy first would break the fast seat's output (it writes `{place}`).

## 2. Prompt refinement: what I found

I re-checked the system map's census (§3g) where it was cheap; it holds.

- **Row 1 runs, row 2 runs, row 7 is off.** `Sessions.js:97` defines `worth_refining`, `:666` the `refine()` gate, `:1021` calls it from `say()`. `prompt-tasks.off` exists in the Servex home (dated Oct 25 01:55), and `Servex.js:301` only builds `PromptTasks` when `SERVEX_NO_PROMPT_TASKS` is unset, so the hook is the off-by-file switch the map describes.
- **Rows 6 and 13 are env-gated off:** `SERVEX_ECHO`, `SERVEX_CHAIN` (`Assistant.js:64`, `Echo.js`). Row 4's code path (`LiveRefine`, `Servex/ext/refine/*`, `Servex.js:788-802`) is wired but has no fresh output per the map; I did not run it.
- **Who uses `ext/Refine`:** `AISessionCoverage.js`, `Mic.js`, `ext/Session/Session.js`, `Refine.js` and two try/demo pages. So the client half of refinement is still referenced from live chat code; do not retire it by name.
- **The owner's "maybe 3+" is really 2.** Two paths do work each sentence or prompt (the fast `{place}` pass and the smart seat's refine). The other twelve are off, by-hand, or duplicates of `clean()`.
- **Worth keeping:** the `clean()`/`structure()` engine and prompts (`ext/Refine/engine.js`, `structuredPromptDefault` in `Server/refine.mjs`); the `[S#]` sentence-citing idea (proposal only, per the map); `Placement.js`'s rule-based placing, because a rule-based placer is the cheapest way to replace the fast model (see §4).

## 3. Roles: what I found

Registry count, `started_at` window (3859 rows; scratch script, not in the repo):

| role | all | 7d | 14d |
|---|---|---|---|
| minion | 1198 | 110 | 206 |
| clarity | 852 | 108 | 275 |
| reviewer | 700 | 199 | 280 |
| task-mastermind | 355 | 18 | 54 |
| mastermind | 191 | 41 | 90 |
| helper | 141 | 1 | 81 |
| echo | 125 | 0 | 0 |
| session-smart | 85 | 8 | 43 |
| session-fast | 67 | 0 | 25 |
| card-assistant | 31 | 2 | 2 |
| checker | 28 | 0 | 0 |
| voice-assistant | 21 | 10 | 21 |
| voter | 21 | 0 | 0 |
| card-manager | 13 | 0 | 0 |
| directory-mastermind | 9 | 0 | 1 |

- **`roles.js` has no `helper` row**, yet 141 helpers were spawned (81 in 14 days). Callers: `ProcessRunner.js:97` (default role of a Process step), `Assistant.js:295`, `policy.js:151`, `ext/openrouter/evals/keys.mjs:95,163`. `roles-proposal.md` §12 says "0 spawned": that is wrong, probably because it counted by a different field. The $263/month figure is real money going to a role with no definition.
- **`session-fast` is not dead.** `Sessions.js` (~1284-1310) spawns `voice-assistant` when `voice_seat()` is true and `session-fast` otherwise; the `session-assistant.txt` switch decides. 25 spawns in 14 days, none in the last 7: the switch was flipped to `voice` around then. `roles.js` marks it retired (alias), which is true of the definition, not of the file switch.
- **The voice seats today.** Fast seat `voice-assistant-v-<id>` (Haiku, low effort, no tools, item door only, woken once per finished sentence, writes one `{place}`). Smart seat `session-smart-v-<id>` (Sonnet, medium effort, bypass permissions). The old per-card assistant/manager pairs (`Layers.js:637,648`) and `Global.js` master-assistant (`:155`) are wired at `Servex.js:324-325` but hardly run (2 and 1 spawns in 14 days). An always-on `Assistant` is started at boot (`Servex.js:222-229`) unless `SERVEX_NO_ASSISTANT`; I did not check what it does with no sessions open.
- **"Voice mastermind" is a mastermind, not an assistant.** `RemoteMCP.js:274` makes `ask_mastermind` spawn a normal `mastermind` named `voice-<short>`, loaded with the voice-mastermind skill. A VS Code tab acting as the voice (`register_session`) is a registered row, not a role. Neither should be folded; they do repo work the smart voice agent should not.

### What folding the voice roles into ONE smart agent would cost

1. **It does not remove the re-read cost by itself.** `roles-proposal.md` §12 hypothesizes that `voice-assistant`'s $1,500 a month (about $60 a session) comes from re-reading history on every wake. One Sonnet agent woken per sentence would re-read more, at a higher price. The saving only exists if the one agent is woken **less often**: per pause, per N sentences, or per Prompt close. This is the owner's "batch it" note in item 10.
2. **Placing changes owner.** The fast seat's `{place}` lines are what V1 renders (`improve`/`clean`/`nothing`; 821 of 1654 lines in `v-sq8y7db` were "nothing", half the wakes did no work). If the smart agent places per batch, V1 will show raw sentences a few seconds longer. V2/V3 already show raw gray then solid, so they tolerate it. So: change the view first (§1), then the agent.
3. **A cheap fallback exists:** `ext/Refine/Placement.js` is a rules placer with `use_model` off. A rules placer plus the smart agent refining on a pause could remove the fast model entirely. Untested; that is a prototype, not a plan.
4. **Fallback paths to keep:** the OpenRouter-to-Claude fallback in the seat spawn (`Sessions.js` ~1284-1310) must follow the surviving seat.
5. **Migration risk is low:** the registry shows the smart seat is already woken at every Prompt, so merging adds one behaviour (place), not a new agent.

## 4. Checking the proposal docs against the findings

| Doc | Holds | Breaks |
|---|---|---|
| `design-decisions-2026-10-27.md` (Option B, chat is the spine) | Matches what V2/V3 already do: both read one list. One writer (Servex) makes the spine plausible. | It adds a stored chat list while V1, V2 and V3 still read three shapes; the cost is a fourth shape unless the views merge first. |
| `chat-architectures.md` (recommends A, pause the fast seat) | The fast seat is half no-ops (821 of 1654), so "pause it" is supported. | Superseded by B. Its `session-assistant.txt` and `Sessions.refine` pointers are still right. |
| `roles-proposal.md` | Verdict table matches usage: checker/voter/log-assistant/echo have zero recent spawns. | §12 says `helper` spawned 0; the registry says 141. `session-fast` is called retired but was spawned 25 times in 14 days. |
| `system-map.md` §3g (14-row census) | Rows 1, 2, 6, 7, 13 verified against code or files. Two systems earn their keep: confirmed. | Row 5 ("Placement, retire") undervalues it as a way to drop the fast model. |
| Owner direction: "ONE smart agent, rest legacy" | Usage supports it for voice (one fast + one smart per session). | Only if wakes are batched, see §3. The voice mastermind and VS Code tab are not "the others". |

## 5. requirements.md essence (e00f55c9; nothing moved)

139 `requirements*.md` files are in `ai/sessions/2026/10/20/session-e00f55c9/` (largest ~19 KB). I read the first lines of 14 of them and judged from the titles and openings; I did not read them whole. The ones that read as design knowledge, not task instructions: see the table in [shape.md](shape.md) §4. Most start with a budget line and the owner's words, which belong in the prompt log; the part worth lifting is the "shape the owner asked for" and "rule to build" sections (for example `session-is-a-task` items 1-n and `session-record`'s spawn-line rule). Before lifting, check each against the current code, since several describe work that has since landed (Session now extends Task).

## 6. Order of moves (later, scripted)

1. Write the one chat view on the stored list; keep V1 as default until it matches.
2. Make the smart agent batch and place; stop spawning `voice-assistant`/`session-fast` (flip `session-assistant.txt`).
3. Give `helper` a role row or point its callers at `minion`.
4. Mark V1/V2/V3, `ChatPanel`, `Drill`, `Layers`, `ai2/chat.js`, and rows 4-6, 9-11, 13-14 of the refinement census legacy with a scripted index; move the §5 files' essence into module docs.

## Open uncertainties

- What the always-on `Assistant` at boot does with no sessions.
- Whether `LiveRefine` still emits anything (the map says no fresh output; unverified).
- Quality of the `{place}` output: counts only, not judged.
