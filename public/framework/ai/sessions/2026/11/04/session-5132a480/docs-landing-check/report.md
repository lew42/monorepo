# Do decisions reach the module readmes?

**Short answer:** in the recent landings, yes. Of the last 8 merge landings (`Merge <slug>:` commits on `compliance/dev`), **8 of 8** changed module code and **8 of 8** also changed a readme or `doc/` file in a module. Measured with a script over `git diff --name-only` (code = `.js/.mjs` that is not a test, docs = `readme.md` or `doc/*.md` outside `sessions/`). The window is short because older history was rewritten by the git plan (branch rename, main fast-forward), and only the 8 merge commits there are real task landings. The remaining commits in the window: 4 of 22 had code and no docs, all infrastructure or PR merges (merge.mjs, security-inner-html, paths).

## Sample of the biggest landings

| Landing | Decision | Where it now lives | Reached? |
|---|---|---|---|
| voice-qcards (question cards) | question-card shape | `ux/Dictate/doc/question-cards.md`, `ext/Chat/v3/readme.md` | yes |
| voice-place (placement defaults) | newest thing first | `ux/Dictate/doc/placement-defaults.md` | yes |
| voice-think (thinking cue) | hand-off uses live tool names | `Servex/agents/doc/say-tools.md`, `ux/Dictate/doc/thinking-sound.md` | yes |
| usage-stale | the stale rule | `Server/doc/scripts.md` only, not `Servex/doc/budget.md` | partly |

I read only these four by file list (not the decisions line by line), so "yes" means a module doc changed in the same landing, not that every decision is in it. No clearly buried decision turned up, so nothing was moved into a readme (the brief allowed up to 5).

## The rule and whether anything checks it

- Meant to cause it: CLAUDE.md law 9, the `documentation` skill, `finish-task` step "run `documentation` first", and the reviewer's `DOCS_CHECK` in `Server/review.mjs`.
- All of them **ask**; the only one that runs on each landing is the reviewer prompt, which an agent can skip with `--size none` or `--no-review`. `merge.mjs` checked nothing about docs.

## Fix landed (about 15 lines)

`docsReminder` in `Server/merge.mjs`: prints `!!! Docs: code changed in <module> but no readme.md or doc/ there did` for each module (`public/framework/<tier>/<Name>`, `Servex`, `Server`). A warning, not a refusal, like `shotsReminder`. Documented in `Server/doc/review.md`. Limit: it sees that a doc changed, not that the decision is in it. Next step if the warning proves useful: refuse unless `--no-docs "why"`.
