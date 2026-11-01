import Item from "../Item.js";
import LabTape from "./LabTape.js";

// A plain Item with one field and one verb: a like button.
export default class LabCounter extends Item {

	static Store = LabTape.Store;
	static fields = ["count"];

	increment(){ return this.set({ count: (this.count ?? 0) + 1 }); }
}
Item.register(LabCounter, "LabCounter");
