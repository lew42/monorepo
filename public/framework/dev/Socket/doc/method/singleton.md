## Usage

Five call sites now, all asking for the same instance:

- `public/app.js:25` — `socket: Socket.singleton()`, inside the `new App({…})`. The one that boots it.
- `ext/Ask/Ask.js` — three call sites, gating and driving the dev-only browser→CLI bridge.
- `ext/Saver/FileSaver.js` — `write()` and `delete()`, each grabbing the instance to check `disabled` and send.
- `ext/DesignTool/audit/twin.js` — `accept()`, queuing an accepted layout fix.

Every one of them gets the connection `public/app.js` already opened —
that's the point of a singleton, and why the count above doesn't change the
"Necessity" argument below.

## Necessity

Essential. One document wants **one** connection: a second instance means a
second subscription on the server's socket list
(`Server/plugins/SocketServer/LiveReload.js:32` loops over every socket) and
therefore two `reload` frames per save — a double reload that races itself.

A static, rather than a module-level `const socket = new Socket()`, so that
**importing this module opens nothing**. `public/app.js` is the edge that
connects, visibly, on a line you can delete. That matters more here than
elsewhere: a module whose import has a network side effect is exactly the black
magic the house rules forbid.

The constructor stays public. Building a `new Socket({ … })` directly is the
right move in a test or a second document, and nothing about the class assumes
it is alone.

## Simplicity

Right-sized. `this._instance` on `this`, not on `Socket`, so a subclass gets its
own singleton rather than inheriting the base's — which is free and correct, and
would be a real surprise the other way round.

The one wart: `_instance` is the only underscore-prefixed name in the framework.
Nothing reads it and nothing should; it is not on the audit's delete list only
because renaming it would be churn.
