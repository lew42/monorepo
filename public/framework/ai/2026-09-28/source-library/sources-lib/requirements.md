# The source library + the web fan-out script + seeding it for real

Load the `minion` skill first. Your parent task (read it, and its links, before touching
anything): `public/framework/ai/2026-09-28/source-library/requirements.md` — pieces 1, 2
and 5 of that brief are yours. Background: `.../agent-work-on-every-page-sanity-checks-c/design.md`
("Added" section, rows "Source" and "Web fan-out") and `owner-words-2.md` (the raw
dictation — search for "collection of references" and "sources").

**Work in the shared worktree, not the main tree:** `C:\Code\lew42\worktrees\source-library`
(branch `worktree/source-library`, dev server at `http://source-library.localhost/` via the
proxy, or the port `worktree-up.mjs` printed). Commit there. A sibling minion owns
`public/framework/ext/Doc/` in the same worktree — don't touch it.

## Your fence

- `public/framework/sources/` — everything under it (new)
- `Server/sources.mjs` — new file
- Nothing else.

## What this is, in one sentence

A place any agent can save a web page as markdown once, and a list of what's already
there so nobody re-fetches it — plus a small tool that does the fetching.

## Deliverable 1 — the library's shape

`public/framework/sources/<topic>/<slug>.md` — one page, converted to markdown, with a
header block. Use YAML frontmatter (a `---` fence top and bottom) so it's both human- and
machine-readable:

```markdown
---
url: https://docs.claude.com/en/api/agent-sdk/overview
title: Claude Agent SDK overview
kind: docs
authority: high
fetched_at: 2026-09-28T14:32:10-05:00
---

<the page, converted to markdown — headings, code blocks, links kept>
```

`kind` is one of `docs` (an official documentation site), `source` (source code — a GitHub
file or repo README), `article` (a blog post, a forum answer, anything else). `authority`
is `high` (the project's own docs or source), `medium` (a well-known third party),
`low` (unverified). Pick these yourself per page — nobody hands them to you.

One `public/framework/sources/<topic>/index.jsonl` per topic, ONE line per source, appended
(never rewritten — two fan-outs racing on the same topic must not clobber each other):

```json
{"slug":"agent-sdk-overview","url":"https://docs.claude.com/en/api/agent-sdk/overview","title":"Claude Agent SDK overview","kind":"docs","authority":"high","fetched_at":"2026-09-28T14:32:10-05:00","path":"claude-agent-sdk/agent-sdk-overview.md"}
```

`cite(topic)`: this is `node Server/sources.mjs --cite <topic>` — reads that topic's
`index.jsonl` and prints title + url + path for each entry, so an agent checks what
exists BEFORE fetching again. No topic given: list the topic directories that exist.

## Deliverable 2 — the fan-out script

`node Server/sources.mjs "<question>" --topic <topic>` (flags: `--n <2|3>` how many
searchers, default 2; `--model <name>` default a cheap one).

What it does: spawns `--n` headless `claude -p` sessions (house style —
`Server/plugins/Ask.js:158-208` is the exact pattern to follow: `spawn(process.env.CLAUDE_BIN
|| "claude", args, { windowsHide: true })`, `--output-format stream-json --verbose`, read
stdout line by line, and there's an existing `--tools` flag — give each searcher
`--tools "WebSearch,WebFetch"` and nothing else so they can't edit files). Each searcher's
prompt: search the question, prefer documentation sites and GitHub source over blog posts,
then run one or two FOLLOW-UP searches from what the first round found, and answer with a
JSON array (ask for `--output-format stream-json` and read the final `result` text as JSON;
tell the searcher in its prompt to answer with ONLY a JSON array, nothing else) of the best
2-4 pages: `[{"url":...,"title":...,"kind":...,"authority":...,"markdown":"..."}]` — the
markdown is the page's content already converted (the search agent has read the page via
WebFetch, which already gives markdown-ish text — clean it up, don't re-fetch a second time
just to convert).

The script then: dedupes by url across all searchers, writes each surviving page as
`sources/<topic>/<slug>.md` (slug = a short kebab-case name from the title — YOU write this
slugify, it's five lines), appends one line per page to that topic's `index.jsonl`, and
prints a summary: total cost (`sum of each searcher's total_cost_usd` from the stream-json
`result` event, same field `Ask.js` already reads), how many pages were found vs. kept
after dedup, and the paths written. Follow `Server/merge.mjs`'s house style for the file
itself (header comment block documenting the CLI usage, manual argv parsing, no new npm
dependency — this repo takes no build step and no new dependency, `npx`/global tools only,
per root `CLAUDE.md` — you don't need any: `spawn` and `fs` are all this needs).

Handle a searcher that fails, times out, or returns unparseable output by skipping it and
saying so in the summary — never let one bad searcher kill the whole run.

## Deliverable 3 — the library's own page

`public/framework/sources/page.js` (+ `readme.md`, `doc/` per the usual module shape —
`code` skill, section "the lifecycle of a task" if you haven't loaded it this session).
Shows the topics that exist (read each `<topic>/index.jsonl` — these are checked-in static
files, safe to fetch at runtime, UNLIKE `directory.json`: read
`public/framework/ext/Doc/doc/files.md` for exactly why `directory.json` is the wrong
answer here, and don't repeat that mistake — this page must list topics from something
that ships with the static site, not a dev-server-only file. A short declared list of topic
names in the page itself, or a top-level `public/framework/sources/index.jsonl` the script
also appends a `{"topic":...}` line to on a topic's first save — your call, pick the
simpler one and say which in your log), then each source under it: title, url, kind,
authority badge, a link to read the converted markdown (`md.file`, same as `ext/Doc` does
it — see `Doc.js`'s `member_page_config`). Show it, don't just describe it — a live list
you can click into a source's markdown, at `/framework/sources/<topic>/`. Route everything:
each topic gets its own url, each source's markdown its own url under that.

## Deliverable 5 — seed it, for real

Run your own script three times (or once per topic — your call), for real, against these
today's-harness topics, and let the real cost land in the library:

- `claude-agent-sdk` — "What is the Claude Agent SDK, how do I use it, what are its core APIs"
- `openrouter` — "OpenRouter API, pricing, and its web search plugin"
- `opencode` — "What is opencode (the coding agent / CLI), how does it work"

This is the actual proof for deliverable 5 AND for "one fan-out's cost and the pages it
saved" — don't fabricate numbers, run it and report what actually came back. If a searcher
comes back empty or the CLI errors, say so plainly rather than padding the library with
junk.

## Proof (paste into your report)

- [ ] `sources.mjs --cite claude-agent-sdk` (etc.) prints real entries with real urls
- [ ] the library page at `/framework/sources/` shows all three topics, live, clickable
- [ ] one converted markdown page opens and reads sensibly (not a fetch error, not raw HTML)
- [ ] the fan-out's total cost for at least one real run, and how many pages it kept
- [ ] zero console errors on `/framework/sources/` and one source's page

## Length budget

Three real pieces (schema+script, page, seeding). If the script balloons past ~200 lines,
that's a sign you're building a research program (ext/Research already exists for that,
unchanged, out of your fence) rather than the cheap default this is meant to be — stop and
ask on the task card (`2026/09/28/agent-work-on-every-page-sanity-checks-c`).

When done, log your decisions (especially the topics-listing call above) and the proof
checklist to `task.jsonl` beside this file, and tell your mastermind
(`task-mastermind-source-library`) rather than merging yourself.
