The nearest page that is the **thing being read or edited** — `nearest("document")`,
named. The second role, and the reason `nearest()` takes a parameter at all.

```js
new Page({ is: "document", body: "…", children: { Notes: …, Meta: … } });
this.document().body;
```

**Usage** — the [Refs demo](/framework/core/Page/overview/columns/refs/)'s Reader
column claims it; its Notes child finds the document 1 hop up and the topic 4 hops up
from the same call site. That pair is the whole argument for two roles: one page, two
different ancestors, neither of them "the parent".

**Necessity** — borderline on its own, and honest about it: one role would have done
for the demo. It is here because *topic* and *document* are the two nestings that
actually recur — a workspace containing a file, an inbox containing a message — and a
second role is what proves `nearest()` generalises rather than being `topic()` with
extra steps. A third role does not need a method; call `nearest("thing")`.

**Simplicity** — one line, and no relationship to the DOM `document`. Inside a method
body `document` is still the global; only `this.document()` is this.

⚠ **`findLast` is load-bearing here.** A document inside a document — a quoted reply,
an embedded draft — must resolve to the inner one. The record:
[`doc/roles.md`](/framework/core/Page/doc/roles/).
