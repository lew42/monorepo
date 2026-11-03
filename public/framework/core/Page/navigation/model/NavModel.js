// The navigation model's rules as code, so the page's demos compute their answers instead of stating them. Docs: ./readme.md
export default class NavModel {

	// Which pages are section roots: each owns the one left tree for everything under it.
	// Demo override for a `section: true` page word (doc/core-changes.md); today only /framework/ draws its own Sidebar.
	static SECTIONS = ["/framework/", "/layouts/", "/imagine/", "/web/", "/blog/"];

	// Width of one left rail, in px, when nothing is on screen to measure (16em at 16px).
	static RAIL = 256;

	// "/framework/core/Page/" → ["/framework/", "/framework/core/", "/framework/core/Page/"]
	static ancestors(url){
		const parts = new URL(url, "http://x").pathname.split("/").filter(Boolean);
		return parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/") + "/");
	}

	// The section a url belongs to: its nearest ancestor that is a section root, or "/".
	static section_of(url){
		return this.ancestors(url).findLast(u => this.SECTIONS.includes(u)) ?? "/";
	}

	// Where a clicked link opens: the target's own section, unless the link says `?in=<section>`.
	// Returns the tree's root and the crumb the reader sees.
	static opens(href){
		const url = new URL(href, "http://x");
		const stay = url.searchParams.get("in");
		const own = this.section_of(url.pathname);
		const root = stay && this.SECTIONS.includes(stay) ? stay : own;
		const crumb = root === own
			? this.ancestors(url.pathname).filter(u => u.startsWith(root))
			: [root, url.pathname];
		return { root, own, stay: root !== own, crumb };
	}

	// What is left for the content when `rails` left sidebars stand side by side on a `screen` px wide window.
	static room(screen, rails, rail = this.RAIL){
		return Math.max(0, screen - rails * rail);
	}

	// "/framework/core/Router/" → "Router", "/web/" → "Web": a crumb label from a url.
	static label(url){
		const last = url.split("/").filter(Boolean).at(-1) ?? "Home";
		return last[0].toUpperCase() + last.slice(1);
	}

	// The two page kinds. A workspace fills and its parts are panes; a document is padded and flows.
	static KINDS = {
		document:  { pad: true,  fills: false, children: "nav items: they appear in the left tree" },
		workspace: { pad: false, fills: true,  children: "panes: drawn inside it, never in the left tree" },
	};

	static kind(page){ return page?.kind === "workspace" ? "workspace" : "document"; }
}
