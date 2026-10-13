# Docs check: a fresh Sonnet read only the readme chain and `doc/refine-queue.md`

Reviewer: `reviewer-refine-docs-check` (session a9977aef, $0.42). It could not write this file itself (permission), so its findings were relayed and are recorded here, each with what was done.

**Verdict:** it could run the queue and find a card from the docs alone; it could only half-explain the Coverage score.

1. Root and framework readmes don't mention Refine. ✅ root `readme.md` Systems list now has a Refine line.
2. The Refine readme opens on the demo; the queue is 50 lines down. ✅ one line under the heading.
3. "Run it" gives no working folder or prerequisites. ✅ "Run from the repo root (main tree)…".
4. Where a card lives is vague (uuid vs folder). ✅ the dated folder and the page url are named.
5. The Coverage score is circular, and "coverage" means two things. ✅ "Two scores are called coverage" paragraph; 0% means unreviewed.
6. Which `asks-outcomes` fields are read. ✅ listed.
7. The cost section has no scale. ✅ ~540 prompts a week; a few dollars instead of ~$90.
8. Where the `<line>` comes from. ✅ the card's `/ai-logs/<id>#<line>` link.
9. The Refine readme's older "Architectural Recommendations" and CSS-prefix notes are stale. ⬜ not this task's text; left for the next Refine readme pass (the module's own keeper).
10. `--repeats` has no destination. ✅ "it only prints; whoever runs it writes the directive and commits".
11. Links don't say which session. ✅ `session-730e8a7b` in the link text.
