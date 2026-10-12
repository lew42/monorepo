# Builder brief: fold Figma pages into the style system

You work in the worktree `C:\Code\lew42\worktrees\style-system` (branch `worktree/style-system`, its own server at http://localhost:50632/). Never touch the main tree `C:\Code\lew42\monorepo`. Your page folders are named in your prompt; edit nothing outside them.

## Read first (short)
- `public/framework/styles/doc/architecture.md`: the tokens, the four grounds, the one card. This is the whole system.
- `public/framework/framework.css`: search for `bg-white`, `.surface, .card`, `--prime`, `--light`, `--dark`, `--shadow`, `--darken-1`, `.flex`, `.grid`, `.gap`, `.pad`, `.muted`, `h4`, `button.prim`. Use the utility classes that exist (`flex`, `v`, `gap`, `grid`, `auto`, `pad`, `wrap`, `flex-1`, `muted`, `h1`..`h4`, `center`…); read their definitions before using one.

## The job, per page
1. Every hand-painted colour becomes the system: Figma's `#72c4ff` → `var(--prime)` / `.bg-prime`; `#675f56` → `.bg-dark` / `var(--dark)`; `#fff` blocks → `.bg-white` (or just `.card`); `rgba(0,0,0,.8)` text → nothing (the ground's ink); `rgba(0,0,0,.55)` / `rgba(255,255,255,.7)` → `.muted` or `var(--subtle)`; a black/white alpha inset → a nested `.card` (it steps automatically) or `.bg-darken` / `.bg-lighten` / `var(--darken-1..3)` / `var(--lighten-1..3)`. **No inline `.style("color", …)` or `.style("background", …)` with a literal colour.** The page will show `--prime` (our accent, orange on this site), not Figma's blue: that is the point.
2. Every boxed thing that is a card (pricing card, control card, scheme column, feature card…) is `div.c("card …")`, plus a ground class if it is not the default. Don't re-declare padding, radius, shadow or background a `.card` already gives.
3. The page's own `.css` keeps only what is truly unique to the design (a price's big type, a timeline's line). Cut every rule a utility class or `.card` replaces; cut classes nobody uses. Keep the class prefix the file already uses. Keep `@layer base, theme, site, util;` + `@layer theme { }` wrapping. If nothing is left, delete the CSS file and its `View.stylesheet` line.
4. Fonts: drop `Montserrat` and hard px font sizes; use `h1`..`h4` / `.h1`..`.h4` classes and the site font.
5. Layout: rows of cards are `grid auto` (or `flex wrap gap` with `flex-1` children) so they wrap from 400 to 3440 with no media query.

## Prove it
- Load each page headless: call the servex MCP tool `check_page` (`shot: true`) on `http://localhost:50632/<page url>` at least once after your edits; no page errors. Read the screenshot.
- Run `node public/framework/ai/2026-10-12/style-system/css-lines.mjs "<your label>"` from the worktree root and report the lines for your folders.
- Commit your folders only: `git add <your folders>` then `git commit -m "<folder>: fold into the style system (tokens, grounds, .card)"` with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not merge. Do not stage anything else (the server rewrites files.jsonl and page.jsonl files on its own; leave them).

## Reply
Three lines: what changed per page, CSS lines before → after, anything you were unsure of.
