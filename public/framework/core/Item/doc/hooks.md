# Property hooks: `set_<key>(value)` (D17)

A class that defines `set_<key>(value)` has `set()` call it **instead of the default store** for that key. Test: `node public/framework/core/Item/hooks.test.mjs`.

```js
class Cart extends Item {
	set_qty(value){ this.put("qty", value); this.total = value * 2; }   // store it, and keep a derived cache
	set_hover(value){ this.hovered = value; }                            // or keep a volatile value and save nothing
}
cart.set({ qty: 3 });   // runs the hook, saves {"set":{"qty":3}}
cart.set_qty(4);        // the same: a direct call saves too
```

- The hook stores with `this.put(key, value)`. When the stored value differs afterwards, the change is announced as `set()` announces it: the `delta` (the save) first, then `change` (the views). A hook that stores nothing saves nothing.
- It is called as `set_qty(value, old)`; `old` is the value before.
- **Same hook, every way in:** a live `set()`, a direct call, a line another tab wrote (`Store.read`), a replayed line (`Item.replay`, line 1's own fields included) and the fields a Task or Session reads itself (`Item.take`). A replay saves nothing (`Store.replay_depth`), so only the hook's own work shows.
- **How a direct call saves.** The first time a class is instantiated, `wrap_hooks` (`Item.js`) wraps each `set_*` method on its prototype chain (except `set_one`) so both paths run `Item.run_hook`. A hook that sets its own key again is warned about and stored as it is; it never loops.
- The constructor does not call hooks (a subclass is not built yet); `Item.open` / `Item.replay` do, for line 1's fields.

**Caveat.** Any existing `set_<name>` method on an Item subclass becomes a hook for the key `<name>`. Found today: `AISession.set_configured` and `AISessionsPage.set_scope/set_from/set_to` (UI methods, not data keys; a `set({scope})` would now call them, and nothing does). The grep: `grep -rnE "^\s*set_[a-z_]+\(" public --include=*.js`.

## Alternatives not taken

- **`set()` saves first, then calls the hook** (D17's recommended text: "the hook can never skip saving"). The owner's brief puts the store inside the hook so a direct call also saves and a hook can keep a value volatile. A hook that forgets `put` stores nothing; that is the price.
- **A name that reads as a reaction** (`on_state`, `state_changed`): D17 asked the owner; the brief kept `set_<key>`.
- **Events only** (`item.on("change")`, today): still there for views. Order depends on who listened first and a stack trace shows the emitter, not the reason.
- **Magic JavaScript setters** (`set state(v)`): refused by D17; `set()` stays the one door.
- **Fold the log before replay** so a hook runs once per key: not built. A replay of 500 lines runs the hook 500 times until snapshots exist (Wave 2).
