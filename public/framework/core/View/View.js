import is from "../../util/is/is.js";

// ⚠ Capturing is synchronous: `append_fn` restores the previous captor the instant
// your function RETURNS, which for an `async` function is its first `await`. Nothing
// throws — the elements simply appear somewhere else. doc/capturing.md.
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

	// ⚠ filter(Boolean): a doubled or trailing space yields an empty token, and
	// classList.add("") THROWS — so `.ac("card " + maybe)` was a live landmine.
	ac(...args){
		for (const arg of args){
			arg && arg.split(" ").filter(Boolean).forEach(cls => this.el.classList.add(cls));
		}
		return this;
	}

	rc(...args){
		for (const arg of args){
			arg && arg.split(" ").filter(Boolean).forEach(cls => this.el.classList.remove(cls));
		}
		return this;
	}

	// ⚠ Runs inside `super()`, BEFORE a subclass's class fields initialize — a
	// `classes = "docs"` field arrives too late. Name the subclass instead.
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
				this.el.append(arg);
			}
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

	// ⚠ A promise appended before an `empty()` belongs to content that is gone — it may
	// not land on whatever replaced it, so the epoch it was started in has to still hold.
	async append_promise(promise){
		const epoch = this.epoch;
		const return_value = await promise;

		if (this.epoch !== epoch) return this;

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

	// ⚠ Getter or setter by WHETHER a value was passed, never by whether it differs
	// from what is there — an equal-value set must still return `this`, not a string.
	// The `!==` skips the write only: contenteditable loses focus on a re-set.
	html(value){
		if (!is.def(value)) return this.el.innerHTML;

		if (value !== this.el.innerHTML){
			if (View.supports_sanitizer){
				this.el.setHTML(value);
			} else {
				console.warn("View.html(): Sanitizer API not supported, rendering as text instead of HTML");
				this.el.textContent = value;
			}
		}

		return this;
	}

	// ⚠ Raw innerHTML, unsanitized — only for content you fully trust.
	html_unsafe(value){
		if (!is.def(value)) return this.el.innerHTML;

		if (value !== this.el.innerHTML) this.el.innerHTML = value;
		return this;
	}

	text(value){
		if (!is.def(value)) return this.el.textContent;

		if (value !== this.el.textContent) this.el.textContent = value;
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

	// ⚠ `code` spans and NOTHING else. Bold, links and tables render as literal
	// text — use `md()` for anything formatted.
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
		if (is.def(value)){
			if (value !== this.el.getAttribute(name)){
				this.el.setAttribute(name, value);
			}
			return this;

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

	// Import a module and append its default export. Not async on purpose, so it
	// works inside a capture fn. Parallel — `lazy()` when written order matters.
	load(meta, url){
		this.append_promise(import(View.url(meta, url)).then(mod => mod.default));
		return this;
	}

	lazy(meta, url){
		url = View.url(meta, url);

		View.lazy = View.lazy.then(async () => {
			View.set_captor(this);
			let mod = await import(url);
			if (is.def(mod.default))
				this.append(mod.default);
			View.restore_captor();
		});
		return this;
	}

	empty(...args){
		this.epoch = (this.epoch ?? 0) + 1;
		this.el.innerHTML = "";
		this.append(...args);
		return this;
	}

	// ⚠ `--x` needs setProperty: `el.style["--x"] = v` silently does nothing.
	style(prop, value){
		if (is.obj(prop)){
			for (var p in prop){
				this.style(p, prop[p]);
			}
			return this;

		} else if (prop && is.def(value)) {

			if (prop.startsWith("--")){
				this.el.style.setProperty(prop, value);
			} else {
				this.el.style[prop] = value;
			}
			return this;

		} else if (prop) {
			if (prop.startsWith("--")){
				return this.el.style.getPropertyValue(prop);
			} else {
				return this.el.style[prop];
			}

		} else if (!arguments.length){
			return this.el.style;
		} else {
			throw "whaaaat";
		}
	}
	hide(){
		this.el.style.display = "none";
		return this;
	}
	show(){
		this.el.style.display = "";
		return this;
	}
	// ⚠ Reads the computed style, so a view already hidden by CSS toggles to hidden.
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

		return this;
	}

	static set_captor(view){
		View.previous_captors.push(View.captor);
		View.captor = view;
	}

	static restore_captor(){
		View.captor = View.previous_captors.pop();
	}

	static url(meta, path){
		if (is.str(meta)){ // url("/file.js");
			return meta;
		} else { // url(import.meta, "file.js");
			return new URL(path, meta.url).href;
		}
	}

	// ⚠ App awaits every promise in `View.stylesheets`, so this one MUST settle: a
	// <link> that 404s fires `error`, not `load`, and an unsettled promise is a
	// permanently blank page. It RESOLVES on error — unstyled, not down.
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

		["p", "h1", "h2", "h3", "h4", "h5", "h6"].forEach(tag => {
			fns[tag] = function(){
				return new View({ tag }).backtick_append(...arguments);
			};

			fns[tag].c = function(classes, ...args){
				return new View({ tag }).ac(classes).backtick_append(...args);
			};
		});

		["span", "ul", "ol", "li", "pre", "code", "button", "a", "section", "nav", "footer", "header", "main", "article", "aside", "form", "label", "input", "textarea", "select", "option", "fieldset", "legend", "img", "video", "audio", "iframe", "table", "thead", "tbody", "tr", "th", "td", "blockquote", "cite", "dfn", "em", "i", "kbd", "mark", "q", "s", "samp", "small", "strong", "u", "br", "hr", "b", "abbr", "del", "ins", "sub", "sup", "time", "meter", "progress", "data", "details", "summary", "figure", "figcaption"].forEach(tag => {
			fns[tag] = function(){
				return new View({ tag }).append(...arguments);
			};

			fns[tag].c = function(classes, ...args){
				return new View({ tag }).ac(classes).append(...args);
			};
		})

		return fns;
	}

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

export const { el, div, p, style, h1, h2, h3, h4, h5, h6, span, ul, ol, li, pre, code, button, a, section, nav, footer, header, main, article, aside, form, label, input, textarea, select, option, fieldset, legend, img, video, audio, iframe, table, thead, tbody, tr, th, td, blockquote, cite, dfn, em, i, kbd, mark, q, s, samp, small, strong, u, br, hr, b, abbr, del, ins, sub, sup, time, meter, progress, data, details, summary, figure, figcaption } = View.elements();
export { View, is };

// ⚠ On the prototype, not class fields — a field would stop a subclass declaring
// `tag = "other"`, and `capture` has to be readable before the constructor body.
View.previous_captors = [];
View.prototype.capture = true;

// framework.css loads HERE so that importing View fixes the document's @layer order.
// ⚠ DEAD LAST in this file, and it has to be: `stylesheet()` builds a View, which
// pushes onto `View.previous_captors` — declared two lines up.
View.stylesheet(import.meta, "../../framework.css");
