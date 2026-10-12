# Night audit: do tonight's "done" claims hold?

**Short answer: yes. Almost every claim held; the misses are four dead links and one stale line number, not missing work.**

---

### 📋 What was checked `claims.json`, `refs-missing.json`, `load.json`
- 35 task folders under `ai/2026-10-12/`; 33 landed (`feedback-council`, `openrouter-gap` never wrote a landing). Script: `claims.mjs`.
- 128 landing points: 107 ticked, 21 honestly left open. Open ones carry a reason; none claimed as done.
- 20 of 20 cited commits are on `michael/dev` (`git merge-base --is-ancestor`).
- Every path or URL a landing names was looked up (`refs.mjs`), then 38 cited pages were loaded headless at 1200 and 400 (`load.mjs`): 0 page errors, 0 horizontal overflow.
- Spot checks of "does it do what was asked": owner_note, Inbox chips (3 render), "N open tasks on this page", `Subpages.js`, `PageWeight`, `relay-bypass`, role skill rows, `RefineStyle.js`, `branch-prune.mjs` (89 salvage tags), `ext/System`, sessions resume tags (203), Page.class.js 2270 to 1089 lines. All true. Judgement done by me, since the files were already in context; no extra agents.

---

### ⚠️ What did not hold
- **Dead link** `/framework/ext/Refine/stages/` (Refine readme, and the "Things you mentioned" link in refine-asks): the folder has no `page.js`. **Fixed**: readme now links `stages/readme.md`.
- **Dead link** `/framework/ai/doc/` (named in the CLAUDE.md consolidation landing): docs-only folder, its page is `doc/readme.md`. The ai readme already links it correctly. Left as is.
- **Dead link** `page-context-asks/proof/`: a folder of screenshots, no page. Left; open `weight/` instead.
- **Wrong link** in the CLAUDE.md consolidation landing: `.../review/md/report/` should be `.../review/report.md`. Landing text only.
- **Stale proof**: the page-columns landing cites `Page.class.js:1551,1736`. The page-split tasks moved that code, so it is now `core/Page/Columns.js:107` and `Page.class.js:997`. The behaviour is true; file:line cites go stale after any split, so prefer a name over a line number.
- **Nothing proven for**: a real phone mic (needs https) and a two-tab replay for page parts; both were stated as not run.

---

### 📈 "Already built" accuracy
- Tasks that said "already built": `page-columns-asks` and the roles rows in `servex-health`. **2 of 2 held**: `fit: "round"`, the `fill` word, `column_even` and the 64em mobile-tabs rule all exist. A sample of two is too small to call the audits accurate in general.

---

### 💸 Cost finding
- `feedback-council` logged 18 passes, each finding the same JFK test quote in `words.jsonl` and doing nothing. A stalled loop on empty input; it should stop after the second identical pass. Recorded in the Servex asks, not fixed here.

---

### ✅ Done
- Fixed the Refine readme link (committed). Script and proof files are in this folder.
