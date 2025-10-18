import type { Extras } from "../../../_model";

type DateComponents = Extras.Date.ParsedDate;
type TimeComponents = Extras.Date.ParsedTime;

type DateParseResult = Extras.Date.ParsedResult;

export function parseDateEnhanced(
	value: string,
	format: string,
	dateSeparators: string | string[] = ["/", "-", "."],
	timeSeparators: string | string[] = [":"],
	multipleTimeSeparator: string | null = null,
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

		// If multipleTimeSeparator is provided, handle multiple time parsing
		if (multipleTimeSeparator && stringValue.includes(multipleTimeSeparator)) {
			parseWithMultipleTimes(
				result,
				stringValue,
				format,
				dateSeparators,
				timeSeparators,
				multipleTimeSeparator,
			);
		} else {
			// Original single time parsing logic
			parseSingleTime(result, numbers, formatTokens, stringValue);
		}

		// Generate formatted outputs
		result.date.formatted = formatDate(result.date, format);

		// Format all time entries
		result.time.forEach((time) => {
			time.formatted = formatTime12h(time);
			time.formatted24h = formatTime24h(time);
		});

		// Extract others by removing used numbers and separators
		result.others = extractOthers(stringValue, numbers, dateSeparators, timeSeparators);

		// Validate based on what's requested in the format
		result.date.valid = validateDateComponents(result.date, format);

		// Validate each time entry
		result.time.forEach((time) => {
			time.valid = validateSingleTimeComponents(time, format);
		});

		// Overall validation - consider valid if either date or any time is valid
		result.valid = result.date.valid || result.time.some((t) => t.valid);
	} catch (error) {
		result.error = error instanceof Error ? error.message : "Unknown parsing error";
	}

	return result;
}

function parseSingleTime(
	result: DateParseResult,
	numbers: string[],
	formatTokens: string[],
	stringValue: string,
): void {
	const timeEntry = createEmptyTime();

	// Simple linear assignment - numbers in order to format tokens
	for (let i = 0; i < Math.min(numbers.length, formatTokens.length); i++) {
		const number = numbers[i];
		const token = formatTokens[i];

		if (isValidNumber(number, token)) {
			assignComponent(result.date, timeEntry, token, number);
		}
	}

	// Detect AM/PM
	detectPeriod(timeEntry, stringValue);

	// Only add time entry if it has at least one component
	if (timeEntry.hour || timeEntry.minute || timeEntry.second) {
		result.time.push(timeEntry);
	}
}

function parseWithMultipleTimes(
	result: DateParseResult,
	stringValue: string,
	format: string,
	dateSeparators: string | string[],
	timeSeparators: string | string[],
	multipleTimeSeparator: string,
): void {
	const formatTokens = extractFormatTokens(format);

	// Split the input by the multiple time separator
	const parts = stringValue.split(multipleTimeSeparator);

	if (parts.length < 2) {
		// Fall back to single time parsing if no multiple times found
		const numbers = stringValue.match(/\d+/g) || [];
		parseSingleTime(result, numbers, formatTokens, stringValue);
		return;
	}

	// Parse date from first part (assuming date comes first)
	const datePart = parts[0];
	const dateNumbers = datePart.match(/\d+/g) || [];

	// Assign date components
	for (let i = 0; i < Math.min(dateNumbers.length, formatTokens.length); i++) {
		const number = dateNumbers[i];
		const token = formatTokens[i];

		if (isValidNumber(number, token) && isDateToken(token)) {
			assignComponent(result.date, createEmptyTime(), token, number); // We only care about date components here
		}
	}

	// Parse time from remaining parts
	const timeParts = parts.slice(1);

	// Try to parse each time part
	for (const timePart of timeParts) {
		const timeEntry = createEmptyTime();
		const timeNumbers = timePart.match(/\d+/g) || [];
		const timeFormatTokens = formatTokens.filter((token) => isTimeToken(token));

		// If we don't have enough time tokens, use the first available ones
		const availableTimeTokens =
			timeFormatTokens.length > 0
				? timeFormatTokens
				: ["hh", "nn", "ss"].slice(0, Math.min(3, timeNumbers.length));

		for (let i = 0; i < Math.min(timeNumbers.length, availableTimeTokens.length); i++) {
			const number = timeNumbers[i];
			const token = availableTimeTokens[i];

			if (isValidNumber(number, token)) {
				assignComponent(result.date, timeEntry, token, number);
			}
		}

		// Detect AM/PM in this time part
		detectPeriod(timeEntry, timePart);

		// Only add time entry if it has at least one component
		if (timeEntry.hour || timeEntry.minute || timeEntry.second) {
			result.time.push(timeEntry);
		}
	}
}

function assignComponent(
	date: DateComponents,
	time: TimeComponents,
	token: string,
	value: string,
): void {
	const normalizedToken = token.toLowerCase();

	// Date components
	if (normalizedToken === "yyyy") {
		date.year = value;
		date.yearNumber = parseInt(value);
	} else if (normalizedToken === "yy") {
		date.year = value.length === 2 ? `20${value}` : value;
		date.yearNumber = parseInt(date.year);
	} else if (normalizedToken === "mm") {
		date.month = value.padStart(2, "0");
		date.monthNumber = parseInt(date.month);
	} else if (normalizedToken === "m") {
		date.month = value.padStart(2, "0");
		date.monthNumber = parseInt(date.month);
	} else if (normalizedToken === "dd") {
		date.day = value.padStart(2, "0");
		date.dayNumber = parseInt(value);
	} else if (normalizedToken === "d") {
		date.day = value.padStart(2, "0");
		date.dayNumber = parseInt(value);
	}
	// Time components
	else if (normalizedToken === "hh" || normalizedToken === "h") {
		time.hour = value.padStart(2, "0");
		time.hourNumber = parseInt(value);
	} else if (normalizedToken === "nn" || normalizedToken === "n") {
		time.minute = value.padStart(2, "0");
		time.minuteNumber = parseInt(value);
	} else if (normalizedToken === "ss" || normalizedToken === "s") {
		time.second = value.padStart(2, "0");
		time.secondNumber = parseInt(value);
	}
}

function detectPeriod(time: TimeComponents, value: string): void {
	const lowerValue = value.toLowerCase();

	if (lowerValue.includes("am") || lowerValue.includes("a.m.") || lowerValue.match(/\ba\b/)) {
		time.period = "AM";
		// Convert 12 AM to 00
		if (time.hour === "12") {
			time.hour = "00";
		}
	} else if (
		lowerValue.includes("pm") ||
		lowerValue.includes("p.m.") ||
		lowerValue.match(/\bp\b/)
	) {
		time.period = "PM";
		// Convert to 24-hour (except 12 PM)
		if (time.hour && time.hour !== "12") {
			const hourNum = parseInt(time.hour);
			if (!Number.isNaN(hourNum) && hourNum < 12) {
				time.hour = String(hourNum + 12).padStart(2, "0");
			}
		}
	}

	// Auto-detect 24-hour format
	if (!time.period && time.hour) {
		const hourNum = parseInt(time.hour);
		if (!Number.isNaN(hourNum) && hourNum >= 13 && hourNum <= 23) {
			time.period = "PM";
		} else if (!Number.isNaN(hourNum) && hourNum >= 0 && hourNum <= 23) {
			time.period = "AM";
		}
	}
}

function isDateToken(token: string): boolean {
	const normalizedToken = token.toLowerCase();
	return ["yyyy", "yy", "mm", "m", "dd", "d"].includes(normalizedToken);
}

function isTimeToken(token: string): boolean {
	const normalizedToken = token.toLowerCase();
	return ["hh", "h", "nn", "n", "ss", "s"].includes(normalizedToken);
}

function createEmptyResult(): DateParseResult {
	return {
		date: {
			year: null,
			month: null,
			day: null,
			yearNumber: null,
			monthNumber: null,
			dayNumber: null,
			valid: false,
			formatted: null,
		},
		time: [], // Empty array instead of single time object
		valid: false,
		others: null,
	};
}

function createEmptyTime(): TimeComponents {
	return {
		hour: null,
		minute: null,
		second: null,
		hourNumber: null,
		minuteNumber: null,
		secondNumber: null,
		period: null,
		valid: false,
		formatted: null,
		formatted24h: null,
	};
}

// Rest of your existing utility functions with minor adjustments...

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

export function formatTime12h(
	time: Pick<TimeComponents, "hour" | "minute" | "second" | "period">,
): string | null {
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

export function formatTime24h(
	time: Pick<TimeComponents, "hour" | "minute" | "second">,
): string | null {
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

function validateSingleTimeComponents(time: TimeComponents, format: string): boolean {
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
