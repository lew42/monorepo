# A method saved as one call: `as_call` (D14)

The method declares itself by wrapping its body, so a caller never has to remember `act()`. Test: `node public/framework/core/Item/call.test.mjs`.

```js
sort_by(key){ return this.as_call("sort_by", [key], () => { /* the work */ }); }
```

- While the body runs, saving is **muted for this item and what sits under it** (`Store.mute`), and for the changes the call makes **in its ancestors** (a parent that completes because its last child did): they are the call's effect, and a replay makes them again. An unrelated item's write is still saved.
- When the body is done, **one** line is saved: `{"sort_by()": "title"}`. **Only the outermost call saves**: a call made inside the body just runs.
- **A replay saves nothing:** reading `{"sort_by()": "title"}` calls `sort_by("title")` (D13), the body runs, and `Store.replay_depth` keeps every store quiet. A sort replays to the same order.
- No change, no line. A body that throws saves no line and the error goes on to the caller.
- `act()` keeps working: `act("sort_by", "title")` saves its one verb line, and the `as_call` inside sees the mute and just runs.
- Name the call after the method, pass its arguments in `[]`. **Every argument list replays to the same arguments** (`Item.call_value` writes it, `Item.call_args` reads it, for the `name()` spelling and for the bare one the item tool uses):

  | arguments | the line's value |
  |---|---|
  | one (not undefined) | the argument as it is: `{"sort_by()": "title"}`, an object, an array, `null` |
  | none, or two or more | `{"$args": []}`, `{"$args": [1, 2]}` |
  | an `undefined` in the middle | `{"$args": ["a", null, "c"], "$undefined": [1]}` (JSON has no undefined; the listed places are put back) |
  | one object that has an `$args` key | wrapped: `{"$args": [{"$args": …}]}`, so it is never taken for the wrapper |

  Trailing `undefined` arguments are dropped: the method sees "no argument" and "undefined" the same way (only `arguments.length` differs). Test: `call.test.mjs`, "every argument list".

## Alternatives not taken

- **The value as the argument array** (`{"sort_by()": ["title"]}`, the brief's example). Replay would have to spread the array into `sort_by(...)`, but `order()` and `add()` take an array as their one argument, and the item tool strips the `()` mark (`unmark_delta`), after which a bare `sort_by: ["title"]` cannot be told from one array argument. So an array stays one argument and only the `$args` wrapper means "a list".
- **Save several arguments as a bare array and one `{}` for none** (the first version): replay called `pair([1, 2])` for `pair(1, 2)`, and `sort_by()` saved an empty line `{}` that replays to nothing; a zero-argument call replayed as `m({})`, which defeats a default parameter. Found by the review (finding 8).
- **Find `as_call` methods by reading their source** (to know which to spread): fragile, rejected.
- **Replay calls by default, changes never** (D14 option "calls"): old calls would run today's code. `as_call` is the opt-in per method; the default stays "save the changes".
- **A global flag like `Store.muted` for the whole run:** the bug fixed in [core-fixes.md](./core-fixes.md) (1b).
- **Save the line even when the body throws:** a replay would throw at the same place on every load.
