The one direction, twice — `undo` and `redo` are both `step()` with the two
stacks swapped. Pop the stack we came *from*, push the present onto the other
*before* restoring, so stepping back and forth never loses a state.

```js
step(from, to){
	if (!from.length) return false;
	to.push(this.read());
	this.restore(from.pop());
	return true;
}
```

## Order matters

`this.read()` runs before `this.restore()`. Reversed, `restore` would already
have replaced the live document by the time `read()` ran, and the state pushed
onto `to` would be a duplicate of what `from.pop()` is about to hand back.
