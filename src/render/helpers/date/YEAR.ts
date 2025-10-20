import type { Extras } from "../../../_model";
import { CALENDAR } from "../../../const";

export default {
	init: (extras: Extras.Date.Out<any>): Extras.Date.Out<any>["YEAR"] => {
		const result: Extras.Date.Out<any>["YEAR"] = {} as any;
		result.active = new Date().getFullYear();
		result.start = result.active - Math.floor(extras.yearSpan / 2);
		result.end = result.start + (extras.yearSpan - 1);
		return result;
	},
	update(year: number | undefined | null, extras: Extras.Date.Out<any>) {
		if (year == null) {
			return;
		}
		extras.YEAR.active = year;
		extras.YEAR.start = year - Math.floor(extras.yearSpan / 2);
		extras.YEAR.end = extras.YEAR.start + (extras.yearSpan - 1);
	},
	check(extras: Extras.Date.Out<any>) {
		if (!extras.mode.sequence.includes(CALENDAR.MODE.YEAR)) {
			extras.YEAR.cells = null as any;
			return;
		}
		const years: Extras.Date.CellDate[] = [];
		// Calculate start year based on the current view, not selection
		for (let i = 0; i < extras.YEAR.end; i++) {
			const year = extras.YEAR.start + i;
			const yearStr = year.toString();
			const isSelected = extras.selected.hasYear(year);

			years.push({
				key: `calendar.year.${i}`,
				mode: CALENDAR.MODE.YEAR,
				modeName: CALENDAR.MODE[CALENDAR.MODE.YEAR] as any,
				value: yearStr,
				valueNumber: year,
				name: yearStr,
				shortName: yearStr.slice(-2),
				isSelected: isSelected || extras.YEAR.active === year,
			});
		}

		extras.YEAR.cells = years;
	},
	//
	events: {
		prevView: (extras: Extras.Date.Out<any>) => {
			extras.YEAR.start -= extras.yearSpan;
			extras.YEAR.end = extras.YEAR.start + (extras.yearSpan - 1);
		},
		nextView: (extras: Extras.Date.Out<any>) => {
			extras.YEAR.start += extras.yearSpan;
			extras.YEAR.end = extras.YEAR.start + (extras.yearSpan - 1);
		},
		prev: (extras: Extras.Date.Out<any>) => {
			const next = extras.YEAR.active - 1;
			extras.YEAR.active = next;
			if (next < extras.YEAR.start) {
				extras.YEAR.start -= extras.yearSpan;
				extras.YEAR.end = extras.YEAR.start + (extras.yearSpan - 1);
			}
		},
		next: (extras: Extras.Date.Out<any>) => {
			const next = extras.YEAR.active + 1;
			extras.YEAR.active = next;
			if (next > extras.YEAR.end) {
				extras.YEAR.start += extras.yearSpan;
				extras.YEAR.end = extras.YEAR.start + (extras.yearSpan - 1);
			}
		},
	},
};
