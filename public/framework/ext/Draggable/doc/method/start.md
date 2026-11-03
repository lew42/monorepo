Blank on purpose — the first of four stub methods a subclass fills in
(`start`, `move`, `drop`, `restore`). Called once per gesture, from `grab()`,
before anything has moved. `Sortable.start()` builds the ghost and placeholder
here; the [Draggable alone](/framework/ext/Draggable/overview/draggable-alone/)
demo has nothing to do at this step at all.
