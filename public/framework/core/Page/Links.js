import { div, p, h2, span, ul, li, a, button, icon } from "../View/View.js";

// Where a clicked link opens, and the .md-file helpers it uses. The Router hands every in-app click to the page that
// holds the link; the page decides, the link carries no target. (doc/open.md)
// `page.open_link(link)`, `swap_link(link)`, `md_files(names)` and `Page.md_file/md_url/md_page` are facades on Page:
// a page overrides `open_link` (`return this.swap_link(link)`), so these only ever run through the page.
export default class PageLinks {

	page = null;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// A url to navigate to, or nothing when the page showed the link itself. The default navigates;
	// in a columns tree, a doc from the page's own folder opens as the next column.
	open(link){
		const page = this.page, file = this.page.constructor.md_file(link);
		if (!file) return link.pathname;

		const dir = page.md_dir(), rel = dir && file.startsWith(dir) && file.slice(dir.length);
		if (!rel || !page.column_host()) return this.page.constructor.md_url(file);

		// A doc beside me becomes my child, so it opens as the very next column.
		// One in a subfolder goes through my md/, which is a column of its own.
		if (rel.includes("/")) return page.url + "md/" + rel.replace(/\.md$/i, "/");

		const name = rel.slice(0, -3);
		if (!page.children.has(name)) page.add(name, this.page.constructor.md_page(file));
		return page.url + name + "/";
	}

	// Draw the doc inside the page with a way back, at its own address `<page url>md/<doc>/`. (doc/decisions.md)
	swap(link){
		const page = this.page, file = this.page.constructor.md_file(link);
		if (!file) return link.pathname;

		page.swap_close?.();
		const shown = [...page.view.el.children].filter(el => !el.matches(".page-swap"));
		shown.forEach(el => el.style.display = "none");

		const url = this.swap_url(file);
		const back = () => location.pathname === url ? history.back() : close();
		const on_pop = () => { if (location.pathname !== url) close(); };
		let $shell;
		const close = () => {
			$shell?.el.remove();
			shown.forEach(el => el.style.display = "");
			removeEventListener("popstate", on_pop);
			page.swap_close = null;
		};

		page.view.append(() => {
			div.c("page-swap pad", $swap => {
				$shell = $swap;
				button.c("page-swap-back flex v-center gap", () => { icon("arrow_back"); span("Back"); }).on("click", back);
				page.constructor.file(file).then(doc => {
					$swap.append(() => { doc ? doc.title && h2(doc.title) : p.c("muted", "Nothing could be read at " + file + "."); });
					if (doc) $swap.append(doc.content());
				});
			});
		});

		page.swap_close = close;
		if (location.pathname !== url) history.pushState({}, "", url + link.hash);
		addEventListener("popstate", on_pop);
	}

	// Where a swapped doc lives: the page's own md/ when the doc is in its folder, else its module's.
	swap_url(file){
		const dir = this.page.md_dir();
		return dir && file.startsWith(dir) ? this.page.url + "md/" + file.slice(dir.length).replace(/\.md$/i, "/") : this.page.constructor.md_url(file);
	}

	// The page's own folder's .md files, as links: the Router hands each click back to the page.
	// `names` when the caller knows them; else the dev server's file list, which production does not have (so: nothing there).
	files(names){
		const dir = this.page.md_dir();

		return ul.c("page-md-files", $list => {
			const list = names ? Promise.resolve(names)
				: import("./Markdown.js").then(({ default: PageMarkdown }) => PageMarkdown.files(dir));

			list.then(files => $list.append(() => {
				(files ?? []).filter(name => /\.md$/i.test(name) && !name.includes("/"))
					.forEach(name => li(() => { a(name.slice(0, -3)).href(dir + name); }));
			}));
		});
	}

	// A page that is one .md file, headed by its file name; the file keeps its own h1.
	static md_page(file){
		return {
			folder: file.replace(/[^/]*$/, ""),
			content(){ return import("../../ext/markdown/md.js").then(({ md }) => md.file({ url: location.href }, file)); },
		};
	}

	// The .md file a link points at: its href, or what md.route() rewrote it from.
	static md_file(link){
		return link.dataset?.md ?? (/\.md$/i.test(link.pathname) && !link.search ? link.pathname : null);
	}

	// A .md file's page when nothing nearer claims it: `<module>/md/<path>/` (module = the folder above doc/).
	// ⚠ The trailing slash is load-bearing: a url ending in `.js` is answered as a file.
	static md_url(file){
		const doc = file.indexOf("/doc/");
		const base = doc >= 0 ? file.slice(0, doc + 1) : file.replace(/[^/]*$/, "");
		return base + "md/" + file.slice(base.length).replace(/\.md$/i, "/");
	}
}
