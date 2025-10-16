import type { Extras } from "../../../_model";

type Configs = {
	locale: string;
	firstDayOfWeek: number;
};
export function initHeaders(configs: Configs): Extras.Date.Out<any>["headers"] {
	return {
		days: days(configs.locale, configs.firstDayOfWeek),
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
