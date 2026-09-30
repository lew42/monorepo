import { View, select, option } from "../../core/View/View.js";
import track from "../../core/track/track.js";
import Part from "../Part.js";
import { remembered_device, remember_device } from "/framework/ux/Dictate/Dictate.js";

/**
 * class MicPicker extends Part — the microphone chooser. Lists every
 * `audioinput` device and remembers the pick with `ux/Dictate`'s own
 * `remember_device()` — the SAME storage key `MicStream` reads
 * (`ux/Dictate/Dictate.js`'s `DEVICE_KEY`) — so picking a microphone here
 * moves it for `MicStream`, and for `Dictate` itself, with nothing to wire.
 *
 *   const picker = new MicPicker({ on_pick(id, label){ … } });
 *   await picker.devices();     // [{ deviceId, label, kind }, …]
 *   picker.pick(id, label);     // remembers it, fires on_pick
 */
export default class MicPicker extends Part {

	/** `navigator.mediaDevices.enumerateDevices()` only returns real LABELS
	 *  once permission has been granted somewhere on this page — before that
	 *  every input reads as an empty string, which the view shows as
	 *  "Microphone 1", "Microphone 2" rather than nothing at all. */
	async devices(){
		const list = await navigator.mediaDevices.enumerateDevices();
		return list.filter(d => d.kind === "audioinput");
	}

	pick(id, label){
		this.device_id = id;
		this.device_label = label;
		remember_device(id, label);
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
