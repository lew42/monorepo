# Technical Tim — Phase 3 report

## 1. What I'd change first

`App.js:render()` and `site/app.js:render()` both do:

```js
this.$app = div.c("app", () => { this.$pages = div.c("pages"); });
View.set_captor(this.$app);
```

The captor is set to `$app`, not `$pages`. Every time `Page.render()` (`Page.class.js`)
builds `div.c("page", …)`, `View`'s own constructor (`prerender()`) auto-appends the
new element into *whatever the current captor is* — which is `$app`, a sibling of
`$pages` and `$sidebar`. It never ends up there because `Page.mount()`
(`Page.class.js:56-63`) immediately does `this.app.$pages.append(this.view)` right
after, which reparents an already-attached node rather than placing it fresh. So
today it self-corrects, on every single navigation, silently.

It works only because `mount()` is currently the *only* caller of `render()`. The
moment anything calls `page.render()` on its own — a thumbnail preview, a test
harness, a future `previews()` that inlines content — that view lands as a stray
direct child of `.app`, invisible now only because `.page{display:none}` is the
default, and not because it's actually in the right place. That's exactly the
"where did this DOM node go" class of bug the async-`previews()` writeup in
`new/starter/readme.md` already burned time on, reintroduced by which element gets
named as the captor rather than by an `await`. The fix is one line in each
`render()`: `View.set_captor(this.$pages)`. `mount()`'s parentNode check stays —
it's still needed to make re-activation idempotent — but stops being load-bearing
for *placement*, only for *idempotence*, which is what it reads as.

## 2. Where the build diverges

**`resolved_mode()` didn't survive.** My proposal put mode resolution on `Page`
itself — `resolved_mode(){ return this.mode ?? this.parent?.resolved_mode() ?? "replace"; }`
— a method any page could call on itself, chain-active or not. The built code has
no such method; the same logic is inlined in `App.js:mark()` as
`chain.findLast(p => p.mode)?.mode ?? "replace"`, operating on the array
`page.chain()` returns. Functionally identical for the active leaf, but a page can
no longer answer "what mode would I resolve to" in isolation — the knowledge only
exists transiently inside `App.mark()`'s local computation, coupled to "am I the
currently active chain." Not urgent — nothing today asks an inactive page for its
mode — but it's a real move of a concept from the object that owns it to the
object that happens to be marking it, and it's the kind of thing that gets rebuilt
badly by whoever needs it next without knowing it once existed.

**`mark_links()` — the readme says none of us proposed it in `App`; my own
proposal did.** `agents/tim/proposal.md` §1 has it as a stub called from `mark(chain)`
for the same reason it's in the build: sidebar highlighting has to be recomputed
on *every* `activate()`, including the button-driven ones that touch no URL, not
just on boot. So crediting this to a late add is slightly off the record for me —
and it's not a mistake regardless: computing it once at boot is exactly the bug
`new/starter/readme.md` already documented and fixed once ("link marking ran one
navigation behind, and not at all on boot"). Doing it inside `mark()` is the
correct location, not an afterthought.

## 3. A failure that never throws

`site/app.js`'s `nav` array (lines 16–23) is a hand-written list of
`[url, text, sub]` triples, independent of the `Page` objects it links to. Nothing
ties `"Docs — columns"` to `docs/page.js`'s actual `title: "Docs — columns"` — they
currently agree because someone typed them to match, not because one derives from
the other. Rename a page's `title` and the sidebar link silently keeps the old
text; nothing errors, nothing warns, the link still resolves and still highlights
correctly via `mark_links()` (that reads `.pathname`, not text) — only the *label*
goes stale. This was the predicted cost in my own phase-1 dissent under A ("any
topic-listing UI… has to use inert `[url, title]` data… or it silently re-inherits
the full-site-load cost"), so it isn't a surprise, but it's worth confirming it
actually landed in the shipped site and is not hypothetical: six pages, six
hand-typed titles, zero of them checked against the real thing.

## 4. My dissent

Decision A went against me: `site/page.js` directly imports `about`, `docs`, and
`focus`, and `docs/page.js` imports `intro` and `guide` — so importing `/page.js`
once, at boot, pulls in the entire six-page site regardless of which URL loaded
it. At six pages this is free and the measured numbers in the readme prove the
*mechanism* (retention, ordering, mode resolution) works correctly. My objection
was never about correctness at this size — it's that there is no lazy tier left
to reintroduce later without a second breaking change to how `children` are
declared (name-strings instead of direct-import arrays, the exact thing `starter`
already built and this design deliberately walked back). The day this site has
fifty pages instead of six, visiting `/about/` still imports all fifty. That's a
known, accepted, load-bearing trade for now — recorded once, not re-argued.

## 5. readme.md vs. the code

Nothing false. The CSS block under "The one structural fact" is a trimmed
illustration, not a literal excerpt — the real `site/styles.css` also carries
`padding`, `overflow-y`, and `flex`/`border-right` that the readme's version
omits — but the readme doesn't claim it's verbatim, and the omitted properties
don't change the behavior being illustrated. Every load-order, retention, and
measurement claim I checked against the actual files matches.
