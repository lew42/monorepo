# Sheet audit: how a page draws its nav, its ☰, its sheet and its sidebar (2026-10-16)

Facts only, read from the code on `michael/dev` at 41c9607e7. The owner's words are in [owner-2026-10-16-sheet.md](../../../../../../../ext/drawer/doc/owner-2026-10-16-sheet.md). The proposal that follows from this is [proposal.md](proposal.md).

## The short version

- **One call draws all of the AI chrome.** `app.js:69` calls `menu(this)`, which builds the top-right ☰ and the phone's bottom strip (`Sheet.of(app)`). The Router and the page know nothing about either.
- **There are two ☰ buttons, and they share one corner.** The drawer's ☰ opens the AI drawer. A page's own `Sidebar` draws a second ☰ that opens the navigation, but only below 52em. On those pages, CSS hides the drawer's ☰ below 52em. So on a phone the ☰ means *navigation*, and on a desktop the same icon means *AI*.
- **`hides-nav` does nothing.** Ten pages still set it, but nothing reads it: the top nav strip it used to hide was deleted on 2026-09-18 (`styles.css:11-24`).
- **There are two url words for one panel.** `?sheet=open|full` is the phone sheet (it pushes history entries). `?drawer=<tab>` is the desktop drawer (it replaces the url and pushes nothing). Each one hides when the other one shows.
- **There is one conversation everywhere.** The phone sheet, the drawer's AI tab and push-to-talk all mount `ux/Dictate/chat.js`'s `GLOBAL` controller (`chat.js:110`), keyed `lew42-voice-session`.
- **A per-page `ai/` already exists, on the server side only.** Servex's `Layers.js` gives any page an assistant and a mastermind pair, and saves their chat to `<page>ai/chat.jsonl`. No routed `<page>ai/` *view* exists.

---

## (a) The render path, top down

```
public/app.js:24      new App({...})                        core/App/App.js:6   class App
  App.instantiate()   config → render → load → initialize   App.js:22-29
  app.render()        .app > .pages                         app.js:50-90
    menu(this)        ☰ + Sheet.of(app)                     app.js:69 → ext/drawer/menu.js:17
    devbar · devshell · push_to_talk(this)                  app.js:77-84 (outside .app)
  App.load()          Page.load("/") → new Router           App.js:54-69, core/Router/Router.js:3
    Router.load()     walks page.child() down the url       Page.class.js:360
      page.activate() → render() → render_content()         Page.class.js:518, 562
                      (a page that sets any of the six page words builds a Frame: Page.class.js:571)
        [opt-in] class Sidebar extends View                 core/Sidebar/Sidebar.js:13  (the page's own nav + its mobile ☰)
        [opt-in] class CoreShell extends View               core/Shell/Shell.js:53      (a 5-region grid; unrelated to the drawer)
  drawer(fn)          the right-hand drawer, pushes .app    ext/drawer/drawer.js (one writer of --drawer-w: drawer.js:35-40)
    DrawerTabs        AI · Dictation · Settings · Element   ext/drawer/tabs.js:64-70
  class Sheet extends View   the phone's bottom strip       ext/drawer/Sheet.js (was rail.js / DrawerRail)
    Sheet.Sheet = DrawerRailSheetChat                       Sheet.js:694
      extends DrawerRailSheetPanel → DrawerRailSheet → DrawerRailSheetV1 → View
      mounts chat(el) — the GLOBAL conversation             Sheet.js:617, ux/Dictate/chat.js:110
```

Page → nav → drawer → sheet is not a chain. The **page** and its **Sidebar** come from the Router. The **drawer** and the **sheet** come from `app.js` on the side, once per site, and follow the page through `menu.navigated()` (`menu.js:49`).

---

## (b) Every control the owner named

| Control | Defined | Phone (below 52em) | Desktop |
|---|---|---|---|
| `hides-nav` | set in `public/page.js:28`, `framework/page.js:164`, `blog/page.js:50`, `michael/page.js:24`, `live/page.js:3`, `Live.js:144`, `core/Sidebar/variants/{a,b,c,d}`, three lab pages | nothing | nothing. No reader exists; `styles.css:11-24` records that the nav it gated was deleted |
| Drawer ☰ `.drawer-menu` | `ext/drawer/menu.js:25-29`; placed at the fixed top right, `drawer.css:94-109` | hidden on any page that has a `.sidebar` (`drawer.css:125-128`); on other pages it still opens the drawer | opens the drawer on its AI tab (`tabs.toggle()`) |
| Sidebar ☰ `.sidebar-toggle` | `core/Sidebar/Sidebar.js:56-65` | shown (`Sidebar.css:310,328`); opens the nav tree | `display: none` (`Sidebar.css:254`) |
| Bottom strip: Home · ✦ AI · ⋯ More | `Sheet.js` `home_button()`, `ai_button()`, `menu_button()` | shown (`rail.css:8-13`) | `display: none` |
| ✦ AI | `Sheet.js` `ai_button()` → `open_sheet()` | opens the sheet with the mic on (`listen: true`), pushes `?sheet=open` | not shown |
| ⋯ More | `Sheet.js` `menu_button()` → `tabs.toggle()` | opens the *desktop* drawer's tabs (the drawer goes full width below 26rem, `drawer.css:60-65`) | not shown |
| Sheet sizes | `DrawerRailSheetV1`: `collapse_h()` 84 px, `clamp_height` 40–92% of the screen, default 60dvh, `full_at` 0.85, `close_at` 0.28 | closed / open (dragged height, saved in localStorage) / full (100dvh). In the full state the drawer's tab row is mounted under the chat (`DrawerRailSheetChat.state()`) | hidden; the url is kept |
| Sheet drag | `handle()` → `ext/grip` y axis; `settle(h)` | drag up past 85% = full (pushes a history entry); below 28% = closed; at about 84 px = the collapsed strip | none |
| Desktop sidebar | `ext/drawer/drawer.js` + `tabs.js` | reached only through ⋯ | ☰ opens it at `--drawer-w` (19rem default), pushing the page |
| Session page columns | `ai/sessions/AISessionsPage.js:52` → `Page.columns()` (`Page.class.js:642`); `sessions.css:106-116` | a container query stacks the rows into cards below 88em | a list column and a detail column side by side (50%) |
| `?drawer=` | `tabs.js:109` `routed()`, `tabs.js:148-153` `write()` (`replaceState`); `?drawer=sessions` is remapped to `ai` (`tabs.js:129`) | opens the drawer, full width | opens the drawer on that tab |
| `?sheet=` | `Sheet.js` `routed()`, `push()`, `replace()`, `to()` | `open` / `full`; the phone's back button steps down one state | ignored, but left in the url |

---

## (c) What is duplicated or contradictory

1. **Two ☰ buttons in one corner.** The overlap is solved by a `display: none` rule (`drawer.css:112-128`). It is not one component. The same icon means *navigation* on a phone and *AI* on a desktop: this is the owner's complaint.
2. **Two url words for one panel.** `?sheet=` pushes history; `?drawer=` replaces it. A phone that follows a `?drawer=ai` link gets the full-width drawer, not the sheet.
3. **Two ways into the same tabs on a phone.** ⋯ opens the desktop drawer, and dragging the sheet to full mounts the same tab row inside the sheet (`DrawerRailSheetChat.mount_tabs()`).
4. **Two copies of the voice-session code.** `SESSION_KEY = "lew42-voice-session"` appears in `chat.js:7` and in `Sheet.js:18`. `DrawerRailSheetPanel`'s own `ensure_session / watch_session / forget_session / voice_deliver` (about 130 lines) are dead in the live sheet, because `DrawerRailSheetChat` mounts `chat()` instead. They are kept only for the `Sheet.SheetPanel` variant.
5. **Five classes in a chain for one sheet** (`V1 → Sheet → Panel → Chat`, plus the strip). Each one re-does `render()` and `show()`, and `DrawerRailSheetChat.render()` copies `DrawerRailSheetPanel.render()` line for line.
6. **The class stamping fights the CSS.** View stamps a CSS class from each class name, so the strip now carries `.sheet` *and* `.drawer-rail` (kept on purpose, `Sheet.prototype.classes`). The sheet panel carries four classes (`drawer-rail-sheet-chat … -v1`), and a bare rule on one of them once leaked (`doc/sheet.md`, Watch out).
7. **`hides-nav` is dead markup** on ten pages.
8. **`VoiceStrip.js`** (a full `View` with its own CSS) has no importer on the live path; only `ext/Refine/RefineDemo.js` and the Dictate demo page use it.
9. **"Session" names two different things**: `ext/Session` is a voice conversation; `ai/AISession` is a Claude Code session. The sheet uses the first one; the session page shows the second.

---

## Past work: what was built or decided before

- **A per-page AI already exists, on the server.** `Servex/agents/Layers.js` gives any page a `page-assistant` and `page-mastermind` pair the first time someone messages it (`POST /api/page-ai`). The chat is saved to `<page>ai/chat.jsonl`. Sources: [Servex/agents/doc/page-roles.md](../../../../../../../../../Servex/agents/doc/page-roles.md), [page-pairs.md](../../../../../../../../../Servex/agents/doc/page-pairs.md), [core/Page/ai/readme.md](../../../../../../../core/Page/ai/readme.md), and the census [core/Page/ext/doc/path-extensions.md](../../../../../../../core/Page/ext/doc/path-extensions.md) ("Its own AI assistant + manager, and a chat log … `<page>ai/chat.jsonl`").
- **`<module>/ai/` folders already hold logs** (`ext/drawer/ai/log.jsonl`, the `ux/Dictate/ai/v-*.jsonl` voice transcripts, `ext/Session/ai`). On 2026-10-08 the owner asked for them to be documented (addendum 4, commit d822c096d). A grep of `framework/ai/doc` still finds no such doc.
- **Global or per page was asked before.** On 2026-09-30 the owner suggested that "the per-page mastermind becomes the per-directory README system" ([refine-640/brief.md](../../../../09/30/voice-sessions/voice-sessions/refine-640/brief.md) #14). Then on 2026-10-13, "assistant-chain" landed **one global fast assistant** (d81697bd4), and the drawer's AI tab moved from the per-page `send()` to the global `chat.js`. `tabs/ai.js`'s `send()` (the per-page route) is still kept for `aiV1` / `aiV2`.
- **The sheet's history:** the ☰ became the page nav again on a phone, and ✦ was added ([mobile-nav, 2026-09-29](../../../../09/29/mobile-nav/mobile-nav/)). One chat panel serves the drawer and the sheet (c-chat, 2026-09-29). The sheet became a page with `?sheet=` states and the phone's back button (`ext/drawer/doc/sheet.md`, 2026-09-30). Closing the sheet keeps the mic on (2026-10-01). Chrome's toolbar auto-hide was researched and not built (2026-10-01). The full state mounts the drawer's tabs ([dictate-sheet, 2026-10-13](../../../../10/13/session-730e8a7b/mastermind-repo-slim/dictate-sheet/)).
- **How Dictate, the conversation and Refine connect:** `Dictate` (capture + Whisper) → `Widget` (bubbles + composer) → `chat.js` `GLOBAL` → `ext/Session` `say()` → Servex's fast and smart assistants. `ext/Refine` is separate: it refines past prompts into cards (`Server/RefineQueue.mjs`) and runs its own demo. It shares only `VoiceStrip` and `Connection`. The new task system is not traced here.

## The rename that landed today

`ext/drawer/rail.js` is now [`Sheet.js`](../../../../../../../ext/drawer/Sheet.js), with `export default class Sheet extends View` (it was `DrawerRail`), and `Sheet.of(app)` replaces `rail(app)`. `rail.js` re-exports it. The brief guessed 115+ importers; there are 6 in the code. Commit 58270f2e3, merged as 41c9607e7.
