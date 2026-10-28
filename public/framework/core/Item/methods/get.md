## A field, else a child

`get(key)` looks in three places, in order: an own property of the item, then its `data`, then a member with that id in any List it owns. The last one is what lets a saved line like `{"milk":{"set":{…}}}` find `milk` on replay.

**Watch out:** a getter declared on a class (not an own property, not in `data`) is not found by `get`; read it as a property. Task overrides `get` for its `tasks` for this reason.
