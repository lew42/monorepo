Budget: $8.

# Servex: Known issues: one live list, a "+1" instead of a second report

The owner, 2026-10-02 (relayed by vscode-mastermind, which decided the shape):
1. **A Known issues page:** `/framework/servex/issues/` as a live page (page.jsonl, written with the page tools). Each issue is an item with an id, title, area, impact, status, first seen and reporters.
2. **No duplicate reports:** every mastermind reads the open issues (a computed short list, injected at start like the usage line) before reporting. An existing issue gets a "+1" `set` (reporter, time, one-line evidence), which raises its weight; it doesn't get a second issue.
3. **Your inbox:** other masterminds report to the Servex mastermind through its page inbox, never by long messages. It triages those reports into issues.
4. **Seed it** (the list is `seed.json` beside this file, nine issues: the owner's six, plus three found 2026-10-02; a seed with two reports is seeded as one `report()` followed by a `plus1()`).
5. **The owner sees it:** issues above a weight show as one Inbox card ("Known issues: 3 open, RAM top").
"Don't wait on the owner."

Owner: `mastermind-servex`, which keeps this system running after it lands: it triages the page's inbox on every wake. Card: one card, made by deliverable 5.

## Read first
- The readme chain down to `Servex/` and `public/framework/servex/`.
- `Servex/agents/page_tools.js`: the four page tools. Build on its `write_line` and `replay` (export them); don't write a second page.jsonl reader.
- `Servex/doc/inbox.md`: `drop` / `inbox` / `clear`, and how a note waits in a page's own page.jsonl.
- `core/Page/Log.js`: how a `page.jsonl` page loads, and how a page.js parent lists one (`children: "issues/page.jsonl"`).

## Build (node, law 7)

1. **`Servex/issues/issues.js`, the one place that knows issues**, with a CLI `node Servex/issues/issues.mjs <verb>`, and the same functions as MCP tools:
   - `report({id?, title, area, impact, evidence})`: when `id` names an open issue, it's a +1. Otherwise it adds a new item.
   - `plus1(id, evidence)`: a `page_set` on the item that appends `{by, at, evidence}` to its reports. `by` and `at` are stamped by code. The new list is computed from the replayed state, and Servex is the only writer.
   - `status(id, status, note)`: the status is `open`, `fix-queued`, `fix-pending-restart` or `fixed`.
   - `open_list()`.
   **`weight` is computed, never stored or typed:** the number of reports, plus 2 for `high` impact. `fixed` issues drop off every list but stay on the page, struck through.
2. **The page.** Create `public/framework/servex/issues/` and seed it from `seed.json` through `report()`, so every line has the page tools' shape and stamps. Its line 1 is `{"title":"Known issues","icon":"bug_report","description":"…"}`. Add `issues/page.jsonl` to `public/framework/servex/page.js` `children:`, plus one line on that page linking it. Items draw as cards, heaviest first: title, area, impact, status, weight, reports (folded), and a link to the fix. If the content list can't draw that, register a small `Issue` type rather than adding a page.js.
3. **Injected at start, like the usage line.** Every mastermind and task-mastermind start and wake gets one line, prepended at the same place as token reduction item 2's usage line (build that hook point if it isn't built yet; share it, don't add a second):
   `Known issues (3 open): ram-limit w5 · revive-drops-provider w3 · … Before reporting a problem, read /framework/servex/issues/; +1 an existing one (report with its id) or drop a note there.`
   At most 5 issues, heaviest first. Minions don't get it.
4. **Reports go through the page inbox.** A mastermind reports with `drop("/framework/servex/issues/", "<one line>")`, or with `report()` when the issue clearly exists already. When the Servex mastermind is woken, its line also says how many inbox notes are open there. It triages each one into `report()`, `plus1()` or a decline, then `clear()`s it. No long messages: `send_to_agent` to mastermind-servex for a bug report is the old way, and the skills say so.
5. **One Inbox card for the owner.** When any open issue has weight ≥ 4, the Asks/Cards tick keeps exactly one card, with the fixed id `servex/known-issues`, updated rather than duplicated, and only when the list changes. Its title reads "Servex: Known issues: 3 open, RAM top". Its summary lists the top three with their status, and it links to the page. Category `fyi` (card-pipeline-2's categories); when nothing is over the weight, the card says so and is marked done.
6. **The skills say it in one line each:** `servex-mastermind` (you own the page and triage its inbox on every wake), `mastermind` and `sub-mastermind` (read the injected list; +1 or drop a note, never a second report), and the `Servex/readme.md` "Limits we hit" line links the page.
7. **Tests:** a report on an existing id is a +1 and not a new item; weight is computed; the injected line is at most 5 issues and leaves out fixed ones; the card is one card across several ticks; `drop` on the page lands in its inbox.

## Never backfires
- A failure to read the issues never blocks a start: the injected line is left out and one line goes to the system log.
- Append only: no line in the page is rewritten.

## Rules
Sonnet, high effort. A pool worktree, a commit after each piece. This changes a page, so it gets the screenshot review at the four widths (`Server/doc/review.md`, "Who reviews"). Then `merge.mjs` and a Servex restart. It shares the start-line hook with token reduction item 2: run after token reduction, or build that hook point here and tell its minion. Never wait on the owner.
