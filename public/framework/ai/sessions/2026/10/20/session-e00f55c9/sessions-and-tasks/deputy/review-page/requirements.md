# The owner's review page: one page per day, approve in chunks, every dollar accounted for

**Scope changed (the owner, prompts.jsonl 2026-10-24T00:20:16Z):** no new review page, and nothing on the AI dashboard. The review page IS the sessions list, `/framework/ai/sessions/`, and the first slice is a variant of it, `/framework/ai/sessions/v/review/`, shown for the owner's look before anything more is built. Read the numbered asks below for that variant: per day (1), Approve (2), leaks in red (3), the time filter pill (5), plain titles with their context (6). Ready to merge (4) folds in later. The session page's filter (5, inside a session) comes after the look is approved.

Budget: $25. Model: Opus, high effort, one builder that designs AND builds the whole slice (this run is the model experiment below). Parent: `mastermind-deputy`, who reviews and merges your branch and restarts Servex. You don't merge or restart anything yourself.

## The owner's words

Read the owner's prompt first: `../../../prompts.jsonl`, line index 307 (the `"stage":"raw"` line at 2026-10-23T23:51:53Z), from "hopefully there's one page that you can link me to" to "approve the entire session all at once". The owner has asked for this "forever". In short:

- "a single page ... per day": the AI sessions page gets a **per-day view** that indexes every session created that day. A multi-day session lives on the day it was created.
- **Inside a session, a time filter:** "having the word today appear in a little drop-down ... then the drop down could also say week, and then month ... and maybe even year" (Year means all, for now). Use the existing dropdown widget, and build it as a **reusable filter-pill system**.
- "I don't think sessions should really be complete until I ... check it off." But "I don't want 1,000 irrelevant sessions showing up in my inbox". **Approve in chunks:** approving a session approves everything in it; one working demo can validate a whole session.
- "every single dollar spent, every session, every prompt ... should be accounted for." Work and spend that never gets approved is a **leak**, and is flagged red.
- The owner doesn't know branch or session slugs ("mobile picks, task chase ... I'm not familiar with them"). Rows show **plain titles**, not folder names.

## Build: one page, no second version (CLAUDE.md law 6)

There are already three day views. Pick ONE home and make the others link to it. **The deputy's pick: the AI dashboard, `/framework/ai/?day=YYYY-MM-DD`** ([AIDashboard/readme.md](/framework/ai/AIDashboard/readme.md)), because it is already one day of sessions, nested by parent, with cost rolled up. The others are `AIDay` (`/framework/ai/<date>/`, a check-mark list of the day's tasks) and `sessions/v/mobile/` (the phone pages). If you find a strong reason to pick another, say why in the readme, and still end with one page.

1. **Per day:** every session created that day, nested under its parent, each row a plain title, its cost (rolled up from its children), and its state. The day's header shows three totals: **approved $**, **waiting $**, and **leaking $**.
2. **Approve:** each session row has an Approve button. Pressing it writes one `{"approve":{"at":"NOW","by":"owner"}}` line to that session's own record (`session.jsonl`; the verb is already in `.claude/hooks/jsonl-schema.mjs`). Approving a parent approves its children and tasks (computed when read, not written per child). "Approve all" on the day approves every finished session in one press. Writes go through the existing writer the session page already uses (`FsFile.append`, as in `core/Session/SessionTasks.js`), never a new one.
3. **Leaks in red:** a session that is finished (no activity for an hour), cost more than $0.50, and is not approved (itself or through a parent) is a leak once it is older than a day. Name the rule and its numbers in the readme so they can be tuned.
4. **Ready to merge** folds into this page: the rows of `/framework/ai/merge/` (class `ReadyToMerge` in `public/framework/ai/merge/ReadyToMerge.js`, data from Servex's `/api/ready-to-merge`) appear as a band at the top of the day, reusing that class. `/framework/ai/merge/` stays as a plain link to it.
5. **The time filter pill, inside a session** (`/framework/ai/sessions/<id>/`, `AISessionDetail`): a pill reading **Today ▾** whose menu offers Today, Week, Month and Year; it filters that session's prompts, tasks and child sessions by time. Build it as a reusable class (look at `ux/Filter/` and `ext/Dropdown/` first; extend one, don't write a third), so a page adds a filter pill in one line. The choice lives in the url.
6. **Plain titles:** wherever a row would show a slug, show the record's title (line 1's `title`, `card`, or the session summary), and the slug only as a small secondary label.

Phone first: it must read well at 400 px, then 1200 and 1920. The approved mobile picks are in [sessions/doc/mobile-cards.md](/framework/ai/sessions/doc/mobile-cards.md) (wrapper card, flat rows with one indent, green / amber / red / grey status).

## How

- Read `past-work.md` beside this file first, then the AIDashboard, AIDay, `core/Session`, and `ai/merge` readmes. Load the `code`, `layout` and `ui` skills before writing code.
- Work in your own worktree (`take_worktree`, or `node Server/worktree-up.mjs review-page --task <this dir>`). Commit each working step.
- **Test it for real:** shoot the page headless at 400, 1200 and 1920 with real data (`mcp__site__shot` or `node Server/layout-check.mjs`), press Approve in a headless page (the `ui-test` skill) and show the line it wrote. Never write into a real session's record while testing: use a scratch copy.
- When it works, run `node Server/review.mjs <this dir> <your worktree>` and answer every finding with `append.mjs`.
- **Document what you built** in the AIDashboard readme (and the readme of any module you extend): what it is, the files, which writer writes the approve line, which class reads it. No dated log in the readme.
- Log progress to `session.jsonl` here at least every 10 minutes. End with one line `{"log":{"at":"NOW","msg":"ready: <branch> <sha> — <one line of what it does>"}}`; that is what puts it on the Merge list.

## The model experiment (record it, it decides how we staff the next builds)

You are one Opus builder that plans, designs and builds. You may spawn **one** Sonnet minion, only to debug or test (never to design). At the end, log one line: `{"experiment":{"try":"one Opus high builder designs and builds the review page","measure":"cost $, hours, review findings, does it work at 400/1200/1920","result":"…"}}`.
