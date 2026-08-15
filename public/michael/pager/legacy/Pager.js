import { View } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "Pager.css");

export class Pager extends View {

	show(page){
		this.empty();
		this.append(page); // Page → render(); View → appended directly
		this.active = page;
		return this;
	}

	// `this.app` is absent for a standalone `new Pager()` — hence the optional chain.
	leaf(){
		const page = this.app?.page;
		return page?.chain?.includes(this.root) ? page : this.root;
	}
}

export default Pager;
