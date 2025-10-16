import type { Field } from "../../../_model";
import { Extras } from "../../../_model";

type Configs = Pick<
	Extras.Date.Out<any>,
	"mode" | "cells" | "now" | "spanYears" | "selected" | "locale" | "firstDayOfWeek" | "viewYear"
>;
export function makeCells(configs: Configs): Extras.Date.Out<any>["cells"] {
	const result: Extras.Date.Out<any>["cells"] = {};
	result.YEAR = year(configs);
	result.MONTH = month(configs);
	result.DAY = day(configs);
	// time

	// general arrays
	const activeDateName =
		configs.mode.active <= Extras.Date.Mode.DAY
			? configs.mode.activeName
			: configs.mode.default <= Extras.Date.Mode.DAY
				? configs.mode.defaultName
				: null;
	if (activeDateName != null) {
		result.date = result[activeDateName];
	}

	return result;
}

function year(configs: Configs): Extras.Date.Cell[] {
	const years: Extras.Date.Cell[] = [];
	// Calculate start year based on the current view, not selection
	const currentViewYear = configs.viewYear || configs.now.year;
	const startYear = currentViewYear - Math.floor(configs.spanYears / 2);

	if (!configs.mode.sequence.includes(Extras.Date.Mode.YEAR)) {
		return null as any;
	}
	const keys = configs.selected.keys();

	for (let i = 0; i < configs.spanYears; i++) {
		const year = startYear + i;
		const yearStr = year.toString();
		const found = keys.find((d) => d.yearNumber === year);
		const isSelected = found != null;

		years.push({
			key: `calendar.year.${i}`,
			mode: Extras.Date.Mode.YEAR,
			modeName: Extras.Date.Mode[Extras.Date.Mode.YEAR] as any,
			value: yearStr,
			valueNumber: year,
			name: yearStr,
			shortName: yearStr.slice(-2),
			isSelected: isSelected || configs.now.year === year,
		});
	}

	return years;
}

function month(configs: Configs): Extras.Date.Cell[] {
	const months: Extras.Date.Cell[] = [];
	const formatter = new Intl.DateTimeFormat(configs.locale, { month: "long" });
	const shortFormatter = new Intl.DateTimeFormat(configs.locale, { month: "short" });

	if (!configs.mode.sequence.includes(Extras.Date.Mode.MONTH)) {
		return null as any;
	}

	const keys = configs.selected.keys();
	for (let i = 0; i < 12; i++) {
		const date = new Date(configs.now.year, i, 1);
		const monthNumber = i + 1;
		const found = keys.find(
			(d) => d.yearNumber === configs.now.year && d.monthNumber === monthNumber,
		);
		const isSelected = found != null;

		months.push({
			key: `calendar.month.${i}`,
			mode: Extras.Date.Mode.MONTH,
			modeName: Extras.Date.Mode[Extras.Date.Mode.MONTH] as any,
			value: `${monthNumber}`,
			valueNumber: monthNumber,
			name: formatter.format(date),
			shortName: shortFormatter.format(date),
			isSelected: isSelected || configs.now.month === monthNumber,
		});
	}

	return months;
}

function day(extras: Configs): Extras.Date.Cell[] {
	if (!extras.mode.sequence.includes(Extras.Date.Mode.DAY)) {
		return null as any;
	}

	const days: Extras.Date.Cell[] = [];
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
	const keys = extras.selected.keys();
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
		}

		// check for selected dates in spanned months' days
		const found = keys.find(
			(d) =>
				d.yearNumber === extras.now.year &&
				d.monthNumber === extras.now.month &&
				d.dayNumber === dayNumber,
		);
		isSelected = found != null;

		const dayStr = dayNumber.toString();

		days.push({
			key,
			mode: Extras.Date.Mode.DAY,
			modeName: Extras.Date.Mode[Extras.Date.Mode.DAY] as any,
			value: dayStr,
			valueNumber: i,
			name: dayStr,
			shortName: dayStr,
			isSelected,
			isToday,
			isOtherMonth,
		});
	}

	return days;
}

// function hours(extras: Configs): Extras.Date.Cell[] {
// 	const hours: Extras.Date.Cell[] = [];
// 	const maxHour = extras.timeFormat === "12h" ? 12 : 24;

// 	for (let i = 0; i < maxHour; i++) {
// 		const hour = extras.timeFormat === "12h" ? (i === 0 ? 12 : i) : i;
// 		const hourStr = hour.toString();
// 		const idx = extras.__selectedDates.findIndex((d) => d.time.hour === hourStr);

// 		hours.push({
// 			key: `calendar.hour.${i}`,
// 			mode: Extras.Date.Mode.DAY,
// 			modeName: Extras.Date.Mode[Extras.Date.Mode.DAY] as any,
// 			value: hourStr,
// 			name: hourStr.padStart(2, "0"),
// 			shortName: hourStr,
// 			isSelected: idx >= 0,
// 			is24Hour: extras.timeFormat === "24h",
// 			selectedIndex: -1,
// 		});
// 	}

// 	return hours;
// }

// function minutes(extras: Options): Extras.Date.Cell[] {
// 	const minutes: Extras.Date.Cell[] = [];

// 	for (let i = 0; i < 60; i++) {
// 		const minuteStr = i.toString();
// 		const isSelected = extras.__selectedDates.some((d) => d.time.minute === minuteStr);

// 		minutes.push({
// 			key: `calendar.minute.${i}`,
// 			type: "minute",
// 			value: minuteStr,
// 			name: minuteStr.padStart(2, "0"),
// 			shortName: minuteStr.padStart(2, "0"),
// 			isSelected,
// 			selectedIndex: -1,
// 		});
// 	}

// 	return minutes;
// }

// function seconds(extras: Options): Extras.Date.Cell[] {
// 	const seconds: Extras.Date.Cell[] = [];

// 	for (let i = 0; i < 60; i++) {
// 		const secondStr = i.toString();
// 		const isSelected = extras.__selectedDates.some((d) => d.time.second === secondStr);

// 		seconds.push({
// 			key: `calendar.second.${i}`,
// 			type: "second",
// 			value: secondStr,
// 			name: secondStr.padStart(2, "0"),
// 			shortName: secondStr.padStart(2, "0"),
// 			isSelected,
// 			selectedIndex: -1,
// 		});
// 	}

// 	return seconds;
// }

// function generatePeriod(extras: Options): Extras.Date.Item[] {
// 	return [
// 		{
// 			type: "period",
// 			value: "AM",
// 			name: "AM",
// 			shortName: "AM",
// 			isSelected: extras.selectedDates.some((d) => d.period === "AM"),
// 		},
// 		{
// 			type: "period",
// 			value: "PM",
// 			name: "PM",
// 			shortName: "PM",
// 			isSelected: extras.selectedDates.some((d) => d.period === "PM"),
// 		},
// 	];
// }
