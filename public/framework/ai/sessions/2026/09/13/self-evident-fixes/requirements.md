# self-evident-fixes — the critic's ten defects, fixed

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Two fixers, one per realm, same brief, different fences. Group: `ux`.

## The three laws, and your length budget

1. **Less is more.** Fix the cause once. If two defects share a cause (the same drawer, the same chip class), one change fixes both — say so in the log.
2. **Clear beats brief.** The critic's test is the owner's: a newcomer must be able to say what every control does and see what it did within one frame. After each fix, re-run the critic's exact gesture and shoot it.
3. **Prioritize.** The critic's rank order. Ship 1–5 before 6–10.

Budget: no new prose on either screen unless a sentence is the fix the critic asked for. A landing report of one screen: each defect number → fixed / how / after-png, or left with a reason a reader accepts.

## The spec is the critic's log

`public/framework/ai/2026-09-13/self-evident-critique/task.jsonl` — the lines beginning `DEFECT 1.` … `DEFECT 10.` are the spec, each with a png beside it in that dir (`01-…png` … `08-…png`). Read all ten before touching anything. The critic's landing `outcome` (last `assign` line) has the top five in one screen. The owner's rule, verbatim, is at the top of `self-evident-critique/requirements.md`.

## Split

**Fixer A — Make** (defects 1, 2, 3, 5, 7, 8, plus one the critic found in cleanup):
- 1 `Code` and `More` open the same drawer, and its first line says the page has no address while the url is live in the middle pane. The drawer's first line becomes the picked page's real url when it has one; `Code` opens the same drawer scrolled to the code section, or the two buttons become one — say which and why.
- 2 A brand-new page shows 300 words of Northwind sample under the newcomer's own title. The "this is the sample the content word draws" line moves ABOVE the sample as an eyebrow on it (the shape already used when blocks are present), visible at a 900px-tall window.
- 3 The delete question ellipsises the page name to one letter at 1280. It wraps to two lines inside the row; the name and the count under it are always readable.
- 5 The star cannot be un-pressed and says nothing in words. A second press clears it; the starred row says "opens first". **And** a star press must write only the files whose content actually changes — the critic measured it rewriting every top-level sibling's `page.json` (`made/archive` dirtied); never add `default: false` to a sibling that had no flag.
- 7 The most destructive control (forget every demo on the site) needs one press while the tree delete needs two. Same shape for every destroyer: a second press that names what goes.
- 8 One orange chip means three things on one screen. Pick one meaning per look: a chip that acts, a chip that is a state, a chip that is a link do not share a class.
- Fence A: `public/imagine/paging/make/**`, `public/imagine/paging/stage.js`, `public/imagine/paging/toolbar.js`, `public/imagine/paging/baseline.js`, `public/imagine/paging/paging.css`, `public/imagine/paging/readme.md`, `public/imagine/paging/doc/**`. ⚠ The owner's made pages under `public/imagine/paging/made/` are data: press things on your own `probe-*` pages, delete them before landing, `git status public/imagine/paging/made/` unchanged before/after (restore a dirtied file with `git show HEAD:<path> > <path>`, never `checkout --`).

**Fixer B — Importance** (defects 4, 6, 9, 10):
- 4 Nothing says a judge card is clickable, and the key caps go dead once the name field has focus. One line above the pair — "click the one that matters more, or press its key" — the cards look pressable (a button, or a button's affordances), and Enter blurs the name field.
- 6 A caveat page has no way back up; the item's name is the only navigation and where it leads is not said. A trail up-link exists on every node page; a name that navigates says so.
- 9 The context view explains in three sentences what the picture should show. Cut the paragraph to the one sentence the bars cannot say, or to nothing, and let the rank / bar / "N% of M" carry it.
- 10 The judge screen prints both scores before you pick, which biases the pick. Hide the scores until after the pick (show them as the result), or say why they must stay.
- Fence B: `public/imagine/importance/**`. ⚠ The data files are the owner's example: every judgment / node / edge you write for a test is removed by id before landing; the dir is untracked so `git diff` is vacuous — hash the three files before and after (`md5sum`) and log both hashes.

## Rules every brief carries

- Open your task with `new-task`: Fixer A at `ai/2026-09-13/self-evident-fixes/make/task.jsonl` (its own `requirements.md` is this file, linked), Fixer B at `ai/2026-09-13/self-evident-fixes/importance/task.jsonl`; own `session_id`, group `ux`, the defect numbers as `steps`. The day dir and `day.jsonl` exist — append one line. Land with `finish-task`; run `documentation` first if a readme's Watch out changes.
- Skills: `code` first; `ui-test` before any headless run; `css` / `new-css-class` for any style or class; `skill-improvement` for anything that misled you.
- **Never kill or restart the dev server on port 80. Never drive the owner's tabs. Never `git stash`. Never commit.**
- Headless on a PRIVATE server, killed by pid at landing: Fixer A `PORT=8093`, Fixer B `PORT=8097` (pick another 809x if netstat shows it taken). Plans and pngs in the session scratchpad under `fixes-make-*` / `fixes-imp-*`; after-pngs copied into your task dir as `NN-after-<width>.png`.
- Resolve, don't park: "left" needs a reason a reader accepts. Findings as `log` lines, never a findings.md.

## Landing report (to the mastermind)

One screen: a line per defect number — fixed (how, in one sentence, after-png path) or left (why) — then the cleanup check line, then the realm's control count that now carries a label and a visible consequence, as two numbers that must agree with the critic's count.
