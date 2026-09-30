# Drill in: open a chat card as its own small page

Tap a card in the chat, then its **Open ⤢** button. The chat becomes a small shell: a **← Back** button, the path above you, the card's title, and what is inside the card, each as its own card. A card inside it that holds more opens one level deeper. Try it: [/framework/ext/Chat/panel/](/framework/ext/Chat/panel/), the "Drill in" demo.

![A refined card opened at 1920](/framework/ai/2026-09-29/audio/next-drill-in/shots/1920-2-level1.png)

## What a card holds

| The card | What opens inside it |
|---|---|
| A run of your messages merged into one bubble | each message |
| A refined bubble | its sections; each section opens to the raw words it came from |
| A card placed in the chat (`place`, e.g. a Decision) | that card, full width |
| A reply with a heading | its body |

A card with nothing inside gets no Open button. Built by `Chat.js`'s `card_of()`, drawn by `Drill.js`'s `ChatDrill`.

## Its address

Each level is the url's hash: `#chat=<session>~<at>/<key>…`. `<session>` names the chat (a `ChatPanel`'s `session`, else its `watch` url, else `panel-1`, `panel-2`… in build order); `<at>` is the card's first line's own `at`; a deeper key is a section (`s0`, `s1`…) or a piece's `at`. Opening a level adds a history entry, so reload lands on the same level, and Back, Esc or the browser's back button goes up one. Only the hash is touched: the ✦ sheet's own `?sheet=` stays as it is.

## A card is a tiny page

- **How it maps to the page system:** a card is a page with no directory: it is addressed by its session plus its `at`, rendered by `ChatDrill` inside the page you are on, and has no `page.js` of its own.
- **When it graduates to a real directory:** once it has something that must outlive the chat (its own children added later, files, comments), it gets a `page.js` under its session's card directory and a line in that parent's `children:`.

## Where the shell goes

- **Phone (the ✦ sheet) and any plain page:** the whole screen, over the sheet.
- **Desktop drawer's AI tab:** over the drawer, at its full height, so the page you asked about stays beside it.
- **Not chosen:** the page's main area on desktop. The chat you drilled from would disappear from beside the page.

The rule is one method, `ChatDrill.mount_point()`.

## Turning it off

`new ChatPanel({ drill: false })` is v1: no Open button, nothing else changes.

## Left open

- A card that changes while it is open (a new message merges into it) is not redrawn until you move a level.
- The `panel-N` fallback name depends on build order; a host that rebuilds its panel with no `session` or `watch` can land a reload on the wrong chat. The ✦ sheet and the drawer each have one panel, so both are fine today.
