# Inbox

![Two notes in the page's inbox, at the top of the AI tab: who left each (a mastermind wears the M), how long ago, Clear](/framework/ext/drawer/doc/inbox.png)

**Every page has an inbox.** Anyone can leave a note on any page: an agent, or you. The note shows at the top of that page's AI tab until someone clears it. While notes are open, the tab's label counts them: **AI · 2**.

**It is for coordination, never chat.** If a mastermind coordinates the page's module, a note goes straight to that mastermind, and the inbox names it at the top ("Coordinated by …"). The page inbox is the fallback, for when nobody does.

![A coordinated module: the note went straight to its mastermind](/framework/ext/drawer/doc/inbox-coordinated.png)

## What a row shows

One row per open note, newest first: **who left it (a mastermind wears the M logo; you are "you") · how long ago · Clear**, with the note itself underneath. With no open notes and no coordinator, nothing is drawn at all. After you leave a note, one line says where it went (or why it wasn't saved).

## Leaving a note

- **You:** the **Leave a note** button in the AI tab's head row. Type, then Enter (Escape puts it away).
- **An agent:** Servex's `drop(path, text)` tool. `clear(path, id)` clears one, and `inbox(path)` lists them.
- **A page's own form:** `POST /api/inbox/drop` with `{path, text}`.

All three write through Servex, the only writer. The tools, the routing and the file: `Servex/doc/inbox.md` in the repo.

## Where the notes live

In the page's own AI log, `<page>/ai/log.jsonl`, one line each. A note is `{"inbox": {id, from, text, at}}`, and clearing it appends `{"cleared": {id, by, at}}`. Nothing is rewritten: a note is open until a `cleared` line names it. The notes never go in `page.jsonl`, which is the page's content.

## Watch out

- The drawer reads the notes through Servex (`GET /api/inbox?path=`), so **off the dev machine the inbox isn't drawn**. That is on purpose: a static-file fetch would log a 404 on every page without notes.
- A page with no folder of its own (a card, a query view) has an empty inbox, not an error.
- Only the desktop AI tab shows the inbox. The phone's ✦ sheet (`rail.js`) does not, yet.
- The code: [`inbox.js`](../inbox.js), wired with one line in [`tabs/ai.js`](../tabs/ai.js); the count is `label_ai()` in [`tabs.js`](../tabs.js).
