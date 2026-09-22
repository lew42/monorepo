# `data:` — a page whose `page.json` is the page

A page can say one word about whether it has data, and that word is `data`.

```js
export default new Page({ meta: import.meta, data: true });   // read the page.json beside me
```

That page fetches `page.json` from its own directory, waits for it, and **is** what the
file says: its title, its icon, its description, the six page words, and its children.
Nothing else in the file is thrown away — the whole object stays on `page.data`.

A page that does **not** say `data:` fetches nothing, probes nothing, and costs exactly
what it always cost. That is the point of having a flag at all rather than looking for a
`page.json` everywhere (the owner, 2026-09-18: *"pages without it load nothing and are as
efficient as before — no 404s, no probing"*). Measured: the network requests on
`/framework/`, `/framework/core/Page/` and `/notes/` are **317, 369 and 281 both before
and after** this landed.

## The three forms

| you write | what happens |
| --- | --- |
| `data: true` | `<my url>page.json` is fetched once, on the first ask for a child |
| `data: { … }` | that object, right now — no fetch at all |
| nothing | no fetch, no probe, no 404 |

The two forms are the same feature, which is why the key is called `data` and not `json`:
the second one is not a file. (`json: true` was the owner's first wording; it has nothing
to call the inline form.)

## What core reads out of the file

```json
{
	"title": "Notes",
	"icon": "description",
	"description": "A page you made.",
	"mode": { "navigation": "tabs", "room": "reading", "surface": "card" },
	"children": ["today", "later"]
}
```

The three labels and the six page words — exactly the keys `Page.props()` already knew,
because `Page.from()` has read a `page.json` this way since 2026-09-06. One reader, two
doors.

**Your page.js wins every key it sets.** The merge is `??=`, so a `title:` you typed beats
the `title` in the file. The file is the page's *data*; the `page.js` is the page's
*decision*, and a file a tool generates must never quietly overwrite a line a person
wrote. (The one thing that does **not** count as "you set it" is the title core derives
from the directory name — `naming()` holds that back until the data is in, or the file
could never name its own page.)

**Everything else stays whole on `page.data`.** A realm's own words, `blocks`, anything
core has never heard of: core does not invent a reserved name on `Page` for each key a
file might carry. `/imagine/paging/`'s `content` word is read back off `page.data.mode` by
the realm that knows what it means.

## A directory with only a `page.json` is a page

`Page.load()` now has three rungs, in this order:

1. `page.js` — a real module, as always.
2. **`page.json`** — a plain `Page` carrying that file as its `data`.
3. `x.md` beside the parent — the last-resort markdown fallback, in `child()`.

So [`/imagine/paging/made/notes/`](/imagine/paging/made/notes/) is a real page with a real
url, and nothing was written for it but data. **There is no url pattern and no naming
convention** — the owner ruled that out by name — and nothing pays for the rung except a
url that was already going to 404, because the module import above has to fail first.

### A name inside a `page.json` is another `page.json`

That one line is what makes the file a **directory listing** rather than a hint: a child
named in a `page.json` is declared as a data page straight away, so nothing ever asks the
server for a `page.js` the parent has already said is not there.

```
made/page.json               children: ["notes", "ideas", "archive"]
made/notes/page.json         children: ["today", "later"]
made/notes/today/page.json   children: []
```

Fetch the root, fetch what it names, repeat: **one fetch per page and zero 404s**, with no
index of any kind. The other two forms are untouched — a POJO of whole nodes (what
[`/imagine/cms/json/`](/imagine/cms/json/) uses) still declares itself inline.

**One 404 is left, at the root of a data subtree.** `/imagine/paging/made/` is named by a
`page.js` that declared it as an ordinary child, so core asks for `made/page.js` before it
asks for `made/page.json`. A parent that knows says so and even that goes:

```js
children: [{ name: "made", data: true }]
```

## Reaching a child whose children live in data

> *"Import a dynamic sub page by importing the parent; its data instantiates the children;
> look the child up through a property."* — the owner, 2026-09-18

```js
import parent from "/imagine/paging/made/page.js";

await parent.source_children();          // the data is in, the children are declared
const notes = parent.children.get("notes");
```

`source_children()` answers for **every** page, not only one with a data source — a page
with no source resolves at once with itself. So that one line means *"this page's children
are declared now"*, whether they were named in a string, handed in as a POJO, answered by
a `children()` function, or read out of a `page.json`.

`await parent.child("notes")` is the other way and is what the Router itself walks. The
difference: `child()` will go on to **probe the server** when the name is not declared;
the lookup above never does.

## `page.json` is the directory — and what `directory.json` is still for

A page's `children` in its `page.json` **is** its directory listing. Core needs no
`directory.json` to walk such a tree, and none is built for one.

The site-wide files are still there and were **not** ripped out. They are big — 2,330,818
bytes for `public/directory.json` and 1,820,583 for `public/framework/directory.json`,
4.15 MB of generated index — and the dev server rebuilds them on every change
(`Server/plugins/Directory.js`). Seven live readers depend on them today:

| reader | what it uses it for |
| --- | --- |
| `core/Search` | the whole search index — every directory that holds a `page.js` |
| `ext/AITask/dashboard.js` | enumerates every `ai/<date>/<slug>` task dir |
| `ext/Research/Program.js`, `Topic.js` | what each research topic has actually written |
| `framework/research/page.js` | the same listing, for the research index |
| `ext/DesignTool/vision/browse.js` | the shot listing |
| `dev/DevBar/ask.js` | the file listing the browser→CLI bridge offers |
| `ext/Omnibox` | the url list it then loads one by one through `Page.load()` |

**Every one of them wants a listing of a directory nobody declared** — task dirs, research
notes, screenshots, files that are not pages at all. That is the one thing a `page.json`
cannot answer, because a `page.json` only exists where somebody made a page. So the two
are not the same job and this is not a migration waiting to happen.

What *could* move, and what it would take:

- **`ext/AITask/dashboard.js`** is the closest. If `new-task` wrote a `page.json` in each
  `ai/<date>/` directory naming that day's tasks, the dashboard would read one small file
  per day instead of a 1.8 MB index — and every day page would become a real page for
  free. It needs the `new-task` skill to write one more file, which is a decision for the
  owner, not a refactor.
- **`core/Search`** would need every page to be reachable by walking `page.json` children
  from the root, which is only true once every directory has one. That is the whole site,
  and it is not worth it while the index is generated for free in dev.

## Watch out

- **`data` is a reserved page key now.** A page using `data:` for its own state is read
  once as a page file — harmless when its object has none of the keys above (the one
  existing case, `core/new/1/site/forms/wizard/`, is exactly that), but pick another name.
- **A page with `data: true` has no `title` until its data arrives.** Anything that reads
  a title off `Page.load(url, 0)` without letting it load — `related:`'s aside does this —
  will see nothing. The inline form does not have this gap, and `Page.load()`'s own
  `page.json` rung hands the data in as a POJO for exactly that reason.
- **`data:` and a `children()` function are two ways to say the same thing**, and `data:`
  wins: it replaces the source. Say one or the other.
- **`content` in a `mode` is only read when it is a url.** `/imagine/paging/`'s `content`
  word is `docs` / `cards` / `article`, and core drew the literal word "docs" as a
  paragraph the moment a made page became a real page.

## More

- [`doc/data-children.md`](./data-children.md) — `children` as a function, the seam this is built on
- [`doc/declaring.md`](./declaring.md) — nothing crawls; how a page comes to exist
- [`/imagine/paging/make/`](/imagine/paging/make/) — the editor that writes these files
- [`/imagine/cms/json/`](/imagine/cms/json/) — the other page tree that lives in data
