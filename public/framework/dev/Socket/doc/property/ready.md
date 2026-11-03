A promise that settles when the socket is usable — **or when it has been
decided that there will never be one.**

```js
this.ready = promise();   // Socket.js:35 — a promise with .resolve attached
```

## Usage

- `Socket.js:43` — resolved immediately on the disabled branch, so off localhost
  every await returns at once.
- `Socket.js:67` — resolved by `open()`, on a real connection.
- `Socket.js:78` — **replaced** by `reconnect()`, but only if the old one had
  resolved.
- `Socket.js:105` — awaited by `send()`, which is what parks a send during a
  server restart instead of throwing.

## Necessity

Essential, and the second bullet is the design. `ready` does not mean
*"connected"* — `connected` means that. It means **"stop waiting"**, and on a
static host the honest answer is *stop waiting, there is nothing here*. That is
why `send()` needs no branch of its own beyond the `disabled` guard.

## Simplicity

Right-sized. Two rules govern it, and both are traps that never throw:

**Never reject it.** A rejection makes every later `send()` throw for the life
of the page, and a dev-server restart is routine, not exceptional.

**Only replace it once it has resolved.** Swapping a still-pending promise
strands everything already awaiting the old one — a hang with an empty console.
`connected` is the test, because it is true exactly when this promise has been
resolved.

The `promise()` helper at the top of `Socket.js` is a hand-rolled deferred.
`Promise.withResolvers()` is the standard spelling and replaces it outright the
day the browser floor allows it; noted in the readme.
