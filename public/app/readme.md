# /app/: the auth demo UI

Not the site's own entry file: that is `public/app.js`; this folder has its own `app.js`.

A small installable app (PWA) in vanilla JS: Google sign-in, a feed, profile, an admin users list and live documents with one editor at a time. It talks to the Worker's `/api/*` ([worker/readme.md](../../worker/readme.md)); open it at http://monorepo.localhost/app/ (Servex starts the API on the first request, [Servex/doc/prefix-routes.md](../../Servex/doc/prefix-routes.md)) or on staging.

| File | What it is |
|---|---|
| [index.html](index.html), [style.css](style.css) | The shell and styles. Hash routes (`#/docs`), so static hosting needs no rewrites. |
| [app.js](app.js) | The views (login, dashboard, profile, admin users, install button, notification bell), built on the framework `View` class. |
| [docs.js](docs.js) | The live document page; reads and writes lines through [DocStore](../framework/core/Item/DocStore.js) over a WebSocket to the `Room` Durable Object. |
| [sw.js](sw.js), [manifest.webmanifest](manifest.webmanifest) | The service worker (scoped to `/app/`) and the install manifest. |
| [icons/](icons/) | App icons, made by `node worker/scripts/icons.mjs`. |

Tests: `node worker/scripts/ui.test.mjs <base-url>` and `node worker/scripts/live.test.mjs <base-url>` (headless browser, see the worker readme).
