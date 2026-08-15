import Item from "/framework/core/Item/Item.js";

/* The palette. A block is an `Item` that knows what it looks like: `words` is the
   class string it wears — on this site a design IS a class string — and a leaf also
   carries `text`. Both live in `data`, so both serialize, undo and reload with
   everything else in the document. */
export class Block extends Item {

	constructor(...args){
		super(...args);
		this.data.words ??= this.words;
		if (this.text !== undefined) this.data.text ??= this.text;
	}

	// A leaf carries a word; a container carries blocks. The canvas asks once, and
	// only a container is given `$items` — so nothing can be dropped into a sentence.
	leaf(){ return this.data.text !== undefined; }
}

export class Section extends Block {}
export class Grid extends Block {}
export class Card extends Block {}
export class Text extends Block {}

// ⚠ On the prototype, not class fields: a field initializes AFTER `super()`, and the
// constructor above reads these inside it.
Section.prototype.words = "flex v gap pad";
Grid.prototype.words    = "grid gap auto pad";
Card.prototype.words    = "flex v gap pad surface";
Text.prototype.words    = "pad";
Text.prototype.text     = "Text";

// The palette, in order — and its keys are the wire names, so a rename is one edit.
export const BLOCKS = { Section, Grid, Card, Text };

// ⚠ Last line, and the reason the editor imports this file for its side effect: an
// unregistered type is an unimported one, and hydrates as a plain Item.
Object.entries(BLOCKS).forEach(([name, Class]) => Item.register(Class, name));
