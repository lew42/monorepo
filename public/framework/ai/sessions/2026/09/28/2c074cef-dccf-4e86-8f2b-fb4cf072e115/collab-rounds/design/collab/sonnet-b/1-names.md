# `Source` — names (no implementation)

One web page an agent found, already saved once as markdown, so any other agent can read it fast
and cite it. Lives in `public/framework/sources/<topic>/`, one row per page in that topic's
`index.jsonl`.

## Class: `Source`

House style: plain ES class, assign-based constructor, small methods, parts as static subclasses.

```js
class Source {
  constructor(o){ Object.assign(this, o) }
}
```

## Properties

Every property is written once, at creation, from the fields below. Nothing here is computed at
read time except where a method is listed.

| Property | Type | What it holds |
|---|---|---|
| `url` | string | the page's real address, exactly as fetched (the citation key) |
| `topic` | string | the folder name under `public/framework/sources/`, e.g. `"websocket-reconnect"` |
| `kind` | string | one of `Source.KINDS` — what sort of page this is (`"docs"`, `"source"`, `"article"`, `"forum"`, `"spec"`) |
| `authority` | number | 0–1, how much to trust it (see `Source.Authority` below) |
| `title` | string | the page's own title, for a human-readable citation |
| `mdPath` | string | path to the saved markdown file, relative to `public/framework/sources/<topic>/` |
| `fetchedAt` | string | ISO timestamp of when it was converted and saved |
| `fetchedBy` | string | the member/agent id that found it (so a caveat about a bad source has an owner) |
| `summary` | string | one or two sentences, written by the fetching agent, on what this page is for |

Two properties are deliberately **not** stored on the instance because they are cheap to derive
and would drift out of sync with the file on disk:
- the markdown's own byte size — read from disk when needed, via `sizeOf()`
- whether the file still exists — checked live, via `exists()`

## Static parts

### `Source.KINDS`
A plain array of the allowed `kind` strings, so a caller can validate against it rather than
inventing new kinds ad hoc: `["docs", "source", "article", "forum", "spec"]`.

### `Source.Authority`
A static helper class (a "part") that turns a URL or kind into a starting authority number, so
every member scores sources the same way instead of guessing:

- `Source.Authority.guess(url, kind)` → `number`
  Looks at the domain (official docs domain, `github.com`, a known blog host, a forum) and the
  `kind`, returns a 0–1 starting estimate. A member can override it by hand afterward if they
  have read the page and think it's worth more or less.

## Methods

### `static async fetch(url, o)`
Arguments: `url` (string, the page to get), `o` (object: `{ topic, kind, fetchedBy }`).
Fetches the page, converts it to markdown, guesses a title and an authority score, and returns a
new `Source` instance — but does **not** save it. Separating fetch from save lets a member look at
what it got (skip a 404, skip a page that turned out to be junk) before committing it to disk.

### `async save()`
No arguments. Writes the markdown body to
`public/framework/sources/<this.topic>/<this.mdPath>` and appends this source's row to that
topic's `index.jsonl`. Returns `this`, so a caller can `await source.save()` and keep going.

### `static async load(topic, url)`
Arguments: `topic` (string), `url` (string — the citation key to find).
Reads `index.jsonl` for that topic, finds the row whose `url` matches, and returns a `Source`
instance built from it (does not re-fetch the page). Returns `null` if no row matches — a caller
asking "do we already have this?" before spending a fetch.

### `static async list(topic)`
Arguments: `topic` (string).
Reads every row of that topic's `index.jsonl` and returns an array of `Source` instances — the
whole reading list for a topic, for a member doing a web fan-out to check what's already covered.

### `async exists()`
No arguments. Checks whether `this.mdPath` still exists on disk (a source can be deleted or moved
without its `index.jsonl` row being cleaned up yet). Returns a boolean.

### `async sizeOf()`
No arguments. Reads the markdown file's size in bytes. Lets a mastermind judging a fan-out spot a
source that's suspiciously thin (an agent that saved a login wall or an error page instead of the
real content).

### `cite()`
No arguments. Returns a short plain string for pasting into a doc or a caveat, e.g.
`"[title](url) — docs, authority 0.9"`. This is the one method every other agent actually calls;
everything else exists to make `cite()` trustworthy.

## What it deliberately leaves out

- **No dedup-by-content** — two different URLs with the same text are two rows; merging them is a
  future problem, not this class's job.
- **No re-fetch/refresh method yet** — a stale source is a lesson for whoever cites it, not
  something `Source` itself manages. If staleness becomes a real problem, a `refresh()` that
  re-runs `fetch()` and overwrites the file is the natural place to add it later.
- **No relevance/ranking score** — `authority` is about the *source*, not about how well it
  answers any particular question. A per-question relevance score belongs to whatever is doing
  the citing, not to `Source`.
