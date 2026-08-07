# Two aliases exist only for consumers outside `framework/`

`app.stylesheet()` and `App.path_to_page_url()` are not API — they are
compatibility.

**This is a bug report about process, recorded so it isn't repeated.** The rewrite
dropped both, and `alex/`, `arya/` and `castin/` all 404'd because they call
`app.stylesheet()` at module scope. The rule *"rename freely inside `framework/`,
alias on the way out"* was already written down in `framework/readme.md` and was
not followed.

**A dev's `lib/` is a downstream package that happens to share a repo.** `grep
public/` before a merge does not see the branches about to land.

`path_to_page_url` cannot delegate to anything — the url convention it encodes
(`/a/b` → `/a/b.page.js`) no longer exists. It is the old rule, frozen. Do not
build on it.
