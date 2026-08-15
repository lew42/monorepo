# Legacy `Pager` — vendored

The historical `Pager` class, kept here so `../mvp/` and `../tabs/` still have a
real class to demonstrate. It left `framework/core/legacy/` when that tier was
deleted (2026-08-12); `/app.js` has not exported it for far longer.

Not framework code, not a page — nothing links here and nothing else should
import it. An arrangement is a CSS class a page opts into now; see
`/framework/core/Page/`. Its only live dependency is core `View`.
