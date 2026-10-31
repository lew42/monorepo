# A method saved as one call: `as_call` (D14)

The method declares itself by wrapping its body, so a caller never has to remember `act()`. Test: `node public/framework/core/Item/call.test.mjs`.

```js
sort_by(key){ return this.as_call("sort_by", [key], () => { /* the work */ }); }
```

- While the body runs, saving is **muted for this item and what sits under it** (`Store.mute`); an unrelated item's write is still saved.
- When the body is done, **one** line is saved: `{"sort_by()": "title"}`. **Only the outermost call saves**: a call made inside the body just runs.
- **A replay saves nothing:** reading `{"sort_by()": "title"}` calls `sort_by("title")` (D13), the body runs, and `Store.replay_depth` keeps every store quiet. A sort replays to the same order.
- No change, no line. A body that throws saves no line and the error goes on to the caller.
- `act()` keeps working: `act("sort_by", "title")` saves its one verb line, and the `as_call` inside sees the mute and just runs.
- Name the call after the method, pass its arguments in `[]`: one argument is the line's value as it is, none is `{}`, several are saved as the array (give a method that needs several **one object**: D13 rule 2).

## Alternatives not taken

- **The value as the argument array** (`{"sort_by()": ["title"]}`, the brief's example). Replay would have to spread the array into `sort_by(...)`, but `order()` and `add()` take an array as their one argument, and the item tool strips the `()` mark (`unmark_delta`), after which a bare `sort_by: ["title"]` cannot be told from one array argument. The single-argument value reads the same bare or marked.
- **Find `as_call` methods by reading their source** (to know which to spread): fragile, rejected.
- **Replay calls by default, changes never** (D14 option "calls"): old calls would run today's code. `as_call` is the opt-in per method; the default stays "save the changes".
- **A global flag like `Store.muted` for the whole run:** the bug fixed in [core-fixes.md](./core-fixes.md) (1b).
- **Save the line even when the body throws:** a replay would throw at the same place on every load.
