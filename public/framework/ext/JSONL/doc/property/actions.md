Every `{"action": …}` value, in file order — the sibling of `logs`, one array per verb. `ext/Timeline`'s `ai.js` maps this into a second kind of dot (`a.at`, `a.did`).

Same shape as `logs`: a class field, `push`-only, no source panel because the field lives on the instance, not the prototype.
