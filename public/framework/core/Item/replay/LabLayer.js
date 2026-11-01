import Item from "../Item.js";
import LabTape from "./LabTape.js";

// A plain Item with three fields and four verbs: show, hide, toggle and move.
export default class LabLayer extends Item {

	static Store = LabTape.Store;
	static fields = ["visible", "x", "y"];

	show(){ return this.set({ visible: true }); }
	hide(){ return this.set({ visible: false }); }
	toggle(){ return this.set({ visible: !this.visible }); }
	move({ dx = 0, dy = 0 } = {}){ return this.set({ x: this.x + dx, y: this.y + dy }); }
}
Item.register(LabLayer, "LabLayer");
