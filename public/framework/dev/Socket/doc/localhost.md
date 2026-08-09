# The gate is inside the socket

```js
if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost"))
    this.connect();
else { this.disabled = true; this.ready.resolve(); }
```

`Socket.js:39`. Four lines, and they are the reason `public/app.js:25` can read

```js
socket: Socket.singleton(),
```

with no branch around it.

## The question

Production here is **pure static hosting** — Cloudflare Workers static assets,
no origin process. Nothing in `public/` may depend on server-side logic at
runtime. A dev socket therefore has to be inert off localhost. Where does the
check that makes it inert live?

| option | why not |
|---|---|
| at the call site — `if (dev) socket: Socket.singleton()` | every adopting site writes it, and each writes it differently. The day one gets it wrong, a visitor's tab retries a WebSocket forever |
| a build flag | there is no build step, by constitution |
| an `enabled:` option on the constructor | an option is API surface forever, and the default would have to be "on", which is the wrong way round for a thing that must not ship |
| **inside `initialize()`** | ✓ |

## The verdict

**Inside the class.** The call site becomes unconditional, which means it cannot
be conditional *wrongly*. `disabled` then guards all four entry points —
`connect`, `reconnect`, `send`, `request` — so no consumer needs a second check
either.

`ready.resolve()` on the disabled branch is the part that is easy to leave out
and impossible to notice: `send()` awaits `ready`, so a permanently pending
promise would park every caller forever rather than no-oping. "Disabled" has to
mean *stop waiting*, not *wait quietly*.

## What this forbids

Widening the gate is a **production change**, whatever it is dressed as. A query
parameter, an env token, a `?dev=1` — each of them puts a live WebSocket attempt
on a static host, for anyone who knows the string.

The `.localhost` suffix is the only extension that has been made, and it is
free: `myapp.localhost` resolves to the loopback in every modern browser, so it
adds no reachable host that was not already the machine you are sitting at.

`CLAUDE.md` lists this as a hard constraint, not a preference. If a future
feature genuinely needs a socket in production, it is a different class with a
different name — not a wider test here.
