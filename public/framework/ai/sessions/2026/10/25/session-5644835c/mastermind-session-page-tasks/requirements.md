# Session page: fix what you found reviewing v-9dvbbrn

Source: [your review of v-9dvbbrn](/framework/ai/sessions/2026/10/25/v-9dvbbrn/session.jsonl), relayed by `session-smart-v-9dvbbrn`. Code: `public/framework/ai/AISession/` (`AISessionDetail.js`, `SessionOutline.js`, `SessionOutlineView.js`, `SessionOverview.css`, `SessionTimeline.js`, `SessionTimelineRows.js`).

## Landed

- [x] **Sort button.** It flipped its own label on click. Now a two-option control, **Cost / Newest**, the active one highlighted.
- [x] **Child list heading.** "201 tasks drawn" counted chat records. Now **"Child sessions (N)"**; the real count already shows under "This session's own work".
- [x] **Empty white strip under the title.** The stats bar was `hidden` but its `display: flex` rule beat the browser's hidden rule. One CSS rule fixes it.
- [x] **Console 400 on `/ai-logs/v-9dvbbrn/session`.** That route needs a Claude Code transcript; a voice session has none. The fetch is now guarded like the transcript load above it.
- [x] **Timeline "1817 of 1818 events" and "other lines: 1691".**
  - The one hidden line is a stray `ResizeObserver` warning; the count now says "X hidden by Filters ▾".
  - Voice plumbing (`chat`, `place`, `sent`, `quiet`, word-by-word `raw`/`paragraphs`) is now named: `chat` and a new `plumbing` kind, both in Filters ▾.
- [x] **Prompt/Question rows in "Other work".** They showed raw `p-<ms>`/`q-<ms>` ids and could not open. Now they show their own words, linked to the Timeline row.

## On hold (you said: "STILL ON HOLD, structural")

- [ ] **Chat tab as first tab.** Chat v2 (`ext/Chat/v2`) already draws a session's Prompts; it is the 3rd tab and defaults to v1. Open: does talking to an old session wake its smart seat?
- [ ] **Regroup "Other work" by Prompt.** Stop counting Prompt/Question records as tasks. Held because it changes what the task counts mean, so you sign off first.
- [ ] **Tasks-view redesign.** Group by state, a "Waiting on you" row of open Questions, nested subtasks, click-through to a Prompt/Question page (none exists). First check `SessionTasksGrid.js`: it reads task folders, so it may go blank when tasks live only in `session.jsonl` (see `mastermind-ai-system-architect`).

Plan sent to `session-smart-v-9dvbbrn` before building; this file is the same plan.

## Review

`node Server/review.mjs` verdict `fix` (5 findings, 3 notes), all addressed: this file, a note in `AISession/readme.md`, trimmed comments, a reworded voice-session message, a test for the Prompt/Question title rule. The "chat records still drawn as tasks" finding read an older log line; the held list above is current.
