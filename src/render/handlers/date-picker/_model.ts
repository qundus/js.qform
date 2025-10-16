import type { createDatePicker } from "./index";

export namespace DatePicker {
	export type Instance = ReturnType<typeof createDatePicker>;

	export interface Options {
		format?: string;
		range?: boolean;
		multiple?: boolean;
		minDate?: Date;
		maxDate?: Date;
		time?: boolean;
		timeFormat?: "12h" | "24h";
		classes?: Classes;
		locale?: Locale;
	}

	export interface Classes {
		container?: string;
		header?: string;
		navButton?: string;
		monthYear?: string;
		body?: string;
		daysHeader?: string;
		day?: string;
		selectedDay?: string;
		today?: string;
		otherMonth?: string;
		disabled?: string;
		rangeDay?: string;
		multipleDay?: string;
		timeContainer?: string;
		timeInput?: string;
		ampmButton?: string;
	}

	export interface Locale {
		months?: string[];
		weekdays?: string[];
		weekdaysShort?: string[];
		am?: string;
		pm?: string;
	}

	export interface Event {
		date: Date | Date[] | null;
		formatted: string | string[] | null;
		value: string;
		type: "select" | "input" | "time";
		isValid: boolean;
	}

	export interface Events {
		onChange?: (event: Event) => void;
		onShow?: () => void;
		onHide?: () => void;
	}

	export interface State {
		currentDate: Date;
		selectedDates: Date[];
		isVisible: boolean;
		currentMode: CalendarMode;
		currentTime: TimeSelection;
	}

	export interface TimeSelection {
		hours: number;
		minutes: number;
		isPM: boolean;
	}

	export type CalendarMode = "days" | "months" | "years" | "time";
}
