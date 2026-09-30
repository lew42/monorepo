import { View, select, option } from "../../../core/View/View.js";
import track from "../../../core/track/track.js";
import Part from "../../Part.js";
import MicStream from "../../MicStream/MicStream.js";
import { remembered_device } from "/framework/ux/Dictate/Dictate.js";

/**
 * class MicPicker extends Part — DEPRECATED, absorbed into `MicStream`
 * (2026-09-30): `mic.devices()` and `mic.pick(id, label)` are the same two
 * methods, now living on the class that actually opens the microphone. This
 * file stays only so the v1 demo pages (`/framework/audio/v1/`) keep
 * working unchanged — it does not enumerate devices or remember a pick
 * itself any more, it just calls `MicStream`'s copy of that code, so there
 * is still exactly one implementation on the site.
 *
 * New code: use `MicStream.Controls` (shows the picker, the level and a
 * hold/toggle button together) or call `mic.devices()`/`mic.pick()`
 * directly — see [`../../MicStream/`](../../MicStream/).
 *
 *   const picker = new MicPicker({ on_pick(id, label){ … } });
 *   await picker.devices();     // [{ deviceId, label, kind }, …]
 *   picker.pick(id, label);     // remembers it, fires on_pick
 */
export default class MicPicker extends Part {
	async devices(){ return MicStream.prototype.devices.call(this); }
	pick(id, label){
		MicStream.prototype.pick.call(this, id, label);
		this.on_pick?.(id, label);
	}
}

track(MicPicker);

MicPicker.View = class extends View {
	render(){
		this.ac("audio-micpicker");
		this.$select = select.c("audio-micpicker-select").on("change", e => {
			const opt = e.target.selectedOptions[0];
			this.subject.pick(e.target.value, opt?.dataset.label ?? "");
		});
		this.fill();
	}

	async fill(){
		const list = await this.subject.devices();
		const remembered = remembered_device();
		this.$select.empty(() => {
			if (!list.length){ option("no microphone found").attr("value", ""); return; }
			list.forEach((d, i) => option(d.label || `Microphone ${i + 1}`)
				.attr("value", d.deviceId).attr("data-label", d.label || ""));
		});
		if (remembered?.id) this.$select.el.value = remembered.id;
		else if (list[0]) this.subject.pick(list[0].deviceId, list[0].label || "");
	}
};

export { MicPicker };
