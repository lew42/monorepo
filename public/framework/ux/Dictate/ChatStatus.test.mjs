// ChatStatus: the four words in order, "" when none, subscribe fires on a change only.
// Run: node public/framework/ux/Dictate/ChatStatus.test.mjs
import { test } from "../../core/Test/Test.js";
import ChatStatus from "./ChatStatus.js";

const make = () => {
	const s = { speaking: false, working: false, sending: false, listening: false }, pokes = [];
	const st = new ChatStatus({ speaking: () => s.speaking, working: () => s.working, sending: () => s.sending, listening: () => s.listening, watch: [fn => pokes.push(fn)] });
	const set = o => { Object.assign(s, o); pokes.forEach(f => f()); };
	return { st, set };
};

test("each word shows alone, all false is empty", t => {
	const { st, set } = make();
	t.eq(st.phase(), "", "nothing true: an empty line");
	set({ listening: true }); t.eq(st.phase(), "listening", "mic on");
	set({ listening: false, sending: true }); t.eq(st.phase(), "sending", "posted, not landed");
	set({ sending: false, working: true }); t.eq(st.phase(), "agent working", "landed, no reply yet");
	set({ working: false, speaking: true }); t.eq(st.phase(), "speaking", "Recite reading aloud");
});

test("two true at once shows the higher one, in the order speaking, agent working, sending, listening", t => {
	const { st, set } = make();
	set({ listening: true, sending: true }); t.eq(st.phase(), "sending", "sending beats listening");
	set({ working: true }); t.eq(st.phase(), "agent working", "agent working beats sending");
	set({ speaking: true }); t.eq(st.phase(), "speaking", "speaking beats all");
});

test("subscribe fires on a change of word only", t => {
	const { st, set } = make();
	const seen = []; st.subscribe(w => seen.push(w));
	set({ listening: true }); set({ listening: true });
	set({ sending: true }); set({ working: true });   // sending then agent working
	set({ listening: false }); set({ sending: false });   // still agent working: no repeat
	set({ working: false });
	t.eq(seen, ["listening", "sending", "agent working", ""], "four changes, no repeats");
});
