import { marked } from "/framework/ext/Markdown/md.js";

/* MARKDOWN IN A CHAT, SAFELY (the owner, 2026-09-24: "the bold markers show as
   raw asterisks"). ext/Markdown's `.md()` writes marked's output straight in and
   marked passes raw HTML through — fine for repo docs, not for words an agent or
   a stranger typed. So: parse, then rebuild only what is on the allow list;
   any other element (script, img, iframe…) is replaced by its own text, every
   attribute goes except a safe link's `href`. */
const OK = new Set("A STRONG B EM I CODE PRE UL OL LI P BR DEL BLOCKQUOTE H1 H2 H3 H4 H5 H6 HR".split(" "));

function clean(node){
	for (const kid of [...node.childNodes]){
		if (kid.nodeType === 3) continue;
		if (kid.nodeType !== 1 || !OK.has(kid.tagName)){ kid.replaceWith(document.createTextNode(kid.textContent ?? "")); continue; }
		const href = kid.tagName === "A" ? kid.getAttribute("href") : null;
		for (const at of [...kid.attributes]) kid.removeAttribute(at.name);
		if (href && /^(https?:|mailto:|\/|#)/i.test(href.trim())){
			kid.setAttribute("href", href.trim());
			if (/^https?:/i.test(href.trim())){ kid.setAttribute("target", "_blank"); kid.setAttribute("rel", "noopener noreferrer"); }
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
	return el;
}

export default md_into;
