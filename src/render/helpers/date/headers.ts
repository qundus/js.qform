import type { Extras } from "../../../_model";

type Configs = Pick<
	Extras.Date.Out<any>,
	"locale" | "firstDayOfWeek" | "yearView" | "yearSpan" | "now"
>;
export function makeHeaders(configs: Configs): Extras.Date.Out<any>["headers"] {
	const startYear = configs.yearView - Math.floor(configs.yearSpan / 2);
	const month = {
		date: new Date(configs.now.year, configs.now.month - 1, 1),
		formatter: new Intl.DateTimeFormat(configs.locale, { month: "long" }),
		shortFormatter: new Intl.DateTimeFormat(configs.locale, { month: "short" }),
	};
	const day = {
		date: new Date(configs.now.year, configs.now.month - 1, configs.now.day),
		formatter: new Intl.DateTimeFormat(configs.locale, { weekday: "long" }),
		shortFormatter: new Intl.DateTimeFormat(configs.locale, { weekday: "short" }),
	};
	return {
		days: days(configs.locale, configs.firstDayOfWeek),
		year: configs.now.year,
		yearStart: startYear,
		yearEnd: startYear + (configs.yearSpan - 1),
		month: configs.now.month,
		monthLong: month.formatter.format(month.date),
		monthShort: month.shortFormatter.format(month.date),
		day: configs.now.day,
		dayLong: day.formatter.format(day.date),
		dayShort: day.shortFormatter.format(day.date),
		period: "am",
	};
}

function days(locale: string, firstDayOfWeek: number): Extras.Date.Header[] {
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
