import type { Extras } from "../../../_model";
import { CALENDAR } from "../../../const";

export default {
	init: (extras: Extras.Date.Out<any>): Extras.Date.Out<any>["MONTH"] => {
		const result: Extras.Date.Out<any>["MONTH"] = {} as any;
		result.active = new Date().getMonth() + 1;

		//
		const date = new Date(extras.YEAR.active, extras.MONTH.active - 1, 1);
		const formatter = new Intl.DateTimeFormat(extras.locale, { month: "long" });
		const shortFormatter = new Intl.DateTimeFormat(extras.locale, { month: "short" });

		//
		result.name = formatter.format(date);
		result.shortName = shortFormatter.format(date);
		return result;
	},
	update(_month: number | undefined | null, extras: Extras.Date.Out<any>) {
		if (_month == null) {
			return;
		}
		const month = _month <= 0 ? 1 : _month > 12 ? 12 : _month;
		const date = new Date(extras.YEAR.active, month - 1, 1);
		const formatter = new Intl.DateTimeFormat(extras.locale, { month: "long" });
		const shortFormatter = new Intl.DateTimeFormat(extras.locale, { month: "short" });

		//
		extras.MONTH.name = formatter.format(date);
		extras.MONTH.shortName = shortFormatter.format(date);
	},
	check: (extras: Extras.Date.Out<any>) => {
		if (!extras.mode.sequence.includes(CALENDAR.MODE.MONTH)) {
			extras.MONTH.cells = null as any;
			return;
		}
		const months: Extras.Date.CellDate[] = [];
		const formatter = new Intl.DateTimeFormat(extras.locale, { month: "long" });
		const shortFormatter = new Intl.DateTimeFormat(extras.locale, { month: "short" });

		for (let i = 0; i < 12; i++) {
			const date = new Date(extras.YEAR.active, i, 1);
			const monthNumber = i + 1;
			const isSelected = extras.selected.hasYearMonth(extras.YEAR.active, monthNumber);

			months.push({
				key: `calendar.month.${i}`,
				mode: CALENDAR.MODE.MONTH,
				modeName: CALENDAR.MODE[CALENDAR.MODE.MONTH] as any,
				value: `${monthNumber}`,
				valueNumber: monthNumber,
				name: formatter.format(date),
				shortName: shortFormatter.format(date),
				isSelected: isSelected || extras.MONTH.active === monthNumber,
			});
		}

		extras.MONTH.cells = months;
	},
	//
	events: {
		prev: (extras: Extras.Date.Out<any>) => {
			const next = extras.MONTH.active - 1;
			if (next < 1) {
				return;
			}
			extras.MONTH.active = next;
		},
		next: (extras: Extras.Date.Out<any>) => {
			const next = extras.MONTH.active + 1;
			if (next > 12) {
				return;
			}
			extras.MONTH.active = next;
		},
	},
};
