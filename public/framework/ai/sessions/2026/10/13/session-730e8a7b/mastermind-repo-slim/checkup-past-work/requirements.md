# Checkup: past-work discovery, the old prompts, readme indexing, salvage branches, the Whisper log

Budget: $14. Sonnet; Haiku for any scan. Read `../checkup-common.md` first: it is the job description for every checkup; this file holds only what is specific. `V` and `VO` are the paths named there.

## The owner's second dictation (`../requirements-15.md`, asks 1 to 3) is yours too

The owner's themes:

- Work already done but lost should be findable.
- The old prompts hold "a million things I've asked for that haven't been done".
- "We don't want to be building new things if it might already exist", checked at the mastermind level before any build.
- Readme indexing is the main way to discover things. A folder of 50 to 100 things with a paragraph each is too much context, so a throwaway Haiku minion under 100k tokens loads the readme chain and does the search.
- How indexing works should be documented somewhere.

Your jobs:

- [ ] In checkup.md, say in plain sentences what exists today for each, and the ONE next step for each, started:
  - the `past-work` skill (`.claude/skills/past-work/SKILL.md`) and its script
  - `ai/doc/asks-by-module.md` and `ext/Refine/doc/asks.md`
  - the session digests and tags
  - `core/Page/doc/query.md`'s keep/scrap list
  - `ai/doc/owner-2026-10-16-indexing.md`
  - the readme rules in CLAUDE.md ("Readmes are the cheap index", "The iceberg readme")
- [ ] Record the essence of asks 1 to 3 in `public/framework/ai/doc/owner-2026-10-17-finding-past-work.md`, linked from `ai/readme.md`.
- [ ] Add to the `past-work` skill, as a should, the Haiku-searcher pattern (spawn a Haiku minion with the readme chain and the question; it answers "exists at X / partly / new"), unless it is already there.

## The tasks

1. **`V/past-work/`** (+ `pilot/`, `pilot2/`, `transcripts/`, `round3.md`, `round4.md`, `round4-result.md`): summaries and tags for 588 sessions (bd39fad93, dd56406da), `Server/Transcripts.mjs` + `Server/doc/transcripts.md`, `ai/audits/index.jsonl`. Verify: is the digest reachable from the Sessions page (a tag filter, a search)? If a reader cannot find past work from the site, that is the next step (a small Sonnet minion).
2. **`VO/past-work-audit/`** and **`past-work-audits/`** (`findings.md` each, landed): fold any still-open finding into the next step above or into `ai/todo.md` with a link; close.
3. **`V/salvage/`** (`audit.md`: 108 real unmerged branches, top 5 listed; the owner is waiting on nothing but a decision). Decide per top-5 branch: a reviewed merge now (`Server/review.mjs` then `merge.mjs`), or set aside with a one-line reason; the other 103 get the rule (a dated `salvage/` note, never deleted). Do the merges you decide on, one at a time, smoke-tested.
4. **`V/whisper-log/`**: landed 3cecf3724, page `/framework/audio/Whisper/log/`; "waiting on a live dictation with the log open". Open the page headless; if it renders with the existing log, close the task with the truth; if not, say what is missing in one line.
5. **`V/subpages/`** (landed: subpages are `page.jsonl` lines, never `page.js` edits): verify on dev and that `core/Page`'s readme says so; close.

Fence: `.claude/skills/past-work/`, `Server/Transcripts.mjs`, `ai/sessions` views only where a finder is added (`ai/sessions/**` page code, not its data), `ai/doc/`, `ai/readme.md` (one line), `ai/todo.md`, the branches you merge (each its own commit), the records named, this task dir. Not `core/Task`, not `ext/Refine`.
