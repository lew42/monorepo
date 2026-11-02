// PromptItem.js — one sub-item of a Prompt card (`Prompt.items`, chat-model step 6, plan.md decision 4): a title, and the ids of
// the sentences it was made from. A plain, untyped member of `Prompt.items` hydrates as this class; `{type:"Ref"}` hydrates as the
// real core Ref instead (Item.hydrate's own rule — no special case needed here), so an item can point at something filed elsewhere.
import Item from "../../Item/Item.js";

export class PromptItem extends Item {
	// `sentences` is an array of ids: data, not child Items (same shape as Prompt.sentences).
	static plain_lists = ["sentences"];

	get title(){ return this.get_one("title") ?? null; }
	/** The ids of the sentences filed under this item, in the order they were pushed. */
	get sentences(){ return [...(this.get_one("sentences") ?? [])]; }

	/** Grow it by one or more sentence ids: `{sentences: {push: "s-2"}}` or `{sentences: ["s-2"]}`. Nothing ever removes one. */
	push_sentences(value){
		const more = [].concat(Array.isArray(value) ? value : value?.push ?? value).filter(s => typeof s === "string" && s.length);
		if (!more.length) return this;
		const old = this.sentences;
		this.put("sentences", [...old, ...more]);
		this.emit("change", "sentences", this.sentences, old);
		this.emit("delta", { sentences: { push: more } }, this);
		return this;
	}
	set_one(key, value){ return key === "sentences" ? void this.push_sentences(value) : super.set_one(key, value); }
}

export default PromptItem;

// Registered globally (review finding 1, 2026-11-02): `toJSON()` already wrote "PromptItem" as its wire type (Item.wire()'s
// fallback to the constructor name), but hydrate() only resolves a KNOWN type — unregistered, a snapshot round trip warned
// "unknown type" and came back as a plain Item, losing push_sentences (a later {sentences:{push}} would replace the array).
Item.register(PromptItem, "PromptItem");
