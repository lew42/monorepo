# Selecting an element, and asking about it

![A paragraph selected on the page, and its properties in the drawer's Element tab](/framework/ext/drawer/doc/select.png)

**While the drawer is open, you can click any content on the page to select it** — a paragraph, a heading, a list item, a question, a card. Hovering brightens it a little; a click keeps it selected, one at a time, and the drawer's **Element** tab shows what it is and where it lives. Escape, or a click on empty page, clears it.

**"💬 Ask about this"** puts the element on the AI tab's input as a chip, *this paragraph ✕*, the way an editor shows the open file in its chat box. Every message you send carries the chips as context, until you remove them with ✕.

## What stays the same

- **With the drawer shut, nothing changes.** A click on a paragraph does nothing, text selects as usual, and links work.
- Links, buttons and inputs always keep their own clicks.
- Nothing inside the drawer, the dev bar, the site's navigation or the page's tab bar is ever selectable.
- A drag that selects text is reading, not choosing, so it selects no element.
- While another module owns the drawer (ext/layout's panel), its own clicks win.

## What the Element tab shows

**What:** the tag, the element's own classes and its first words. **Where:** the page, the page file that drew it, the nearest readme and the module that owns its class name. The "where" half is [`ext/Ask`](/framework/ext/Ask/)'s own `context()`, the same gathering its *pick an element* button does.

## What the message carries

Each chip is `{kind, label, text, selector}`, the shape agreed in the page-pair interface (`framework/ai/2026-09-25/recursive-pairs/interface.md`):

```json
{ "page": "/framework/ext/drawer/", "text": "Is this sentence right?", "from": "owner",
  "context": [{ "kind": "p", "label": "this paragraph", "text": "It pushes rather than covers …",
                "selector": ".page--intro > p:nth-of-type(4)" }] }
```

The page's own assistant answers; there is no agent per element. `selector` finds the element again (`document.querySelector(selector)`), stepping up from it to its page.

## Watch out

- **The hover and selection are data attributes** (`data-drawer-hover`, `data-drawer-selected`), not classes. The element's classes are what the Element tab reports and what ext/Ask maps to a module; a `drawer-` class would name ext/drawer as the owner of everything you select.
- **`lighten` is invisible on white.** Hover is one lighten rung. Selection adds a hairline ring so it still shows on a white card.
- What counts as content is one list, `DrawerSelect.CONTENT` in `select.js`. Add `data-selectable` to anything else that should count.

Suggestions are this chat for now; there is no suggest-an-edit UI yet.
