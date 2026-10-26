# Chat: handoff from mastermind-dictation-2

The owner's rule (2026-10-25): no more work under revived old agents. mastermind-dictation-2 stops here; a fresh child of voice session v-sq8y7db continues from this file. Card: [chat-show-when-your-words-reach-the-assi](/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/). The full plan of record is [proposal.md](proposal.md).

## The mode the owner set

- **Do not break anything (the owner, 2026-10-26, firm, for everyone).** V1 chat and its `{chat}`/`{place}`/`{summary}`/`{refined}` lines keep working exactly as today. New work targets V3 only. Any change to shared data (`session.jsonl`) must leave V1 reading it unchanged. Plan first; nothing is built or landed until the owner approves the plan. This overrides the queue below: rounds 2+ and the session switcher are plans for V3 until approved.

- **Safe fixes land without asking:** review (`Server/review.mjs`), answer findings, merge (`Server/merge.mjs`), tell the voice session when each lands.
- **Shape changes get a plan shown to the owner first:** one reader for V1 and V2, a server Session object, any Servex restart.
- **Priority:** the prompt pipeline (raw text live, the refined prompt looks right, three clear states). The Tasks tab is on hold.
- Servex restarts only through `node Servex/sustain.mjs --restart`, never while agents work or during a voice call.

## Landed today (on michael/dev)

- ✅ **Completed tasks show checked in Chat v2** ([fix-v2-checkbox](fix-v2-checkbox/)).
- ✅ **Drawer split:** back on the AI tab the chat takes full height; Chat v2 prompts are cards with room below ([drawer-split](drawer-split/), merge of `worktree/qf-3`).
- ✅ **Pipeline doc:** [ux/Dictate/doc/pipeline.md](/framework/ux/Dictate/doc/pipeline.md), first in the Docs tab ([pipeline-doc](pipeline-doc/), merge of `worktree/qf-5`). It found `core/Session/Session.js` already extends Task, so proposal.md's ⬜ on Session is wrong (fix it there).

- ✅ **Round 1, [chat-sent](chat-sent/):** sent marks ("fast ✓ 0.4 s · smart ✓ 3.1 s") in both views, the jump button bottom-right in both, V1 Questions under their Prompt, the light mic (merge 812751847). ⚠ The server half, `mark_sent` in `Servex/agents/Sessions.js`, shows only after a Servex restart, at a time the owner picks. Review notes 6–10 (the test's hard-coded path, mic colour tokens, "fast …" left for a line sent straight to smart, a Question that can't be completed from chat) go to round 2.

## In flight

- Nothing. Round 1's process, [chat-see-your-words-live-and-know-when-t](chat-see-your-words-live-and-know-when-t/), still waits at its build step: complete it, then its review and land steps (the work is merged).

## Queued, in order

1. **Round 2, [chat-live](chat-live/requirements.md)** ($5, Sonnet): raw text live in Chat v2, no flash on send, three states with separate cues that never revert (the black → gray → black flicker), periods, one steady send cue, the long pause that did not send, refresh loss, two verdicts on feeding fast. Start after round 1 merges; minion-chat-sent may continue it if its context is small, else a fresh minion.
2. **[v2-speed](v2-speed/requirements.md)** (polish; process [chat-polish](chat-polish/) waits at its okay step). Item 7 (spacing) is done by drawer-split; one leftover: "show raw" still has a little more space above than below.
3. **[one-chat-view](one-chat-view/requirements.md)**: plan first, shown to the owner (process [chat-one-session-one-view](chat-one-session-one-view/) waits at okay). The pipeline doc has landed, so its okay can be completed now; the plan step then runs and stops at the plan.

## Done

4. ✅ **Session switcher in the dictate widget** (asked 2026-10-25 in voice session v-9dvbbrn, relayed by session-smart-v-9dvbbrn). The "New session" button in the dictate widget and the mobile sheet left no way back to the old session. Replaced with one control: `chat.session_switcher()` (`ux/Dictate/chat.js`) — a "Switch session ▾" dropdown beside a bare "+", one row per recent session, labelled by title (falling back to "Session <id>") with the time ago, shared by the desktop drawer's AI tab and the phone sheet's head. Task: [mastermind-session-switcher](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/). Round 1 merged `df173833f` + `56738425b` via `28c6d4a4b`; round 2 (2026-10-25, live testing: the first version's in-flow list reflowed the whole header when opened) rebuilt the dropdown on `ux/Popover`'s `menu()` — a top-layer popover with its own height cap and scroll, so it floats over the header instead of pushing it — merged `ab44c412c` + `727f0e475` via `aaa4ecf85`.

## Open questions to answer

- **Routing (the owner, relayed by session-smart, not yet investigated):**
  1. Is the chat on a session's own page (`/framework/ai/sessions/...`) the same component as the drawer's chat? It should be one component in both.
  2. Cards (prompts, tasks, questions) are previews; a click shows the full detail in place of the chat, with a way back. On a session's page that is a normal subpath through the existing router.
  3. The global voice sheet must not take the URL. Options: (a) UI-only state, (b) a query-string variable that also keeps the sheet open on reload and can carry an item path, (c) other. No new routing system; reload must not lose the spot.
  Report which option reuses what exists and the cost of each, short, with a recommendation. Check first whether the sheet already persists its open state (`ext/drawer/Sheet.js`, `ext/drawer/readme.md`).
- **From mastermind-tasks-completion** (its [Prompt record proposal](/framework/core/Task/doc/prompt-record.md), branch `worktree/prompt-record`): link it from one-chat-view's brief and from pipeline.md once merged. Its asks on our files, for round 2 or the one-view build:
  - `ext/Chat/v2/ChatV2Model.js:87` `sentences()` should import `core/Task/sentences.js` (its own regex splits "session.json").
  - `edit()` should handle `paragraphs.replace` ({id, text}), string or array `raw` pushes, and dedupe `paragraphs.add` by id (V2 shows two where core keeps one).
  - Facts for pipeline.md: smart's {title, text} refine the Prompt and the cleaned paragraphs stay; core `Prompt.text` returns the refined text, else the cleaned.
  - The fast seat's `{place}` never becomes a Prompt paragraph (0 of 56 prompts in v-sq8y7db have a second one); the Servex writer fix is theirs, proposed to mastermind-ai.

## The owner's new asks (2026-10-25, relayed by session-smart)

Answered: [wake-policy.md, "Next: the smart seat tails its own session log"](/framework/ux/Dictate/doc/wake-policy.md) (how the smart seat is woken today, what tailing its log would take, the send-after-pause timeout).

1. **The smart seat should tail its own `session.jsonl`** through the existing follow tool, with a gather window that can be set, and a wake for every placed sentence (the owner accepts the token cost). The WakePolicy batching (12 s quiet, a question, its name, 6 sentences) and `feed_smart` go. What it takes is in that doc: a line filter so its own replies and raw pushes do not wake it, a subscription made when the session starts, a Servex restart. This is a shape change, so the plan is shown to the owner first.
2. **What each seat does.** The fast seat places each sentence (a new Prompt, or add to the last one) and makes a Question item for a question, nothing more. The smart seat writes titles, restructures and states outcomes. Roles are in `Servex/agents/roles.js` (`voice-assistant`) and its role text.
3. **V2 shows the live raw whisper text**, as V1 does: the owner needs it to know they were heard. This is already round 2's first item ([chat-live](chat-live/requirements.md)).
4. **Refined cards converge.** They show ranked, conclusive outcomes and open decisions, and merge or shrink rather than grow; the raw sentences tuck inside the card. Mostly the smart seat's role text, plus the card layout in `ext/Chat/v2/`.
5. **V2 renders markdown:** numbered items are drawn as plain text today; draw real lists. Small; fits round 2.
6. **One data source:** both views read the same Prompt data (V1 compact, V2 rich is fine). This is the [one-chat-view](one-chat-view/requirements.md) plan.
7. **A "working" sign from the smart seat.** When the smart seat has seen a question or card and is writing its answer, that card shows a small brain icon with animated dots under it (seen, working). The smart seat sets a flag on the item with the item tool and clears it when it writes the answer onto the Question. The delta key (for example `working: {by, at}`, cleared with `working: null`) is defined once in the Prompt and Question classes (`core/Task/`), so the shared reader handles it and Chat V1 and V2 both draw it. It belongs with item 6 (one reader), plus one line in the smart seat's role text.

## Known defects

- **Merge gate tests against the live site:** MergeTests runs the branch's new tests against the main site, which still serves old code, so a new test fails before the merge. Prove it on the worktree url, then `--skip-tests`. Worth filing as an improvement on the merge tooling.
- **merge.mjs refuses adjacent-line conflicts** even when both sides are compatible; when the worktree is dirty with `files.jsonl` churn, `git merge michael/dev` in it aborts. What worked: make the worktree's file match dev, merge, re-apply the small change on dev.
- **Git-ignored shots:** `public/framework/ai/**/*.png` is ignored; `git add -f` each shot a review must see.

## Agents

- minion-chat-sent: round 1 merged; it is a revived old agent, so by the owner's rule round 2 goes to a fresh minion under the new mastermind. Stop it.
- minion-drawer-split, minion-pipeline-doc: done; stop them.
- Old worktree `fix-v2-nested-state`: merged, only `files.jsonl` churn; close it with `node Server/worktree-down.mjs`.

Pace at handoff: week about 49% used, 54% gone.
