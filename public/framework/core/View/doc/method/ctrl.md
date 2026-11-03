**Usage** — one call site in `public/`: `michael/branding/page.js:51`, a sandbox
page whose own prose notes it was "unused anywhere until now".

**Necessity** — no, not on `View`. It is a **demo widget** — a labelled checkbox
per class, wired to `tc()` — and it is the only member of `View` that builds a
multi-element UI.

**Simplicity** — it is the longest method in the file (18 lines, more than
`append`) and it emits a class, `.class-ctrls`, that **no stylesheet on this site
styles**. A component that ships markup and no CSS has decided half a design. Its
home is `ext/demo`, beside the other things that exist to show code working; core
would then be free of it. Proposed in `readme.md`.

