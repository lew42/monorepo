// A page-shaped stand-in for something that is not a Page (a layout catalog entry, a Template), so Library.Item can wrap it. Docs: doc/decisions.md §9.
export default class LibraryEntry {

	constructor({ title, icon, description, specimen, optimalWidth }){
		Object.assign(this, { title, icon, description, specimen, optimalWidth });
		this.children = new Map();
	}

	async child(){ return null; }
}
