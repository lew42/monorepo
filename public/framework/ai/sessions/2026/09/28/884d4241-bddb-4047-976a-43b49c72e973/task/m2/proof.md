# Minion 2 — proof

While the drawer is open, a click on any content on the page selects it. The drawer's new **Element** tab shows what the element is and where it lives. "💬 Ask about this" puts it on the AI tab's input as a chip, and every message carries it as `context`. All shots are headless Playwright at 1920 against this worktree's server. The key ones, one per deliverable, are committed in [`../proof/`](../proof/); every shot taken is on disk in the worktree's `../shots/`, which the repo ignores (`ai/**/shots/`).

| # | Deliverable | Done | Shot |
|---|---|---|---|
| 0 | (fix from m1) All five tabs visible at the default 19rem and at the 200px drag floor: they wrap, never scroll | yes | [tabs-1920-narrow.png](../proof/tabs-1920-narrow.png) · [plain-ai-1920.png](../proof/plain-ai-1920.png) |
| 1 | Any content element selectable while the drawer is open: hover brightens (`--lighten-2`), a click keeps it (one at a time), Escape or empty page clears; controls keep their clicks; never the drawer, dev bar or navigation | yes | [select-paragraph-hover-1920.png](../proof/select-paragraph-hover-1920.png) · [select-card-selected-1920.png](../proof/select-card-selected-1920.png) |
| 2 | Its properties in the drawer: tag, classes, first words; the page, the page file that drew it, the nearest readme, the owning module (from ext/Ask's `context()`) | yes | [select-paragraph-properties-1920.png](../proof/select-paragraph-properties-1920.png) |
| 3 | A chip in the AI input ("this paragraph ✕"); the send carries `context: [{kind, label, text, selector}]` | yes | [chip-in-input-1920.png](../proof/chip-in-input-1920.png) · [chip-sent-1920.png](../proof/chip-sent-1920.png) · the logged body: [request-body.json](request-body.json) |
| 4 | Suggestions are that chat; no suggest-edit UI | yes | — |
| 5 | Docs: `ext/drawer/doc/select.md` (screenshot first), a readme line, a line on the drawer page | yes | [/framework/ext/drawer/doc/select/](/framework/ext/drawer/doc/select/) |
| — | The drawer shut: a paragraph click selects nothing and opens nothing; a link still navigates | yes | [shut-no-select-1920.png](../proof/shut-no-select-1920.png) |

Measured on the run: the chip's `selector` (`.page--intro > p:nth-of-type(4)`) finds the same element again with `document.querySelector`. Escape cleared the selection. The script saw no console errors apart from AI 2's own missing `ai/usage.json`.

## Things to know

- **The send's endpoint was stubbed for the proof.** `/api/page-ai` is not live yet, so the headless run answered it with `{ok: true}` and saved the exact body the drawer sent ([request-body.json](request-body.json)). The card test did not send, because a card send goes to the real Servex prompt log.
- **Hover and selection are data attributes, not classes.** With a `drawer-` class, ext/Ask named `ext/drawer` as the module of every element you selected (it maps class prefixes to modules). Found on the card shot, fixed.
- **One ext/Ask seam, logged:** `context()` now also returns `file`, the page.js that drew the element.
- **Hover is subtle on purpose** (the owner's word): one lighten rung. Selection adds a hairline ring so it still shows on a white card.
- **A card now sends through `send()` too**, so its chips ride along. It posts to the same place the card's own footer does.
- **Links that will work after merge:** the Dictation playground (`/framework/ux/Dictate/playground/`) is still uncommitted in the main tree, so it 404s here. The interface file is untracked in main, so the docs name its path without linking it.

## Review fixes (review.jsonl)

- **Element is a tab only while something is selected.** It sits after Admin and goes away when the selection clears, and the drawer goes back to the tab you were on. [review-element-tab-1920.png](../proof/review-element-tab-1920.png)
- **The hover clears when the pointer leaves the window** (`pointerout` with no `relatedTarget`; `pointerleave` never fires on document).
- **Off the dev server** only the ☰ and the AI, Sessions and Dictation tabs show. The AI tab makes no Servex call and says there is no page assistant yet. The check mapped a fake host, `drawer-review.test`, to this server and counted zero Servex requests. [review-static-host-1920.png](../proof/review-static-host-1920.png)
- **The "Ask anything about this page" hint goes** as soon as the first message is sent.
- Finding 5 is unchanged: a click still opens the properties in the drawer, as the owner asked.

## The empty clock band on `/framework/?drawer=sessions` (merge follow-up)

**Not caused by the drawer, and it happens on `michael/dev` without it.** The home page's clock (`ext/Panel/templates.js`, the `clock` entry, last changed 2026-08-30, before this branch) paints for the first time while its element is still detached. That paint writes nothing, by design, and the next one waits for the next whole second. So every load shows an empty band for up to one second, drawer or not.

- Caught empty in its first second **with no drawer**: [clock-empty-first-second-no-drawer-1920.png](../proof/clock-empty-first-second-no-drawer-1920.png). With the drawer: [clock-empty-first-second-drawer-1920.png](../proof/clock-empty-first-second-drawer-1920.png).
- A moment later both are filled: [clock-live-1920.png](../proof/clock-live-1920.png) · [clock-live-drawer-1920.png](../proof/clock-live-drawer-1920.png).
- Ten loads of the live site measured the empty time at 12–921 ms without the drawer and 392–582 ms with it. The drawer opens at about 70 ms, before the band exists, so it cannot interrupt the clock.
- Also checked, and never empty: the dev bar open, a 600px drawer, both colour schemes, and the pointer crossing or clicking the band. The site's own screenshot tool shows the clock both ways.

Left unfixed, as asked, because the cause predates this branch. If you want it gone, it's a one-line change in ext/Panel: paint once more when the element first becomes visible, instead of waiting up to a second.
