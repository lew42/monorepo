# Which template draws which page

Every page under the Sessions tab is a class that extends `Page`. `page.js` only creates the first one. The detail page also prints its template's name under the session id. How the code is split: [classes](classes.md).

| URL | Template | What it shows |
|---|---|---|
| `/framework/ai/sessions/` | [`AISessionsPage`](../AISessionsPage.js) | The in-flight strip, the grid, the list of every session |
| `/framework/ai/sessions/<id>/` | [`AISessionDetail`](../AISessionDetail.js) | One session: cost, model, tokens, trace. Opens in the right-hand half. |
| `/framework/ai/sessions/doc/` | `AISessionsPage.docs_page()` | The priority list |
| `/framework/ai/sessions/readme/` | `AISessionsPage.docs_page()` | This module's readme |

Every session, whatever its data shape ([patterns](patterns.md)), opens in `AISessionDetail`, never the Inbox.
