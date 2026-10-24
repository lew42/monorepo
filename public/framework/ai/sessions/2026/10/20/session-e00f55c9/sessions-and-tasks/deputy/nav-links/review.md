verdict: pass
1. [note] Server/merge.mjs:~572 reuses `wtBase`, which is null unless `pageUrlFor` returned a url for an added file. A branch that adds only a page the screenshot step skips, with no worktree server, prints "click test skipped" and merges. The gate fails open there. Say so in nav-check.md, or call `worktreeBase(dir)` directly in the nav block.
2. [note] The diff has no link on the sessions page for `/framework/ai/sessions/v/review/`, and none for `/framework/ai/asks/undone/`. `/framework/ai/sessions/v/`, `/framework/ai/asks/` and `/framework/ai/readmes/` do get a pill. The census list is in session.jsonl, not the diff, so I could not check whether those two are reached from `v/` and `asks/`. The deputy should check that list.
3. [note] The Live pill row links `/live/` from `/live/` itself (public/live/Live.js NAV, first entry). It is harmless, but it is a self-link.
4. [note] NavCheck skips every `tasks/` folder, so a new task-module page that nothing links to passes. This is documented and a reasonable call.
5. [note] The owner asked for a Merge link on `AISessionDetail.js`, which is added with a plain `a`. The count pill is only on the dashboard and the sessions page. That matches "if cheap".

## Requirements
- 1 Merge first-class link, with count, on /framework/ai/ — yes — AIDashboard.NAV puts `PageNav.merge_link()` first as a primary pill with the waiting count. I did not see a 400 or 1920 shot in the diff; the show: line should carry them.
- 1b Merge link from the session page — yes — AISessionDetail.js adds "Ready to merge →".
- 2 Census and linking of unreachable pages — partly — the dashboard now links Now, Tasks, Asks, Review, Readmes, Usage, Quick fix and Processes, and the sessions page links v/, v/mobile/ and doc/variants/. The 7-day census output is not in the diff (see note 2). All nine linked ai/ targets exist on disk.
- 3 NavCheck.mjs, merge.mjs call, `--no-nav`, test, and the index step's `do:` text — yes — the test shows a refusal and a pass, and BuildProcess and DesignProcess both name the check.
- Fences — yes — nothing in the diff touches `ai/merge/*`, `core/Page`, `core/Router` or `SessionWork`. No column layouts were added.
- Show-the-class (new class, live instances page) — n/a — PageNav is a stateless View with no state worth watching.
## Words
- Pill labels and titles are plain and short — yes — PageNav.js, AIDashboard.js NAV.
- The refusal text says what to do — yes — NavCheck.refusal names the parent and `--no-nav "why"`.
