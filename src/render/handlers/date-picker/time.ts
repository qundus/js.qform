import type { DatePicker } from "./_model";

export function createTimeElement(
	currentTime: DatePicker.TimeSelection,
	options: Required<DatePicker.Options>,
	locale: Required<DatePicker.Locale>,
	onTimeChange: (hours: number, minutes: number) => void,
	onAMPMChange: (isPM: boolean) => void,
): HTMLElement {
	const container = document.createElement("div");
	container.className = "qform-dp-time-container";

	// Hours input
	const hoursInput = createTimeInput(
		"hours",
		formatHours(currentTime.hours, options.timeFormat),
		(value) => {
			const hours = parseHours(value, options.timeFormat, currentTime.isPM);
			if (hours !== null) {
				onTimeChange(hours, currentTime.minutes);
			}
		},
	);

	// Minutes input
	const minutesInput = createTimeInput("minutes", formatMinutes(currentTime.minutes), (value) => {
		const minutes = parseMinutes(value);
		if (minutes !== null) {
			onTimeChange(currentTime.hours, minutes);
		}
	});

	container.appendChild(hoursInput);
	container.appendChild(createSeparator());
	container.appendChild(minutesInput);

	// AM/PM toggle for 12h format
	if (options.timeFormat === "12h") {
		container.appendChild(createAMPMToggle(currentTime.isPM, locale, onAMPMChange));
	}

	return container;
}

function createTimeInput(
	type: "hours" | "minutes",
	value: string,
	onChange: (value: string) => void,
): HTMLInputElement {
	const input = document.createElement("input");
	input.type = "text";
	input.value = value;
	input.className = `qform-dp-time-${type}`;

	input.style.cssText = `
        width: 30px;
        text-align: center;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 2px;
    `;

	input.addEventListener("input", (e) => {
		const target = e.target as HTMLInputElement;
		onChange(target.value);
	});

	return input;
}

function createSeparator(): HTMLElement {
	const separator = document.createElement("span");
	separator.textContent = ":";
	separator.style.cssText = `
        margin: 0 2px;
        font-weight: bold;
    `;
	return separator;
}

function createAMPMToggle(
	isPM: boolean,
	locale: Required<DatePicker.Locale>,
	onChange: (isPM: boolean) => void,
): HTMLButtonElement {
	const button = document.createElement("button");
	button.textContent = isPM ? locale.pm : locale.am;
	button.className = "qform-dp-ampm-btn";

	button.style.cssText = `
        margin-left: 5px;
        padding: 2px 6px;
        border: 1px solid #ccc;
        border-radius: 3px;
        background: ${isPM ? "#007bff" : "#f8f9fa"};
        color: ${isPM ? "white" : "black"};
        cursor: pointer;
    `;

	button.addEventListener("click", () => {
		onChange(!isPM);
	});

	return button;
}

function formatHours(hours: number, timeFormat: "12h" | "24h"): string {
	if (timeFormat === "12h") {
		const twelveHour = hours % 12 || 12;
		return String(twelveHour).padStart(2, "0");
	} else {
		return String(hours).padStart(2, "0");
	}
}

function formatMinutes(minutes: number): string {
	return String(minutes).padStart(2, "0");
}

function parseHours(value: string, timeFormat: "12h" | "24h", isPM: boolean): number | null {
	const hours = parseInt(value);
	if (isNaN(hours)) return null;

	if (timeFormat === "12h") {
		if (hours < 1 || hours > 12) return null;
		return isPM ? (hours === 12 ? 12 : hours + 12) : hours === 12 ? 0 : hours;
	} else {
		if (hours < 0 || hours > 23) return null;
		return hours;
	}
}

function parseMinutes(value: string): number | null {
	const minutes = parseInt(value);
	if (isNaN(minutes) || minutes < 0 || minutes > 59) return null;
	return minutes;
}

// ==============================
// TIME UTILITIES
// ==============================

export function updateDateWithTime(
	date: Date,
	time: DatePicker.TimeSelection,
	timeFormat: "12h" | "24h",
): Date {
	let hours = time.hours;

	if (timeFormat === "12h") {
		if (time.isPM && hours < 12) {
			hours += 12;
		} else if (!time.isPM && hours === 12) {
			hours = 0;
		}
	}

	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, time.minutes);
}

export function getCurrentTime(): DatePicker.TimeSelection {
	const now = new Date();
	return {
		hours: now.getHours(),
		minutes: now.getMinutes(),
		isPM: now.getHours() >= 12,
	};
}
