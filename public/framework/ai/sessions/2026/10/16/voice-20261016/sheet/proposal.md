# Sheet proposal: one AI surface for phone and desktop, routed at `<path>/ai/` (2026-10-16)

This is a proposal: apart from the rename, nothing here is built. Each step below is one commit and waits for the owner's yes. The facts behind it are in [audit.md](audit.md), and the owner's words are in [owner-2026-10-16-sheet.md](../../../../../../../ext/drawer/doc/owner-2026-10-16-sheet.md).

**Pick a control layout:** [the five variants](variants/index.html) (each one shows the strip, split and full sizes).

| A · Compact | B · Verbose | C · More | D · Fewer | E · Live space |
|---|---|---|---|---|
| [![](variants/shots/a-compact-400.png)](variants/a-compact.html) | [![](variants/shots/b-verbose-400.png)](variants/b-verbose.html) | [![](variants/shots/c-more-400.png)](variants/c-more.html) | [![](variants/shots/d-fewer-400.png)](variants/d-fewer.html) | [![](variants/shots/e-live-400.png)](variants/e-live.html) |

My pick is **A's head with E's feed**: a quiet head (title, path, ✕), and the split size showing the page's live feed. The alternative is B, which is easier to learn but takes about 70 px more of a phone's screen.

---

## The class architecture

```js
class Sheet extends View            // ext/drawer/Sheet.js: the one AI surface. Phone: a bottom sheet. Desktop: the right sidebar.
  static Strip  extends View        //   the phone's bottom bar: ⌂ Home · ✦ AI · ☰ Menu (navigation)
  static Head   extends View        //   grip + "AI · <page path>" + ✕; a drag on it resizes
  static Size                       //   the one size machine: closed | strip | split | full (phone), side (desktop)
  body: the AIPage view for drawer.page()

class AIPage extends Page           // core/Page/ai/AIPage.js: the routed <path>/ai/ page, minted for any path
  children: chat (default) · live · sessions · dictation · settings   // were DrawerTabs' rows
  about: the page at <path>         // what drawer.page() answers today

class AIFeed extends View           // the live space: chat bubbles (ux/Dictate Widget) + this page's events, one stream
```

- **`drawer(fn)` stays** as the plain right-hand container that any module can fill. On a desktop, `Sheet` is simply its biggest user.
- **Retired, kept reachable:** `DrawerRailSheetV1`, `DrawerRailSheet` and `DrawerRailSheetPanel` (with its dead session code) move to an archive file, and `DrawerTabs` becomes `AIPage`'s children. Nothing is deleted.
- **The conversation stays the one `ux/Dictate/chat.js` `GLOBAL`**, unchanged.

## The route: `<path>/ai/` replaces `?drawer=` and `?sheet=`

- `<path>` = the sheet is closed. `<path>/ai/` = the sheet is open on the chat. `<path>/ai/sessions/` (and the other children) = the sheet is open on that view. **✦ navigates to `<path>/ai/`.**
- **The size is not in the url.** Going from split to full adds a history entry with the same url, so the phone's back button still steps down one size, as the owner asked on 2026-09-30.
- **Old links still work:** `?drawer=x` and `?sheet=open|full` are rewritten once (`replaceState`) to `<path>/ai/x/`.
- **The data is already there:** Servex saves each page's assistant chat to `<page>ai/chat.jsonl`. The routed page reads its own folder (CLAUDE.md: data lives with its page).
- ⚠ **One name clash:** `/framework/` + `ai/` is `/framework/ai/`, which is the AI system's own page, and `core/Page/ai/` is a real page too. My rule: a real declared child named `ai` wins, and on that page ✦ opens the sheet about the page itself. The alternative is a segment that can never clash (`<path>/~ai/`), but it is not the owner's word.

## One system for phone and desktop, three sizes

- **Phone:** ✦ opens the **strip** (about 100 px, listening, showing the last line said). Drag up to **split**, and past about 90% it snaps to **full**, where ✕ shows. A drag down from the title bar goes from full back to split, then to the strip. These replace today's 84 px / 28% / 85% numbers.
- **Desktop:** the same `Sheet`, docked as the right sidebar at `--drawer-w`. It is **open by default where there is room** (proposed: 1920 px and wider), and opened by a top-right ✦ below that.
- **The live space:** at split and full, the body is `AIFeed`: the chat plus this page's events (a task filed, a reference, a log line), newest at the bottom (variant E).

## Global agent or page agent

**Recommendation: one global agent that knows the page, and can hand off to the page's expert.**

- The global agent is what runs today. `chat.js` `GLOBAL` survives navigation, and `say({path})` and `nav()` tell it which page you are on. The global fast assistant landed on 2026-10-13 (d81697bd4).
- The page's expert also exists: `Layers.js`' per-page assistant and mastermind pair. But each page you talk to spawns two agents (Servex caps them at 30 live and reaps idle ones), and every page would then have its own separate conversation. That split is what the drawer moved away from.
- So the sheet shows **one conversation**. "File a task about this page" and "ask this page's expert" go to that page's pair as a tool call, and the result lands in the feed.
- The alternative is C's **This page / Everywhere** switch: two conversations, with the owner choosing between them.

## The ☰ question

**Recommendation: ☰ always means navigation, and ✦ always means AI.**

- **Phone:** the bottom strip becomes ⌂ Home · ✦ AI · ☰ Menu, and ☰ opens the page's navigation (the Sidebar's tree) from the bottom, within thumb reach. Today's ⋯ More (which opens the desktop drawer) goes away, because the tabs live inside the sheet.
- **Desktop:** the top-right drawer ☰ becomes ✦. Then no icon means two things.

---

## The steps (each one commit, each needs a yes)

1. ✅ **Rename** `rail.js` → `Sheet.js`, `class Sheet extends View` (done, merged as 41c9607e7).
2. ⬜ **Fold the sheet chain into one class**: `V1 → Sheet → Panel → Chat` becomes `Sheet.Panel`, and the old classes move to an archive file. The behavior does not change. Proved by headless shots at 400 and 1200, before and after.
3. ⬜ **☰ = navigation, ✦ = AI**: the bottom strip's ⋯ becomes ☰ (it opens the nav), and the desktop's top-right ☰ becomes ✦.
4. ⬜ **The three sizes**: strip (about 100 px) / split / full with ✕, dragging both ways, and a drag on the title bar from full to split.
5. ⬜ **The route**: `AIPage` at `<path>/ai/` with its children; ✦ navigates there; `?drawer=` and `?sheet=` are rewritten.
6. ⬜ **The desktop dock**: the same `Sheet` as the right sidebar, open by default at 1920 px and wider.
7. ⬜ **The live space**: `AIFeed`, the chat plus the page's events, from `<page>ai/`.
8. ⬜ **Page hand-off**: "file a task / ask this page's expert" from the global chat to the page's `Layers` pair.
9. ⬜ **Cleanup**: drop the dead `hides-nav` markup on ten pages; decide `VoiceStrip`'s fate.
10. ⬜ **The dictation redesign**: its own mocked variants first, as the owner asked. It is not part of this proposal.

**The decision I need most:** is `<path>/ai/` routing approved, with the rule that a real `ai` child wins? Steps 5 to 8 depend on it.
