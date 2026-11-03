// The plugins, in value order: the panel lists them in this order. Importing this file registers them once, on the class.
import { VoiceChat } from "../VoiceChat.js";
import Interrupt from "./Interrupt.js";
import ThinkingCue from "./ThinkingCue.js";

VoiceChat.use(Interrupt, ThinkingCue);
export { Interrupt, ThinkingCue };
