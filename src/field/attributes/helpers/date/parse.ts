import type { Extras } from "../../../_model";

type DateComponents = Extras.Date.ParsedDate;
type TimeComponents = Extras.Date.ParsedTime;

export interface EnhancedParsedTime
	extends Omit<TimeComponents, "valid" | "formatted" | "formatted24h"> {
	valid: boolean;
	formatted: string | null;
	formatted24h: string | null;
}

export interface EnhancedParsedResult {
	date: DateComponents;
	time: EnhancedParsedTime[];
	valid: boolean;
	others: string | null;
	error?: string;
}

// Update the main function to pass timeSeparators
export function parseDateEnhanced(
	value: string,
	format: string,
	dateSeparators: string | string[] = ["/", "-", "."],
	timeSeparators: string | string[] = [":"],
	multipleTimeSeparator: string | null = null,
): EnhancedParsedResult {
	const result = createEmptyResult();

	if (!value?.trim()) {
		return result;
	}

	const stringValue = String(value).trim();

	try {
		const formatTokens = extractFormatTokens(format);

		// Parse date first (it follows the format strictly)
		parseDateWithFormat(result.date, stringValue, formatTokens);

		// Then parse times from the original string using the provided time separators
		result.time = extractAllTimes(stringValue, multipleTimeSeparator, timeSeparators);

		// Post-processing
		formatResults(result, format, timeSeparators);
		validateResults(result, format);
		result.others = extractRemainingText(stringValue, dateSeparators, timeSeparators);
	} catch (error) {
		result.error = error instanceof Error ? error.message : "Unknown parsing error";
	}

	return result;
}

function parseDateWithFormat(date: DateComponents, input: string, formatTokens: string[]): void {
	const numbers = extractAllNumbers(input);

	for (let i = 0; i < Math.min(numbers.length, formatTokens.length); i++) {
		const number = numbers[i];
		const token = formatTokens[i].toLowerCase();

		if (isDateToken(token) && isValidDateNumber(number, token)) {
			assignDateComponent(date, token, number);
		}
	}
}

function extractAllTimes(
	input: string,
	multipleTimeSeparator: string | null,
	timeSeparators: string | string[],
): EnhancedParsedTime[] {
	const times: EnhancedParsedTime[] = [];

	if (multipleTimeSeparator && input.includes(multipleTimeSeparator)) {
		// Split by multiple time separator and parse each segment
		const parts = input.split(multipleTimeSeparator);

		for (const part of parts) {
			const time = parseTimeFromSegment(part, timeSeparators);
			if (time.hour !== null) {
				times.push(time);
			}
		}
	} else {
		// Single time - parse the entire input
		const time = parseTimeFromSegment(input, timeSeparators);
		if (time.hour !== null) {
			times.push(time);
		}
	}

	return times;
}

function parseTimeFromSegment(
	segment: string,
	timeSeparators: string | string[],
): EnhancedParsedTime {
	const time = createEmptyTime();

	// Convert time separators to regex pattern
	const separators = Array.isArray(timeSeparators) ? timeSeparators : [timeSeparators];
	const separatorPattern = separators.map((sep) => escapeRegex(sep)).join("|");

	// Look for time patterns with actual separators
	const timePattern = new RegExp(
		`(\\d{1,2})(${separatorPattern})(\\d{1,2})(?:(${separatorPattern})(\\d{1,2}))?`,
	);
	const match = segment.match(timePattern);

	if (match) {
		const hour = match[1];
		const minute = match[3];
		const second = match[5] || null;

		if (isValidHour(hour) && isValidMinute(minute)) {
			time.hour = hour.padStart(2, "0");
			time.hourNumber = parseInt(hour);
			time.minute = minute.padStart(2, "0");
			time.minuteNumber = parseInt(minute);
			if (second && isValidSecond(second)) {
				time.second = second.padStart(2, "0");
				time.secondNumber = parseInt(second);
			}
		}
	}

	detectPeriod(time, segment);
	return time;
}

function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidHour(hour: string): boolean {
	const hourNum = parseInt(hour);
	return !Number.isNaN(hourNum) && hourNum >= 0 && hourNum <= 23; // 0-23 ONLY!
}

function isValidMinute(minute: string): boolean {
	const minuteNum = parseInt(minute);
	return !Number.isNaN(minuteNum) && minuteNum >= 0 && minuteNum <= 59;
}

function isValidSecond(second: string): boolean {
	const secondNum = parseInt(second);
	return !Number.isNaN(secondNum) && secondNum >= 0 && secondNum <= 59;
}

function isValidDateNumber(number: string, token: string): boolean {
	const length = number.length;

	switch (token) {
		case "yyyy":
			return length === 4;
		case "yy":
			return length === 2;
		case "mm":
		case "dd":
			return length === 2;
		case "m":
		case "d":
			return length >= 1 && length <= 2;
		default:
			return false;
	}
}

function assignDateComponent(date: DateComponents, token: string, value: string): void {
	switch (token) {
		case "yyyy":
			date.year = value;
			date.yearNumber = parseInt(value);
			break;
		case "yy":
			date.year = value.length === 2 ? `20${value}` : value;
			date.yearNumber = parseInt(date.year);
			break;
		case "mm":
		case "m":
			date.month = value.padStart(2, "0");
			date.monthNumber = parseInt(date.month);
			break;
		case "dd":
		case "d":
			date.day = value.padStart(2, "0");
			date.dayNumber = parseInt(value);
			break;
	}
}

function detectPeriod(time: EnhancedParsedTime, input: string): void {
	const lowerInput = input.toLowerCase();

	if (lowerInput.includes("am") || lowerInput.includes("a.m.")) {
		time.period = "AM";
		if (time.hour === "12") {
			time.hour = "00";
		}
	} else if (lowerInput.includes("pm") || lowerInput.includes("p.m.")) {
		time.period = "PM";
		if (time.hour && time.hour !== "12") {
			const hourNum = parseInt(time.hour);
			if (!Number.isNaN(hourNum) && hourNum < 12) {
				time.hour = String(hourNum + 12).padStart(2, "0");
			}
		}
	}
}

// Simple utility functions
function extractAllNumbers(input: string): string[] {
	return input.match(/\d+/g) || [];
}

function isDateToken(token: string): boolean {
	return ["yyyy", "yy", "mm", "m", "dd", "d"].includes(token);
}

export function extractFormatTokens(format: string): string[] {
	const tokenRegex = /(yyyy|yy|mm|m|dd|d|hh|h|nn|n|ss|s)/gi;
	const matches = format.match(tokenRegex);
	return matches ? matches.map((match) => match.toLowerCase()) : [];
}

function extractRemainingText(
	input: string,
	dateSeparators: string | string[],
	timeSeparators: string | string[],
): string | null {
	let workingValue = input;

	// Remove separators
	const allSeparators = [
		...(Array.isArray(dateSeparators) ? dateSeparators : [dateSeparators]),
		...(Array.isArray(timeSeparators) ? timeSeparators : [timeSeparators]),
	];

	for (const sep of allSeparators) {
		workingValue = workingValue.split(sep).join("");
	}

	// Remove AM/PM indicators and numbers
	workingValue = workingValue
		.replace(/\b(am|pm|a\.m\.|p\.m\.)\b/gi, "")
		.replace(/\d+/g, "")
		.replace(/\s+/g, " ")
		.trim();

	return workingValue || null;
}

function formatResults(
	result: EnhancedParsedResult,
	format: string,
	timeSeparators: string | string[] = [":"],
) {
	result.date.formatted = formatDate(result.date, format);

	const timeSeparator = Array.isArray(timeSeparators) ? timeSeparators[0] : timeSeparators;

	result.time.forEach((time) => {
		time.formatted = formatTime12h(time, timeSeparator);
		time.formatted24h = formatTime24h(time, timeSeparator);
	});
}

function validateResults(result: EnhancedParsedResult, format: string): void {
	result.date.valid = validateDateComponents(result.date, format);

	result.time.forEach((time) => {
		time.valid = validateTimeComponents(time, format);
	});

	result.valid = result.date.valid || result.time.some((t) => t.valid);
}

// Factory functions
function createEmptyResult(): EnhancedParsedResult {
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
		time: [],
		valid: false,
		others: null,
	};
}

function createEmptyTime(): EnhancedParsedTime {
	return {
		hour: null,
		minute: null,
		second: null,
		period: null,
		hourNumber: null,
		secondNumber: null,
		minuteNumber: null,
		valid: false,
		formatted: null,
		formatted24h: null,
	};
}

// Keep your existing format functions (they're fine)
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

	if (components.length > 0) {
		const separator = detectSeparatorFromFormat(originalFormat);
		return components.join(separator);
	}

	return null;
}

function detectSeparatorFromFormat(format: string): string {
	const separatorMatch = format.match(/[^a-zA-Z0-9]/);
	return separatorMatch ? separatorMatch[0] : "-";
}

export function formatTime12h(
	time: Pick<EnhancedParsedTime, "hour" | "minute" | "second" | "period">,
	timeSeparator: string = ":",
): string | null {
	if (!time.hour) return null;

	const timeParts = [] as any[];
	let displayHour = time.hour;

	// Always respect the existing period if provided
	let period = time.period;

	const hourNum = parseInt(time.hour);
	if (!Number.isNaN(hourNum)) {
		// Only calculate period if it wasn't provided
		if (!period) {
			if (hourNum === 0 || hourNum === 12) {
				period = hourNum === 0 ? "AM" : "PM";
				displayHour = "12";
			} else if (hourNum > 12) {
				period = "PM";
				displayHour = String(hourNum - 12).padStart(2, "0");
			} else {
				period = "AM";
				displayHour = String(hourNum).padStart(2, "0");
			}
		} else {
			// Period was provided, just format the hour for 12-hour display
			if (hourNum === 0) {
				displayHour = "12";
			} else if (hourNum > 12) {
				displayHour = String(hourNum - 12).padStart(2, "0");
			} else if (hourNum === 12) {
				displayHour = "12";
			} else {
				displayHour = String(hourNum).padStart(2, "0");
			}
		}
	}

	timeParts.push(displayHour);
	if (time.minute) timeParts.push(time.minute);
	if (time.second) timeParts.push(time.second);

	const timeString = timeParts.join(timeSeparator);
	return period ? `${timeString} ${period}` : timeString;
}

export function formatTime24h(
	time: Pick<EnhancedParsedTime, "hour" | "minute" | "second">,
	timeSeparator: string = ":",
): string | null {
	const timeParts = [] as any[];

	if (time.hour) {
		timeParts.push(time.hour);
		if (time.minute) timeParts.push(time.minute);
		if (time.second) timeParts.push(time.second);
	}

	return timeParts.length > 0 ? timeParts.join(timeSeparator) : null;
}

function validateDateComponents(date: DateComponents, format: string): boolean {
	// Your existing validation logic
	const formatTokens = extractFormatTokens(format);
	const dateTokens = formatTokens.filter((token) =>
		["yyyy", "yy", "mm", "m", "dd", "d"].includes(token.toLowerCase()),
	);

	if (dateTokens.length === 0) return false;

	for (const token of dateTokens) {
		switch (token.toLowerCase()) {
			case "yyyy":
			case "yy":
				if (!date.year) return false;
				break;
			case "mm":
			case "m":
				if (!date.month) return false;
				break;
			case "dd":
			case "d":
				if (!date.day) return false;
				break;
		}
	}

	if (date.year && Number.isNaN(parseInt(date.year))) return false;
	if (date.month) {
		const month = parseInt(date.month);
		if (Number.isNaN(month) || month < 1 || month > 12) return false;
	}
	if (date.day) {
		const day = parseInt(date.day);
		if (Number.isNaN(day) || day < 1 || day > 31) return false;
	}

	return true;
}

function validateTimeComponents(time: EnhancedParsedTime, format: string): boolean {
	if (!time.hour) return false;

	const hour = parseInt(time.hour);
	if (Number.isNaN(hour) || hour < 0 || hour > 23) return false;

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
