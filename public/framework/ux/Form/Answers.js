import YesNo from "./answers/YesNo.js";
import Toggle from "./answers/Toggle.js";
import ChooseOne from "./answers/ChooseOne.js";
import Dropdown from "./answers/Dropdown.js";
import ChooseMany from "./answers/ChooseMany.js";
import Chips from "./answers/Chips.js";
import Frequency from "./answers/Frequency.js";
import Agreement from "./answers/Agreement.js";
import Scale7 from "./answers/Scale7.js";
import Slider7 from "./answers/Slider7.js";
import Slider100 from "./answers/Slider100.js";
import Likelihood from "./answers/Likelihood.js";
import Stars from "./answers/Stars.js";
import NumberAnswer from "./answers/NumberAnswer.js";
import DateAnswer from "./answers/DateAnswer.js";
import TimeAnswer from "./answers/TimeAnswer.js";
import ShortText from "./answers/ShortText.js";
import LongText from "./answers/LongText.js";
import RankTop3 from "./answers/RankTop3.js";
import Emoji from "./answers/Emoji.js";

/**
 * The 20 answer classes in type order (T01 … T20), and how a question's `type` finds one.
 *   Answers.find("T09") · find("scale7") · find("Scale7") · find("number")   // the class
 *   Answers.make("stars", { value: 4 })                                       // an instance
 * A key matches the type id or the class name, case and punctuation ignored, "Answer" suffix optional.
 */
export default class Answers {

	static list = [YesNo, Toggle, ChooseOne, Dropdown, ChooseMany, Chips, Frequency, Agreement, Scale7, Slider7,
		Slider100, Likelihood, Stars, NumberAnswer, DateAnswer, TimeAnswer, ShortText, LongText, RankTop3, Emoji];

	static norm(key){
		return String(key).toLowerCase().replace(/[^a-z0-9]/g, "").replace(/answer$/, "");
	}

	static find(key){
		const k = Answers.norm(key);
		return Answers.list.find(A => Answers.norm(A.type) === k || Answers.norm(A.name) === k);
	}

	static make(key, opts = {}){
		const A = Answers.find(key);
		if (!A) throw new Error(`Form: no answer type "${key}"`);
		return new A(opts);
	}
}
