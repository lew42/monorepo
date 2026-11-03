`this.children.indexOf(child)` — a pass-through. No framework code calls this
directly today (`append`, `insert_before` and `remove` all call
`this.children.indexOf` inline rather than `this.index_of`); it exists as
public vocabulary for a caller that wants a numeric position without reaching
past the class into `.children`.
