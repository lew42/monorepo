# site-study — eight Haiku scouts read every section of the site and say, per thing: what it is, its parts, its demos and how much they show, the gaps, a twelve-word blurb; then a Sonnet assembles the wall and the demo-stage verdict

**For a scout:** load the `minion` skill first. Read-only over the repo. You write ONE file: `public/framework/ai/2026-09-18/site-study/scouts/<your group>.json`, and nothing else (no task.jsonl of your own — the study is one task; the assembler logs). No server. Never `find /` (rg/Glob scoped to the repo; a pattern starting with `/` returns nothing through this Bash tool — drop the slash), never `git stash`, never touch port 80.

**The owner's words (2026-09-18):** "study each piece: what is this thing? core concepts, core features. Are there demos? Does the demo show 100% of it — a demo coverage concept — to find the gaps in the logical presentation. Sometimes a demo is all you need. First just a short little icon blurb, and if I want to click through, see what it does." And: "a lot of times we go full bleed and on 3440 a thing that should have been maximum 1000 pixels is spread to 3000 and looks funny."

## For each target url in your group

Read its `readme.md` (all of it), its `page.js` (all of it), its `children:` line and the first 20 lines of each child's `page.js`, and its `doc/` file names. Do not read task logs under `framework/ai/`. Then write one row:

```json
{
  "url": "/imagine/team/",
  "name": "Team",
  "what": "one plain sentence a newcomer understands: what this thing IS",
  "parts": ["3 to 6 major components, each two to five words"],
  "features": ["3 to 6 things it can do, each a short verb phrase"],
  "demos": [{"url": "/imagine/team/board/", "shows": "what the demo shows in one line", "covers": 60}],
  "coverage": 60,
  "gaps": ["what a reader cannot see in any demo — one line each; empty if none"],
  "blurb": "at most twelve words, the icon-card line",
  "clarity": 3,
  "stage": {"kind": "full bleed | wide | measure | column | none", "cap": "the widest a demo or stage here can grow, in px or em if the code says, else null", "should_cap": "your one-line view: does anything here spread past ~1000px of content at 3440 and look wrong"},
  "reads": ["files you read"]
}
```

`covers` and `coverage` are your estimate, 0–100, of how much of the thing's features a reader sees by using the demo(s) alone, no prose. `clarity` is 1–5: could a stranger say what this is for in ten seconds from the page's first screen (5) or not at all (1). Say `null` rather than guess when a file does not say. Keep every string plain and short; no markdown inside strings.

The file is a JSON array of rows, one per target, valid JSON (run it through `python -c "import json,sys; json.load(open(sys.argv[1]))" <file>` before you finish). Your final message: the count of rows, the mean `coverage`, and the three lowest-`clarity` urls with their blurbs.

## The groups

1. `imagine-a`: `/imagine/cms/` `/imagine/codrops/` `/imagine/design/` `/imagine/feeds/` `/imagine/gallery/` `/imagine/game/`
2. `imagine-b`: `/imagine/generated/` `/imagine/importance/` `/imagine/paging/` `/imagine/platform/` `/imagine/research/` `/imagine/review/`
3. `imagine-c`: `/imagine/` (the host itself) `/imagine/scenes/` `/imagine/stream/` `/imagine/team/` `/imagine/vary/` `/imagine/youtube/`
4. `layouts`: `/layouts/` and every directory directly under `public/layouts/` that has a `page.js` (list it; the seven labs that moved there today included)
5. `web-notes`: `/web/` `/websites/` `/notes/` `/blog/` (for `/notes/` and `/blog/`, the index page only plus a count of children)
6. `core`: every directory directly under `public/framework/core/` with a `page.js` (list it)
7. `ext-a`: the first half, alphabetically, of the directories directly under `public/framework/ext/` with a `page.js` (list all, take the first half, say where you cut)
8. `ext-b`: the second half of that list, plus `/framework/ui/` `/framework/ux/` `/framework/styles/` (each as one target)

## For the assembler (Sonnet, after the eight files exist)

Open the task (`new-task` in this dir; this file is the brief), read the eight files (count rows = targets), and build `study.md` beside them: one line at the top saying what the table is; a table sorted by `clarity` ascending then `coverage` ascending — url · blurb · clarity · coverage · stage kind · should_cap — then three short lists: the ten least clear things with their gaps; every stage the scouts flagged as spreading at 3440, with the cap the code has; the things with no demo at all. Then measure, headless on your private server (`PORT=8126 node server.js`, background, killed by its real Windows PID): for ten flagged stages, the widest painted content at 3440 in px — and write the demo-stage verdict in five sentences: how many bleed, what cap the code gives them today (read `ext/demo`'s stage css), and a proposed default cap with the one alternative and when it wins (a `decision` line in your log). Finally, the blurbs: a `blurbs.json` (url → blurb) the mastermind can hand to the rail builders. `finish-task`; the landing report is one screen: rows, mean clarity, mean coverage, the ten least clear, the stage verdict, links.
