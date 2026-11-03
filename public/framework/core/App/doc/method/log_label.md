```js
log_label(){ return "app"; }
```

## Usage

**None.** Zero callers, in `framework/` and in every sandbox.

`Page.log_label()` is called three times (`Page.class.js:134, 137, 168`), all
inside `container()` and its arrangement warning. This one — the `App` copy — is
called nowhere. The nearest thing is `Page.container()`, which logs the string
`"app.$pages"` as a **literal** rather than asking the app what it is called
(`Page.class.js:139`).

## Necessity

**Dead, or an unfinished convention.** Two honest readings:

- It exists so `App` satisfies the same informal interface as `Page`, and one day
  something will log a chain of mixed nodes. Nothing does.
- It was written alongside `Page.log_label()` and never wired up.

The name earns its length for a reason that still stands — `log_label()` exists
precisely so `label` can stay the human-facing one — but that argument is about
`Page`.

## Simplicity

The code is right. The status is not: this is one line of API that has never been
called and is not covered by any test, which is the definition of a claim nothing
can check.

Proposal (readme): either delete it, or make `Page.container()` use it —
`this.mounts_in(this.app.$pages, this.app.log_label() + ".$pages")` — which turns
one hardcoded string into the convention it was written for. Pick one; leaving it
in this state is the only wrong answer.
