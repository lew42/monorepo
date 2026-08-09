**Usage** — 34 call sites, roughly the same as every other event combined. Demo
toggles, `Sidebar`'s open button (`framework/core/Sidebar/Sidebar.js:67`), the
copy button in `framework/ui/parts.js:40`, `ctrl()`'s checkboxes
(`View.js:386`).

**Necessity** — sugar over `on("click", cb)`, and it has earned the shorthand:
clicks outnumber all other events on this site.

**Simplicity** — right-sized, with one oddity. The missing-callback guard is
`console.error` rather than a throw, so `view.click()` logs and then hands
`undefined` to `addEventListener`, which accepts it — you get a red line and a
live-looking chain. A throw would be more honest for a mistake that can only be a
typo.

