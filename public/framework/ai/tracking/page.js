import { Page } from "/app.js";
import TrackingView from "./TrackingView.js";

export default new Page({
	meta: import.meta,
	title: "Tracking",
	description: "Work with no task open, child sessions with no parent link, and stored numbers that disagree.",
	icon: "monitoring",
	classes: "full",
	content(){ new TrackingView(); },
});
