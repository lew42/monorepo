verdict: fix
1. [fix] Tail mode wakes the smart seat with housekeeping lines: `Follow.without` only drops a top-level `by` or `chat.from.agent`, but `Sessions.write()` writes `sent`, `refined`, `skip`, `para`, `quiet`, `pause`, `select`, `nav`, `backing` and `log` lines with neither. Worst case: `feed_smart()` still calls `mark_sent()` before its early return (Servex/agents/Sessions.js:273-276), and that writes a `{sent}` line (Sessions.js:627), which Follow then delivers 1.5 s later as a paid Opus turn of its own. The filter should list the lines that may wake the seat (owner chat, Question items), the same way `worth_waking` does for `of`, not just skip by author.
2. [fix] The task folder has no `requirements.md`, plan or landing line: it holds only `past-work.md`, `session.jsonl` (an assign line, one probe log and two commit ids) and `review/diff.patch`. A fresh agent cannot tell from this folder what was asked or what is left. The ask and the leftovers are written only in public/framework/ux/Dictate/doc/wake-policy.md ("Next" section). Write the brief, with a link to the owner's words in v-sq8y7db, and a landing line.
3. [fix] The work sits unmerged on `worktree/qf-8` (commits ff09334c7, 4a9e959b8), and nothing in the task folder says that or says who merges it. wake-policy.md:35 says "Built", but michael/dev doesn't have it yet.
4. [note] What was built is a smaller version of the ask. The owner asked for one mechanism in place of the policy, with no separate message path (wake-policy.md "Next"). This adds an opt-in next to `WakePolicy`, and it is off by default. Of the four removal steps in that doc, only step 1 is done, and only partly: the seat is not subscribed when its session starts, Question items aren't written, and `waker`/`feed_smart` remain. The doc says so honestly under "Still to do". The doc itself also said "the plan is shown before it is built", and no plan.md was written.
5. [note] `skip_by` drops the fast seat's own lines (`s.fast`, `"fast"`; Sessions.js:290). But step 1 of the removal plan says `{place}` lines should reach the smart seat. Pick one and write the reason in wake-policy.md.
6. [note] Stale comment: `settings()`'s doc comment (Sessions.js:278) still lists only `{session, gap_ms?, every?}`, not `tail`. The "Set them" paragraph in wake-policy.md doesn't mention `tail` either. `tail_ms` can be read but cannot be set: `settings()` has no route for it.
7. [note] The dictation widget's settings panel has no switch for `tail`, so for now the only way to turn it on is a hand-made POST.
8. [note] Both tests pass on the worktree's own tree: `node Servex/Follow-skip.test.mjs` printed "ok Follow.skip_by", and `node Servex/agents/WakePolicy.test.mjs` printed "17 checks passed". The new WakePolicy check uses a fake `follow`, so the real file-to-message path (and finding 1) is not tested.

## Requirements
- "the smart assistant follows its own session.jsonl with the existing follow tool" — partly — opt-in `tail_log()` uses Servex/Follow.js; off by default
- "with a gather window that can be set" — partly — `gather_ms` comes from `s.tail_ms`, which no route sets
- "no separate message path" — no — `feed_smart` and `WakePolicy` stay; the first batch of a sleeping seat is still sent as a message
- New class: none; `Follow` got one static method, so the live-instances check does not apply
## Words
- follow.md's new section — yes — plain, says what `skip_by` does, links the test and wake-policy.md
- wake-policy.md "Next" section — yes — says what is built and what is not ("opt-in built, policy not yet replaced")
- wake-policy.md "Caveats" paragraph — no — one dense run of clauses separated by semicolons; would read better as a short list
