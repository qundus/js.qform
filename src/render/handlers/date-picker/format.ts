import type { DatePicker } from "./_model";

export function formatDateValue(
	date: Date,
	format: string,
	locale: Required<DatePicker.Locale>,
): string {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();

	let result = format;

	// Date components
	result = result.replace(/yyyy/g, String(year));
	result = result.replace(/mm/g, String(month).padStart(2, "0"));
	result = result.replace(/dd/g, String(day).padStart(2, "0"));

	// Time components
	if (result.includes("HH") || result.includes("hh")) {
		if (result.includes("HH")) {
			result = result.replace(/HH/g, String(hours).padStart(2, "0"));
		} else if (result.includes("hh")) {
			const twelveHour = hours % 12 || 12;
			result = result.replace(/hh/g, String(twelveHour).padStart(2, "0"));
		}

		if (result.includes("mm")) {
			result = result.replace(/mm/g, String(minutes).padStart(2, "0"));
		}

		if (result.includes("TT")) {
			const ampm = hours >= 12 ? locale.pm : locale.am;
			result = result.replace(/TT/g, ampm);
		}
	}

	return result;
}

export function formatOutputValue(
	dates: Date[],
	options: Required<DatePicker.Options>,
	locale: Required<DatePicker.Locale>,
): string {
	if (dates.length === 0) return "";

	if (options.range && dates.length === 2) {
		const start = formatDateValue(dates[0], options.format, locale);
		const end = formatDateValue(dates[1], options.format, locale);
		return `${start} - ${end}`;
	} else if (options.multiple) {
		return dates.map((date) => formatDateValue(date, options.format, locale)).join(", ");
	} else {
		return formatDateValue(dates[0], options.format, locale);
	}
}

export function getEventDates(
	selectedDates: Date[],
	options: Required<DatePicker.Options>,
): Date | Date[] | null {
	if (selectedDates.length === 0) return null;

	if (options.range || options.multiple) {
		return [...selectedDates];
	} else {
		return selectedDates[0];
	}
}

export function getFormattedDates(
	selectedDates: Date[],
	options: Required<DatePicker.Options>,
	locale: Required<DatePicker.Locale>,
): string | string[] | null {
	if (selectedDates.length === 0) return null;

	const formatted = selectedDates.map((d) => formatDateValue(d, options.format, locale));

	if (options.range || options.multiple) {
		return formatted;
	} else {
		return formatted[0];
	}
}
