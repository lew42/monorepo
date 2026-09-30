# Minion brief: layout preview cards, auto height and association by proximity

Load the `minion` skill first, then `layout` (read its proximity section, just before "Boxes, padding and contrast"), `css`, `code`. Task dir (the whole conversation): `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\`.

The owner (relayed by servex-mastermind-opus, 2026-09-29): many layout PREVIEW cards are broken.
1. **Previews must be AUTO HEIGHT at one shared zoom.** A one-line item is shown one line high, not stretched to match the others, and taller previews aren't cropped.
2. **Association by proximity.** Today the space between a preview and its label is the SAME as the space to the next preview, so you can't tell which card a label belongs to. The gap from a label to its own card must be clearly smaller than the gap between cards.

## Do
1. **Find every preview component first,** and write the list (component, file, which pages use it) at the top of `previews.md` in the task dir: the core/Page previews and `browse()`, the Page overview grid (building blocks, "Pages are navigation"), /layouts/, layouts/decide, and the layout explorer. Several probably share one source (a preview/thumbnail function or class, or a shared CSS rule). Name it.
2. **Fix at the shared source, once:** one zoom factor shared by every preview in a wall. Height comes from the content at that zoom (no fixed aspect ratio, no fixed height, no crop; a very tall preview may cap at a max height with a visible fade, not a hard crop). Label-to-own-card gap is small (about 0.25–0.5em); card-to-card gap is clearly larger (at least 2× that). Where the grid stretches items in a row, align them to the start so a short preview stays short.
3. A wall that genuinely needs its own override gets one line, not a copy.

**Keep v1 reachable** if you restructure a preview class: the new one extends the old one.

## Proof
Before and after at 1920 and 400 of: /framework/core/Page/ (the Overview grid), /layouts/, /layouts/decide/ (or wherever decide lives), and the layout explorer. Name the files `shots/previews-<page>-<width>-before.png` / `-after.png` in the task dir, and open each pair to check both rules by eye. Zero console errors.

## Where
Worktree `C:\Code\lew42\worktrees\page-switcher` (server http://localhost:59934/; if it doesn't answer, tell me and stop). You are the only agent in it; commit your own files by exact path (never server-appended page.jsonl lines, `public/framework/ai/**`, board.jsonl, flags.jsonl). Don't touch `core/Page/page.js` beyond a class name: another minion is editing its Overview in a different worktree. Every process you spawn sets `windowsHide: true`. The machine is short on memory: never start a second server or browser pool; one headless browser, closed when done. Budget $4. Reply with the hash, the shared source you fixed, and the shot paths, then stop.
