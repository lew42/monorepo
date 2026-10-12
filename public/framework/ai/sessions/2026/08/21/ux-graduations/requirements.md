# ux-graduations — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** pages lead with the thing; final report = one screen, clickable paths.

## The job — a CLOSED list

Graduate **Menu**, **Pagination**, and **Tags** from ui/ templates to ux/ classes — the three whose one real line of logic `ui/doc/decisions.md` deliberately left at the call site (menu close-on-pick, pagination current-page state, tags remove-on-x). Assess **Field validation** honestly against the graduation rule and graduate it ONLY if it is genuinely the same pattern — "no, it stays a template" as a one-line finding is a first-class result (ux/Auth already showed validation living at the workflow level). Nothing else this wave.

## The pattern you are copying — it is already proven, do not innovate on it

`ux/Tree` graduated `ui/tree` today and is THE exemplar. Copy its discipline exactly:
1. **Read the template's actual logic first** — `ui/menu/menu.js`, `ui/menu/page.js`, `ui/pagination/page.js`, `ui/tags/page.js`, `ui/parts.js` (read-only — `.ui-tags-input` lives there), and each module's readme/doc.
2. **Caller census before touching anything** — grep public/ (skip ai/) for each template's classes and any imports; every caller listed with file:line in your task log BEFORE the design call. The split must be ADDITIVE: every ui/ page keeps rendering byte-identically.
3. **All CSS stays `ui-*` in ui/.** Only behavior becomes the class.
4. **The class**: `class Menu extends View` etc. in `ux/Menu/Menu.js`, `ux/Pagination/Pagination.js`, `ux/Tags/Tags.js` — assign-based constructor, every method a seam, parts as static subclasses where a part exists (`Tags.Chip`, `Pagination.Button` — only where real). State on the instance: menu = open/close + close-on-pick + click-outside; pagination = current page + `go(n)` + a `changed()` one-wire (the Tree/Filter precedent); tags = the tag list + `add()`/`remove()` + `changed()`.
5. **One named extension each ONLY where the module's own doc already asks for it** — otherwise none; three clean bases beat six thin extensions. Log the call either way.
6. Read `ux/readme.md` + `ux/doc/system.md` + `ux/doc/decisions.md` (the consolidated verdicts: subclass over mixin, one-wire rule, seam-per-composed-thing) — they bind you.

## ⚠ Class-name stamp check (bit nobody yet — keep it that way)

`classify()` stamps a css class for EVERY constructor in the chain: `class Menu` instances wear `.menu`, `Tags` wear `.tags`, `Pagination` wears `.pagination`. BEFORE naming each class, grep all css (`css(` blocks and .css files under public/framework, skip ai/) for `.menu`, `.tags`, `.pagination` as bare selectors. A collision means prefix the class name (`UxMenu`) and log it; no collision, plain name, log the grep as proof.

## Deliverables (priority order)

1. Three classes + three demo pages: `ux/Menu/page.js`, `ux/Pagination/page.js`, `ux/Tags/page.js` (stubs planted — replace content, keep the blessed shape). Each demo: the thing live and big (menu opening/picking/closing; pagination driving a visible list through `changed()`; tags adding by typing and removing by ×), a words proof (`ui-contrast ui-compact`), readme.md + doc/decisions.md per module (documentation skill).
2. The ui/ side told the truth: each of `ui/menu/page.js`, `ui/pagination/page.js`, `ui/tags/page.js` gets the graduation pointer the `ui/tree` page got today (template stays, "the class lives at /framework/ux/<Name>/") — copy ui/tree/page.js's shape. Readmes likewise, minimal edits.
3. The Field verdict: a `log` line + (only if graduating) `ux/Field/` — but you must FIRST log the argument that it passes "something remembered between renders". If it is CSS `:user-invalid` + caller logic, it stays; write the finding and move on.
4. Verification per module (below) + verdict `lesson:` lines.

## Fence

Yours alone: `ux/Menu/**`, `ux/Pagination/**`, `ux/Tags/**` (+ `ux/Field/**` only on a logged YES), `ui/menu/**`, `ui/pagination/**`, `ui/tags/**` (+ the `new-css-class` skill's `styles/css-scopes.txt` append if you mint a class — `ux-menu-*` / `ux-pagination-*` / `ux-tags-*`). READ-ONLY: everything else — `ui/ui.js` (its css-only imports already cover these; a needed change = log line for the mastermind), `ui/parts.js` (`.ui-tags-input` — a needed change = log line), `ux/page.js` (children already declared), `ux/readme.md`, `ux/doc/**`, other modules, `core/`, `styles/` (except the skill's scopes append).

## Process

- Load skills: `code`, `css`, `layout` before writing; `new-page` per page.js; `new-css-class` per new class name; `documentation`; `finish-task`; `skill-improvement` when a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-graduations/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends via Add-Content. **Appends must be real UTF-8 or pure ASCII — PowerShell Add-Content defaults to ANSI; an em dash becomes an invalid byte and the board drops the line. Use ASCII.**
- **Timestamps are READ FROM THE CLOCK in the same command that writes the line, never typed** — e.g. build the line with `Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"` inline (or bash `date +%Y-%m-%dT%H:%M:%S%z`) in the SAME command that appends it. A sibling agent hand-typed stamps 90 minutes in the future today and the record had to be corrected from file order.

## Verification (before landing)

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server you find. A static server serves public/ at **http://localhost:8918** (pid noted by the mastermind — never kill it). Proven recipe:
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs http://localhost:8918/framework/ux/Menu/ <out.png> <width>` — prints overflow_x + console errors; ⚠ ignore only the repeated ws://localhost:8918 LiveReload error. Per module: 360 / 768 / 1280 / 3440 shots (`ux-grad-*` in the scratchpad) + one interaction proof driven headless (ui-test skill drive.mjs or Playwright: open menu, pick, closed; click page 3, list changed; add a tag, remove one). ⚠ Re-shoot the three `/framework/ui/<name>/` pages you touched — they must still stand. Money shot per module into this task dir, linked in the landing line.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's live browser tabs; never `git stash`; never commit or push; scratch stays in the scratchpad.

## Traps that never throw

No DOM after an `await` (click-outside handlers that await: capture first); every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; a method named `render()` collides with core unless deliberately overriding — style `this`, never a nested wrapper, or config words miss you; ⚠ View name shadows: `text`, `toggle`, `show`, `hide`, `click` are View methods — `this.text = x` silently fails (bit Filter today; the code skill's improvements has the line); `.append(fn)` passes the View to a bare reference — wrap in `() =>`; an inline custom property inherits into what sits below; a declared child without a page.js 404s; resolve URLs against `import.meta`; a tooltip/menu panel is out of flow — an `overflow: hidden` ancestor clips it (ui/readme names this).

## Cut first if squeezed

The named extensions → the Field write-up depth (the verdict line itself is never cut) → Tags keyboard niceties (keep type-to-add, x-to-remove). Never cut: three working classes, additive ui/ pages re-verified, interaction proofs.
