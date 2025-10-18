import type { Field } from "../../../_model";
import type { Extras } from "../../../_model";
import { CALENDAR } from "../../../const";

type Configs = Pick<
	Extras.Date.Out<any>,
	| "mode"
	| "cells"
	| "now"
	| "yearSpan"
	| "selected"
	| "locale"
	| "firstDayOfWeek"
	| "yearView"
	| "timeFormat"
>;
export function makeCells(configs: Configs): Extras.Date.Out<any>["cells"] {
	const result: Extras.Date.Out<any>["cells"] = {};
	result.YEAR = year(configs);
	result.MONTH = month(configs);
	result.DAY = day(configs);
	result.HOUR = hour(configs);
	result.MINUTE = minute(configs);
	result.SECOND = second(configs);

	// sequential arrays
	const activeDateName =
		configs.mode.active <= CALENDAR.MODE.DAY
			? configs.mode.activeName
			: configs.mode.default <= CALENDAR.MODE.DAY
				? configs.mode.defaultName
				: null;
	if (activeDateName != null) {
		// @ts-expect-error
		result.DATE = result[activeDateName];
	}
	//
	const activeTimeName =
		configs.mode.active > CALENDAR.MODE.DAY
			? configs.mode.activeName
			: configs.mode.default > CALENDAR.MODE.DAY
				? configs.mode.defaultName
				: null;
	if (activeTimeName != null) {
		result.TIME = result[activeTimeName];
	}

	return result;
}

function year(configs: Configs): Extras.Date.CellDate[] {
	const years: Extras.Date.CellDate[] = [];
	// Calculate start year based on the current view, not selection
	const currentViewYear = configs.yearView || configs.now.year;
	const startYear = currentViewYear - Math.floor(configs.yearSpan / 2);

	if (!configs.mode.sequence.includes(CALENDAR.MODE.YEAR)) {
		return null as any;
	}
	for (let i = 0; i < configs.yearSpan; i++) {
		const year = startYear + i;
		const yearStr = year.toString();
		const isSelected = configs.selected.hasYear(year);

		years.push({
			key: `calendar.year.${i}`,
			mode: CALENDAR.MODE.YEAR,
			modeName: CALENDAR.MODE[CALENDAR.MODE.YEAR] as any,
			value: yearStr,
			valueNumber: year,
			name: yearStr,
			shortName: yearStr.slice(-2),
			isSelected: isSelected || configs.now.year === year,
		});
	}

	return years;
}

function month(configs: Configs): Extras.Date.CellDate[] {
	const months: Extras.Date.CellDate[] = [];
	const formatter = new Intl.DateTimeFormat(configs.locale, { month: "long" });
	const shortFormatter = new Intl.DateTimeFormat(configs.locale, { month: "short" });

	if (!configs.mode.sequence.includes(CALENDAR.MODE.MONTH)) {
		return null as any;
	}

	for (let i = 0; i < 12; i++) {
		const date = new Date(configs.now.year, i, 1);
		const monthNumber = i + 1;
		const isSelected = configs.selected.hasYearMonth(configs.now.year, monthNumber);

		months.push({
			key: `calendar.month.${i}`,
			mode: CALENDAR.MODE.MONTH,
			modeName: CALENDAR.MODE[CALENDAR.MODE.MONTH] as any,
			value: `${monthNumber}`,
			valueNumber: monthNumber,
			name: formatter.format(date),
			shortName: shortFormatter.format(date),
			isSelected: isSelected || configs.now.month === monthNumber,
		});
	}

	return months;
}

function day(extras: Configs): Extras.Date.CellDate[] {
	if (!extras.mode.sequence.includes(CALENDAR.MODE.DAY)) {
		return null as any;
	}

	const days: Extras.Date.CellDate[] = [];
	const today = new Date();

	const currentYear = extras.now.year;
	const currentMonth = extras.now.month - 1;
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
			key = `calendar.day.${extras.now.month}.${dayNumber}`;

			// Only check for today
			const date = new Date(currentYear, currentMonth, dayNumber);
			isToday = date.toDateString() === today.toDateString();
			// check for selected dates in spanned months' days
			isSelected = extras.selected.hasDate(extras.now.year, extras.now.month, dayNumber);
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

	return days;
}

function hour(extras: Configs): Extras.Date.CellTime[] {
	const hours: Extras.Date.CellTime[] = [];
	const maxHour = extras.timeFormat === "12h" ? 12 : 24;
	const year = extras.now.year;
	const month = extras.now.month - 1;
	const day = extras.now.day;
	const period = extras.now.period;
	const is12Hour = extras.timeFormat === "12h";

	const times = extras.selected.getTimesForDate(year, month, day);
	for (let i = 0; i < maxHour; i++) {
		const hour = is12Hour ? (i === 0 ? 12 : i) : i;
		const hourStr = hour.toString();
		const idx = times.findIndex(
			(t) => (is12Hour ? t.period === period : true) && t.hourNumber === hour,
		);

		hours.push({
			key: `calendar.hour.${i}`,
			mode: CALENDAR.MODE.HOUR,
			modeName: CALENDAR.MODE[CALENDAR.MODE.HOUR] as any,
			value: hourStr,
			valueNumber: hour,
			isSelected: idx >= 0,
			is24Hour: !is12Hour,
		});
		// name: hourStr.padStart(2, "0"),
		// shortName: hourStr,
	}

	return hours;
}

function minute(extras: Configs): Extras.Date.CellTime[] {
	const minutes: Extras.Date.CellTime[] = [];
	const year = extras.now.year;
	const month = extras.now.month - 1;
	const day = extras.now.day;
	const hour = extras.now.hour;
	const period = extras.now.period;
	const is12Hour = extras.timeFormat === "12h";

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
		});
	}

	return minutes;
}

function second(extras: Configs): Extras.Date.CellTime[] {
	const seconds: Extras.Date.CellTime[] = [];
	const year = extras.now.year;
	const month = extras.now.month - 1;
	const day = extras.now.day;
	const hour = extras.now.hour;
	const minute = extras.now.minute;
	const period = extras.now.period;
	const is12Hour = extras.timeFormat === "12h";

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
		});
	}

	return seconds;
}
