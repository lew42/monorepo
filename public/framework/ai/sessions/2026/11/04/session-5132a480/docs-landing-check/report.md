# Do decisions reach the module readmes?

**Short answer:** yes, in the recent landings decisions reach the module docs.

- **8 of 8** recent merge landings changed module code, and **8 of 8** also changed a module `readme.md` or `doc/*.md`.
- Measured by script over `git diff --name-only` (code = non-test `.js/.mjs`; docs = `readme.md` or `doc/*.md` outside `sessions/`).
- The window is 8, not the 30 asked: older history was rewritten by the git plan (branch rename, main fast-forward), so only 8 merge commits are real task landings.
- Of the other 22 commits, 4 had code and no docs: all infrastructure or PR merges.

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
