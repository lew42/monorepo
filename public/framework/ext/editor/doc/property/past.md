An array of snapshots — whatever `read()` returned, oldest first — the undo
stack. `[]` in the constructor; nothing outside `act()` and `step()` touches it.

There is no cap: a long editing session keeps every snapshot (whole serialized
documents, via `JSON.stringify`) for the life of the page. Fine at prototype
scale, worth a limit before this is trusted with a large document.
