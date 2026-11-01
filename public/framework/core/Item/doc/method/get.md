## A field, else a child

`get(key)` looks in three places, in order: an own property of the item, then its `data`, then a List it owns by that name. It never searches the lists for a member: a saved line names the list first, `{"items":{"milk":{"set":{…}}}}`, so replay is one `get()` per hop. A dotted key is a path: `get("items.milk")`. (An old line that names a member by its id alone still replays, through `set`; [architecture.md](../architecture.md), "Every hop names its list".)

**Watch out:** a getter declared on a class (not an own property, not in `data`) is not found by `get`; read it as a property. Task overrides `get` for its `tasks` for this reason.

There is no default-value argument: write `item.get("x") ?? fallback`.
