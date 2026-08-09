**Usage** — **no live caller in `framework/`.** The three modules that set markup
all use `html_unsafe` instead (`framework/ext/markdown/md.js:27,42,72`), because
the Sanitizer API strips what markdown legitimately emits. Only sandbox View pages
document this name.

**Necessity** — doubtful in its current form. It is the *safe* setter, which is the
right default to offer — but it has no users, and its fallback path is worse than
having none.

**Simplicity** — one branch is a genuine hazard. When `Element.setHTML` is missing,
it warns and writes the string as **text** — so the same call renders markup on
Chrome and prints angle brackets on a browser without the Sanitizer API. A silent
content change on a capability difference is the failure mode this codebase spends
the most effort avoiding. Either it should throw, or it should fall through to
`html_unsafe` and say so. Proposed in `readme.md`.

