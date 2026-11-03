`get length(){ return this.children.length; }` — a getter, not a stored count,
so it can never drift out of sync with the array underneath it. There is no
world where `list.length` disagrees with `[...list].length`.
