# A fetched file's relative links pointed at the route

**The bug.** `styles/readme.md` contains `[base](base/)`. A browser resolves
that against the **document**, and the SPA fallback makes the document url
the *current route* — so on `/framework/core/Router/` it pointed at
`/framework/core/Router/base/`. Measured by a link crawl: **40 broken
routes**, all of them links that were correct in the file and wrong on the
page.

This is exactly the trap [`md.file`](/framework/ext/markdown/api/file/) was
already written to avoid for the *fetch* (resolve against `import.meta`,
never the document). The fetch was right and what the fetch returned was not
— the file text is correct, the browser's own link-resolution rule is what
misplaces it.

## Options weighed

| | |
|---|---|
| make every readme link absolute | works, and re-breaks the moment someone writes a natural relative link — also breaks the links on GitHub, where relative is correct |
| `<base>` on the document | global, and would move every other relative url on the page |
| **rewrite hrefs against the file's url after parsing** | ✓ |

**Verdict:** [`md.resolve(root, base)`](/framework/ext/markdown/api/resolve/),
called by `md.file()`. One pass over `a[href]` and `img[src]`, skipping
anything absolute, protocol-relative, or a fragment. The happy consequence:
**a relative link is now the right thing to write** — the same
`[base](base/)` works in the rendered page and in GitHub's readme view.

`url.pathname + search + hash`, not `url.href`: an absolute url would make
`Router.link_clicked()` treat it as external and hand it to the browser,
costing a full reload for what should have been an in-app navigation.

## Not fixed by this, on purpose

A link to a real file (`[readme](../Page/readme.md)`) still resolves to the
file and the Router still declines it — `/\.\w+$/` means "not ours" — so the
browser fetches the raw markdown. That is the correct behaviour for a link to
a file, as distinct from a link to a route.

## What this means for links written *inside* `doc/*.md`

The rewrite resolves against the **fetched file's own path**, which mirrors
the `doc/` folder (`doc/method/file.md`, `doc/relative-links.md`, …) — not
against the route a member page actually lives at (`/api/file/`,
`/docs/relative-links/`). A relative link from one `doc/*.md` to another
member's *page* has to be written **absolute**
(`/framework/ext/markdown/api/resolve/`); a relative link is only correct
when it deliberately targets a real file for the browser to fetch, the same
way GitHub would read it.
