import { marked } from "/framework/ext/markdown/md.js";
import { mentions } from "/framework/ext/Mention/Mention.js";

/* MARKDOWN IN A CHAT, SAFELY (the owner, 2026-09-24: "the bold markers show as
   raw asterisks"). ext/Markdown's `.md()` writes marked's output straight in and
   marked passes raw HTML through — fine for repo docs, not for words an agent or
   a stranger typed. So: parse, then rebuild only what is on the allow list;
   any other element (script, img, iframe…) is replaced by its own text, every
   attribute goes except a safe link's `href`. */
/* The site's own hosts (the owner, 2026-11-01: a link from a chat bubble to a site page opens in the SAME tab and keeps dictation
   running). An agent often writes a full https link to the public host; it becomes "/path" here, and core/Router opens it in place. */
const SITE_HOSTS = new Set(["monorepo.lew42.com", "monorepo.localhost", "localhost", "127.0.0.1"]);
export function site_path(href){
	if (!/^https?:/i.test(href)) return href.startsWith("/") ? href : null;   // already a path (or #, mailto: which stay as they are)
	try {
		const u = new URL(href);
		if (u.origin !== location.origin && !SITE_HOSTS.has(u.hostname)) return null;
		u.searchParams.delete("site_key");   // never carry the gateway key along
		return u.pathname + u.search + u.hash;
	} catch { return null; }
}

const OK = new Set("A STRONG B EM I CODE PRE UL OL LI P BR DEL BLOCKQUOTE H1 H2 H3 H4 H5 H6 HR".split(" "));

function clean(node){
	for (const kid of [...node.childNodes]){
		if (kid.nodeType === 3) continue;
		if (kid.nodeType !== 1 || !OK.has(kid.tagName)){ kid.replaceWith(document.createTextNode(kid.textContent ?? "")); continue; }
		const href = kid.tagName === "A" ? kid.getAttribute("href") : null;
		for (const at of [...kid.attributes]) kid.removeAttribute(at.name);
		if (href && /^(https?:|mailto:|\/|#)/i.test(href.trim())){
			const own = site_path(href.trim());   // a link to this site, under any of its hosts: a path, opened in this tab by core/Router, so dictation keeps running
			kid.setAttribute("href", own ?? href.trim());
			if (!own && /^https?:/i.test(href.trim())){ kid.setAttribute("target", "_blank"); kid.setAttribute("rel", "noopener noreferrer"); }
		}
		clean(kid);
	}
}

/** Fill `el` with `text` as safe markdown (`inline` = no paragraph wrapper). Returns `el`. */
export function md_into(el, text, inline){
	const t = document.createElement("template");
	t.innerHTML = inline ? marked.parseInline(String(text)) : marked.parse(String(text));
	clean(t.content);
	el.replaceChildren(t.content);
	mentions(el);   // `#Page`, `@owner` — chat bubbles and Drill titles, ext/Mention/doc/syntax.md
	return el;
}

export default md_into;
