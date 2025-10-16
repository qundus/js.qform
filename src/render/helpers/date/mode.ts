import { Extras } from "../../../_model";
import { extractFormatTokens } from "./parse";

type Configs = {
	format: string;
};
export function initMode(configs: Configs): Extras.Date.Out<any>["mode"] {
	const formatTokens = extractFormatTokens(configs.format);
	const modeSequence = [] as Extras.Date.Mode[];
	//
	for (const token of formatTokens) {
		const value = token.toLowerCase();
		if (value === "yyyy" || value === "yy") {
			modeSequence.push(Extras.Date.Mode.YEAR);
		} else if (value === "mm" || value === "m") {
			modeSequence.push(Extras.Date.Mode.MONTH);
		} else if (value === "dd" || value === "d") {
			modeSequence.push(Extras.Date.Mode.DAY);
		} else if (value === "hh" || value === "h") {
			modeSequence.push(Extras.Date.Mode.HOUR);
		} else if (value === "nn" || value === "n") {
			modeSequence.push(Extras.Date.Mode.MINUTE);
		} else if (value === "ss" || value === "s") {
			modeSequence.push(Extras.Date.Mode.SECOND);
		}
	}
	modeSequence.sort();
	// set initial type mode
	let active = null as unknown as Extras.Date.Mode;
	// TODO: offer a better way to set starting mode, for now it's in this order.
	if (modeSequence.includes(Extras.Date.Mode.DAY)) active = Extras.Date.Mode.DAY;
	else if (modeSequence.includes(Extras.Date.Mode.MONTH)) active = Extras.Date.Mode.MONTH;
	else if (modeSequence.includes(Extras.Date.Mode.YEAR)) active = Extras.Date.Mode.YEAR;
	else if (modeSequence.includes(Extras.Date.Mode.HOUR)) active = Extras.Date.Mode.HOUR;
	else if (modeSequence.includes(Extras.Date.Mode.MINUTE)) active = Extras.Date.Mode.MINUTE;
	else if (modeSequence.includes(Extras.Date.Mode.SECOND)) active = Extras.Date.Mode.SECOND;

	const activeType =
		active <= Extras.Date.Mode.DAY ? Extras.Date.ModeType.DATE : Extras.Date.ModeType.TIME;
	return {
		active,
		activeType,
		default: active,
		defaultType: activeType,
		// names
		activeName: Extras.Date.Mode[active] as any,
		defaultName: Extras.Date.Mode[active] as any,
		activeTypeName: Extras.Date.ModeType[activeType],
		defaultTypeName: Extras.Date.ModeType[activeType] as any,
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
			active <= Extras.Date.Mode.DAY ? Extras.Date.ModeType.DATE : Extras.Date.ModeType.TIME;
		result.activeName = Extras.Date.Mode[result.active] as any;
		result.activeTypeName = Extras.Date.ModeType[result.activeType] as any;
	}

	return result;
}

export function goToMode(
	reqMode: Extras.Date.Mode,
	configs: { mode: Extras.Date.Out<any>["mode"] },
) {
	const idx = configs.mode.sequence.indexOf(reqMode);
	if (idx < 0) {
		return configs.mode;
	}
	const result = { ...configs.mode };
	const active = reqMode;

	//
	result.active = active;
	result.activeType =
		active <= Extras.Date.Mode.DAY ? Extras.Date.ModeType.DATE : Extras.Date.ModeType.TIME;
	result.activeName = Extras.Date.Mode[result.active] as any;
	result.activeTypeName = Extras.Date.ModeType[result.activeType] as any;
	return result;
}
