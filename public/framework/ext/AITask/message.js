import { div, pre, img } from "../../core/View/View.js";
import md from "../markdown/md.js";
import { count } from "./stats.js";

export const clip = (s, n = 400) => s && s.length > n ? s.slice(0, n) + ` … (${count(s.length)} chars)` : s;

/** Our own expando — a clickable bar over a hidden body. */
export function fold(title, fn){
	return div.c("ai-fold", () => {
		div.c("ai-fold-bar wash", title).on("click", e => e.currentTarget.parentElement.classList.toggle("open"));
		div.c("ai-fold-body", fn);
	});
}

/** Visible text length of one transcript line, roughly. */
export function chars_of(l){
	const c = l.message.content;
	if (typeof c === "string") return c.length;
	return c.reduce((n, b) => n + (b.text ?? b.thinking ?? (typeof b.content === "string" ? b.content : "")).length, 0);
}

/** One assistant message or tool-result line, block by block. */
export function message(l){
	div.c("ai-msg " + l.type + (l.isSidechain ? " sidechain" : ""), () => {
		const { content } = l.message;
		if (typeof content === "string") return md(content);
		content.forEach(block);
	});
}

function block(b){
	if (b.type === "text") md(b.text);
	else if (b.type === "thinking") b.thinking && fold(`thinking · ${count(b.thinking.length)} chars`, () => md(b.thinking));
	else if (b.type === "tool_use") pre.c("ai-tool", b.name + " " + (clip(JSON.stringify(b.input), 160) ?? ""));
	else if (b.type === "tool_result") result(b.content);
	else if (b.type === "image") image(b.source);
}

function result(c){
	if (typeof c === "string") return pre.c("ai-result", clip(c));
	if (Array.isArray(c)) c.forEach(item =>
		item.type === "image" ? image(item.source) : item.text && pre.c("ai-result", clip(item.text)));
}

function image(source){
	source?.data && img.c("ai-img").attr("src", `data:${source.media_type};base64,${source.data}`);
}
