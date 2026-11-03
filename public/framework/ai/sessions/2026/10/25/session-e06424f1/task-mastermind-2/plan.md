# Plan: chat/dictation round 2+ (task-mastermind-2)

Continues [dictation-debug/handoff.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/handoff.md). Owner asks are numbered as in the spawn prompt.

| # | Step | Status |
|---|---|---|
| A | [reader/](reader/requirements.md): V2 drops its splitter; ONE reader. Step 1 landed in the worktree; step 2 stopped at the size rule, design in [reader/design.md](reader/design.md): the Prompt tree is already shared through `ChatV2Model`; V1's bubble log reads another line shape. Decision: keep V1 compact on its own shape, share the Prompt tree, take the session-detail check (design item 1) inside step E. | step 1 (ChatV2Model fixes, tests, docs) reviewed and merging; the shared V1/V2/session reader is NOT built, deferred to step E and the dictation-debug proposal |
| B | [roles/](roles/requirements.md): fast seat places + makes Questions; smart seat titles, ranked outcomes, `working:{by,at}` | built in worktree/chat-roles, in review |
| C | [routing/report.md](routing/report.md): item detail = `?item=<id>` in sheet and session page | done |
| D | [chat-live](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-live/requirements.md) (ask 2) | **in progress, worktree/chat-live, 4 rounds landed** (`chat-live/result.md`): hallucination drop, the sent/working marks (two moving cursors in V2, a clearing tick in V1), the paragraph-gap renderer bug fixed, settings checkboxes. Still open within ask 2: the raw live draft is not drawn in Chat v2 at all (no code path exists) — that is ask 2's own "3-state cue" and "no flash on send", so ask 2 is NOT done. |
| E | cards converge, `?item=` detail, working dots, offscreen cue, windowed list (asks 3, 5, 6, 8) | ask 6 (working dots) done in `worktree/chat-live` ahead of schedule; **asks 3, 5, 8 still open, not started** |

## Next step for a fresh agent (2026-10-25, round 4)

1. **Ask 2's live draft** (the real gap left in `chat-live`): draw the mic's raw interim text in Chat v2 — today `ChatV2.js` only ever reads `session.jsonl` lines already written, so there is no live, unsent text on screen at all yet. This blocks ask 2's "3-state cue", "no flash on send" and "one steady send cue" sub-items.
2. **Ask 1** (one shared reader for V1/V2/session detail): design is in `reader/design.md`; step 1 (ChatV2Model) is reviewed and merging, step 2 (actually sharing it with V1 and the session-detail page) was deferred here and is still not built.
3. **Ask 3** (cards converge: one title + one cleaned paragraph per prompt, ranked outcomes, a detail view): not started.
4. **Ask 5** (offscreen-completion cue on the newest button): not started; not the same bug as the newest-button scroll bug the quick fixer already landed (191409455) — that one needs a re-check before this ask starts, not instead of it.
5. **Ask 8** (windowed chat list): design sketch above ("Added asks") is unbuilt.

## Added asks (2026-10-25)

- **8, windowed list (in E):** the model holds every item; the DOM holds the last ~20. A sentinel at the top, watched by an IntersectionObserver, prepends 20 more and adds the height gained to `scrollTop`, so the view does not jump. Scroll lock and the newest button read the model's last item, not the DOM.
- **9 and links, landed:** `@agent-id`, or an agent id alone in backticks, links to `/framework/ai/sessions/<id>/`; an inline code span holding only a site path links too (`ext/Mention`). Write site paths (`/framework/...`) and agent ids plainly. Repo paths without a site page cannot link.
- **10, close-out of the predecessor's records:** done, completion 0.83; `chat-one-session-one-view` closes when A merges.

Not mine: wake-by-tailing (a sibling task-mastermind); the newest-button/scroll bug (the quick fixer, landed in 191409455; re-check before E). Servex-side changes (`mark_sent`, role texts) need a restart the owner picks.
Wake-policy.md:37 (ux/Dictate/doc) still says the fast seat writes only {place}; the sibling owning it should update it to say the fast seat also files Question items.
