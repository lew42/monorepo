`this.data[key]`. The read half of the pair; see [`set`](set.md) for the write
half and why the two are not symmetric.

There is no default-value argument (`get(key, fallback)`) — a missing key reads
`undefined` like any object property, and a call site that wants a default
writes `item.get("x") ?? fallback` same as it would for a plain object.
