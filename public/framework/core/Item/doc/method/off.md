Removes every listener `=== fn` from `event`'s list. Unsubscribing a function
that isn't listening, or from an event nobody ever subscribed to, is a silent
no-op — `this._on[event]` is reassigned to `(this._on[event] ?? []).filter(...)`
either way.

There is no "remove all listeners for this event" form and no "remove every
listener on this Item" form — both would be one line to add if a caller ever
needed one; nothing here does.
