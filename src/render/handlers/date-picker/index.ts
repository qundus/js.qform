import type { DatePicker } from "./_model";
import { DatePickerCore } from "./core";
import { DatePickerDOM } from "./dom";

export function createDatePicker(options?: DatePicker.Options, events?: DatePicker.Events) {
	const finalOptions: DatePicker.Options = options ?? {};
	const finalEvents: DatePicker.Events = events ?? {};
	let dom: DatePickerDOM | null = null;

	// Create core functionality
	const core = new DatePickerCore(finalOptions, finalEvents);

	const instance = {
		// Core methods
		setValue: (value: string) => core.setValue(value),
		setDate: (date: Date) => core.setDate(date),
		setDates: (dates: Date[]) => core.setDates(dates),
		setTime: (hours: number, minutes: number) => core.setTime(hours, minutes),
		setAMPM: (isPM: boolean) => core.setAMPM(isPM),

		// Getters
		getValue: () => core.getValue(),
		getSelectedDates: () => core.getSelectedDates(),
		getState: () => core.getState(),

		// Validation
		validate: (value?: string) => core.validate(value),

		// DOM methods (only work after attachTo is called)
		show: () => dom?.show(),
		hide: () => dom?.hide(),
		toggle: () => dom?.toggle(),
		isVisible: () => dom?.isVisible ?? false,

		// DOM attachment
		attachTo: (inputElement: HTMLInputElement) => {
			dom = new DatePickerDOM(inputElement, core);
			return instance;
		},

		// Cleanup
		destroy: () => {
			dom?.destroy();
			dom = null;
		},

		// Core instance for advanced usage
		core: core,
		_dom: () => dom, // internal access to DOM
	};

	return instance;
}

// Export individual components for advanced usage
export { DatePickerCore, DatePickerDOM };
