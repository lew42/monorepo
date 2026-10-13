# Docs check: repo-size.md and commit-rule.md

(`load_module` failed twice: it rejected the `path` argument as undefined, so the readme chain was not loaded through it. The numbers were checked with one `repo-size.mjs` run.)

1. **Order trap, missing.** The next push still sends ~127 MB of already-committed pictures. Phase 1's untracking leaves history unchanged, so only the smaller phase-3 variant or a full rewrite stops that, and it must happen *before* the push. The doc never says "decide phase 3 before pushing".
2. **Contradiction on `files.jsonl`.** repo-size.md says keep it (the static site reads it). commit-rule.md says "untracking them is a later, scripted step". Pick one sentence and use it in both.
3. **`owner-prompts.jsonl` is not in commit-rule.md.** repo-size.md says it "slipped past the transcript rule", but the rule table never names the rule or the file, so the next agent can't tell what to ignore. Add a row, or say the rule lives elsewhere.
4. **Kept-record lists disagree.** commit-rule.md lists `task`, `page`, `spend`, `log`, `words` and `session`. repo-size.md keeps `day.jsonl` and `board.jsonl` too. Say whether the sweeper commits them.
5. **Unexplained terms for a newcomer:** "Servex", "mastermind", "the E: Passport drive", "`salvage/` branches", "`.worktree-logs/`" (it is in the filter-repo command with no explanation), "worktree indexes", "`merge.mjs` already looks for review shots". Each needs a half-sentence or a link.
6. **"The brief said move nothing"** (Phase 1) refers to a brief the reader can't see. Link it, or say "this task was told not to change tracked files".
7. **Cloudflare naming is muddled.** The headline says "Workers Free", and the archive table says "Pages / Workers static". It says 20,000 files and 25 MiB per file without naming which product the limits belong to. Name the product once.
8. **Numbers drift.** I re-ran the script and got `.git` 753.6 MB (the doc says 762), and 1,704 commits for the next push (the doc says 1,699). The rest matched: 474.3 MB packed, 396.5 MB screenshots, 305.3 MB on GitHub, ~160 MB next push. Add "as of" to each figure, or point to the script as the source.
9. **"~310 MB of the 474 MB" saved in phase 3 is not derived.** Screenshots are 397 MB. The 310 MB figure is the AI-log pictures minus the `doc/` ones, and the doc never says so. Also "the 5-week" projection assumes 350 MB a month, which makes the 1 GB headroom closer to 6-7 weeks.
10. **"You / your call" voice.** It is fine, but Phase 2 recommends R2 and the E: drive with no stated decision owner or next step. Say who acts next (the owner's Cloudflare login).
11. **The rule table's "output, too heavy" row** is ambiguous about `doc/` images. State once that doc-folder images stay tracked. The filter-repo regex and the `.gitignore` agree, but the prose never says so.
12. **commit-rule.md has two topics.** The sweeper rules and "Why agents do not always work in worktrees" share one file under a title about commits. Retitle it, or split the worktree section into its own doc and link it.
13. **Final push command is vague.** `git push --force origin michael/dev main` skips the `alex`, `castin` and `edric` branches the text says must re-clone. Say so, or list them.
