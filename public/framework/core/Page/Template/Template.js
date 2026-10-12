import { Page } from "../Page.class.js";
import { div, span } from "../../View/View.js";
import { Property } from "../../Property/Property.js";

// A page that renders many times, each time from its own data. See ../doc/templates.md
export class Template extends Page {

	views = [];
	clones = [];
	source = null;

	// `data` fills this template's own map; the rest goes to Page as usual.
	constructor(data, ...args){
		super(...args);
		this.map = new Property.Map().assign(this.expand(data));
	}

	// The seam a subclass fills: draw the layout, asking show(name) for every value.
	draw(){}

	// Subclass hook: turn friendly data into flat map keys.
	expand(data){ return data; }

	// Always a NEW view, never the cached one.
	render(){
		const unbinds = [], before = this._drawing;
		this._drawing = { unbinds };
		let view;
		try { view = div.c(`template template--${this.name ?? "x"}`, () => this.draw()); }
		finally { this._drawing = before; }
		view.unbinds = unbinds;
		this.views.push(view);
		this.view = view;
		Page.views.set(view.el, this);
		this.emit("render", view);
		return view;
	}

	// A text span bound to the field; the unbind is filed on the view being drawn.
	show(name){
		const el = span();
		const prop = this.map.prop(name);
		if (!prop) return el;
		this._drawing?.unbinds.push(prop.bind(value => el.text(value ?? "")));
		return el;
	}

	// A new use of this layout: reads through to this one, writes only to itself.
	clone(data){
		const c = Object.create(this);
		c._on = {};
		c.views = [];
		c.clones = [];
		c.view = null;
		c.source = this;
		c.map = this.map.clone(this.expand(data));
		this.clones.push(c);
		return c;
	}

	// set({name: v}) or set(name, v); a bound value updates its spans, anything else redraws.
	set(a, b){
		const delta = typeof a === "string" ? { [a]: b } : a;
		for (const [name, value] of Object.entries(delta ?? {})){
			const how = this.map.set(name, value);
			if (how !== "prop") this.refresh();
			if (how === "plain") this.clones.forEach(c => c.inherits(name) && c.refresh());
		}
		return this;
	}

	unset(name){
		if (this.map.unset(name)) this.refresh();
		return this;
	}

	inherits(name){ return !this.map.has_own(name); }

	get(name){ return this.map.get(name); }

	// Redraw every view in place.
	refresh(){
		this.views.slice().forEach(old => {
			const was = this.views.indexOf(old);
			const view = this.render();
			this.views.pop();
			this.views[was] = view;
			old.el.replaceWith(view.el);
			this.release(old);
		});
		return this;
	}

	release(view){
		view.unbinds?.splice(0).forEach(off => off());
		Page.views.delete(view.el);
	}

	// Remove one view and its listeners.
	drop(view){
		const at = this.views.indexOf(view);
		if (at < 0) return this;
		this.views.splice(at, 1);
		this.release(view);
		view.el.remove();
		if (this.view === view) this.view = this.views.at(-1) ?? null;
		return this;
	}

	// Listeners on every Property this template can see.
	listeners(name){ return this.map.listeners(name); }
}

export default Template;
