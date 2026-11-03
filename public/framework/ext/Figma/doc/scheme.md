# Figma pages use the site's tokens

Decided 2026-10-12 (owner, style-system brief): the rebuilt Figma pages show OUR `--prime` (`#FF6157` in framework.css as of 2026-10-12) and `--dark`, never the Sept-2026 file's blue `#72c4ff` / brown `#675f56`. Anything labelled prime uses `var(--prime)`; ink on a prime ground is dark ([architecture.md](/framework/styles/doc/architecture.md)), which keeps contrast readable.

`scheme.css` holds only `.fs-prime-text`, the "prime-bound text" specimen line. An earlier same-day commit (`7e83771f8`) scoped the Figma blue onto these pages; that went the wrong way and is removed.


2026-10-12: the Figma file now matches: its `prime` variable was set to `#FF6157` (owner's ask), so Figma and the site share one accent. `dark` still differs (`#675F56` in Figma, `#42404B` on the site); that switch is an open question on the Claude · Overview page.
