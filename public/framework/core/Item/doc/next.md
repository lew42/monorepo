# Next

Done (2026-10-28, the data backbone): `item.set("prop", anotherItem)` adopts the child (`Item.adopt_slot`; [architecture.md](architecture.md#items-save-through-their-parent)); the known-gap assertions in `Item.test.mjs` are flipped.

- The owner (2026-10-20 18:50): the JSONL store, the dated indexes and the query should be one system, probably in core/Item, with JSONL as one swappable store. Essence: [ai/doc/owner-2026-10-20-who-makes-tasks.md](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) section 15. The plan, checked against the prompt before any code: [store-index-query-plan.md](store-index-query-plan.md) (classes `Dated` + `DatedFiles`, six slices).
- Not planned yet (the owner: "not really that important"): subscribing to a parent item so its children update with it, versus subscribing to one child alone.
