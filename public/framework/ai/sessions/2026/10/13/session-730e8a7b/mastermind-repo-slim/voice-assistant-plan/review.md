verdict: pass
1. [note] `edit: "move"` is in the contract (SKILL.md:26, voice-assistant.md:341) but `Widget.Thread.place()` (Widget.js diff lines 269-290) ignores it, and `where: "up"` draws the same as `beside` (Widget.css only styles `inside`). Either say in the plan that move/up are the next brief, or drop them from the skill until they do something.
2. [note] The plan says "a node check reads the session file and confirms every owner sentence appears exactly once" (voice-assistant.md:344), but the only coverage check is the browser one in test/in-place.mjs:493. That is fine for this slice; the plan should say so, or the node check should become its own item.
3. [note] fixture/v-fixture.jsonl:5 has a `{place}` line stamped `voice-assistant-test` that in-place.mjs never reads (it keeps only `chat` lines, :426). Either drop the line or have the test apply it, so the fixture shows what it really tests.
4. [note] Setting `MODES.dictate` to `{ bubble: true }` (Widget.js:132) changes every Dictate surface, not just voice. This is in line with ask 2b ("no text-area hop"), but it is the widest change in the diff. The 400 and 1200 proof only covers a bare Widget, not the ✦ sheet or the rail.
5. [note] The new `live()` drops the `sent` parameter. Three callers still pass `sent: true` (ai/cards/card.js:260, ai/rail/rail.js:646, TimelineTalk.js:50). They appear to drive `ext/Chat`'s own `live()` (Chat.js:794), so nothing breaks, but someone should confirm that none of them reaches `Widget.Thread`.
6. [note] SKILL.md:29 lets the assistant skip the write for `same`/`nothing`. That means "no line yet" and "decided same" look identical in the file, so a stalled assistant is invisible. A one-line `same` write is cheap and keeps every sentence accounted for.
7. [note] I can't verify from the diff alone that each slice was its own commit through a worktree and `merge.mjs`, or that the card was updated. The diff arrives as one patch.

## Requirements
- 1 "The plan, first … one screen plus a class architecture" — yes — voice-assistant.md: flow, classes, data, alternatives, slices; linked from readme.md:405.
- 1 "placement: same (default) · paragraph · card (inside/beside/up); nothing · move · improve · both" — yes, in the contract (voice-assistant.md:339-341). Only partly applied: move and up are not wired (finding 1).
- 1 "coverage … a node check, not an opinion" — partly — the check is in the browser test, not in node (finding 2).
- 1 "answer ask 1 with the facts" — yes — voice-assistant.md:366: one file per tab session, `ai/v-<id>.jsonl`, 36 in the repo.
- 1 "say what exists already and is reused" — yes — voice-assistant.md:358: chat.js tail, item tool, split_paragraph, speak merge, Refine Placement.js as the fallback.
- 1 "alternatives you rejected, each in a line" — yes — voice-assistant.md:376-383.
- 2a "role row + skill; fast row retired, not deleted; pair logic points at the one assistant" — yes for the rows (roles.js: `assistant` and `session-fast` keep `retired: "voice-assistant"`, and the new row is added). Pointing Sessions.js at it is deferred to sessions-brief.md, which is honest because it needs a restart and was outside the fence.
- 2b "a sentence arrives in place in the bubble" — yes — Widget.js `live()`/`settle_draft()`; in-place.mjs checks same top, no extra bubble, no faded copy, at 400 and 1200.
- 2c "placement applied as a delta, default same paragraph" — yes — `place()` + chat.js:309 routing; the test covers `same` and `card`.
- 2 "headless proof with the fake mic at 400 and 1200" — yes — in-place.mjs uses jfk.wav and both widths. I did not re-run it.
- 3 "Study the jumpiness … one paragraph … fix if small" — yes — voice-assistant.md:372 names both jumps (the 15-second faded "sent" copy, and the `(new paragraph)` split), and slice b fixes the first.
- 4 "card, landing line, git status clean" — not verifiable from the diff (finding 7).
- Fence — yes — the diff touches only ux/Dictate, roles.js, .claude/skills/voice-assistant, and the task dir. Not audio/Whisper, core/Item or core/Task.

## Words
- content — yes — voice-assistant.md opens with what it is, in plain sentences, and the jump paragraph reads clearly to a newcomer.
- naming — yes — `voice-assistant` is used the same way across the role, skill, doc and CSS (`ux-dictate-placed-*`).
- length — yes — the plan is about one screen per section, and the skill is 29 lines.
