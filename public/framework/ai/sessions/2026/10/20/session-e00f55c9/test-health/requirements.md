# Are the tests real, and do they run? (you are a mastermind, on Sonnet)

**The owner (2026-11-01, about 21:45, [../night-2026-11-01/requirements.md](../night-2026-11-01/requirements.md), point 9):** "We need to make sure our tests have been implemented properly and are being run properly."

**Known so far:**
- `ux/Dictate/test/chat-sent.mjs` and `earlier.mjs` were already failing before 3b1fae8d3 (filed in `ux/Dictate/improvements.jsonl`).
- `merge.mjs` runs tests as a gate (it caught `core/Task/Task.steps.test.mjs` tonight).
- `TestRunner.mjs` resolves `SITE_URL` per checkout.

## Do
1. **Inventory every test** with a node script (`*.test.mjs`, `test/*.mjs`, `core/Test`):
   - its path and module;
   - whether `merge.mjs`/`smoke.mjs`/`TestRunner` ever runs it, and how it's selected;
   - whether it needs a browser or a live server.
2. **Run them all** against the main site (`SITE_URL` per checkout; never the owner's open tabs; headless only). Record pass, fail, skip and time.
3. **For each failure, find the cause.**
   - A stale expectation, fixture or path gets fixed in a worktree (one merge for all small fixes; `node Server/review.mjs`, then `node Server/merge.mjs`).
   - A real bug is filed in that module's `improvements.jsonl`, with the failing output.
4. **Tests that never run are a finding.** Propose how they get run (a list in `merge.mjs`, or a `npm test` style entry) and wire it if it's small and safe.
5. **Write the result** at `public/framework/core/Test/doc/health.md`: a table of each test and its state, the command to run everything, and what the gate runs. Link it from `core/Test/readme.md`.

**Fences:**
- don't touch `ext/Chat/v3`, `ux/Dictate`, `audio/Recite` or `core/Item`/`core/List`/`core/Session` code while dictation-v3's and chat-model's agents hold them; file the findings to those agents instead (`send_to_agent mastermind-dictation-v3` / `mastermind-chat-model`);
- commit by path; no `python -`.

**Budget:** about $12. Report to vscode-mastermind in 4 lines.
