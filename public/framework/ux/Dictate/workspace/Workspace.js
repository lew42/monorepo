import { View, div, span, button, textarea, p, h3 } from "/framework/core/View/View.js";
import Dictate from "../Dictate.js";
import Draggable from "/framework/ext/Draggable/Draggable.js";

View.stylesheet(import.meta, "Workspace.css");

/**
 * SentenceItem: a draggable, editable card representing a settled sentence in the structured stream.
 */
class SentenceItem extends View {
	assign(data, opts = {}){
		super.assign(opts);
		this.data = data;
		this.on_change = opts.on_change;
		this.on_remove = opts.on_remove;
		this.on_reorder = opts.on_reorder;
	}

	render(){
		this.ac("dictate-sentence-item card pad flex gap v-center");
		this.el.__item_id = this.data?.id;

		this.$grip = span.c("dictate-sentence-grip drag-handle muted", "⋮⋮");
		this.$text = span.c("dictate-sentence-text flex-1", this.data?.text || "");
		this.$text.attr("contenteditable", "true");
			this.$text.on("blur", () => {
				const next = this.$text.el.textContent.trim();
				if (next !== this.data.text){
					this.data.text = next;
					this.on_change?.(this.data);
				}
			});

		this.$actions = div.c("dictate-sentence-actions flex gap-35 v-center", () => {
			button.c("btn-icon muted", "✕")
				.attr("title", "Remove sentence")
				.on("click", (e) => {
					e.stopPropagation();
					this.on_remove?.(this.data);
				});
		});

		// Set up Draggable behavior for sentence re-ordering
		this.draggable = new Draggable({
			view: this,
			handle: this.$grip,
			start: () => {
				this.ac("dragging");
			},
			move: (dx, dy, e) => {
				this.on_reorder?.("move", this, e);
			},
			end: () => {
				this.rc("dragging");
				this.on_reorder?.("end", this);
			}
		});
	}
}

/**
 * Workspace: A dictation workspace where a long dictation grows.
 * Each sentence becomes a structured, movable item, while the raw transcript stays beside it.
 */
export default class Workspace extends View {
	assign(opts = {}){
		super.assign(opts);
		this.sentences ??= opts.sentences ?? [];
		this.raw_entries ??= opts.raw_entries ?? [];
		this.dictate ??= null;
	}

	render(){
		this.el = div.c("dictate-workspace wide flex v gap", () => {
			this.el.__view = this;
			window.__workspace = this;
			// Top control bar
			div.c("dictate-workspace-toolbar flex gap v-center wrap card pad", () => {
				this.$mic_slot = div.c("flex v-center gap");
				this.dictate = new Dictate({
					mode: "open",
					on_text: (text, reason) => this.handle_text(text, reason),
					on_guess: (text) => this.handle_guess(text)
				});
				if (this.dictate.view) this.$mic_slot.append(this.dictate.view);

				this.$status = span.c("dictate-workspace-status muted", "Click 🎤 and dictate freely. Each sentence becomes an editable, movable item.");

				div.c("flex-1");

				button.c("btn", "Clear All")
					.attr("type", "button")
					.on("click", () => this.clear_all());

				button.c("btn prim", "Copy All")
					.attr("type", "button")
					.on("click", () => this.copy_all());
			});

			// Dual-column main area: Left = Structure (cards), Right = Raw Transcript
			div.c("dictate-workspace-grid grid gap", () => {
				// Column 1: Structured Sentences
				div.c("dictate-workspace-col dictate-workspace-structure flex v gap", () => {
					div.c("flex gap v-center justify-between", () => {
						h3.c("muted", "Structured Items");
						this.$count = span.c("badge muted", `${this.sentences.length} sentences`);
					});

					this.$list = div.c("dictate-sentence-list flex v gap");
					this.render_sentences();
				});

				// Column 2: Raw Transcript
				div.c("dictate-workspace-col dictate-workspace-raw card pad flex v gap", () => {
					h3.c("muted", "Raw Transcript");
					this.$raw_log = div.c("dictate-raw-log flex v gap-35 code");
					this.$live_guess = div.c("dictate-raw-guess muted italic");
					this.render_raw();
				});
			});
		}).el;
	}

	handle_text(text, reason){
		if (!text || !text.trim()) return;
		const raw = text.trim();
		this.raw_entries.push({ raw, time: new Date().toLocaleTimeString(), reason });
		this.$live_guess.text("");
		this.render_raw();

		// Split utterance into individual sentences if multiple sentences were transcribed together
		const matched = raw.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [raw];
		for (const s of matched){
			const clean = s.trim();
			if (!clean) continue;
			const item = { id: "s-" + Math.random().toString(36).slice(2), text: clean, raw: clean };
			this.sentences.push(item);
		}
		this.render_sentences();
	}

	handle_guess(text){
		this.$live_guess.text(text || "");
	}

	render_sentences(){
		if (!this.$list) return;
		this.$list.empty();
		this.$count?.text(`${this.sentences.length} sentence${this.sentences.length === 1 ? "" : "s"}`);

		if (this.sentences.length === 0){
			this.$list.append(div.c("dictate-empty-state muted pad text-center", "No sentences yet. Start talking into the microphone."));
			return;
		}

		for (let i = 0; i < this.sentences.length; i++){
			const data = this.sentences[i];
			const view = new SentenceItem(data, {
				on_change: (updated) => {
					this.sentences[i] = updated;
				},
				on_remove: () => {
					this.sentences.splice(i, 1);
					this.render_sentences();
				},
				on_reorder: (action, item_view, e) => {
					this.handle_drag_reorder(action, item_view, e);
				}
			});
			this.$list.append(view);
		}
	}

	handle_drag_reorder(action, itemView, e){
		if (action === "end"){
			// Clean up drag markers and sync internal order from DOM
			const ids = [...this.$list.el.children].map(c => c.__item_id).filter(Boolean);
			if (ids.length === this.sentences.length){
				const map = new Map(this.sentences.map(s => [s.id, s]));
				this.sentences = ids.map(id => map.get(id)).filter(Boolean);
			}
			return;
		}
		if (action === "move" && e){
			// Simple adjacent swap based on pointer position relative to list children
			const items = [...this.$list.el.querySelectorAll(".dictate-sentence-item:not(.dragging)")];
			for (const other of items){
				const rect = other.getBoundingClientRect();
				if (e.clientY >= rect.top && e.clientY <= rect.bottom){
					const dragIdx = this.sentences.findIndex(s => s.id === itemView.data.id);
					const otherText = other.querySelector(".dictate-sentence-text")?.textContent?.trim();
					const otherIdx = this.sentences.findIndex(s => s.text === otherText);
					if (dragIdx >= 0 && otherIdx >= 0 && dragIdx !== otherIdx){
						const [moved] = this.sentences.splice(dragIdx, 1);
						this.sentences.splice(otherIdx, 0, moved);
						this.render_sentences();
						break;
					}
				}
			}
		}
	}

	render_raw(){
		if (!this.$raw_log) return;
		this.$raw_log.empty();
		if (this.raw_entries.length === 0){
			this.$raw_log.append(div.c("muted", "(Raw transcript will appear here word-for-word)"));
			return;
		}
		for (const entry of this.raw_entries){
			this.$raw_log.append(div.c("dictate-raw-entry flex gap v-center", () => {
				span.c("muted text-xs", entry.time);
				span(entry.raw);
			}));
		}
	}

	clear_all(){
		this.sentences = [];
		this.raw_entries = [];
		this.$live_guess.text("");
		this.render_sentences();
		this.render_raw();
	}

	copy_all(){
		const text = this.sentences.map(s => s.text).join(" ");
		if (navigator.clipboard) navigator.clipboard.writeText(text);
	}
}
