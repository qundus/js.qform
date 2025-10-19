import type { Extras } from "../../../_model";
import { CALENDAR } from "../../../const";
import { extractFormatTokens } from "./parse";

type Configs = Pick<Extras.Date.In, "format" | "defaultMode">;
export function initMode(configs: Configs): Extras.Date.Out<any>["mode"] {
	const formatTokens = extractFormatTokens(configs.format);
	const modeSequence = [] as CALENDAR.MODE[];
	//
	for (const token of formatTokens) {
		const value = token.toLowerCase();
		if (value === "yyyy" || value === "yy") {
			modeSequence.push(CALENDAR.MODE.YEAR);
		} else if (value === "mm" || value === "m") {
			modeSequence.push(CALENDAR.MODE.MONTH);
		} else if (value === "dd" || value === "d") {
			modeSequence.push(CALENDAR.MODE.DAY);
		} else if (value === "hh" || value === "h") {
			modeSequence.push(CALENDAR.MODE.HOUR);
		} else if (value === "nn" || value === "n") {
			modeSequence.push(CALENDAR.MODE.MINUTE);
		} else if (value === "ss" || value === "s") {
			modeSequence.push(CALENDAR.MODE.SECOND);
		}
	}
	modeSequence.sort();
	// set initial type mode
	let active = null as unknown as CALENDAR.MODE;
	// TODO: offer a better way to set starting mode, for now it's in this order.
	if (modeSequence.includes(CALENDAR.MODE.DAY)) active = CALENDAR.MODE.DAY;
	else if (modeSequence.includes(CALENDAR.MODE.MONTH)) active = CALENDAR.MODE.MONTH;
	else if (modeSequence.includes(CALENDAR.MODE.YEAR)) active = CALENDAR.MODE.YEAR;
	else if (modeSequence.includes(CALENDAR.MODE.HOUR)) active = CALENDAR.MODE.HOUR;
	else if (modeSequence.includes(CALENDAR.MODE.MINUTE)) active = CALENDAR.MODE.MINUTE;
	else if (modeSequence.includes(CALENDAR.MODE.SECOND)) active = CALENDAR.MODE.SECOND;

	// check if user requested mode is allowed
	if (configs.defaultMode != null) {
		const userRequestedMode = CALENDAR.MODE[configs.defaultMode];
		if (modeSequence.includes(userRequestedMode)) {
			active = userRequestedMode;
		} else {
			console.warn(
				"qform: user requested default calendar mode <",
				configs.defaultMode,
				"> is not allowed, reverting to <",
				CALENDAR.MODE[active],
				">",
			);
		}
	}
	//
	const activeType =
		active <= CALENDAR.MODE.DAY ? CALENDAR.MODE_TYPE.DATE : CALENDAR.MODE_TYPE.TIME;
	const apply = modeSequence[modeSequence.length - 1];
	return {
		active,
		activeType,
		default: active,
		defaultType: activeType,
		apply,
		// names
		activeName: CALENDAR.MODE[active] as any,
		defaultName: CALENDAR.MODE[active] as any,
		activeTypeName: CALENDAR.MODE_TYPE[activeType],
		defaultTypeName: CALENDAR.MODE_TYPE[activeType] as any,
		applyName: CALENDAR.MODE[apply] as any,
		// others
		sequence: modeSequence,
	};
}

export function nextMode(configs: { mode: Extras.Date.Out<any>["mode"] }) {
	// find next mode object
	const result = { ...configs.mode };
	const idx = result.sequence.indexOf(result.active);
	const nextIdx = idx + 1;
	let active = result.active;
	if (nextIdx < result.sequence.length) {
		active = result.sequence[nextIdx];
	}

	//
	if (active !== result.active) {
		result.active = active;
		result.activeType =
			active <= CALENDAR.MODE.DAY ? CALENDAR.MODE_TYPE.DATE : CALENDAR.MODE_TYPE.TIME;
		result.activeName = CALENDAR.MODE[result.active] as any;
		result.activeTypeName = CALENDAR.MODE_TYPE[result.activeType] as any;
	}

	return result;
}

export function goToMode(reqMode: CALENDAR.MODE, configs: { mode: Extras.Date.Out<any>["mode"] }) {
	const idx = configs.mode.sequence.indexOf(reqMode);
	if (idx < 0) {
		return configs.mode;
	}
	const result = { ...configs.mode };
	const active = reqMode;

	//
	result.active = active;
	result.activeType =
		active <= CALENDAR.MODE.DAY ? CALENDAR.MODE_TYPE.DATE : CALENDAR.MODE_TYPE.TIME;
	result.activeName = CALENDAR.MODE[result.active] as any;
	result.activeTypeName = CALENDAR.MODE_TYPE[result.activeType] as any;
	return result;
}
