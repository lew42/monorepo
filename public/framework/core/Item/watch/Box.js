import Item from "../Item.js";
import List from "../../List/List.js";

// The demo's object: an Item that gives itself a List, the way Page and Task do (core/Item/readme.md,
// "Item itself has no list"). `fields` make `title` and `count` accessors over `data`.
export default class Box extends Item {
	static icon = "inventory_2";
	static fields = ["title", "count"];
	constructor(...args){
		super(...args);
		this.items = new List({ owner: this, name: "items", of: Box });
	}
}
Item.register(Box, "Box");
