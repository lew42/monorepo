// VoiceChat: one instance per Recite (one per page), built on core/Plugin. Plugins read their settings from the instance's own rows.
// Run: node public/framework/ux/Dictate/VoiceChat/VoiceChat.test.mjs   (written before VoiceChat.js: it fails until the class exists)
import { test } from "../../../core/Test/Test.js";
import { Plugin } from "../../../core/Plugin/Plugin.js";
import { VoiceChat } from "./VoiceChat.js";
import { Interrupt } from "./plugins/index.js";

Plugin.store = new Map();

// the two hosts a chat hands over, reduced to the fields the plugins touch
const recite = () => ({
	barge: { on: true, remembered: [], set_on(v){ this.on = !!v; this.remembered.push(["on", this.on]); this.sync(); }, set_mode(v){ this.mode = v; this.remembered.push(["mode", v]); }, set_threshold(v){ this.threshold = Number(v); this.remembered.push(["threshold", this.threshold]); }, mode: "volume", threshold: 0.35, quiet_ms: 2500, syncs: 0, sync(){ this.syncs++; } },
	auto: true, voice: { name: "Heart" }, set_auto(v){ this.auto = !!v; }, pick(n){ this.voice = { name: n }; },
	thinking_cue: true, cue_repeat_ms: 2000, cue_timer: null, cue_pending: true, changed(){},
});
const row = (vc, name) => vc.plugins.find(name);
const reset = () => { for (const r of VoiceChat.records.values()) { r.config = { ...r.plugin.defaults }; delete r.config.on; r.on = r.plugin.defaults.on !== false; } };

test("the class lists Interrupt and Thinking cue with their defaults, in value order", t => {
	t.eq([...VoiceChat.records.keys()].map(p => p.name), ["SendAfter", "ReadAloud", "Interrupt", "ThinkingCue"], "registered once, at the class, in value order");
	const r = VoiceChat.records.get(Interrupt);
	t.eq(r.config, { mode: "volume", threshold: 0.35, quiet_ms: 2500 }, "Interrupt's defaults are its config (without `on`), read from BargeIn");
});

test("a new chat applies the class settings to its Recite", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r });
	t.ok(r.barge.on && r.barge.mode === "volume" && r.barge.threshold === 0.35 && r.barge.quiet_ms === 2500, "Interrupt applied");
	t.ok(r.thinking_cue && r.cue_repeat_ms === 2000, "Thinking cue applied");
});

test("one chat's threshold is its own: the class and a second chat are untouched", t => {
	reset();
	const a = recite(), b = recite(), va = new VoiceChat({ recite: a }), vb = new VoiceChat({ recite: b });
	row(va, "Interrupt").set({ config: { threshold: 0.6 } });
	t.eq(a.barge.threshold, 0.6, "chat A reads 0.6");
	t.eq(b.barge.threshold, 0.35, "chat B still reads the class value");
	t.eq(va.overrides, { Interrupt: { config: { threshold: 0.6 } } }, "only the changed field is kept");
});

test("switching Interrupt off turns Recite's barge-in off and on puts it back", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r });
	row(vc, "Interrupt").set({ enabled: false });
	t.eq(r.barge.on, false, "off");
	t.ok(r.barge.syncs > 0, "the mic was told to close");
	row(vc, "Interrupt").set({ enabled: true });
	t.eq(r.barge.on, true, "on again");
});

test("a plugin that is off at the class still settles a new chat into the off state", t => {
	reset();
	const rec = VoiceChat.records.get(Interrupt);
	VoiceChat.disable(rec);
	const r = recite(), vc = new VoiceChat({ recite: r });
	t.eq(r.barge.on, false, "Recite's own default was on; the chat starts with Interrupt off");
	VoiceChat.enable(rec);
});

test("Thinking cue: its delay is a config field; off clears the timer and the flag", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r });
	row(vc, "ThinkingCue").set({ config: { repeat_ms: 3500 } });
	t.eq(r.cue_repeat_ms, 3500, "re-run with the new delay");
	r.cue_timer = setTimeout(() => {}, 100000);
	row(vc, "ThinkingCue").set({ enabled: false });
	t.eq([r.thinking_cue, r.cue_timer, r.cue_pending], [false, null, true], "flag off, timer cleared, the no-flood hold flag kept");
});

test("load_overrides puts a saved session back, and {} returns to the class values", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r });
	vc.load_overrides({ Interrupt: { config: { mode: "words" } }, ThinkingCue: { enabled: false } });
	t.eq([r.barge.mode, r.thinking_cue], ["words", false], "saved settings applied");
	vc.load_overrides({});
	t.eq([r.barge.mode, r.thinking_cue, r.cue_repeat_ms], ["volume", true, 2000], "back to the class");
});

test("make_default copies this chat's settings to the class, so a new chat starts from them", t => {
	reset();
	const va = new VoiceChat({ recite: recite() });
	row(va, "Interrupt").set({ config: { threshold: 0.8 } });
	VoiceChat.make_default(va);
	t.eq(va.overrides, {}, "nothing left to override");
	const r = recite(); new VoiceChat({ recite: r });
	t.eq(r.barge.threshold, 0.8, "the new chat starts from the new default");
	reset();
});

test("the bar's own controls write the chat's settings too, and the browser's memory still gets them", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r });
	r.barge.set_threshold("0.7"); r.barge.set_mode("words"); r.barge.set_on(false);
	t.eq(vc.overrides, { Interrupt: { enabled: false, config: { threshold: 0.7, mode: "words" } } }, "the chat's overrides follow the controls");
	t.eq(r.barge.remembered.map(x => x[0]), ["threshold", "mode", "on"], "the host's own save still runs");
	r.barge.set_on(true);
	t.eq(r.barge.on, true, "on again");
});

test("the bar's switch does not keep an override equal to the class value (step 2a review, carried to step 4)", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r });
	r.barge.set_threshold("0.6");   // differs from the class default (0.35): kept
	t.eq(vc.overrides, { Interrupt: { config: { threshold: 0.6 } } });
	r.barge.set_threshold("0.35");   // back to the class value: dropped, not stored as "0.35 on purpose"
	t.eq(vc.overrides, {}, "no override left: this chat now just follows the class");
	r.barge.set_on(false);   // differs from the class default (true): kept
	t.eq(vc.overrides, { Interrupt: { enabled: false } });
	r.barge.set_on(true);   // back to the class value: dropped
	t.eq(vc.overrides, {});
});

test("what the browser remembered becomes this chat's overrides, not the class", t => {
	reset();
	const r = recite(); r.barge.threshold = 0.5; r.barge.on = false;
	t.eq(Interrupt.snapshot(r), { Interrupt: { enabled: false, config: { threshold: 0.5 } } }, "only what differs from the class");
	t.eq(Interrupt.snapshot(recite()), {}, "nothing remembered, nothing to adopt");
	const had = Interrupt.snapshot(r), seen = [];   // read BEFORE the chat starts: its attach writes the class values
	let on = r.barge.on; Object.defineProperty(r.barge, "on", { get: () => on, set: v => { seen.push(v); on = v; } });
	const vc = new VoiceChat({ recite: r, overrides: had });
	t.eq(seen.includes(true), false, "Interrupt was never switched on, not even for a moment (the mic would have opened)");
	t.eq(r.barge.on, false, "still off, as the browser remembered");
	r.barge.set_on(true);
	t.eq(r.barge.threshold, 0.5, "turned on, it uses the remembered threshold, not the class one");
});

test("moving the threshold does not close and reopen the mic: only the values change", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r }), syncs = r.barge.syncs;
	row(vc, "Interrupt").set({ config: { threshold: 0.55 } });
	t.eq(r.barge.threshold, 0.55, "the new value is on the host");
	t.eq([r.barge.on, r.barge.syncs], [true, syncs], "still on, and the mic was not told to sync");
	row(vc, "ThinkingCue").set({ config: { repeat_ms: 4000 } });
	t.eq(r.cue_repeat_ms, 4000, "the cue delay changes without a detach");
});

test("overrides_by_group splits by each plugin's static group; load_grouped is the inverse", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r });
	row(vc, "Interrupt").set({ config: { threshold: 0.6 } });
	row(vc, "ThinkingCue").set({ enabled: false });
	t.eq(Interrupt.group, "recite", "both shipped plugins are read-aloud");
	t.eq(vc.overrides_by_group(), { dictate: {}, recite: { Interrupt: { config: { threshold: 0.6 } }, ThinkingCue: { enabled: false } } });
	const vb = new VoiceChat({ recite: recite() });
	vb.load_grouped(vc.overrides_by_group());
	t.eq(vb.overrides, vc.overrides, "load_grouped merges the two groups back into one load_overrides call");
});

test("two chats on one Recite wrap the bar controls once; the newest chat owns them", t => {
	reset();
	const r = recite(), a = new VoiceChat({ recite: r }), b = new VoiceChat({ recite: r });
	r.barge.set_threshold("0.6");
	t.eq(r.barge.remembered.length, 1, "the host's own call ran once, not once per chat");
	t.eq([a.overrides, b.overrides], [{}, { Interrupt: { config: { threshold: 0.6 } } }], "only the newest chat took the change");
});

const mic = () => ({ send_mode: undefined, sentences_per_send: undefined, send_on_period: undefined, send_on_question: undefined, send_on_comma: undefined });
const sends = m => [m.sentences_per_send, m.send_on_period, m.send_on_question, m.send_on_comma, m.send_mode];

test("SendAfter: each preset sets the mic's own fields; switching changes them, off puts the mic back", t => {
	reset();
	const m = mic(), vc = new VoiceChat({ recite: recite(), mic: m });
	t.eq(sends(m), [1, true, true, false, undefined], "default: each sentence");
	const r = row(vc, "SendAfter");
	r.set({ config: { after: "two" } });
	t.eq(sends(m), [2, true, true, false, undefined], "every two sentences");
	r.set({ config: { after: "pause" } });
	t.eq(sends(m), [0, true, true, false, "pause"], "when you pause: no per-sentence send, pause mode");
	r.set({ config: { after: "clause" } });
	t.eq(sends(m), [1, true, true, true, undefined], "each clause: commas end a piece too");
	r.set({ enabled: false });
	t.eq(sends(m), [undefined, undefined, undefined, undefined, undefined], "off: the mic follows the browser-wide settings again");
	r.set({ enabled: true });
	t.eq(m.sentences_per_send, 1, "on again");
});

test("ReadAloud: on is auto-read, the voice is picked; the bar's button writes the chat's row", t => {
	reset();
	const r = recite(), vc = new VoiceChat({ recite: r });
	t.eq([r.auto, r.voice.name], [true, "Heart"], "class defaults applied");
	row(vc, "ReadAloud").set({ config: { voice: "Puck" } });
	t.eq(r.voice.name, "Puck", "voice picked for this chat");
	row(vc, "ReadAloud").set({ enabled: false });
	t.eq(r.auto, false, "off: no reading by itself");
	row(vc, "ReadAloud").set({ enabled: true });
	r.set_auto(false);
	t.eq(vc.overrides.ReadAloud, { enabled: false, config: { voice: "Puck" } }, "the bar's 🗣 button became this chat's override");
	reset();
});

test("class_values reads what Make default changed; apply_defaults puts it back at the next page start", t => {
	reset();
	t.eq(VoiceChat.class_values(), {}, "nothing changed: nothing to send");
	const va = new VoiceChat({ recite: recite() });
	row(va, "Interrupt").set({ config: { threshold: 0.8 } });
	row(va, "ThinkingCue").set({ enabled: false });
	VoiceChat.make_default(va);
	const saved = VoiceChat.class_values();
	t.eq(saved, { Interrupt: { config: { threshold: 0.8 } }, ThinkingCue: { enabled: false } }, "only the differences");
	reset(); VoiceChat.enable(VoiceChat.records.get([...VoiceChat.records.keys()][3]));
	const r = recite(), vb = new VoiceChat({ recite: r });
	t.eq(r.barge.threshold, 0.35, "a fresh page: the shipped values");
	VoiceChat.apply_defaults(saved);
	t.eq([r.barge.threshold, r.thinking_cue], [0.8, false], "the live chat that follows the class re-ran");
	reset();
});
