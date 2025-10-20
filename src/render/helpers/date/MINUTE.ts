import type { Extras } from "../../../_model";
import { CALENDAR } from "../../../const";

export default {
	init: (extras: Extras.Date.Out<any>): Extras.Date.Out<any>["MINUTE"] => {
		const result: Extras.Date.Out<any>["MINUTE"] = {} as any;
		result.active = new Date().getMinutes();
		//
		return result;
	},
	update(_minute: number | undefined | null, extras: Extras.Date.Out<any>) {
		if (_minute == null) {
			return;
		}
		extras.MINUTE.active = _minute;
	},
	check: (extras: Extras.Date.Out<any>) => {
		if (!extras.mode.sequence.includes(CALENDAR.MODE.MINUTE)) {
			extras.MINUTE.cells = null as any;
			return;
		}
		const minutes: Extras.Date.CellTime[] = [];
		const period = extras.TIME.activePeriod;
		const suffix = extras.TIME.suffix;
		const is12Hour = extras.timeFormat === "12h";

		const year = extras.YEAR.active;
		const month = extras.MONTH.active - 1;
		const day = extras.DAY.active;
		const hour = extras.HOUR.active;

		const times = extras.selected.getTimesForDate(year, month, day);
		for (let i = 0; i < 60; i++) {
			const minuteStr = i.toString();
			const idx = times.findIndex(
				(t) =>
					(is12Hour ? t.period === period : true) && t.hourNumber === hour && t.minuteNumber === i,
			);

			minutes.push({
				key: `calendar.hour.${hour}.minute.${i}`,
				mode: CALENDAR.MODE.MINUTE,
				modeName: CALENDAR.MODE[CALENDAR.MODE.MINUTE] as any,
				value: minuteStr,
				valueNumber: i,
				isSelected: idx >= 0,
				is24Hour: !is12Hour,
				name: `${minuteStr.padStart(2, "0")}${suffix.long.minute}`,
				shortName: `${minuteStr.padStart(2, "0")}${suffix.short.minute}`,
			});
		}

		extras.MINUTE.cells = minutes;
	},
};
