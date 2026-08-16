The other end of [`live()`](/framework/ext/JSONL/api/live/): stop reading this
file. Drops this instance from `live.js`'s registry and — only when it was the
**last** reader of that path — sends `{"method": "unsubscribe", "args": [url]}`, so
the dev server drops the subscription too. Returns `this`.

```js /framework/ext/AITask/AITask.js
await t.live(() => this.$live && this.refresh(t));
if (t.loaded) return t;

const old = await this.legacy();
if (old) t.unsubscribe();
```

One caller today, and it is the case the method exists for: `ext/AITask`'s
[`session()`](/framework/ext/AITask/api/session/) probes `<task>/task.jsonl` blind,
and a task from before the log format has no such file. A missing file is answered
with an empty batch and a **standing** subscription — right for a task dir whose
log is about to be written, wrong forever for a legacy task that will never have
one.

**⚠ Only unsubscribe when the file is never going to exist.** The legacy path knows
that because it found a `session.json` instead; a probe that came back empty with
nothing else to show keeps its stream, because that is a just-scaffolded task and
the standing subscription is what makes its log appear without a reload.

**⚠ It does not stop the OTHER readers of the same path.** The board card and an
open task page are two instances on one url, and the registry is a Set per path —
dropping one leaves the socket subscription in place for the rest, by design.

Off localhost there is no socket, nothing was ever registered, and the call is a
no-op. Navigation still does not unsubscribe anything — see the Deferred list in
[readme.md](/framework/ext/JSONL/).
