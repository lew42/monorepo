# Page.class.js split, steps 5-6: columns and links

**Plan:** [core/Page/doc/split-plan.md](/framework/core/Page/doc/split-plan.md) steps 5 and 6. Steps 1-4 landed tonight ([page-split-1](../../session-75fc1375/page-split-1/STATE.md): 2,270 to 1,314 lines, nothing broke). Step 7 (jsonl) stays for a later task: it is the core path of every page.

## Do, one commit per step
5. **Columns** to its own class file (`Page.Columns` or the name the plan settles), `columns()`, `column()`, `column_host` stay as facades on Page with the same signatures.
6. **Links** (`open_link`, `swap_link` and their helpers) to their own class file, facades kept.

## Done when
- [ ] Each step: `check_page` on 20 pages including `/imagine/paging/`, the Finder/columns demos (`core/Page/overview/columns`), a markdown page, `/framework/ai/` and a session page, at 400/1200/1920/3440: no new errors, columns and click routing (including reload on a deep link and back button) behave as before. Smoke clean. Commit.
- [ ] `split-measure.mjs` before/after in `STATE.md`; ticked in split-plan.md.
- [ ] Merge to michael/dev with live reloads held during the batch.

Sonnet 5.5, high. Worktree. Stop only for a real failure you cannot fix, written in `STATE.md`. Land with `finish-task`.
