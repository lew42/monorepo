`[...this.children]` — a **bare array**, not `{ children: [...] }`. That is
what makes `Item.toJSON()`'s `json.items = this.items.toJSON()` produce
`"items": [ … ]` with no wrapper key, and lets `JSON.stringify` recurse into
each child's own `toJSON()` with no custom logic at either call site.

The spread copies the array rather than returning `this.children` directly —
so a caller holding the JSON result and mutating it can never accidentally
mutate the live list.
