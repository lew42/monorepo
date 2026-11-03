**Usage** — `code.ext(url)` maps a file extension to an hljs language id:
three special cases (`htm→html`, `mjs→js`, `cjs→js`) and the bare extension
otherwise. One caller, `code.file()`, one line below it in the source.

**Necessity — borderline.** It hangs directly off `code`, alongside `code.js`
and `code.file`, so it *reads* as public API the way every other entry on
this namespace is. It isn't: it exists only to serve `code.file`'s one call.
`readme.md`'s Decisions record the honest fix — demote it to a module-local
`function ext(url)` — as a recommendation, not yet applied (this audit's
fences don't permit behaviour changes; see the audit report for the ranked
version).

**Simplicity** — one line, and correctly cautious: an unmapped extension
falls through as itself rather than throwing, and `render()` already
degrades an unregistered language to escaped plain text, so a wrong guess
here is never worse than a grey code block.
