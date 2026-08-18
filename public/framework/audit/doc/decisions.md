# framework/audit — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## What it is

On 2026-08-15 every module under `public/framework/` was read end to end by a
dedicated agent, following the new [`documentation`](/framework/ext/Doc/) skill —
which was itself being tested by the exercise. Each agent rewrote its module's
docs and filed a report. This directory is those reports plus the synthesis.

It is a **snapshot, not a standing page.** It answers "what state were the docs in
on 2026-08-15, and what did we decide to do." When the recommendations here are
either done or rejected, this directory should be deleted, not maintained — a
stale audit is worse than no audit, because it still reads as current.

## The shape

The reports are `doc/<slug>.md`, one per module, served as the **Docs** tab's left
rail by `notes:`. Nothing new was built to render them: an audit report is prose
that earned a url, which is exactly what a `Doc` note is.

The Overview carries the synthesis — the cross-module priorities and the
organization argument — because that is the part someone reads once rather than
consults.

## What the audit was asked

Every agent answered the same eight questions (the brief is at
`framework/ai/2026-08-15/doc-system/brief.md`, kept because the audit's inputs
should be as browsable as its outputs):

1. What is this module for, and does it earn its place?
2. Does the `readme.md` open with a real conceptual overview?
3. Does `page.js` **show** rather than tell, and are its variants browsable?
4. Is there a `.md` for every file, every method, every property?
5. Who actually uses it? (A module with no callers is itself the finding.)
6. What should change in the code — ranked simple + important first?
7. Which other module does a similar job, and could they be one thing?
8. What is wrong with the `documentation` skill?

Question 7 is the one the owner cared most about: `ext/editor`, `ext/Panel`,
`ext/layout`, `dev/DevBar` and `ext/demo` are five names for what may be one idea,
and the audit was the first time anyone read all five in the same week.

## The fences

An agent could write only `readme.md`, `doc/**/*.md` and `page.js` inside its own
directory, plus its one report here. **No `.js` that is not a `page.js`, no `.css`,
nothing outside its directory.** So every code change in this audit is a
*recommendation*, written down and ranked, never applied by the agent that found
it. Twenty-eight agents editing shared seams in parallel is a merge, not a
refactor.
