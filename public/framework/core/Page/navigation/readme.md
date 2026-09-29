# Navigation — persistent vs switching, the levels that stack, the go-to, the alternatives

The owner's own question, 2026-09-29: **"is there persistent navigation?"** — that's the one
thing to get right. [Live page](/framework/core/Page/navigation/).

## Use

- **Persistent vs switching** is the first and biggest concept: a persistent element (rail,
  header, crumb strip) never moves; switching replaces the whole screen, which is fine as long
  as it does so cleanly. Already measured at 0px drift for four real mechanisms —
  [`/imagine/paging/navigation/`](/imagine/paging/navigation/) is the proof, not a promise.
- **Up to four levels can stack**: header → left sidebar → top tabs → inner left sidebar. A real
  page showing all four: [`/framework/core/Page/api/`](/framework/core/Page/api/).
- **The go-to for a module with real depth** is [`ext/Doc`](/framework/ext/Doc/) — a page whose
  own children are a left rail of top tabs. Use it until something better exists.
- **Alternatives**, each real and running: Miller columns
  ([`core/Page/overview/columns/`](/framework/core/Page/overview/columns/)), a contextual
  swapping workspace ([`/layouts/explorer/`](/layouts/explorer/)), a full-screen switch
  ([`/layouts/labs/screens/`](/layouts/labs/screens/)), a second contextual surface
  ([`ext/drawer`](/framework/ext/drawer/)), and the configurable prototype crossing all of it
  ([`/imagine/paging/`](/imagine/paging/)).

## Watch out

- **Two navigation pages, one click apart, on two different topics.** This page is about
  navigation as a UI *pattern* (rails, tabs, persistent vs switching). [`core/Page/doc/navigation.md`](/framework/core/Page/doc/navigation/)
  is about navigation as core's own routing *mechanism* — how a page's `children:` becomes a
  menu. Same word, different subject; each links to the other rather than merging, since
  merging them is a bigger call than this task's fence covers.
- **Two different vocabularies name the same idea.** This site's stability study says *stable*
  (0px moved) / *dynamic* (something moved); the owner says *persistent* / *switching*. They map
  onto each other — see the page for the exact translation — but don't mix the words in new text
  without saying which one you mean.
- **`/imagine/paging/rightnav/` no longer exists.** The inventory that fed this brief found it as
  a live orphaned demo (built 2026-09-04, never wired into `/imagine/paging/`'s `children:`), but
  a later rewrite ("Paging v3") removed the directory entirely — confirmed with `git log`, not
  guessed. This page does not link to it or add it to any `children:` list; if the pattern is
  wanted again, it needs rebuilding, not re-wiring.
- **Four levels is a ceiling, not a target.** Most pages want one or two; see
  [`doc/levels.md`](doc/levels.md) for what to drop first.

## More

- [`doc/levels.md`](doc/levels.md) — the four levels, why four is the ceiling, what to cut first.
- [`doc/alternatives.md`](doc/alternatives.md) — the alternatives table, with more detail than
  the page shows.
- [`doc/prior-work.md`](doc/prior-work.md) — every navigation row the inventory found, linked.
- Built by `minion-nav-page` for the [page-system](/framework/ai/2026-09-29/page-system/) task.
