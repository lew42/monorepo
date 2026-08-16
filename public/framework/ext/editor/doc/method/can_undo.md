`this.past.length > 0`. Read by the editor's `marks()` to disable/enable the undo
button and is the only thing that decides it — nothing checks a separate "dirty"
flag. Cheap enough to call on every redraw.
