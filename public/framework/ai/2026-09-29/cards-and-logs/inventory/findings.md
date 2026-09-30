# Card inventory — findings

Full list: [`core/Page/card/inventory.json`](/framework/core/Page/card/inventory.json) (9 kinds, 8 screenshotted).

**Grounds in use (5, doing the same job under different names):** `var(--surface)` (white/near-black card), `var(--wash)` (tinted card/chip), `var(--fill-a04)`/`var(--fill-a08)` (AI2's own alpha version of wash), `var(--tint)` (rare), and `color-mix(prim|currentColor N%, transparent)` (chat bubbles only — the one kind tinted by the ACCENT color, not a neutral).

**Padding:** one real token, `var(--pad-card)`, used by `.card` and copied into `ai2-row`. Everything else hand-writes a number: `0.9em 1em` (page-preview), `.1em .5em` (chips), `var(--pad)` (decision box) — four spellings of the same idea.

**Nesting:** almost always ONE level — a flat wall or list, nothing inside a card but text and chips. Only `icard` nests inside a `.card` section, and content.css:181-183 already states the rule: a nested card switches ground (surface → wash) so the two read apart.

**Worst inconsistencies:** border width splits 1px vs 2px with no rule (Object/Answer/Field use 2px, everything else 1px or none); radius is hand-picked per kind (`.3em`, `.4em`, `1em`, `var(--radius)`) instead of one scale; page-preview uses its own shadow+ring system instead of `.card`'s border-inline-start stripe — two unrelated "this is a card" languages on one site.
