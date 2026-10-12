# STATE: figma-colors-fix (landed 2026-10-12)

- Cause: the style-system fold repainted ext/Figma pages; owner rule is the SITE's `--prime`/`--dark`, dark ink on prime.
- Done: `9ca7fa778` (on `michael/dev`, no merge needed); first attempt `7e83771f8` (blue override) reverted by it.
- Kept: prime-bound text specimens (`scheme.css` `.fs-prime-text`), skipped on prime grounds.
- Shots: [compare.md](compare.md), 400 and 1200 beside the Figma frames.
- Not done: other 8 palette subpages not re-shot at 400; no `--bg` grep sweep; smoke not run (needs a worktree).
