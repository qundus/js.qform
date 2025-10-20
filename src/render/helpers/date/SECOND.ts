import type { Extras } from "../../../_model";
import { CALENDAR } from "../../../const";

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
	check: (extras: Extras.Date.Out<any>): Extras.Date.CellTime[] => {
		if (!extras.mode.sequence.includes(CALENDAR.MODE.SECOND)) {
			return null as any;
		}
		const seconds: Extras.Date.CellTime[] = [];
		const period = extras.TIME.activePeriod;
		const suffix = extras.TIME.suffix;
		const is12Hour = extras.timeFormat === "12h";

		const year = extras.YEAR.active;
		const month = extras.MONTH.active - 1;
		const day = extras.DAY.active;
		const hour = extras.HOUR.active;
		const minute = extras.MINUTE.active;

		const times = extras.selected.getTimesForDate(year, month, day);
		for (let i = 0; i < 60; i++) {
			const secondStr = i.toString();
			const idx = times.findIndex(
				(t) =>
					(is12Hour ? t.period === period : true) &&
					t.hourNumber === hour &&
					t.minuteNumber === minute &&
					t.secondNumber === i,
			);

			seconds.push({
				key: `calendar.hour.${hour}.minute.${i}.second.${i}`,
				mode: CALENDAR.MODE.SECOND,
				modeName: CALENDAR.MODE[CALENDAR.MODE.SECOND] as any,
				value: secondStr,
				valueNumber: i,
				isSelected: idx >= 0,
				is24Hour: !is12Hour,
				name: `${secondStr.padStart(2, "0")}${suffix.long.second}`,
				shortName: `${secondStr.padStart(2, "0")}${suffix.short.second}`,
			});
		}

		return seconds;
	},
};
