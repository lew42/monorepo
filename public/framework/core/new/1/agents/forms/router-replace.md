# `Router.replace(url)` — copy-ready diff

**For the url seat's combined `Router` change.** One row in that set, not a standalone
proposal. Filed by the forms seat (Registrar).

## The failing case

Post-submit redirect. Every one of them wants this, and there is no way to say it today.

```
land on /columns/, navigate to /forms/submit/, fill the form, submit:

go()      -> /forms/submit/done/   history.length 3 -> 4   Back: /forms/submit/
replace   -> /forms/submit/done/   history.length 3 -> 3   Back: /columns/
```

Measured on `/forms/submit/`, Playwright 1.62 / Chromium / 1400x800. The `go()` row
is the bug: **Back returns to the filled form**, which then offers to submit work that
has already been submitted. `Router` has exactly one history call — `pushState`, in
`go()` — and nothing else in the class touches `history`.

## The diff

```js
// Router.js — replaces the current go()

go(url){ return this.navigate(url, "pushState"); }
replace(url){ return this.navigate(url, "replaceState"); }

/* Load first, push second: a failed navigation leaves no history entry.
 * `how` is a History method name, so this adds no vocabulary — pushState and
 * replaceState are the two names the platform already has. */
async navigate(url, how){
    if (await this.load(url)){
        history[how]({}, "", url);
        console.log(`  ↳ history.${how}("${url}")`);
    } else {
        console.log(`  ↳ load failed — handing "${url}" to the browser`);
        location.assign(url);
    }
}
```

Two lines added, one moved. `go()` keeps its name, its signature and its meaning, so
`Page.go()` and every existing caller are untouched.

## The test

```js
// at /forms/submit/, with /columns/ as the previous entry
const before = history.length;
await post(data);
await router.replace("/forms/submit/done/");

assert(location.pathname === "/forms/submit/done/");
assert(history.length === before);        // no new entry
// press Back -> /columns/, NOT /forms/submit/
```

The page `/forms/submit/` runs both halves live today, with `replaceState` inlined at
the call site — which is exactly the duplication this diff removes.

## Why not an option

```
go(url, { replace: true })     an option on the hot path, forever
go(url, "replaceState")        a string that must be spelled exactly
router.replace(url)            a name
```

An option is API surface forever and every reader of `go()` then has to know what the
second argument does. Two named methods cost one line and nothing to remember.

## Coordination notes for the url seat

- **`navigate()` is the seam the other rows want too.** The async seat's query-string
  fix (`this.go(link.pathname + link.search)`) is in `click()`, upstream of this; the
  canonical-push and hash-scroll rows land inside `navigate()`, where there is now one
  place that writes history instead of one place that pushes.
- **Ordering:** if a generation token lands for Open #4 (the `router.active` write
  hazard), it belongs in `navigate()` too — `load()` and the history write sit on
  either side of the same `await`, so one guard covers both.
- **No interaction with the forms section's verdict.** This is not a navigation guard
  and does not reopen that question; `replace()` refuses nothing.
