// BargeIn's own starting values, plain data so a settings plugin (ux/Dictate/VoiceChat/plugins/Interrupt.js) can read them without loading the audio classes.
export default { on: true, mode: "volume", threshold: 0.35, quiet_ms: 2500 };   // mode: "volume" | "words"; threshold on the mic meter's 0..1 scale
