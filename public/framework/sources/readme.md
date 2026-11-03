# Sources

A place any agent can save a web page as markdown once, and a list of what's already there
so nobody re-fetches it — plus a small tool that does the fetching. Live at
[/framework/sources/](/framework/sources/).

## What

`sources/<topic>/<slug>.md` — one page, converted to markdown, with a YAML frontmatter
header (`url`, `title`, `kind`, `authority`, `fetched_at`). One `sources/<topic>/index.jsonl`
per topic, one line per source, appended only — never rewritten, so two fan-outs racing on
the same topic can't clobber each other. `sources/index.jsonl` at the top, one `{"topic":...}`
line per topic, is how [`page.js`](page.js) finds what topics exist without a hand-typed list
(why: [`doc/decisions.md`](doc/decisions.md)).

## Use

Before fetching anything, check whether it's already here:

```
node Server/sources.mjs --cite <topic>     # what's saved for one topic
node Server/sources.mjs --cite             # every topic that has anything saved
```

To fetch: `node Server/sources.mjs "<question>" --topic <topic>` — spawns 2 (or `--n 3`)
headless `claude -p` searchers, each with only `WebSearch`/`WebFetch`, each running a first
round of search then one or two follow-ups, preferring documentation and GitHub source over
blog posts. Their pages are deduped by url and saved. Prints the total real cost and what got
written; a searcher that fails or returns junk is skipped and named in the summary, never
silently.

## Watch out

- **`sources.mjs` spends real (small) money** — every run spawns real `claude -p` processes.
  Don't run it in a loop by accident.
- The `.md` files are checked-in static content, read at runtime with a plain `fetch` — same
  as `directory.json` is NOT ([`ext/Doc/doc/files.md`](/framework/ext/Doc/doc/files.md) says
  why that one is gitignored and unsafe for this). Don't make a topic's listing depend on
  anything dev-server-only.
- A page's `kind` and `authority` are picked by the searcher (or by whoever hand-writes a
  page) — nobody checks them; read the page before trusting the badge.

## More

- [`doc/decisions.md`](doc/decisions.md) — the topics-listing call, and the CSS namespace.
- [`Server/sources.mjs`](https://github.com/lew42/monorepo/blob/main/Server/sources.mjs) — the
  script itself (a dev-only Node script, not a page the static site serves — the link goes to
  the repo, not this site), header comment has the full CLI.
