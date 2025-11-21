import type { Extras } from "../../../../_model";
import { CALENDAR } from "../../../../const";

export default {
	init: (extras: Extras.Date.Out<any>): Extras.Date.Out<any>["HOUR"] => {
		const result: Extras.Date.Out<any>["HOUR"] = {} as any;
		result.active = new Date().getHours(); // 0-23
		//
		return result;
	},
	update(_hour: number | undefined | null, extras: Extras.Date.Out<any>) {
		if (_hour == null) {
			return;
		}
		extras.HOUR.active = _hour;
	},
	check: (extras: Extras.Date.Out<any>) => {
		if (!extras.mode.sequence.includes(CALENDAR.MODE.HOUR)) {
			extras.HOUR.cells = null as any;
			return;
		}
		const hours: Extras.Date.CellTime[] = [];
		const period = extras.TIME.activePeriod;
		const suffix = extras.TIME.suffix;
		const is12Hour = extras.timeFormat === "12h";
		const maxHour = extras.timeFormat === "12h" ? 12 : 24;

		const year = extras.YEAR.active;
		const month = extras.MONTH.active;
		const day = extras.DAY.active;

		const times = extras.selected.populateSelectedTime(year, month, day);
		for (let i = 0; i < maxHour; i++) {
			const hour = is12Hour ? i + 1 : i;
			const hourStr = hour.toString();
			const isSelected = times.hasHour(hour);

			hours.push({
				key: `calendar.hour.${i}`,
				mode: CALENDAR.MODE.HOUR,
				modeName: CALENDAR.MODE[CALENDAR.MODE.HOUR] as any,
				value: hourStr,
				valueNumber: hour,
				isSelected,
				is24Hour: !is12Hour,
				name: `${hourStr.padStart(2, "0")}${suffix.long.hour}`,
				shortName: `${hourStr.padStart(2, "0")}${suffix.short.hour}`,
				suffix: suffix.long.hour,
				shortSuffix: suffix.short.hour,
			});
		}

		extras.HOUR.cells = hours;
	},
};
