# 🧭 Feedback council brief: Markdown Explorer, Command Characters and Class Card Views

## 🗳️ Council inputs
- The five checkers each get this brief, in `sessions/2026/10/06/feedback-council/requirements.md`. [S1, S2]
- The owner's brief is recorded verbatim from the 2026-10-06 dictation, covering the three features below. [S24, S25]
- Read the raw words in the card dir `public/framework/ai/council/` and in `words.jsonl` in the active run directory. [S3, S4]
- Asks to check: new asks from `words.jsonl`, plus every open ask in `council/asks.jsonl` whose latest verdict is not `done`. [S5]

---

## 🔍 Council checking
- Give every ask one verdict after looking at the real result: `done`, `partly`, `not done` or `done-but-wrong`. [S6, S7]
  - Each verdict gets one line of evidence (URL, screenshot path, file:line). Anything not done gets the smallest fix. [S7]
  - Prove before calling something missing. A false `not done` is the common failure, so search first: `git log`, grep, `.claude/skills/`, CLAUDE.md. [S8, S9]
- Check the live site at http://monorepo.localhost, never http://localhost/. [S10]
- Visual asks: headless Playwright at 1920 and 3440, never on the owner's tabs (no `mcp__site__eval` on tabs they have open). [S11]
- Measure the Live card load time, and check scroll on the named URLs with real overflow measures. [S12, S13]
- No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`. [S14]
- Edit no repo file. [S15]
- Scratch goes in the scratchpad. Screenshots go to `<run-dir>/shots/`, only as evidence, 12 at most. [S16]
- Scan `words.jsonl` for up to 8 extra asks the current list misses, with the same verdict. [S17]

---

## 📤 Council votes
- Write ONE json file, `<run-dir>/votes/<your-name>.json`. [S19]
  - Shape: `{"name", "votes": {"A1": {"v", "e", "f"}}, "extra": [...]}`. [S19]
- Reply "done" in one line, then return. [S18, S20]
- Never write the owner's name anywhere. [S21]
- Budget about $2 each: be quick, do not over-explore. [S22]
- Load the `minion` skill only if it does not conflict. Edit nothing but your votes file and shots. [S23]

---

## 📖 Markdown Explorer (`md/` path and tab)
- The Markdown Explorer is the dynamic `md/` path and tab. Every page and module already has an `md/` subpath, and it gets upgraded into a full explorer. [S26, S27, S28, S29]
  - Main content pane renders the module's primary `readme.md`. [S30]
  - Sidebar quick-reference lists all sub-markdown files (`doc/*.md`, sibling `.md`) for quick scanning and instant jumping via `swap_link`. [S31]
- An `md` tab on modules that have markdown, so readers and AIs can inspect the docs hub directly. [S32]
- Authoring benefit: AIs writing pure Markdown, with no JavaScript, can make interconnected docs that are served raw and rendered rich. [S33]

---

## ⌨️ Command Characters (`ext/Mention`)
- Three command characters, each for one kind of thing. [S34, S35]
- `/` is file system paths, strictly 1:1 with the real file system (`/framework/core/Page/`). No separate alias: it resolves straight to the disk/URL path. [S36, S37]
- `@` is actors: users and agents (`@owner`, `@mastermind`, `@minion-*`). [S38]
- `#` is classes and concepts (`#Page`, `#Item`, `#List`). [S39]
- Each kind gets a distinct icon and color theme, so the reader learns the type at a glance. [S40, S41]
  - Class mentions get an upgraded framed icon and dark card surface (`.page-surface-dark`), so living classes stand out from plain pages. [S42]

---

## 🧩 Class card (class documentation page)
- Class title card: the class is an icon item card (icon + class name), matching its inline mention and tree navigator row. [S43, S44, S45]
- No cards-within-cards: properties and methods are clean, unboxed icon items, with no nested boxes or borders. [S46, S47]
- Inheritance hierarchy: the class's own methods come first, then inherited base-class methods below (`Page` first, then inherited `Item`). [S48, S49, S50]
- Core API at the top: the 5–7 most critical methods and properties. [S51, S52]
- Members are ranked by importance and usage weight, with manual ranking in docs/metadata first. [S53]
