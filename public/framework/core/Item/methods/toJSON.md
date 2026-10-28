## The saved shape

`{ "type": "Box", "id": "shop", "data": { … }, "items": [ … ] }`: the type name from `register`, the id, every field under `data`, and each List the item owns as an array under its own name.

`parent`, `store` and `views` are never written, so a saved item cannot point back up. `Item.hydrate` reads this shape back and restores each `parent` by adding the members to their lists.
