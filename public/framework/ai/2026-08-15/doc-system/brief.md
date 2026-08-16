# The shared brief handed to every audit agent

Each agent got this text with `<DIR>` and `<SLUG>` substituted. Recorded so the
audit's inputs are as browsable as its outputs.

---

You are auditing and documenting ONE module of the lew42 framework:
**`public/framework/<DIR>/`**. Work autonomously and finish the whole thing.

## Step 0 — load the skill, then the house rules

1. `Skill(skill: "documentation")` — **this is the thing being tested.** Follow it
   literally. Note every place it is unclear, wrong, missing, or made you guess.
2. Read `CLAUDE.md` at the repo root. It outranks everything else, including the
   skill.
3. Read `public/framework/ext/doc/readme.md` and `public/framework/ext/doc/page.js`
   — the `Doc` system you will be using. It replaced `ext/classdoc` today; if you
   find any reference to `classdoc` anywhere in your directory, that is a bug to fix.

## Step 1 — read everything

Read **every file** in your directory, including subdirectories, including files you
do not expect to matter. Then form a view on: purpose, current state, simplicity,
complexity, and future. Do not skim — the audit's value is that someone actually read it.

## Step 2 — the framework-wide usage search

Grep all of `public/` for importers and callers of this module. For each, note what
they use it for and their page url. **A module with no callers is itself a finding.**
Record this as a section in the readme.

## Step 3 — write the docs

Per the skill's six artifacts. Specifically:

- **`readme.md`** — conceptual overview first, then a short section per important
  aspect. Any section over two paragraphs breaks out to `doc/<name>.md`, is
  summarized in one paragraph, is linked, and is added to `notes:`.
- **`doc/file/<path>.md` — one for EVERY file in the module** (never for `doc/` or
  `ai/`). Structure: conceptual overview → a short section per important thing →
  **a ranked list of improvements last** (simple + important first).
- **`doc/method/*.md`, `doc/property/*.md`, `doc/<note>.md`** — for everything named
  in the page's lists.
- **`page.js` — rewrite it as `new Doc({ … })`.** Even with no class: `subject` is
  optional, and the Files tab alone earns it. Top tabs are sections, the inner left
  rail is sub sections.
- **Label code blocks with their filename** where one is meaningful —
  `code.js(src, "/app.js")` in a page, or the fence info string in markdown.
- **Demos must be browsable** — the `overview:` rail, not a wall. Show a variant's
  effect side by side, not its name in a heading.

## Step 4 — verify

- Every name in every list of `page.js` has its `.md` on disk. `ls` and compare.
- `files:` matches the directory (minus `doc/`, `ai/`).
- `node --check` any JS you wrote: `cp page.js /tmp/x.mjs && node --check /tmp/x.mjs`.
- `curl -s -o /dev/null -w "%{http_code}" http://localhost/framework/<DIR>/page.js`
  returns 200. **Do not launch a browser** — the orchestrator does one sweep at the
  end for all modules at once.

## Step 5 — the audit report

Write `public/framework/audit/modules/<SLUG>.md`. **This file is yours alone.**
Markdown, and it will be rendered as a page, so use headings and tables. Structure:

```md
# <DIR>

One-paragraph verdict: what this module is, whether it earns its place, and the
single most important thing to do to it.

## State

| | |
|---|---|
| files | N |
| lines of JS / CSS | N / N |
| callers | N (list them) |
| docs before | readme? page.js shape? how many doc/*.md? |
| docs after | what you wrote |

## What I changed

## Recommendations

Ranked, simple + important first. Each: **the claim** — one sentence of why, and an
honest cost. Mark each `simple`/`medium`/`large` and `important`/`useful`/`speculative`.
Include at least one genuinely outside-the-box idea, even if you rank it last.

## Where this module overlaps others

Explicit: which other module does a similar job, and could they be one thing?
(Editor, Panel, ext/layout, DevBar and demo are all suspected of being the same
thing wearing five names — say what you see from where you sit.)

## Skill feedback

What in the `documentation` skill was unclear, wrong, missing, or made you guess.
Be specific and quote it. This is a real deliverable, not a courtesy.
```

## Fences — do not cross these

You may write ONLY:

- files inside `public/framework/<DIR>/` that are `readme.md`, `*.md` under `doc/`,
  or a `page.js`
- `public/framework/audit/modules/<SLUG>.md`

You may NOT:

- edit any `.js` that is not a `page.js`
- edit any `.css`
- touch any file outside your directory (except your one audit file)
- touch `app.js`, `CLAUDE.md`, `.claude/**`, `framework/ai/**`, or another module
- start/stop the dev server, install anything, run a browser, or commit

Behaviour changes are **recommendations, written down** — never applied. If you find
a real bug, put it top of your Recommendations with the file and line.

## Report back

Your final message is read by the orchestrator, not a human. **Under 250 words**:
the verdict, your top 3 recommendations, the overlap you saw, and your single
strongest piece of skill feedback. The long version is in your audit file.
