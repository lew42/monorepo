The framework's constructor convention — `Object.assign(this, ...args)`. Same
line, same reasoning, as [`View.assign()`](/framework/core/View/api/assign/):
`...args` means no argument order to remember, and later args win, so a caller
can inject on top of whatever the config object already carries. Nothing
Draggable-specific to add.
