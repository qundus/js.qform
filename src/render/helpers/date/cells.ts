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
	if (!configs.mode.sequence.includes(CALENDAR.MODE.YEAR)) {
		return null as any;
	}
	const years: Extras.Date.CellDate[] = [];
	// Calculate start year based on the current view, not selection
	const currentViewYear = configs.yearView || configs.now.year;
	const startYear = currentViewYear - Math.floor(configs.yearSpan / 2);

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
	if (!configs.mode.sequence.includes(CALENDAR.MODE.MONTH)) {
		return null as any;
	}
	const months: Extras.Date.CellDate[] = [];
	const formatter = new Intl.DateTimeFormat(configs.locale, { month: "long" });
	const shortFormatter = new Intl.DateTimeFormat(configs.locale, { month: "short" });

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
	if (!extras.mode.sequence.includes(CALENDAR.MODE.HOUR)) {
		return null as any;
	}
	const hours: Extras.Date.CellTime[] = [];
	const maxHour = extras.timeFormat === "12h" ? 12 : 24;
	const year = extras.now.year;
	const month = extras.now.month - 1;
	const day = extras.now.day;
	const period = extras.now.period;
	const is12Hour = extras.timeFormat === "12h";

	const times = extras.selected.getTimesForDate(year, month, day);
	const suffix = getTimeSuffixes(extras.locale);
	for (let i = 0; i < maxHour; i++) {
		const hour = is12Hour ? i + 1 : i;
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
			name: `${hourStr.padStart(2, "0")}${suffix.long.hour}`,
			shortName: `${hourStr.padStart(2, "0")}${suffix.short.hour}`,
		});
	}

	return hours;
}

function minute(extras: Configs): Extras.Date.CellTime[] {
	if (!extras.mode.sequence.includes(CALENDAR.MODE.MINUTE)) {
		return null as any;
	}
	const minutes: Extras.Date.CellTime[] = [];
	const year = extras.now.year;
	const month = extras.now.month - 1;
	const day = extras.now.day;
	const hour = extras.now.hour;
	const period = extras.now.period;
	const is12Hour = extras.timeFormat === "12h";

	const times = extras.selected.getTimesForDate(year, month, day);
	const suffix = getTimeSuffixes(extras.locale);
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

	return minutes;
}

function second(extras: Configs): Extras.Date.CellTime[] {
	if (!extras.mode.sequence.includes(CALENDAR.MODE.SECOND)) {
		return null as any;
	}
	const seconds: Extras.Date.CellTime[] = [];
	const year = extras.now.year;
	const month = extras.now.month - 1;
	const day = extras.now.day;
	const hour = extras.now.hour;
	const minute = extras.now.minute;
	const period = extras.now.period;
	const is12Hour = extras.timeFormat === "12h";

	const times = extras.selected.getTimesForDate(year, month, day);
	const suffix = getTimeSuffixes(extras.locale);
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
}

function period(extras: Configs): Extras.Date.CellTime[] {
	if (!extras.mode.sequence.includes(CALENDAR.MODE.SECOND)) {
		return null as any;
	}
	const seconds: Extras.Date.CellTime[] = [];
	const year = extras.now.year;
	const month = extras.now.month - 1;
	const day = extras.now.day;
	const hour = extras.now.hour;
	const minute = extras.now.minute;
	const period = extras.now.period;
	const is12Hour = extras.timeFormat === "12h";

	const times = extras.selected.getTimesForDate(year, month, day);
	const suffix = getTimeSuffixes(extras.locale);
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
}

const timeSuffixes = {
	// Arabic and Middle Eastern (RTL)
	ar: {
		dir: "rtl",
		short: { hour: "س", minute: "د", second: "ث" },
		long: { hour: "ساعة", minute: "دقيقة", second: "ثانية" },
	},
	he: {
		dir: "rtl",
		short: { hour: "ש", minute: "ד", second: "ש" },
		long: { hour: "שעה", minute: "דקה", second: "שניה" },
	},
	fa: {
		dir: "rtl",
		short: { hour: "س", minute: "د", second: "ث" },
		long: { hour: "ساعت", minute: "دقیقه", second: "ثانیه" },
	},
	ur: {
		dir: "rtl",
		short: { hour: "گ", minute: "م", second: "س" },
		long: { hour: "گھنٹہ", minute: "منٹ", second: "سیکنڈ" },
	},

	// European (LTR)
	en: {
		dir: "ltr",
		short: { hour: "H", minute: "M", second: "S" },
		long: { hour: "hour", minute: "minute", second: "second" },
	},
	fr: {
		dir: "ltr",
		short: { hour: "H", minute: "M", second: "S" },
		long: { hour: "heure", minute: "minute", second: "seconde" },
	},
	de: {
		dir: "ltr",
		short: { hour: "H", minute: "M", second: "S" },
		long: { hour: "Stunde", minute: "Minute", second: "Sekunde" },
	},
	es: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "hora", minute: "minuto", second: "segundo" },
	},
	it: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "ora", minute: "minuto", second: "secondo" },
	},
	pt: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "hora", minute: "minuto", second: "segundo" },
	},
	nl: {
		dir: "ltr",
		short: { hour: "u", minute: "m", second: "s" },
		long: { hour: "uur", minute: "minuut", second: "seconde" },
	},
	sv: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "timme", minute: "minut", second: "sekund" },
	},
	no: {
		dir: "ltr",
		short: { hour: "t", minute: "m", second: "s" },
		long: { hour: "time", minute: "minutt", second: "sekund" },
	},
	da: {
		dir: "ltr",
		short: { hour: "t", minute: "m", second: "s" },
		long: { hour: "time", minute: "minut", second: "sekund" },
	},
	fi: {
		dir: "ltr",
		short: { hour: "t", minute: "m", second: "s" },
		long: { hour: "tunti", minute: "minuutti", second: "sekunti" },
	},
	pl: {
		dir: "ltr",
		short: { hour: "g", minute: "m", second: "s" },
		long: { hour: "godzina", minute: "minuta", second: "sekunda" },
	},
	cs: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "hodina", minute: "minuta", second: "sekunda" },
	},
	sk: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "hodina", minute: "minúta", second: "sekunda" },
	},
	hu: {
		dir: "ltr",
		short: { hour: "ó", minute: "p", second: "mp" },
		long: { hour: "óra", minute: "perc", second: "másodperc" },
	},
	ro: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "oră", minute: "minut", second: "secundă" },
	},
	bg: {
		dir: "ltr",
		short: { hour: "ч", minute: "м", second: "с" },
		long: { hour: "час", minute: "минута", second: "секунда" },
	},
	hr: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "sat", minute: "minuta", second: "sekunda" },
	},
	sr: {
		dir: "ltr",
		short: { hour: "ч", minute: "м", second: "с" },
		long: { hour: "сат", minute: "минут", second: "секунд" },
	},

	// Asian (LTR)
	zh: {
		dir: "ltr",
		short: { hour: "时", minute: "分", second: "秒" },
		long: { hour: "小时", minute: "分钟", second: "秒" },
	},
	ja: {
		dir: "ltr",
		short: { hour: "時", minute: "分", second: "秒" },
		long: { hour: "時間", minute: "分", second: "秒" },
	},
	ko: {
		dir: "ltr",
		short: { hour: "시", minute: "분", second: "초" },
		long: { hour: "시간", minute: "분", second: "초" },
	},
	hi: {
		dir: "ltr",
		short: { hour: "घ", minute: "मि", second: "से" },
		long: { hour: "घंटा", minute: "मिनट", second: "सेकंड" },
	},
	th: {
		dir: "ltr",
		short: { hour: "ชม.", minute: "น.", second: "ว." },
		long: { hour: "ชั่วโมง", minute: "นาที", second: "วินาที" },
	},
	vi: {
		dir: "ltr",
		short: { hour: "g", minute: "p", second: "g" },
		long: { hour: "giờ", minute: "phút", second: "giây" },
	},

	// Other (LTR)
	ru: {
		dir: "ltr",
		short: { hour: "ч", minute: "м", second: "с" },
		long: { hour: "час", minute: "минута", second: "секунда" },
	},
	uk: {
		dir: "ltr",
		short: { hour: "г", minute: "х", second: "с" },
		long: { hour: "година", minute: "хвилина", second: "секунда" },
	},
	tr: {
		dir: "ltr",
		short: { hour: "s", minute: "d", second: "s" },
		long: { hour: "saat", minute: "dakika", second: "saniye" },
	},
	el: {
		dir: "ltr",
		short: { hour: "ω", minute: "λ", second: "δ" },
		long: { hour: "ώρα", minute: "λεπτό", second: "δευτερόλεπτο" },
	},

	// Default fallback
	default: {
		dir: "ltr",
		short: { hour: "H", minute: "M", second: "S" },
		long: { hour: "hour", minute: "minute", second: "second" },
	},
};
function getTimeSuffixes(locale: string): typeof timeSuffixes.default {
	const baseLocale = locale.split("-")[0];
	return timeSuffixes[baseLocale] || timeSuffixes.default;
}
