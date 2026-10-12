# Page.class.js split, steps 1-4 (the low-risk half of the plan)

**Plan:** [core/Page/doc/split-plan.md](/framework/core/Page/doc/split-plan.md), section "Order, lowest risk first". The owner asked why Page is 2,000+ lines and wants comments to be one-line pointers (code skill, "Comments").

## Do, one commit per step, each proven before the next
1. **Comments** per [comment-plan.md](/framework/core/Page/doc/comment-plan.md): history to `doc/decisions.md`, trap stories to `doc/watch-out.md` (one warning line stays), banners to titles, explanations to one line plus a pointer. Moved text keeps its wording; the plan's script proves every moved block landed.
2. **Already-classes out:** `Reader`, `Listing`, `Prefs`, `PageChildren` to their own files, attached as today (`Page.Reader = Reader`), same names.
3. **Related** to its own class file.
4. **Previews/walls** to its own class, `previews()` stays as the facade.
Stop there: columns, links and jsonl (5-7) are a later task.

## Done when
- [ ] Each step: `check_page` on a sample of 20 pages (core, ai, sessions, imagine/paging, a markdown page) shows no new errors; smoke clean; commit.
- [ ] `node public/framework/core/Page/doc/split-measure.mjs` before and after, in `STATE.md` and ticked in split-plan.md.
- [ ] Merge to michael/dev after the last step (hold live reloads during the batch: `node Server/hold.mjs on/off`).

Sonnet 5.5, high. Worktree. Keep going through all four steps; stop early only for a real failure you cannot fix, written in `STATE.md`. Land with `finish-task`.
