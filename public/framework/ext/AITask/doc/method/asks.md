Builds the **Asks** tab — one preview card per thing the owner asked for, and
the in-place details region under it. The work is in
`asks.js` (its notes are on the [Files tab](/framework/ext/AITask/files/)); this method only hands it
this task's own dir url and the callback that jumps to the Session tab.

Called only when the manifest carries `asks` (the `ask` verb,
[`ext/JSONL`](/framework/ext/JSONL/)) — otherwise the tab does not exist and
Report opens by default, as it always did. Design record:
[asks](/framework/ext/AITask/doc/asks/).
