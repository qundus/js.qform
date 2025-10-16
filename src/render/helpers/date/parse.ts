import type { Extras } from "../../../_model";

type DateComponents = Extras.Date.ParsedDate;
type TimeComponents = Extras.Date.ParsedTime;

type DateParseResult = Extras.Date.ParsedResult;

export function parseDateEnhanced(
	value: string,
	format: string,
	dateSeparators: string | string[] = ["/", "-", "."],
	timeSeparators: string | string[] = [":"],
): DateParseResult {
	const result = createEmptyResult();

	if (!value) {
		return result;
	}

	const stringValue = String(value).trim();
	if (!stringValue) {
		return result;
	}

	try {
		// Extract all numbers from the input
		const numbers = stringValue.match(/\d+/g) || [];
		const formatTokens = extractFormatTokens(format);

		// Simple linear assignment - numbers in order to format tokens
		for (let i = 0; i < Math.min(numbers.length, formatTokens.length); i++) {
			const number = numbers[i];
			const token = formatTokens[i];

			if (isValidNumber(number, token)) {
				assignComponent(result, token, number);
			}
		}

		// Detect AM/PM
		detectPeriod(result, stringValue);

		// Generate formatted outputs - pass the original format
		result.date.formatted = formatDate(result.date, format);
		result.time.formatted = formatTime12h(result.time);
		result.time.formatted24h = formatTime24h(result.time);

		// Extract others by removing used numbers and separators
		result.others = extractOthers(stringValue, numbers, dateSeparators, timeSeparators);

		// Validate based on what's requested in the format
		result.date.valid = validateDateComponents(result.date, format);
		result.time.valid = validateTimeComponents(result.time, format);

		// Overall validation
		result.valid = result.date.valid || result.time.valid;
	} catch (error) {
		result.error = error instanceof Error ? error.message : "Unknown parsing error";
	}

	return result;
}

function assignComponent(result: DateParseResult, token: string, value: string): void {
	const normalizedToken = token.toLowerCase();

	// Date components
	if (normalizedToken === "yyyy") {
		result.date.year = value;
		result.date.yearNumber = parseInt(value);
	} else if (normalizedToken === "yy") {
		result.date.year = value.length === 2 ? `20${value}` : value;
		result.date.yearNumber = parseInt(result.date.year);
	} else if (normalizedToken === "mm") {
		result.date.month = value.padStart(2, "0");
		result.date.monthNumber = parseInt(result.date.month);
	} else if (normalizedToken === "m") {
		result.date.month = value.padStart(2, "0");
		result.date.monthNumber = parseInt(result.date.month);
	} else if (normalizedToken === "dd") {
		result.date.day = value.padStart(2, "0");
		result.date.dayNumber = parseInt(value);
	} else if (normalizedToken === "d") {
		result.date.day = value.padStart(2, "0");
		result.date.dayNumber = parseInt(value);
	}
	// Time components - using 'n' for minutes to avoid conflict with months
	else if (normalizedToken === "hh" || normalizedToken === "h") {
		result.time.hour = value.padStart(2, "0");
	} else if (normalizedToken === "nn" || normalizedToken === "n") {
		result.time.minute = value.padStart(2, "0");
	} else if (normalizedToken === "ss" || normalizedToken === "s") {
		result.time.second = value.padStart(2, "0");
	}
}

function detectPeriod(result: DateParseResult, value: string): void {
	const lowerValue = value.toLowerCase();

	if (lowerValue.includes("am") || lowerValue.includes("a.m.") || lowerValue.match(/\ba\b/)) {
		result.time.period = "AM";
		// Convert 12 AM to 00
		if (result.time.hour === "12") {
			result.time.hour = "00";
		}
	} else if (
		lowerValue.includes("pm") ||
		lowerValue.includes("p.m.") ||
		lowerValue.match(/\bp\b/)
	) {
		result.time.period = "PM";
		// Convert to 24-hour (except 12 PM)
		if (result.time.hour && result.time.hour !== "12") {
			const hourNum = parseInt(result.time.hour);
			if (!Number.isNaN(hourNum) && hourNum < 12) {
				result.time.hour = String(hourNum + 12).padStart(2, "0");
			}
		}
	}

	// Auto-detect 24-hour format
	if (!result.time.period && result.time.hour) {
		const hourNum = parseInt(result.time.hour);
		if (!Number.isNaN(hourNum) && hourNum >= 13 && hourNum <= 23) {
			result.time.period = "PM";
		} else if (!Number.isNaN(hourNum) && hourNum >= 0 && hourNum <= 23) {
			result.time.period = "AM";
		}
	}
}

function extractOthers(
	value: string,
	usedNumbers: string[],
	dateSeparators: string | string[],
	timeSeparators: string | string[],
): string | null {
	let workingValue = value;

	// Remove used numbers
	for (const number of usedNumbers) {
		workingValue = workingValue.replace(number, "");
	}

	// Remove separators
	const allSeparators = [
		...(Array.isArray(dateSeparators) ? dateSeparators : [dateSeparators]),
		...(Array.isArray(timeSeparators) ? timeSeparators : [timeSeparators]),
	];

	for (const sep of allSeparators) {
		workingValue = workingValue.split(sep).join("");
	}

	// Remove AM/PM indicators
	workingValue = workingValue
		.replace(/\b(am|pm|a\.m\.|p\.m\.)\b/gi, "")
		.replace(/\s+/g, " ")
		.trim();

	return workingValue || null;
}

function isValidNumber(number: string, token: string): boolean {
	const normalizedToken = token.toLowerCase();

	switch (normalizedToken) {
		case "yyyy":
			return number.length === 4;
		case "yy":
			return number.length === 2;
		case "mm": // months
		case "dd":
			return number.length === 2;
		case "m": // months
		case "d":
			return number.length >= 1 && number.length <= 2;
		case "hh": // hours
		case "nn": // minutes
		case "ss": // seconds
			return number.length === 2;
		case "h": // hours
		case "n": // minutes
		case "s": // seconds
			return number.length >= 1 && number.length <= 2;
		default:
			return false;
	}
}

export function extractFormatTokens(format: string): string[] {
	// All lowercase tokens: m=month, n=minute
	const tokenRegex = /(yyyy|yy|mm|m|dd|d|hh|h|nn|n|ss|s)/gi;
	const matches = format.match(tokenRegex);
	return matches ? matches.map((match) => match.toLowerCase()) : [];
}

function detectSeparatorFromFormat(format: string): string {
	// Find the first non-alphanumeric character that's not part of a token
	const separatorMatch = format.match(/[^a-zA-Z0-9]/);
	return separatorMatch ? separatorMatch[0] : "-";
}

export function formatDate(
	date: Pick<DateComponents, "year" | "month" | "day">,
	originalFormat: string,
): string | null {
	const formatTokens = extractFormatTokens(originalFormat);
	const dateTokens = formatTokens.filter((token) =>
		["yyyy", "yy", "mm", "m", "dd", "d"].includes(token.toLowerCase()),
	);

	const components: string[] = [];

	for (const token of dateTokens) {
		switch (token.toLowerCase()) {
			case "yyyy":
			case "yy":
				if (date.year) components.push(date.year);
				break;
			case "mm":
			case "m":
				if (date.month) components.push(date.month);
				break;
			case "dd":
			case "d":
				if (date.day) components.push(date.day);
				break;
		}
	}

	// Only format if we have at least one component
	if (components.length > 0) {
		const separator = detectSeparatorFromFormat(originalFormat);
		return components.join(separator);
	}

	return null;
}

export function formatTime12h(time: TimeComponents): string | null {
	const timeParts = [] as any[];

	if (time.hour) {
		let displayHour = time.hour;
		let period = time.period;

		const hourNum = parseInt(time.hour);
		if (!Number.isNaN(hourNum)) {
			if (hourNum === 0) {
				displayHour = "12";
				period = "AM";
			} else if (hourNum === 12) {
				displayHour = "12";
				period = "PM";
			} else if (hourNum > 12) {
				displayHour = String(hourNum - 12).padStart(2, "0");
				period = "PM";
			} else {
				displayHour = String(hourNum).padStart(2, "0");
				period = period || "AM";
			}
		}

		timeParts.push(displayHour);
		if (time.minute) {
			timeParts.push(time.minute);
			if (time.second) {
				timeParts.push(time.second);
			}
		}
	}

	if (timeParts.length === 0) {
		return null;
	}

	const timeString = timeParts.join(":");
	return time.period ? `${timeString} ${time.period}` : timeString;
}

export function formatTime24h(time: TimeComponents): string | null {
	const timeParts = [] as any[];

	if (time.hour) {
		timeParts.push(time.hour);
		if (time.minute) {
			timeParts.push(time.minute);
			if (time.second) {
				timeParts.push(time.second);
			}
		}
	}

	return timeParts.length > 0 ? timeParts.join(":") : null;
}

function createEmptyResult(): DateParseResult {
	return {
		date: {
			year: null,
			month: null,
			day: null,
			formatted: null,
			valid: false,
		},
		time: {
			hour: null,
			minute: null,
			second: null,
			period: null,
			formatted: null,
			formatted24h: null,
			valid: false,
		},
		valid: false,
		others: null,
	};
}

function validateDateComponents(date: DateComponents, format: string): boolean {
	const formatTokens = extractFormatTokens(format);
	const dateTokens = formatTokens.filter((token) =>
		["yyyy", "yy", "mm", "m", "dd", "d"].includes(token.toLowerCase()),
	);

	// If no date tokens in format, date is not required
	if (dateTokens.length === 0) {
		return false;
	}

	// Check if we have the required components based on format
	let hasRequiredComponents = true;

	for (const token of dateTokens) {
		switch (token.toLowerCase()) {
			case "yyyy":
			case "yy":
				if (!date.year) hasRequiredComponents = false;
				break;
			case "mm":
			case "m":
				if (!date.month) hasRequiredComponents = false;
				break;
			case "dd":
			case "d":
				if (!date.day) hasRequiredComponents = false;
				break;
		}
	}

	if (!hasRequiredComponents) {
		return false;
	}

	// Validate the values we do have
	if (date.year) {
		const year = parseInt(date.year);
		if (Number.isNaN(year)) return false;
	}

	if (date.month) {
		const month = parseInt(date.month);
		if (Number.isNaN(month) || month < 1 || month > 12) return false;
	}

	if (date.day) {
		const day = parseInt(date.day);
		if (Number.isNaN(day) || day < 1 || day > 31) return false;

		// Only validate day-in-month if we have all components
		if (date.year && date.month) {
			const year = parseInt(date.year);
			const month = parseInt(date.month);
			const daysInMonth = new Date(year, month, 0).getDate();
			if (day > daysInMonth) return false;
		}
	}

	return true;
}

function validateTimeComponents(time: TimeComponents, format: string): boolean {
	const formatTokens = extractFormatTokens(format);
	const timeTokens = formatTokens.filter((token) =>
		["hh", "h", "nn", "n", "ss", "s"].includes(token.toLowerCase()),
	);

	// If no time tokens in format, time is not required
	if (timeTokens.length === 0) {
		return false;
	}

	// Check if we have the required components based on format
	let hasRequiredComponents = true;

	for (const token of timeTokens) {
		switch (token.toLowerCase()) {
			case "hh":
			case "h":
				if (!time.hour) hasRequiredComponents = false;
				break;
			case "nn":
			case "n":
				if (!time.minute) hasRequiredComponents = false;
				break;
			case "ss":
			case "s":
				// Seconds are optional even if in format
				break;
		}
	}

	if (!hasRequiredComponents) {
		return false;
	}

	// Validate the values we do have
	if (time.hour) {
		const hour = parseInt(time.hour);
		if (Number.isNaN(hour) || hour < 0 || hour > 23) return false;
	}

	if (time.minute) {
		const minute = parseInt(time.minute);
		if (Number.isNaN(minute) || minute < 0 || minute > 59) return false;
	}

	if (time.second) {
		const second = parseInt(time.second);
		if (Number.isNaN(second) || second < 0 || second > 59) return false;
	}

	return true;
}
