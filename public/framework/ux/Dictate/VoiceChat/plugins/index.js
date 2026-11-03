// The plugins, in value order: the panel lists them in this order. Importing this file registers them once, on the class.
import { VoiceChat } from "../VoiceChat.js";
import SendAfter from "./SendAfter.js";
import ReadAloud from "./ReadAloud.js";
import Interrupt from "./Interrupt.js";
import ThinkingCue from "./ThinkingCue.js";

VoiceChat.use(SendAfter, ReadAloud, Interrupt, ThinkingCue);
export { SendAfter, ReadAloud, Interrupt, ThinkingCue };
