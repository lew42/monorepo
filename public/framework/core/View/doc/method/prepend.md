**Usage** — **none.** Grepped across `public/`, sandboxes included: no live caller.
The only reference is `prepend_to()` (`View.js:100`), which has no callers either.

**Necessity** — it is the last surviving half of a method that was broken for
years. Three of its six original branches called `prepend_pojo` and `prepend_fn`,
neither of which was ever written, so `prepend(fn)` threw `TypeError` for as long
as the method existed and nothing noticed. Those branches now warn and point at
`append()`.

**Simplicity** — the right shape for what remains, but the honest reading is that
the whole family should go. **Prepending a *capture* has no sensible meaning
anyway**: the captor fills in document order, so "build these, at the front" is
just `append()` into a container you placed first. Deletion proposed in
`readme.md`; kept for now because three sandbox View pages document it as API.

