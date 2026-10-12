# Page doc audit recommendations

## loading.md: condense

- why: All seven line-number references to `Page.class.js` are stale (e.g., "line 203" for `child()` is actually line 832); hardcoded line numbers become unmaintainable as files grow. The seven-step process is current and useful, but link to `/framework/core/Page/doc/method/` pages instead of line numbers.
- into: Update links in place. Remove all `Page.class.js:NNN` citations and replace with links to the actual method pages. For `Router.js:79-88`, that line range no longer points to `load_segments()`; use a method link instead.
- linked from: readme.md line 66; streaming.md line 44
- stale: `Page.class.js:203` (child() is at 832), `:208-211`, `:215`, `:220`, `:222-223`, `:225-226`, `:228-229`, `:373-388`, `:396-398`; `Router.js:79-88` does not point to `load_segments()` (it's at line 100+)

## words.md: keep

- why: Current, clear, well-structured table of six page words with examples and links. Every reference checks out.
- linked from: readme.md line 121; watch-out.md line 5
- stale: none found

## findings.md: archive

- why: A research summary from column-page labs (dated 2026-08-29/30). The findings are already documented in deeper detail in columns.md, decisions.md, and the lab pages themselves (`/layouts/labs/`, `/imagine/`). This file duplicates without adding new information a reader can't find elsewhere.
- replaced by: findings live in columns.md (the mechanism), decisions.md (the verdict section, lines ~307), and the lab pages themselves. Link those instead.
- linked from: readme.md line 121 only
- stale: none found; facts are current

## panels.md: keep

- why: Referenced from three separate docs (decisions.md, roles.md, watch-out.md) as the pattern for splitting height. Current and specific. Not linked from readme, but that is a readme gap, not a file problem.
- linked from: decisions.md line 307; roles.md line 76; watch-out.md line 19 (not in readme)
- stale: none found

## layout.md: move

- why: The file opens with "Open question — not settled guidance" and frames nested vs full as a known, unsolved design problem (owner's words: "We need a strong, simple strategy for robust page layouts and we do not have one yet", 2026-08-17). This is a decision/proposal document, not a reference guide. It lives better in the ai/ task log for 2026-08-17 or 2026-10-09, beside the columns and layout research.
- folder: `public/framework/ai/sessions/2026/10/09/session-060cdfff/page-mastermind/doc/` (or the task folder where the owner's brief lives); update links in columns.md and layout-overview.md to point there.
- linked from: columns.md line 660; layout-overview.md line 10
- stale: none found; the open issue is still open
