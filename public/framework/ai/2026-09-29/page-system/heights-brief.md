# Minion brief: the fixed-height sweep

Load the `minion` skill first, then `layout` (read "Leave the defaults alone, one property at a time" in full), `css`. Task dir (the whole conversation): `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\`.

The owner (relayed by servex-mastermind-opus, 2026-09-29): there are too many FIXED HEIGHTS, places where an AI guessed a height. Height is auto and width fills. Each property is set only in the cases the layout skill lists, in em where it should follow the font.

## Step 1: classify, touch nothing yet
Find every fixed `height:` / `min-height:` / `block-size:` value (px, em, rem, vh; also `aspect-ratio` on content boxes) in the CSS and in inline `css(`…`)`/`.style(` calls under `public/framework/`, `public/layouts/` and `public/imagine/`. Write `heights.md` in the task dir: one table row per value (file:line, the value, what the box is, and the verdict).
- **legit:** an icon or glyph; a fixed shell (app bar, rail, a full-viewport frame); a deliberate scroll area; a media box that needs its ratio; a 1px rule.
- **guess:** a content box (a card, a panel, a preview, a list, a section) given a height instead of letting its content decide.
Group the rows by directory. Put the counts at the top (legit N, guess M).

## Step 2: fix the guesses
Replace each guess with `auto` (delete the line), or with `max-height` + `overflow: auto` where the box really must not grow past a limit. Where the value should follow the font, use em. Work one directory at a time and commit each directory separately by exact path. Before each commit, shoot every page that uses the changed rule, before and after at 1920 (and 400 for anything in a grid), as `shots/heights-<page>-<w>-before/after.png`. Open each pair. If a change makes a page worse (a collapse, a jump, a scroll area that no longer scrolls), revert that one line, and mark it legit in heights.md with the reason.

Shared CSS (`framework.css`, `styles/`, `.page` rules) needs before/after shots of three pages that use it. Leave `imagine/` realm pages that are deliberately fixed-size art (a 3D pager, a canvas) as legit.

## Where
Worktree `C:\Code\lew42\worktrees\page-switcher` (server http://localhost:59934/). First run `git merge michael/dev` there; stop and tell me if it conflicts. You are the only agent in it. Commit only your own files by exact path (never server-appended page.jsonl/files.jsonl lines, `public/framework/ai/**`, board.jsonl, flags.jsonl). Memory is short: use one headless browser and close it when done; every spawn sets `windowsHide: true`. Budget $5. Reply with the counts (legit / guess / fixed / reverted), the commit hashes, and the pages that changed, then stop.
