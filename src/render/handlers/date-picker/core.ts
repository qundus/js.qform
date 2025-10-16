import type { DatePicker } from "./_model";
import { createTimeElement } from "./time";
import { validateInput } from "./validate";
import { parseDate, parseMultipleDates, parseRangeDates } from "./parse";
import { formatOutputValue, getEventDates, getFormattedDates } from "./format";
import { updateDateWithTime, getCurrentTime } from "./time"; // Keep time utilities in tim

export class DatePickerCore {
	public state: DatePicker.State;
	public options: Required<DatePicker.Options>;
	public locale: Required<DatePicker.Locale>;
	public events: Required<DatePicker.Events>;

	constructor(options: DatePicker.Options = {}, events: DatePicker.Events = {}) {
		this.options = this.initializeOptions(options);
		this.locale = this.initializeLocale(this.options.locale);
		this.events = this.initializeEvents(events);
		this.state = this.initializeState(this.options.format);
	}

	// ==============================
	// INITIALIZATION
	// ==============================

	private initializeOptions(options: DatePicker.Options): Required<DatePicker.Options> {
		return {
			format: "yyyy-mm-dd",
			range: false,
			multiple: false,
			minDate: new Date(1900, 0, 1),
			maxDate: new Date(2100, 11, 31),
			time: false,
			timeFormat: "24h",
			classes: {},
			locale: {},
			...options,
		};
	}

	private initializeLocale(customLocale: DatePicker.Locale): Required<DatePicker.Locale> {
		return {
			months: [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			],
			weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			weekdaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
			am: "AM",
			pm: "PM",
			...customLocale,
		};
	}

	private initializeEvents(events: DatePicker.Events): Required<DatePicker.Events> {
		return {
			onChange: () => {},
			onShow: () => {},
			onHide: () => {},
			...events,
		};
	}

	private initializeState(format: string): DatePicker.State {
		const now = new Date();

		// Determine initial mode based on format
		const initialMode: DatePicker.CalendarMode = this.determineInitialMode(format);

		return {
			currentDate: now,
			selectedDates: [],
			isVisible: false,
			currentMode: initialMode,
			currentTime: getCurrentTime(),
		};
	}

	private determineInitialMode(format: string): DatePicker.CalendarMode {
		const hasDays = format.includes("dd");
		const hasMonths = format.includes("mm") && !format.includes("hh") && !format.includes("HH");
		const hasYears = format.includes("yyyy");
		const hasTime = (format.includes("hh") || format.includes("HH")) && format.includes("mm");

		// Priority: time > days > months > years
		if (hasTime && !hasDays && !hasMonths && !hasYears) return "time";
		if (hasDays) return "days";
		if (hasMonths) return "months";
		if (hasYears) return "years";

		return "days"; // fallback
	}

	// ==============================
	// VALUE MANAGEMENT
	// ==============================

	// Update updateFromSelection to be more reliable:
	private updateFromSelection(type: "select" | "input" | "time" = "select"): void {
		const value = this.getValue();
		const isValid = validateInput(value, this.options);

		const eventData: DatePicker.Event = {
			date: getEventDates(this.state.selectedDates, this.options),
			formatted: getFormattedDates(this.state.selectedDates, this.options, this.locale),
			value: value,
			type: type,
			isValid: isValid,
		};

		this.events.onChange(eventData);
	}

	getValue(): string {
		return formatOutputValue(this.state.selectedDates, this.options, this.locale);
	}

	// In core.ts, update setValue method:
	setValue(value: string): boolean {
		const isValid = validateInput(value, this.options);

		if (value.trim() === "") {
			this.state.selectedDates = [];
			this.updateFromSelection("input");
			return true;
		}

		// Store previous selection to detect changes
		const previousDates = [...this.state.selectedDates];

		// Parse based on selection mode
		if (this.options.range) {
			this.parseRange(value);
		} else if (this.options.multiple) {
			this.parseMultiple(value);
		} else {
			this.parseSingle(value);
		}

		// Update current date to first selected date
		if (this.state.selectedDates.length > 0) {
			this.state.currentDate = new Date(this.state.selectedDates[0]);
		}

		// Always trigger onChange for valid inputs, even if selection didn't change
		// This ensures every valid keystroke triggers the event
		if (isValid && value.trim()) {
			this.updateFromSelection("input");
		}

		return isValid;
	}

	// Update the parse methods to be more aggressive:
	private parseSingle(value: string): void {
		const date = parseDate(value, this.options.format);
		if (date) {
			this.state.selectedDates = [date];
		} else {
			// Clear selection if we can't parse (user is in the middle of typing)
			this.state.selectedDates = [];
		}
	}

	private parseMultiple(value: string): void {
		const dates = parseMultipleDates(value, this.options.format);
		this.state.selectedDates = dates; // Always set, even if empty
	}

	private parseRange(value: string): void {
		const dates = parseRangeDates(value, this.options.format);
		this.state.selectedDates = dates; // Always set, even if empty
	}

	// ==============================
	// DATE SELECTION
	// ==============================

	selectDate(date: Date): void {
		const { currentMode } = this.state;

		if (currentMode === "years") {
			this.selectYear(date);
		} else if (currentMode === "months") {
			this.selectMonth(date);
		} else if (currentMode === "time") {
			this.selectTime(date);
		} else {
			this.selectDay(date);
		}
	}

	private selectYear(date: Date): void {
		this.state.currentDate = new Date(date.getFullYear(), 0, 1);

		const availableModes = this.getAvailableModes();

		if (availableModes.includes("months") && this.options.format.includes("mm")) {
			this.state.currentMode = "months";
		} else if (availableModes.includes("days") && this.options.format.includes("dd")) {
			this.state.currentMode = "days";
		} else if (availableModes.includes("time")) {
			this.state.currentMode = "time";
		} else {
			// If no other modes are available, select the year directly
			this.state.selectedDates = [new Date(date.getFullYear(), 0, 1)];
			this.updateFromSelection("select");
		}
	}

	private selectMonth(date: Date): void {
		this.state.currentDate = new Date(this.state.currentDate.getFullYear(), date.getMonth(), 1);

		if (this.options.format.includes("dd")) {
			this.state.currentMode = "days";
		} else if (this.options.time) {
			this.state.currentMode = "time";
		} else {
			this.state.selectedDates = [date];
			this.updateFromSelection("select");
		}
	}

	private selectDay(date: Date): void {
		const { selectedDates } = this.state;

		if (this.options.range) {
			this.selectRange(date, selectedDates);
		} else if (this.options.multiple) {
			this.selectMultiple(date, selectedDates);
		} else {
			this.selectSingle(date, selectedDates);
		}

		if (this.options.time && !this.options.range && !this.options.multiple) {
			this.state.currentMode = "time";
		} else {
			this.updateFromSelection("select");
		}
	}

	private selectTime(date: Date): void {
		if (this.state.selectedDates.length > 0) {
			const newDate = updateDateWithTime(
				this.state.selectedDates[0],
				this.state.currentTime,
				this.options.timeFormat,
			);
			this.state.selectedDates = [newDate];
		}
		this.updateFromSelection("time");
	}

	private selectRange(date: Date, selectedDates: Date[]): void {
		if (selectedDates.length === 2) {
			selectedDates.length = 0;
			selectedDates.push(date);
		} else if (selectedDates.length === 1) {
			selectedDates.push(date);
			selectedDates.sort((a, b) => a.getTime() - b.getTime());
		} else {
			selectedDates.push(date);
		}
	}

	private selectMultiple(date: Date, selectedDates: Date[]): void {
		const existingIndex = selectedDates.findIndex((d) => d.toDateString() === date.toDateString());

		if (existingIndex > -1) {
			selectedDates.splice(existingIndex, 1);
		} else {
			selectedDates.push(date);
		}

		selectedDates.sort((a, b) => a.getTime() - b.getTime());
	}

	private selectSingle(date: Date, selectedDates: Date[]): void {
		selectedDates.length = 0;
		selectedDates.push(date);
	}

	// ==============================
	// TIME MANAGEMENT
	// ==============================

	setTime(hours: number, minutes: number): void {
		this.state.currentTime.hours = hours;
		this.state.currentTime.minutes = minutes;

		if (this.state.selectedDates.length > 0) {
			const newDate = updateDateWithTime(
				this.state.selectedDates[0],
				this.state.currentTime,
				this.options.timeFormat,
			);
			this.state.selectedDates[0] = newDate;
		}

		this.updateFromSelection("time");
	}

	setAMPM(isPM: boolean): void {
		this.state.currentTime.isPM = isPM;

		let hours = this.state.currentTime.hours;
		if (this.options.timeFormat === "12h") {
			if (isPM && hours < 12) {
				hours += 12;
			} else if (!isPM && hours >= 12) {
				hours -= 12;
			}
			this.state.currentTime.hours = hours;
		}

		this.setTime(this.state.currentTime.hours, this.state.currentTime.minutes);
	}

	private updateTimeFromDate(date: Date): void {
		this.state.currentTime = {
			hours: date.getHours(),
			minutes: date.getMinutes(),
			isPM: date.getHours() >= 12,
		};
	}

	getCurrentTime(): DatePicker.TimeSelection {
		return { ...this.state.currentTime };
	}

	// ==============================
	// NAVIGATION
	// ==============================

	canSwitchModes(): boolean {
		return this.getAvailableModes().length > 1;
	}

	switchMode(): void {
		const availableModes = this.getAvailableModes();
		if (availableModes.length > 1) {
			const currentIndex = availableModes.indexOf(this.state.currentMode);
			const nextIndex = (currentIndex + 1) % availableModes.length;
			this.state.currentMode = availableModes[nextIndex];
		}
	}

	// Ensure this method is public in your core.ts:
	public getAvailableModes(): DatePicker.CalendarMode[] {
		const modes: DatePicker.CalendarMode[] = [];
		const { format, time } = this.options;

		// Only add modes that are relevant based on format
		if (format.includes("dd")) modes.push("days");
		if (format.includes("mm") && !format.includes("hh") && !format.includes("HH"))
			modes.push("months");
		if (format.includes("yyyy")) modes.push("years");
		if (time && (format.includes("hh") || format.includes("HH")) && format.includes("mm")) {
			modes.push("time");
		}

		return modes;
	}

	navigate(direction: number): void {
		const { currentDate, currentMode } = this.state;

		switch (currentMode) {
			case "days":
				currentDate.setMonth(currentDate.getMonth() + direction);
				break;
			case "months":
				currentDate.setFullYear(currentDate.getFullYear() + direction);
				break;
			case "years":
				currentDate.setFullYear(currentDate.getFullYear() + direction * 12);
				break;
		}
	}

	// ==============================
	// PUBLIC API
	// ==============================

	setDate(date: Date): void {
		this.state.selectedDates = [date];
		this.updateFromSelection("select");
	}

	setDates(dates: Date[]): void {
		this.state.selectedDates = [...dates];
		this.updateFromSelection("select");
	}

	getSelectedDates(): Date[] {
		return [...this.state.selectedDates];
	}

	validate(value?: string): boolean {
		const valueToValidate = value || this.getValue();
		return validateInput(valueToValidate, this.options);
	}

	getState(): DatePicker.State {
		return { ...this.state };
	}

	updateOptions(newOptions: Partial<DatePicker.Options>): void {
		this.options = { ...this.options, ...newOptions };
		this.locale = this.initializeLocale(this.options.locale);
	}

	getLocale(): Required<DatePicker.Locale> {
		return this.locale;
	}
}
