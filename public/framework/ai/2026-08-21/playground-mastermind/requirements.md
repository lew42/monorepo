# playground-mastermind — brief

**You:** a Fable sub-mastermind, running the ext/Playground program autonomously. **Supervisor:** the top mastermind (run task `../mastermind-ui-ux/`); it refreshes usage, harvests your report, and restarts you if you stall.
**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** reports are a screen; the Playground itself is the deliverable — a demo you can open beats a description.

## The ask (owner, verbatim)

> lastly, spawn a fable ext/Playground mastermind to manage this project. really test the zero-to-hero playground experience. think about the minimal number of steps or the best ux to get from any state/layout to any other. the +FLEX, +GRID, and +BOX buttons work, but sometimes it's unclear (maybe inconsistent?) whether we're adding a sibling or a child. I think a placeholder + button inside any box could be useful. show it on hover only, and clicking it should add a box with default styling. instead of having to reach to the top toolbar to click +flex or +grid, or +box, there should be one + button, and then while selected, via the right sidebar, you could switch to flex or grid. and when you switch to flex or grid, a modular panel section for flex config or grid config should appear. let's keep the right sidebar as minimal as possible. you should be able to find anythign you need, but not have a wall of empty form fields.
>
> have the Playground mastermind look at the ui-test skill as well, in terms of Playground ui. i'd really like "hug" and "fill" options, for both height and width, even though i know the flex/grid mechanisms will be a little complicated.
>
> we need resize handles for split columns, that should probably use flex-grow for distribution, but could use flex basis for fixed sidebar, or potentially grid.
>
> here's the thing, we want the Playground to be able to produce ANY type of layout, as quickly as possible. We need class toggles in the right sidebar for "flex", "grid", "auto", etc (make those modular, so activating flex produces a whole section of "flex" utilities). gap and pad are outside flex/grid. wrap is flex specific. in the playground, make the "0" padding actually like 0.25em, so that we can see parent-child separation a little. and then make "pad" like 1em or even 2em default, so we can quickly add it, and see how it changes.
>
> we might want bg color selections. stick to tokens, use the dropdown ui, and put this in the right sidebar.
>
> when adding a new box, if we have the + button placeholder, the + button should resemble the new box. so if you hover a parent, a + button appears, and upon clicking, the new child box is exactly in that place. if you're hovering that new child, it should have a + button, but you're still hovering the parent, so it should have a + button. maybe you automatically add the button to new boxes, so it props them open? the one place where this backfires, is when it causes a strange void at the bottom of containers.

## Be a mastermind

- Read `.claude/skills/mastermind/SKILL.md` and operate by it. You decide; minions execute. ~3–6 agents in flight max. Fable does NOT bulk-read or bulk-write — dispatch minions.
- The ladder: **Haiku** scans/inventories (never judgment); **Sonnet** builds (the default); **Opus** judges (interaction design verdicts, expensive-to-botch edits). No Fable minions — you are the only Fable in this effort.
- One task dir per sub-effort at `public/framework/ai/2026-08-21/pg-<slug>/` (new-task skill; `group: "panels"`), each with a `requirements.md` brief. Every brief opens with the three laws + a length budget, names its file fences (no two agents ever write one file), says the deliverable and what to cut first, and repeats the safety lines below. Write follow-ups so a COLD agent can execute them (file:line). Run any code recipe in a brief once yourself before shipping it.
- Your run log is `task.jsonl` in THIS dir — write line 1 yourself (`assign` with your `$env:CLAUDE_CODE_SESSION_ID`, `group: "panels"`, `window.before` from usage.json, 5–10 `steps`); `agent` lines at dispatch and harvest, `log` lines for decisions. ⚠ Write tool to create jsonl, Add-Content to append (Out-File/Set-Content BOM kills line 1). Timestamps from the clock. Forward slashes inside JSON strings. Never backslash-escape backticks or `$`.
- **Budget:** `used% ≤ elapsed%` on every window. Read `public/framework/ai/usage.json` (supervisor refreshes ~15 min; >20 min stale → refresh it yourself with `python "$USERPROFILE/.claude/bin/claude-usage.py" --json > public/framework/ai/usage.json`, never in a loop). At launch: session 0%, weekly 2–3% — front-load now, taper later. Log expected cost before every fan-out.
- **Autonomous:** never stop to ask; make the call, log the assumption. Owner-level moves (core API changes, deleting a module, anything in someone else's fence) become written proposals in your task dir.
- Work in cycles until the experience below is landed and PROVEN, or pace says stop. Land with finish-task. Your final text = report to the supervisor: what landed (clickable), proof screenshots, in flight/parked, proposals, approximate spend.

## Scope and fences

- **You OWN:** `public/framework/ext/Playground/**`.
- **READ-ONLY:** everything else. ⚠ `ext/Panel` is read-only pending the owner (Playground is the simpler Panel — read it for reference, never edit). ⚠ A sibling mastermind owns `ui/` and `ux/` right now — use ui templates by importing them, and if Playground needs a ui/ change, write a proposal in your task dir instead of editing. `core/**`, `styles/**`: proposals only.
- **Safety, repeat in every minion brief:** never kill or restart the dev server (localhost:80, the owner's own terminal); never drive the owner's live browser tabs — prove UI with the `ui-test` skill / Playwright headless from the session scratchpad (prefix files `pg-`), or the mcp `site` `shot` tool; never `git stash`; never commit or push; scratch never goes in the repo.
- **Constraints:** no build step, no server at runtime, no new npm deps. Load `code`, `css`, `layout` skills before writing; `new-css-class` before any new class name; `new-page` for any page.js; `documentation` before landing.
- Traps: no DOM after an `await`; every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — one backtick inside `` css(`…`) `` kills every page; `**/` closes a block comment; framework.css `max-width:100%` and util-layer `:first-child` beat component CSS; resolve URLs against `import.meta`; MCP `eval` runs in a hidden tab — hidden tabs do not lay out (no rAF, frozen geometry), use `shot` or headless Playwright for rendering truth.
- Playground principles already established (memory, 2026-08-19): Playground is the simpler Panel; **data IS the CSS** — keep it that way; the ui-test skill proves gestures.

## The program (priority order)

1. **Baseline.** First minion: drive the current Playground headless (ui-test skill), screenshot the zero-to-hero flow as it exists — add boxes, nest, flex/grid, resize. Name what is unclear or inconsistent (sibling vs child on +FLEX/+GRID/+BOX is the owner's called shot). This is the before-picture every later claim is measured against.
2. **The + placeholder.** One + button, hover-only, inside any box: click adds a default-styled child exactly in that place. The + resembles the box it would create. Hovering a new child shows its own +; the parent, still hovered, keeps its +. Consider auto-adding the + to new boxes to prop them open — but watch the owner's named failure mode: a strange void at the bottom of containers. If it voids, don't ship it that way; log the evidence.
3. **Right sidebar, minimal + modular.** Class toggles: `flex`, `grid`, `auto`… Activating flex reveals a whole flex section (direction, wrap, grow…); grid likewise; deactivating hides it. `gap` and `pad` live outside flex/grid; `wrap` is flex-only. You can find anything you need, but never a wall of empty form fields. Selecting a newly-added box then switching it to flex/grid via the sidebar replaces reaching for the top toolbar.
4. **hug / fill** for both width and height (yes, the flex/grid mechanics are fiddly — the 0px hug/fill seams in ext/Panel are prior art to read).
5. **Resize handles** for split columns: flex-grow for distribution, flex-basis for a fixed sidebar, grid where it wins. Prove with ui-test drags.
6. **Playground calibration:** "0" padding renders ~0.25em so parent-child separation is visible; "pad" defaults to 1–2em so adding it visibly changes things. bg color selection: tokens only, the dropdown ui, in the right sidebar.
7. **Zero-to-hero proof.** Final wave: script the minimal-steps path from empty to (a) holy-grail app shell, (b) 3-column dashboard, (c) mobile stack — screenshot every gesture (ui-test). Count the steps; the count is the score. Any layout, as quickly as possible, is the goal.

**Verification:** every claim ships with a screenshot from the ui-test flow. Two numbers that must agree: gestures scripted vs screenshots taken.

**What to cut first if pace bites:** #6 color dropdown, then #5 grid-mode handles, then #4 height-hug edge cases. Never cut #1's baseline or the proofs of what shipped.
