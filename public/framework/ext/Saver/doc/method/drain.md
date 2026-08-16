The entire queue, in one loop. `save()` starts it once and then only ever reads
its result; every subsequent `save()` while it runs just replaces `pending`.

```js
while (this.pending !== undefined){
    const item = this.pending;
    this.pending = undefined;
    wrote = await this.write(item);
}
```

⚠ **The re-read of `this.pending` after each `await` is the whole mechanism.**
Between the `await` starting and settling, any number of `save()` calls can
overwrite `this.pending` — the loop does not know or care how many; it only
knows whether the slot is `undefined` (nothing new arrived) or not (one more
pass, with whatever is there **now**, not what was there when this pass began).
That is how fifty saves during one write become exactly two writes: the one
already in flight, and one more for everything that landed while it ran.

**Why `undefined` and not a boolean flag** — see
[`pending`](/framework/ext/Saver/api/pending/): `undefined` is a sentinel a real
saved item (which could legitimately be `null`, `0`, or any falsy JSON value)
can never collide with.

**Never call directly.** It is public only because everything in this module is
`assign`-based and nothing is truly private; `save()` is the entry point.
