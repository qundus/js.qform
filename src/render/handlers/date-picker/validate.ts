import type { DatePicker } from "./_model";
import { parseDate, parseMultipleDates, parseRangeDates } from "./parse";

export function validateInput(value: string, options: Required<DatePicker.Options>): boolean {
	if (!value.trim()) return true; // Empty is valid

	// STRICT VALIDATION: Must match the exact format structure
	if (!matchesExactFormat(value, options.format)) {
		return false;
	}

	const formattedValue = formatInput(value, options.format);

	if (options.range) {
		const dates = parseRangeDates(formattedValue, options.format);
		if (dates.length !== 2) return false;

		// Check min/max dates
		if (options.minDate && dates[0] < options.minDate) return false;
		if (options.maxDate && dates[1] > options.maxDate) return false;

		return true;
	} else if (options.multiple) {
		const dates = parseMultipleDates(formattedValue, options.format);
		if (dates.length === 0) return false;

		// Check min/max dates
		for (const date of dates) {
			if (options.minDate && date < options.minDate) return false;
			if (options.maxDate && date > options.maxDate) return false;
		}

		return true;
	} else {
		const date = parseDate(formattedValue, options.format);
		if (!date) return false;

		// Check min/max dates
		if (options.minDate && date < options.minDate) return false;
		if (options.maxDate && date > options.maxDate) return false;

		return true;
	}
}

function matchesExactFormat(value: string, format: string): boolean {
	if (!value.trim()) return false;

	const separator = getFormatSeparator(format);
	const expectedParts = getExpectedFormatParts(format);

	// Split by the expected separator
	const parts = value.split(separator).filter((part) => part.trim() !== "");

	// Must have exactly the expected number of parts
	if (parts.length !== expectedParts.length) return false;

	// Check each part matches its expected pattern and length
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const expectedPart = expectedParts[i];

		if (expectedPart.type === "year" && (!/^\d{4}$/.test(part) || part.length !== 4)) return false;
		if (expectedPart.type === "month" && (!/^\d{1,2}$/.test(part) || part.length !== 2))
			return false;
		if (expectedPart.type === "day" && (!/^\d{1,2}$/.test(part) || part.length !== 2)) return false;
		if (expectedPart.type === "hours" && (!/^\d{1,2}$/.test(part) || part.length !== 2))
			return false;
		if (expectedPart.type === "minutes" && (!/^\d{1,2}$/.test(part) || part.length !== 2))
			return false;
		if (expectedPart.type === "ampm" && !/^(am|pm|AM|PM)$/.test(part)) return false;
	}

	return true;
}

function getFormatSeparator(format: string): string {
	const separators = format.replace(/[ymdht]/gi, "");
	return separators[0] || "-";
}

function getExpectedFormatParts(format: string): Array<{ type: string; length: number }> {
	const parts: Array<{ type: string; length: number }> = [];
	let remainingFormat = format;

	while (remainingFormat.length > 0) {
		if (remainingFormat.startsWith("yyyy")) {
			parts.push({ type: "year", length: 4 });
			remainingFormat = remainingFormat.slice(4);
		} else if (remainingFormat.startsWith("mm")) {
			const prevPart = parts[parts.length - 1];
			if (prevPart?.type === "hours") {
				parts.push({ type: "minutes", length: 2 });
			} else {
				parts.push({ type: "month", length: 2 });
			}
			remainingFormat = remainingFormat.slice(2);
		} else if (remainingFormat.startsWith("dd")) {
			parts.push({ type: "day", length: 2 });
			remainingFormat = remainingFormat.slice(2);
		} else if (remainingFormat.startsWith("HH") || remainingFormat.startsWith("hh")) {
			parts.push({ type: "hours", length: 2 });
			remainingFormat = remainingFormat.slice(2);
		} else if (remainingFormat.startsWith("TT")) {
			parts.push({ type: "ampm", length: 2 });
			remainingFormat = remainingFormat.slice(2);
		} else {
			// Skip separator
			remainingFormat = remainingFormat.slice(1);
		}
	}

	return parts;
}

// Keep the helper function
function formatInput(value: string, format: string): string {
	if (!value.trim()) return value;

	const formatSeparators = format.replace(/[ymdht]/gi, "");
	const expectedSeparator = formatSeparators[0] || "-";

	let cleaned = value.replace(new RegExp(`[^\\d${expectedSeparator}ampAMP\\s]`, "gi"), "");

	if (expectedSeparator) {
		const separatorRegex = /[-/.\s]/g;
		cleaned = cleaned.replace(separatorRegex, expectedSeparator);
	}

	cleaned = cleaned.replace(new RegExp(`\\${expectedSeparator}+`, "g"), expectedSeparator);

	return cleaned;
}
