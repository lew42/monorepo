# The ☰ menu and the drawer's tabs

![The drawer open on its AI tab, beside a page — the ☰ at the page's top right](/framework/ext/drawer/doc/tabs.png)

**Every page has a ☰ in its top right corner.** Click it and the drawer opens on the right with three tabs: **AI**, **Dictation** and **Settings**. A fourth, **Element**, appears after Settings while something on the page is selected, and goes away when the selection clears. Click the ☰ again, or the drawer's ✕, and it shuts.

**AI and Sessions used to be two separate tabs** (one-dictation drawer-chat, 2026-10-02 — the owner: "I feel like the AI and the sessions should be kind of the same thing"). They are one tab now: the AI tab's own header strip, right above the chat, IS what the Sessions tab used to show — see the table below. **Admin used to be its own tab too**; it is a section inside Settings now (same code, `tabs/admin.js`, just called from `tabs/settings.js` instead of routed on its own) — both changes exist for the same reason: the tab row fits one line at the drawer's 19rem default width, instead of wrapping onto two the way six tabs used to.

## What each tab is

| Tab | What it shows | Built from |
|---|---|---|
| AI | A header strip — the live session's name, a link to its raw log, the fast/smart assistants as working/idle/asleep chips, a switcher to other recent sessions, and "+ New session" — then the page's [inbox](/framework/ext/drawer/doc/inbox/) and the one global conversation (`ux/Dictate/chat.js`'s own mount, the exact same call the ✦ sheet makes) | [`ux/Dictate/chat.js`](/framework/ux/Dictate/) for the conversation; `session_header()` in `tabs/ai.js` for the strip |
| Dictation | The dictation playground | [`ux/Dictate/playground/`](/framework/ux/Dictate/playground/) |
| Settings | Edit mode, the reload block, the width line, the x-ray outline, "this page", then an **Admin** section — who holds reloads, the route, the dev server, the page structure, links | the dev bar's own controls; `tabs/admin.js`'s own function for the Admin section |
| Element | What is selected on the page: what it is and where it lives; "Ask about this" | [doc/select.md](/framework/ext/drawer/doc/select/) |

**Off the dev server** (any host but `localhost`, `127.0.0.1` or `*.localhost`) the ☰ and the AI and Dictation tabs stay; Settings drives the dev server, so it is not shown, and the AI tab does not call Servex.

## The route word

The open tab is in the url: `?drawer=ai`. Clicking a tab rewrites it with `history.replaceState`, so a reload opens the same tab and the back button is not filled with tab clicks. A url with no `?drawer` opens with the drawer shut. **An old `?drawer=sessions` link still works** — `tabs.js`'s `open()` remaps the name to `"ai"` before anything else runs, so a bookmark or a shared link from before the merge lands on the AI tab, not a 404 or a blank tab.

⚠ A page that rewrites its own url and drops the query (the Space realm's `space/page.js` does) also drops the route word. The drawer stays open; only a reload forgets it.

## Adding a tab

A tab is one row in `DrawerTabs.list` (`tabs.js`) and one file under `tabs/`:

```js
// tabs.js
{ name: "notes", label: "Notes", load: () => import("./tabs/notes.js") },

// tabs/notes.js — draws into the drawer's body, which is the captor
export default function notes({ app, page, card, tabs }){
    p("Notes about " + page);
}
```

A row may carry `when: () => …`; it shows only while that answers true (how Element and Settings come and go). `load()` runs the first time the tab is shown, so a page nobody opens the drawer on never downloads it. The function gets the app, the **page the drawer is about**, the open card when that page is a card, and `tabs` itself (`tabs.open("ai")` switches tab).

## Sending a message

**The default AI tab sends through `ux/Dictate/chat.js`**, not the function below: every sentence goes to `ext/Session/Session.js`'s `say()`, into the one global voice session — see [`ux/Dictate/readme.md`](/framework/ux/Dictate/)'s own "chat.js" section for the full picture.

`tabs/ai.js` also still exports `send({ page, text, context })`, the OLDER route the kept-reachable `aiV1`/`aiV2` versions use (swap one of them in by pointing `tabs.js`'s "ai" row at `{ default: aiV2 }`):

- **On a card:** the message goes where the card's own composer sends it (Servex's prompt log, pinned to the card), and the reply arrives in the card's chat.
- **On a plain page:** it goes to the page's assistant, `POST http://servex.localhost/api/page-ai` (the agreed interface, `framework/ai/2026-09-25/recursive-pairs/interface.md`). Until that answers, it falls back to the dev bar's Ask route, so a message still gets a reply.
- **On a thread picked from `aiV2`'s own thread list:** it goes straight to Ask and resumes that thread's session. If the old session is gone (Claude Code prunes old transcripts, and a session started in another tree is not found), a fresh session is filed in the same thread and given the thread's last turns.

`context` is a list of picked elements, `[{kind, label, text, selector}]`.

## The page the drawer is about: `drawer.page()`

Every tab reads `drawer.page()`, never `location.pathname`. A host that shows another page inside itself (AI 2 embedding a page in its detail area) calls `drawer.page("/framework/ux/Dictate/")`; `drawer.page(null)` hands it back to the address bar. A change redraws the open tab.

## Sharing the drawer

The drawer is one box that any module can fill. `drawer.filled_by()` says who filled it last, which is how the ☰ knows whether a click should open its tabs or shut them. `ext/layout` now redraws the drawer only when it filled it last, so a click on the page no longer replaces the tabs.

The tab strip wraps onto a second row when the rail is narrow; no tab is ever cut off or scrolled out of sight.

The composer's model picker only stores the choice for now (`localStorage`, `lew42-drawer-model`). Nothing reads it until the provider lands (harness step 2).
