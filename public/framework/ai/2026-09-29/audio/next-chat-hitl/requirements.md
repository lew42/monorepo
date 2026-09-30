# Next task: the chat widget, human in the loop (select, rename, drill in)

The owner's words, verbatim: [`owner-words.md`](owner-words.md) (19:35). They are the acceptance test. Written by task-mastermind-audio as the next brief: the audio task is over budget (about $75 against $15) and lands first, so this is its own task.

## What already exists (from the audio task, merged with it)

- [`ext/Chat/ChatPanel.js`](/framework/ext/Chat/): one component (log + composer + mic) used by the desktop drawer's AI tab and the mobile ✦ sheet ([`ext/drawer/rail.js`](/framework/ext/drawer/)); starts small, grows to a cap, then scrolls. Reads the universal chat line `{chat:{at, session, path, from, via, text, re?, level?, place?, fix?}}` ([`voice-sessions/design.md`](/framework/ai/2026-09-29/voice-sessions/design.md)); a line with `re` + `level` is a revision drawn under its raw line; `place: {module, id}` draws a content card in the flow; a later line with the same `at` and `fix: true` wins.
- [`ux/Dictate/variants/`](/framework/ux/Dictate/): the real sheet embedded live (last round of the audio task).
- The `naming` skill: cheap parallel brainstorm, then a pick.

## Asks, in the owner's order: build 2 first, the smallest working version

1. **One widget, everywhere:** the SAME ChatPanel in the drawer, the sheet, and live on the Dictate page; it adapts (compact on mobile, fills any space on desktop). No one-offs. The sheet may stay in ext/drawer for now.
2. **Select, then rename:** tap a card (a sentence or a title) to SELECT it; say or type "rename this"; the widget shows about 5 alternative names as a DROPDOWN on that title (a cheap model brainstorms, per the naming skill); choosing one appends a line (latest wins). Keep it basic.
3. **Drill in:** tapping a card with contents expands it; the sheet can go FULL SCREEN as its own small shell with paging inside it (routed), and back out.

Keep v1 reachable. Pool worktree, smoke test, merge.mjs, one fresh reviewer, screenshots at 1920 and 400.

## Half-built work to start from

Branch `audio/chat-revision-pairs-wip` (one commit on top of worktree/qf-6): the audio task's last round, stopped half done when this task was split off. It draws a revision (a chat line with `re` + `level`) under its raw line inside ChatPanel, and starts a `watch` option for [`ext/Session`](/framework/ext/Session/) lines. Untested. Still missing from point 1: the real mobile ✦ sheet embedded live as a Dictate variant (linked to ext/drawer/rail.js), and a "used by" line under each Dictate variant.

## Open notes from the audio task's review (fix where they touch your work)

- One id matches a revision to its raw line everywhere (today: Dictate's chunk `at`, ChatPanel's text match).
- `Servex/agents/tidy.js` says "Clean this chunk:" at every level; `edit`/`summary` get no `before` context; run `summary` once on the whole dictation.
- `/api/tidy` accepts any `system` prompt and `model` from the LAN (via `/servex`): accept named levels only, or `system` from loopback only.
- `ux/Revise` copies the three prompts from tidy.js by hand: serve them once (e.g. `GET /api/tidy/levels`).
- The rolling-window Whisper reaches only the Dictate/Parts variant; switching the default is the owner's call after trying it.
- MicPicker, LevelMeter and PushToTalk still lack the icon/row/panel view.
- `ext/Chat/panel/page.js` shows literal `**Variable height, no JS measuring:**`: `p()` doesn't read `**`; use `md()`.
- The old V1 sheet (`DrawerRailSheetV1`) makes two cards per sentence with `revise: "edit"`; the pairs replace that.
