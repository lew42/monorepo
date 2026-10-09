# Which template draws which page

Every page under the Sessions tab is drawn by one function in [`page.js`](../page.js). The detail page also prints its template's name under the session id.

| URL | Template | What it shows |
|---|---|---|
| `/framework/ai/sessions/` | the default export (`Page`) | The in-flight strip, the grid, the list of every session |
| `/framework/ai/sessions/<id>/` | `session_page()` | One session: cost, model, tokens, trace. Opens in the right-hand half. |
| `/framework/ai/sessions/doc/` | `docs_page()` | The priority list |
| `/framework/ai/sessions/readme/` | `docs_page()` | This module's readme |

Every session, whatever its data shape ([patterns](patterns.md)), opens in `session_page()`, never the Inbox.
