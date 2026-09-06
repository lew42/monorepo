# omnibox-search — core/Search with Filters, and the Omnibox that fronts it (Opus, build)

Three laws: less is more (ASAP) — the fastest working version first, then improve; clear beats brief, by far; prioritize. Length budget: the module's page is one screen with the thing itself on it; the report is 10 lines.

Read first: the repo's `CLAUDE.md`; the owner's sentence in `../mastermind-graduate/layout-brief.md` deliverable 10 and the calls beneath it (bottom-centre; `/` outside inputs and Ctrl+K; movable to the top; the choice remembered — an app preference, so persisting it is right); `../../2026-09-04/mastermind-platform/minion-rules.md`; **`ext/Omnibox/`** (built by the platform program on 09-04 — read its readme, doc and page; graduate what is good, delete what is not); `/imagine/design/vocabulary/` (29 tags on 4 axes — the filter facets); `core/Router` and `core/App` (how the app knows every page: title, description, url, `tags:` where a page has one). Skills: `new-task` (this dir, group `web-ui`), `code`, `layout`, `css`, `new-css-class`, `new-page`, `documentation`, `finish-task`.

## What to build

**`core/Search/`** — `Search` (the corpus: every page the router can reach, with title, description, url, tags; a query = words + active filters; ranking simple and explained on the page) and `Search.Filters` (a part class per the `code` skill §3: the facets from the vocabulary's four axes, each a chip group, default *all*; a page's `tags:` prop is what they read). No dependency on any page module that does not exist yet — the layout pages will carry the same `tags:` later and appear on their own.

**The Omnibox** — the one search UI, at the app level: sits bottom-centre (the terminal / chat feel), opens on `/` when focus is not in an input and on Ctrl+K, closes on Escape; autocomplete as you type (titles first, then descriptions); the filter chips live inside the box; arrow keys walk results, Enter opens; a control moves the box to the top and the choice is remembered in `localStorage` (the one place persistence is right here). Results are a wall — `.grid.auto` with a real `--column` so 3440 gets 4+ columns and 400 gets one; render 40, then a *more* control; never 10,000 at once.

**Where it mounts.** One import in `app.js` installs it for the whole site — you are the only agent allowed to touch `app.js` today, and the change is one line. If `ext/Omnibox` had a mount already, replace it; do not leave two.

**`ext/Omnibox` afterwards.** If `core/Search` subsumes it, delete the dir and fix every importer (grep); if part of it is worth keeping as an extension, say what and why in the log. The site has exactly one search box when you land.

## Prove it

`ui-test`: open with `/`, type three letters, see suggestions; a filter chip narrows the wall; Enter opens the page; move to the top, reload, it is still at the top; Escape closes. Screenshots at 400 / 1280 / 1920 / 3440 with the box open and a wall of results — the wall fills 3440 in 4+ columns and never scrolls sideways. Zero console errors on `/`, `/framework/`, `/imagine/`, `/blog/` at all four widths. Two numbers that must agree: pages in the corpus = pages the router declares (say how you counted both).

## Fences and budget

Write only: `core/Search/**`, `ext/Omnibox/**` (edit or delete), one line in `app.js`, one name in `core/page.js` `children:`, `styles/css-scopes.txt` (register `search-` and `omnibox-` if you keep the name), this task dir. Never `core/Page/**` (another minion is in it), never `framework.css`. Private server `PORT=8094 node server.js` (kill the pid you started; never port 80; never the owner's tabs). Never `find /`; never spawn agents; never `git stash`/commit. Budget ~400k tokens. Report in ≤ 10 plain lines: what a reader does to search (three sentences), corpus size and how it agrees, what happened to ext/Omnibox, the four-width verdict, what you left.
