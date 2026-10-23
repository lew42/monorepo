# The session menu

**What it is.** Every session page has a button at the right end of its name line. It opens the session's menu: a list of sub-pages and actions. The owner asked for it on 2026-10-22 (figma-cards Follow-up 2, "Session navigation"): the name on one line, a menu button aligned right, a templated list of actions and sub-pages, settings first, saved to `session.jsonl`.

**It is a template the class declares.** The list is `Session.MENU`, so every session has the same menu, and a subclass adds its own entries:

```js
class Session extends Item
  static MENU = [
    { name: "settings",  title: "Settings",     icon: "settings",    page: true },        // a sub-page, routed at <session url>/settings/
    { name: "log",       title: "Open the log", icon: "description", action: "open_log" }, // calls page.open_log()
    { name: "copy-link", title: "Copy link",    icon: "link",        action: "copy_link" },
  ]
  static SETTINGS = [{ key, label, type: "text" | "select" | "checkbox", options? }, …]  // what the Settings page shows
  menu(url)        // MENU with each page entry's url filled in
  get settings     // every {"settings":{…}} line merged in order; a later line wins

class AISession extends Session   // static MENU = [...Session.MENU, { … }] to add an entry
```

**What it looks like** (headless, served worktree, 2026-10-22): [the open menu at 400 px](shots/menu-open-400.png), [at 1920](shots/menu-open-1920.png), [the Settings page at 400](shots/settings-400.png), [at 1920](shots/settings-1920.png).

## How it is drawn and saved

| Part | File | Job |
|---|---|---|
| the button and its list | `core/Session/SessionMenu.js` | a quiet button, and a [`ux/Popover`](/framework/ux/Popover/) list: a page entry is a link (so back and reload work), an action entry calls that method on the page |
| the button's place | `core/Page/Columns.js` | a page with a `head_tools()` method gets its controls at the right end of its column head, before the × |
| the Settings sub-page | `core/Session/SessionSettings.js` | a form drawn from `SETTINGS`; each change appends one `{"settings":{<key>:<value>}}` line to the session's `session.jsonl` through the dev socket (`FsFile.append`, `rpc:append`), and reading replays the file |
| the session page | `ai/AISession/AISessionDetail.js` | `head_tools()` draws the menu; `child("settings")` routes the sub-page; `open_log()` and `copy_link()` are the two actions |
| the line's shape | `.claude/hooks/jsonl-schema.mjs` | `settings` is a known verb in `session.jsonl`. The dev server reads this file when it starts, so a server started before it refuses the line until it restarts |

## Not built yet

- The settings are saved and shown, but nothing acts on them yet (the model and effort a resumed session uses, the "tell me when it finishes" notice).
- Other shapes the owner named (tabs, a drop-down, a sheet) wait for the Figma session menu; the template stays the same, only the drawing changes.
