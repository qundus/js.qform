import type { Extras } from "../../../../_model";
import { CALENDAR } from "../../../../const";

export default {
	init: (extras: Extras.Date.Out<any>): Extras.Date.Out<any>["MINUTE"] => {
		const result: Extras.Date.Out<any>["MINUTE"] = {} as any;
		result.active = new Date().getMinutes();
		//
		return result;
	},
	update(_second: number | undefined | null, extras: Extras.Date.Out<any>) {
		if (_second == null) {
			return;
		}
		extras.SECOND.active = _second;
	},
	check: (extras: Extras.Date.Out<any>) => {
		if (!extras.mode.sequence.includes(CALENDAR.MODE.SECOND)) {
			extras.SECOND.cells = null as any;
			return;
		}
		const seconds: Extras.Date.CellTime[] = [];
		const period = extras.TIME.activePeriod;
		const suffix = extras.TIME.suffix;
		const is12Hour = extras.timeFormat === "12h";

		const year = extras.YEAR.active;
		const month = extras.MONTH.active;
		const day = extras.DAY.active;
		const hour = extras.HOUR.active;
		const minute = extras.MINUTE.active;

		const times = extras.selected.populateSelectedTime(year, month, day);
		for (let i = 0; i < 60; i++) {
			const secondStr = i.toString();
			const isSelected = times.hasTime(hour, minute, i);

			seconds.push({
				key: `calendar.hour.${hour}.minute.${i}.second.${i}`,
				mode: CALENDAR.MODE.SECOND,
				modeName: CALENDAR.MODE[CALENDAR.MODE.SECOND] as any,
				value: secondStr,
				valueNumber: i,
				isSelected,
				is24Hour: !is12Hour,
				name: `${secondStr.padStart(2, "0")}${suffix.long.second}`,
				shortName: `${secondStr.padStart(2, "0")}${suffix.short.second}`,
				suffix: suffix.long.second,
				shortSuffix: suffix.short.second,
			});
		}

		extras.SECOND.cells = seconds;
	},
};
