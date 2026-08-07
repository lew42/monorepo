import is from "../../util/is/is.js";

/* A DOM element with a chainable API, and one idea: CAPTURING. `View.captor` is the
 * view currently collecting children, so an element factory appends itself to it —
 * which is what makes nested calls build nested DOM with no builder object.
 *
 * ⚠ **Capturing is synchronous.** `append_fn` restores the previous captor the
 * instant your function RETURNS, which for an `async` function is its first `await`.
 * Nothing throws; the elements simply appear somewhere else. See core/View/readme.md.
 *
 * `tag` and `capture` are on the prototype (bottom of the file), not class fields —
 * a field would stop a subclass declaring `tag = "other"`.
 */
export default class View {

	constructor(...args){
		this.assign(...args);
		this.prerender();
		this.initialize();
	}

	initialize(){
		this.append(this.render);
	}

	render(){}

	prerender(){
		this.el = this.el || document.createElement(this.tag || "div");
		this.capture && View.captor && View.captor.append(this);
		this.classify && this.classify();
	}

	// add class
	ac(...args){
		for (const arg of args){
			// filter(Boolean): a trailing or doubled space yields an empty token, and
			// classList.add("") THROWS — so `.ac("card " + maybe)` was a live landmine
			arg && arg.split(" ").filter(Boolean).forEach(cls => this.el.classList.add(cls));
		}
		return this;
	}

	// remove class
	rc(...args){
		for (const arg of args){
			arg && arg.split(" ").filter(Boolean).forEach(cls => this.el.classList.remove(cls));
		}
		return this;
	}

	/* The class-name chain as kebab-case CSS classes: `class FooBarView extends View`
	 * renders `div.foo-bar`, so a subclass is styleable with nothing declared.
	 *
	 * ⚠ This runs inside `super()`, BEFORE a subclass's class fields initialize — so a
	 * `classes = "docs"` field arrives too late to be seen here. Name the subclass
	 * instead; that is what this reads. */
	classify(){
		this.ac(this.classes);

		var cls = this.constructor;

		while (cls !== View){
			this.ac(cls.name.replace("View", "").split(/(?=[A-Z])/).join("-").toLowerCase());
			cls = Object.getPrototypeOf(cls);
		}

		if (this.name)
			this.ac(this.name);
	}

	append(...args){
		for (const arg of args){
			if (arg && arg.el){
				arg.parent = this;
				this.el.appendChild(arg.el);
			} else if (is.fn(arg?.render)){
				this.append_fn(() => arg.render(this));
			} else if (is.pojo(arg)){
				this.append_pojo(arg);
			} else if (is.arr(arg)){
				this.append.apply(this, arg);
			} else if (is.fn(arg)){
				this.append_fn(arg);
			} else if (is.promise(arg)){
				this.append_promise(arg);
			} else {
				// DOM, str, undefined, null, etc
				this.el.append(arg);
			}
		}
		return this;
	}

	prepend(...args){
		for (const arg of args){
			if (arg && arg.el){
				arg.parent = this;
				this.el.prepend(arg.el);
			} else if (is.pojo(arg)){
				this.prepend_pojo(arg);
			} else if (is.obj(arg)){
				console.error("maybe not");
			} else if (is.arr(arg)){
				this.prepend.apply(this, arg);
			} else if (is.fn(arg)){
				this.prepend_fn(arg); // this will be tricky, this fn does not exist right now
			} else {
				// DOM, str, undefined, null, etc
				this.el.prepend(arg);
			}
		}
		return this;
	}

	prepend_to(view){
		if (is.dom(view)){
			view.prepend(this.el);
		} else {
			view.prepend(this);
		}
		return this;
	}

	append_fn(fn){
		View.set_captor(this);
		const return_value = fn.call(this, this);
		View.restore_captor();

		if (is.def(return_value))
			this.append(return_value);

		return this;
	}

	async append_promise(promise){
		const return_value = await promise;

		if (is.def(return_value))
			this.append(return_value);

		return this;
	}

	append_pojo(pojo){
		for (const prop in pojo){
			this.append_prop(prop, pojo[prop]);
		}
		
		return this;
	}

	append_prop(prop, value){
		var view;
		if (value && value.el){
			view = value;
		} else {
			view = (new View({ tag: this.tag })).append(value);
		}

		view.ac(prop).append_to(this);

		if (!this[prop]){
			this[prop] = view;
		} else {
			console.warn(`.${prop} property is already taken`);
		}

		return this;
	}

	append_to(view){
		if (is.dom(view)){
			view.appendChild(this.el);
		} else {
			view.append(this);
		}
		return this;
	}

	has_class(cls){
		return this.el.classList.contains(cls);
	}

	hc(cls){
		return this.has_class(cls);
	}

	toggle_class(cls){
		return this.has_class(cls) ? this.rc(cls) : this.ac(cls);
	}

	tc(cls){
		const classes = cls.split(" ");
		for (const clas of classes)
			this.toggle_class(clas);
		return this;
	}

	/* Getter or setter, decided by WHETHER a value was passed — never by whether it
	 * differs from what is there. These three used to test both, so setting a value
	 * equal to the current one fell into the getter branch and returned a STRING:
	 * `field().text("").attr(…)` on an empty <textarea> threw "attr is not a
	 * function". The skip-the-write optimization wanted the comparison; the return
	 * never did. */
	html(value){
		if (!is.def(value)) return this.el.innerHTML;

		// don't re-update: important for contenteditable change events, and for
		// not losing focus on re-update
		if (value !== this.el.innerHTML){
			if (View.supports_sanitizer){
				this.el.setHTML(value);
			} else {
				// fail-safe: never inject raw HTML we can't sanitize
				console.warn("View.html(): Sanitizer API not supported, rendering as text instead of HTML");
				this.el.textContent = value;
			}
		}

		return this;
	}

	// raw innerHTML, no sanitization - only for content you fully trust (XSS risk otherwise)
	html_unsafe(value){
		if (!is.def(value)) return this.el.innerHTML;

		if (value !== this.el.innerHTML) this.el.innerHTML = value;   // see html()
		return this;
	}

	text(value){
		if (!is.def(value)) return this.el.textContent;

		if (value !== this.el.textContent) this.el.textContent = value;   // see html()
		return this;
	}

	backtick_append(...args){
		for (const arg of args){
			if (is.str(arg))
				this.backticks(arg);
			else
				this.append(arg);
		}
		return this;
	}

	/* `code` spans from backticks, and NOTHING else — this is not markdown. Bold,
	 * links and tables render as literal text, which is the trap: use `md()` for
	 * anything formatted. */
	backticks(text){
		const regex = /`([^`]+)`/g;
		const parts = [];
		let last = 0;
		let match;

		while ((match = regex.exec(text)) !== null){
			if (match.index > last) parts.push(text.slice(last, match.index));

			parts.push(el("code", match[1]));
			last = match.index + match[0].length;
		}

		if (last < text.length) parts.push(text.slice(last));

		this.append(parts);
		return this;
	}

	attr(name, value){
		// set
		if (is.def(value)){ // see comment in html()
			if (value !== this.el.getAttribute(name)){
				this.el.setAttribute(name, value);
			}
			return this;

		// get // we can't set attr to undefined...
		} else {
			return this.el.getAttribute(name);
		}
	}

	href(url){
		return this.attr("href", url);
	}

	click(cb){
		if (!cb) console.error("must provide a callback");
		return this.on("click", cb);
	}

	on(event, cb){
		this.el.addEventListener(event, (...args) => {
			cb.call(this, ...args);
		});

		return this;
	}

	off(event, cb){
		this.el.removeEventListener(event, cb);
		return this;
	}

	/* Import a module and append its default export. Not async on purpose, so
	 * `div.c("thing").load(import.meta, "thing.js")` works inside a capture fn.
	 * Parallel, so several resolve in whatever order they arrive — use `lazy()` when
	 * the order on the page has to match the order you wrote. */
	load(meta, url){
		if (is.str(meta)){ // .load("/file.js");
			url = meta;
		} else { // .load(import.meta, "file.js");
			url = new URL(url, meta.url).href;
		}
		
		this.append_promise(import(url).then(mod => mod.default));
		return this;
	}

	// The same, serialized — one promise chain, so imports append in written order.
	lazy(meta, url){
		if (is.str(meta)){ // .load("/file.js");
			url = meta;
		} else { // .load(import.meta, "file.js");
			url = new URL(url, meta.url).href;
		}

		// promise chain, might be perf issue en masse
		View.lazy = View.lazy.then(async () => {
			View.set_captor(this);
			let mod = await import(url);
			if (is.def(mod.default))
				this.append(mod.default);
			View.restore_captor();
		}); // we have to capture in series, so wait for the last one
		return this;
	}

	// returns index of self relative to parentNode.children
	index(){
		return Array.prototype.indexOf.call(this.el.parentNode.children, this.el);
	}

	insert(el, index){
		if (el.el)
			el = el.el; // if you pass in a view

		if (index >= this.el.children.length){
			this.append(el);
		} else {
			this.el.insertBefore(el, this.el.children[index]);
		}

		return this;
	}

	empty(...args){
		this.el.innerHTML = "";
		this.append(...args);
		return this;
	}

	// inline styles
	style(prop, value){
		// set with object
		if (is.obj(prop)){
			for (var p in prop){
				this.style(p, prop[p]);
			}
			return this;

		// set with "prop", "value"
		} else if (prop && is.def(value)) {

			if (prop.startsWith("--")){
				this.el.style.setProperty(prop, value);
			} else {
				this.el.style[prop] = value;
			}
			return this;

		// get with "prop"
		} else if (prop) {
			if (prop.startsWith("--")){
				return this.el.style.getPropertyValue(prop);
			} else {
				return this.el.style[prop];
			}

		// get all
		} else if (!arguments.length){
			return this.el.style;
		} else {
			throw "whaaaat";
		}
	}
	compute(){
		return getComputedStyle(this.el);
	}
	hide(){
		this.el.style.display = "none";
		return this;
	}
	show(){
		this.el.style.display = "";
		return this;
	}
	// this doesn't work if css display: none is the starting point...
	toggle(){
		if (getComputedStyle(this.el).display === "none")
			return this.show();
		else {
			return this.hide();
		}
	}
	remove(){
		this.el.parentNode?.removeChild(this.el);
		return this;
	}

	replace(view){
		this.el.replaceWith(view.el ? view.el : view);
		return this;
	}

	buffer(){
		this._buffer_clone = this.el.cloneNode(true);
		this.el.replaceWith(this._buffer_clone);
		return this;
	}

	flush(){
		this._buffer_clone.replaceWith(this.el);
		delete this._buffer_clone;
		return this;
	}

	clone(){
		return new this.constructor({
			el: this.el.cloneNode(true)
		});
	}

	repeat(n){
		for (let i = 0; i < n; i++){
			this.clone();
		}
		return this;
	}

	ctrl(classes){
		div.c("class-ctrls", () => {
			for (const cls of classes.split(" ")){
				el("label", 
					el("input", input => {
						if (this.hc(cls))
							input.attr("checked", true);
					})
						.attr("type", "checkbox"), 
					" " + cls
				).style("cursor", "pointer").click(e => {
					if (e.target.tagName !== 'INPUT') return;
					this.tc(cls);
				});
			}
		});

		// maybe return the .class-ctrls, breaking chaining?
		return this;
	}

	static lookup(el){
		return this.registry.get(el);
	}

	static register(view){
		if (this.inspect){
			// console.log("registering view");
			this.registry.set(view.el, view);
		}
	}

	static get registry(){
		if (!this._registry) this._registry = new WeakMap();
		return this._registry;
	}

	static set_captor(view){
		View.previous_captors.push(View.captor);
		View.captor = view;
	}

	static restore_captor(){
		View.captor = View.previous_captors.pop();
	}

	static meta_path(meta, path){
		return new URL(path, meta.url).href;
	}

	static url(meta, path){
		if (is.str(meta)){ // url("/file.js");
			return meta;
		} else { // url(import.meta, "file.js");
			return View.meta_path(meta, path);
		}
	}

	/**
	 * View.stylesheet(import.meta, "file.css") — or a bare url.
	 *
	 * App awaits every promise in `View.stylesheets` before it injects, so this one
	 * MUST settle: a <link> that 404s fires `error`, not `load`, and without the
	 * handler one typo'd url is a permanently blank page. It RESOLVES on error, so a
	 * missing stylesheet degrades to unstyled rather than taking the page down.
	 *
	 * `capture: false` keeps the <link> out of whatever happens to be capturing when
	 * the module is imported.
	 */
	static stylesheet(meta, url){
		url = View.url(meta, url);

		const prom = new Promise(res => {
			new View({ tag: "link", capture: false })
				.attr("rel", "stylesheet").attr("href", url)
				.append_to(document.head)
				.on("load", () => res(url))
				.on("error", () => {
					console.warn("stylesheet failed to load:", url);
					res(url);
				});
		});

		this.stylesheets.push(prom);

		return prom;
	}

	static elements(){
		const View = this;
		const fns = {
			el(tag, ...args){
				return new View({ tag }).append(...args);
			},
			div(){
				return new View().append(...arguments);
			},
			p(){
				return new View({ tag: "p" }).backtick_append(...arguments);
			},
			style(){
				return new View({ tag: "style" }).append(...arguments).append_to(document.head);
			}
		};

		fns.el.c = function(tag, classes, ...args){
			return new View({ tag }).ac(classes).append(...args);
		};

		fns.div.c = function(classes, ...args){
			return new View().ac(classes).append(...args);
		};

		fns.p.c = function(classes, ...args){
			return new View({ tag: "p" }).ac(classes).backtick_append(...args);
		};
		
		
		["h1", "h2", "h3", "h4", "h5", "h6", "span", "ul", "ol", "li", "pre", "code", "button", "a", "section", "nav", "footer", "header", "main", "article", "aside", "form", "label", "input", "textarea", "select", "option", "fieldset", "legend", "img", "video", "audio", "iframe", "table", "thead", "tbody", "tr", "th", "td", "blockquote", "cite", "dfn", "em", "i", "kbd", "mark", "q", "s", "samp", "small", "strong", "u", "br", "hr", "b", "abbr", "del", "ins", "sub", "sup", "time", "meter", "progress", "data", "details", "summary", "figure", "figcaption"].forEach(tag => {
			fns[tag] = function(){
				return new View({ tag }).append(...arguments);
			};

			fns[tag].c = function(classes, ...args){
				return new View({ tag }).ac(classes).append(...args);
			};
		})

		return fns;
	}

	// setup body as captor
	static body(){
		if (View._body){
			return View._body;
		} else {
			View._body = new View({
				tag: "body",
				el: document.body,
				capture: false,
				init(){
					View.set_captor(this);
					return this;
				}
			});
			
			return View._body;
		}
	}

	assign(...args){
		return Object.assign(this, ...args);
	}
}

View.stylesheets = [];
View.lazy = Promise.resolve();
View.supports_sanitizer = "setHTML" in Element.prototype;

export function icon(name){
	return el.c("span", "material-icons icon", name);
}

export function append(...args){
	View.captor.append(...args);
}

export async function load(meta, url){
	if (is.str(meta)){ // .load("/file.js");
		url = meta;
	} else { // .load(import.meta, "file.js");
		url = new URL(url, meta.url).href;
	}

	const placeholder = div.c("load");

	const mod = await import(url);

	if (mod.default?.el){
		// no extra div.load
		placeholder.replace(mod.default);
	} else {
		// if a function or other is exported, .replace doesn't work
		placeholder.append(mod.default);
	}

}

export const { el, div, p, style, h1, h2, h3, h4, h5, h6, span, ul, ol, li, pre, code, button, a, section, nav, footer, header, main, article, aside, form, label, input, textarea, select, option, fieldset, legend, img, video, audio, iframe, table, thead, tbody, tr, th, td, blockquote, cite, dfn, em, i, kbd, mark, q, s, samp, small, strong, u, br, hr, b, abbr, del, ins, sub, sup, time, meter, progress, data, details, summary, figure, figcaption } = View.elements();
export { View, is };

View.previous_captors = [];
View.prototype.capture = true;

/* The layer order and the base look, loaded HERE and not by App — so nothing can
 * beat it into <head>. Every other stylesheet on the site is injected by a module
 * that imports View, so this <link> is always the first one, and the `@layer`
 * statement in it is the one that fixes the order for the whole document.
 *
 * It was App's, and Page.css got there first (App imports Page at module scope,
 * and imports hoist) — which meant the order was decided by a file that isn't
 * about the order. Importing View now means importing the framework's CSS; the
 * two were never separable in practice.
 *
 * ⚠ DEAD LAST in this file, and it has to be: `stylesheet()` builds a View, which
 * runs `append_fn`, which pushes onto `View.previous_captors` — declared two lines
 * up. Higher in the file it throws "Cannot read properties of undefined". */
View.stylesheet(import.meta, "../../framework.css");
