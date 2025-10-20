import type { Extras } from "../../../_model";
import { CALENDAR } from "../../../const";

function daysHeaders(locale: string, firstDayOfWeek: number): Extras.Date.Header[] {
	const headers: Extras.Date.Header[] = [];
	const formatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
	const shortFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });

	for (let i = 0; i < 7; i++) {
		const dayIndex = (firstDayOfWeek + i) % 7;
		const date = new Date(2023, 0, dayIndex + 1); // Any date with the right weekday

		headers.push({
			value: dayIndex.toString(),
			name: formatter.format(date),
			shortName: shortFormatter.format(date),
		});
	}

	return headers;
}

export default {
	init: (extras: Extras.Date.Out<any>): Extras.Date.Out<any>["DAY"] => {
		const result: Extras.Date.Out<any>["DAY"] = {} as any;
		result.active = new Date().getDate();

		//
		const date = new Date(extras.YEAR.active, extras.MONTH.active - 1, result.active);
		const formatter = new Intl.DateTimeFormat(extras.locale, { weekday: "long" });
		const shortFormatter = new Intl.DateTimeFormat(extras.locale, { weekday: "short" });

		//
		result.name = formatter.format(date);
		result.shortName = shortFormatter.format(date);
		result.headers = daysHeaders(extras.locale, extras.firstDayOfWeek);

		return result;
	},
	update(_day: number | undefined | null, extras: Extras.Date.Out<any>) {
		if (_day == null) {
			return;
		}
		const day = _day;
		const date = new Date(extras.YEAR.active, extras.MONTH.active - 1, day);
		const formatter = new Intl.DateTimeFormat(extras.locale, { weekday: "long" });
		const shortFormatter = new Intl.DateTimeFormat(extras.locale, { weekday: "short" });

		//
		extras.DAY.name = formatter.format(date);
		extras.DAY.shortName = shortFormatter.format(date);
	},
	check: (extras: Extras.Date.Out<any>) => {
		if (!extras.mode.sequence.includes(CALENDAR.MODE.DAY)) {
			extras.DAY.cells = null as any;
			return;
		}

		const days: Extras.Date.CellDate[] = [];
		const today = new Date();

		const currentYear = extras.YEAR.active;
		const currentMonth = extras.MONTH.active - 1;
		const firstDay = new Date(currentYear, currentMonth, 1);
		const lastDay = new Date(currentYear, currentMonth + 1, 0);
		const daysInCurrentMonth = lastDay.getDate();
		const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

		const startDayOffset = (firstDay.getDay() - extras.firstDayOfWeek + 7) % 7;
		const totalCells = 42;

		//
		for (let i = 0; i < totalCells; i++) {
			let dayNumber: number;
			let key: string;
			let isOtherMonth = false;
			let isToday = false;
			let isSelected = false;

			if (i < startDayOffset) {
				// Previous month
				dayNumber = daysInPrevMonth - startDayOffset + i + 1;
				key = `calendar.day-prev.${dayNumber}`;
				isOtherMonth = true;
			} else if (i >= startDayOffset + daysInCurrentMonth) {
				// Next month
				dayNumber = i - startDayOffset - daysInCurrentMonth + 1;
				key = `calendar.day-next.${dayNumber}`;
				isOtherMonth = true;
			} else {
				// Current month
				dayNumber = i - startDayOffset + 1;
				key = `calendar.day.${extras.MONTH.active}.${dayNumber}`;

				// Only check for today
				const date = new Date(currentYear, currentMonth, dayNumber);
				isToday = date.toDateString() === today.toDateString();
				// check for selected dates in spanned months' days
				isSelected = extras.selected.hasDate(extras.YEAR.active, extras.MONTH.active, dayNumber);
			}

			const dayStr = dayNumber.toString();

			days.push({
				key,
				mode: CALENDAR.MODE.DAY,
				modeName: CALENDAR.MODE[CALENDAR.MODE.DAY] as any,
				value: dayStr,
				valueNumber: dayNumber,
				name: dayStr,
				shortName: dayStr,
				isSelected,
				isToday,
				isOtherMonth,
			});
		}

		extras.DAY.cells = days;
	},
};
