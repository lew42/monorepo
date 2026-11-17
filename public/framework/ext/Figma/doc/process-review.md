# Process review: why the Figma agents produced slop (2026-11-16, read-only)

## Conclusion

The agents did not fail for lack of effort or rules. They failed because **too many of them edited one file at once, each judged its own work, and none had a measurable "done"**. The rules were also too many and too scattered to follow, and some contradict each other. Where we had one editor, a small bounded job and a script check (lint, a swap count), the work was fine. The fix is fewer rules, one editor at a time, and a gate that is code, not opinion.

Evidence read: the task logs of about 33 agents under [sessions/2026/11/16/](/framework/ai/sessions/2026/11/16/), [owner-words-2026-11-16.md](/framework/ext/Figma/doc/owner-words-2026-11-16.md), [essence.md](/framework/ext/Figma/doc/essence.md), [build-checklist.md](/framework/ext/Figma/doc/build-checklist.md), [lint.md](/framework/ext/Figma/doc/lint.md), [approval-strategy.md](/framework/ext/Figma/doc/approval-strategy.md), and the AI page in Figma (node 60:360). Nothing in Figma was edited.

## 1. Five root causes

1. **Too many parallel editors, no page owner.** At 17:28 to 17:39 six agents (size-2600, size-1600-1000, size-small, text, res-cards, surface) were spawned into the same file at once; four more (tour, masters, bench, lint) followed by 18:38. Their briefs say "several agents work in this file at once: re-read a node's state before editing", which hands the collision problem to each agent. The owner stopped everything at 18:55. After that, `roots` ran as the only editor and the work got clean. The bench agent was stopped mid-rollout after it touched the owner's hand-made 1920 nodes.
2. **"Done" was self-graded, and the evidence was too zoomed out.** Agents reported done, then lint found 215 errors on its first run, 132 on the 2600 XL page and 48 on 1920 Desktop. The review that passed bad pages "only looked at one section" ([essence.md](/framework/ext/Figma/doc/essence.md), section 4). The AI page itself says "Screenshot the whole thing and judge the contrast yourself": a whole-page screenshot shrunk to fit hides padding, same-on-same fills and unstyled text.
3. **Too many rules, in too many places.** The AI page holds 214 text nodes (about 17,000 characters, 8 frames), the repo has about 58 Figma docs, and [build-checklist.md](/framework/ext/Figma/doc/build-checklist.md) itself admits "briefs didn't carry rules". A builder cannot hold all of it. In practice the briefs pasted long rule blocks and the agent skimmed them. The owner keeps repeating the same complaints (same-on-same, unstyled text, Inter, text wider than 720, fixed heights, new masters): the rules existed and were not followed.
4. **The rules contradict each other, and the owner's own open questions stayed open.** On the AI page: "Cards stay on Auto" next to "Every frame that sets a width also sets the Scale mode"; "Decide, don't wait" next to "A new master needs the owner's OK" and "Don't edit a page the owner is working on"; the sidebar rule appears twice; squeeze is both "OPEN, not decided" and "Decided and applied"; the swap-menu slash question is twice "option, no verdict". The big structural questions (one page per size, preview vs duplicate, mode on region vs card) were left open, so each agent picked its own answer. The contradiction table in [essence.md](/framework/ext/Figma/doc/essence.md) lists seven more.
5. **Vague, unbounded prompts with no numeric done criteria.** "Explore", "tour", "study" and "build the 2600 page" briefs named a topic, not a node set, a count to hit or a check to pass. Scope was a page, not node ids, so agents reached into pages the owner edits by hand. And each complaint was answered by adding another rule instead of removing a cause: the file grew rules, not results.

## 2. What actually worked

- **Lint as a hard gate** ([lint.md](/framework/ext/Figma/doc/lint.md), 11 rules): the preview builder landed with 0 errors. It is the only check that disagreed with the agents' own "done".
- **One editor, read-only helpers.** After 19:05 `roots` was the only editor. About twelve read-only study agents each wrote a useful doc in about 3 minutes (essence, master-homes, drop-test, mode-split and the rest).
- **Small bounded jobs with a number to check.** Card dedupe (137 instances swapped, 0 errors), res-cards, the master pass with before/after counts.
- **1:1 or cropped screenshots** instead of whole-page shrinks.
- **The parent-down rule** ("the parent sets width, the child fills"): one clear sentence, hardly broken again once stated.
- **Reuse through the Index** and **Review/Draft tags**: they stop duplicates and make "approved" visible.
- **A separate reviewer** against a rubric (the [approval-strategy.md](/framework/ext/Figma/doc/approval-strategy.md) plan) is right, but it was only written down at 19:xx; it has not run yet.

## 3. Builder prompt template (15 lines)

```
You are the ONLY editor of <page> (<node ids>) in Lew42 v2 (ADpu9u2V0BlEZfR3rrMfER). Read-only everywhere else.
TASK: <one outcome, e.g. "build the Card row 360..3440 from the Card master">. Budget: $N.
SCOPE: touch only these nodes: <ids>. Never touch Index, Icons, 1920 Desktop, variables, styles or modes.
FIRST READ: the Index page (reuse), then the 7 rules on the AI page. Nothing else.
REUSE: use existing masters. No new master or component set without the owner's OK.
DONE MEANS ALL OF:
 - lint.js: 0 errors on <ids> (paste the output)
 - every text has a text style; no Inter; text no wider than 720
 - no same-on-same fill; nesting at most 4 levels; no fixed heights
CHECKS: re-read the node before each edit. After each change take a 1:1 screenshot of the changed section (not the whole page).
Test: one title wrapped to 3 lines; one instance at 400 wide.
REPORT (5 lines): node ids changed; the 1:1 screenshot paths; lint output; anything still off; what you did not touch.
If blocked or unsure of structure: stop, log it, and report. Do not decide structure.
A separate reviewer signs off against the rubric. You never mark your own work approved.
```

## 4. The cut-down AI page (7 rules, one line each)

1. **One editor per page, and one editor at a time on the file;** everyone else is read-only.
2. **Reuse before you build:** look in Index first; a new master needs the owner's OK.
3. **Scale goes on the region that sets the width, never on a card;** the parent sets width, the child fills.
4. **Tokens only:** pad-x and pad-y for padding, gap between blocks, text-gap only inside text, text max measure 720; no raw hex or pixels.
5. **Every text uses a text style;** never a raw font, never Inter.
6. **Done = lint 0 errors plus a 1:1 screenshot of each section, and a separate reviewer approves;** no self-approval.
7. **Never edit the owner's hand-made pages (Index, Icons, 1920 Desktop) or change structure;** propose it instead. Reversible local fixes: just do them and log them.

Everything else on the AI page (sizing tables, swap and slot notes, token lists, open questions) moves behind these seven as reference. It is not part of what a builder must read first.

## 5. Next steps (cheap, no structure changes)

- Replace the Index and Rules frames on the AI page with the seven rules above; keep the rest below as reference. Resolve the five contradictions listed in cause 4 in the same pass.
- Put the 15-line template in every Figma brief; stop pasting rule blocks.
- Run `roots`-style single-editor mode until the Approve page passes the [approval-strategy.md](/framework/ext/Figma/doc/approval-strategy.md) rubric; only then reopen parallel work, one page per agent, node ids named.
- Make lint a precondition that code checks (a script the mastermind runs on the reported node ids), not a line in a report.
