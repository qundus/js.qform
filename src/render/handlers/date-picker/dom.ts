import type { DatePickerCore } from "./core";
import { createTimeElement } from "./time";
import type { DatePicker } from "./_model";
import { formatDateValue, getEventDates, getFormattedDates } from "./format";

export class DatePickerDOM {
	private _core: DatePickerCore;
	private _container: HTMLElement | null = null;
	private _input: HTMLInputElement | null = null;
	private _body: HTMLElement | null = null;

	constructor(input: HTMLInputElement, core: DatePickerCore) {
		this._core = core;
		this._input = input;
		this._container = this.containerInit();
		this.headerInit();
		this._body = this.bodyInit();
		this._container.appendChild(this._body);
		this.eventInit();
	}

	// ==============================
	// CONTAINER
	// ==============================

	private containerInit(): HTMLElement {
		const container = document.createElement("div");
		const classes = this._core.options.classes;

		Object.assign(container.style, {
			position: "absolute",
			background: "white",
			border: "1px solid #e2e8f0",
			borderRadius: "12px",
			padding: "16px",
			boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
			zIndex: "1000",
			display: "none",
			width: "320px",
			fontFamily: "'Inter', -apple-system, sans-serif",
			color: "#1a202c",
		});

		container.className = "qform-dp-container";
		if (classes?.container) {
			container.className += " " + classes.container;
		}

		document.body.appendChild(container);
		return container;
	}

	private containerUpdatePosition(): void {
		if (!this._container || !this._input) return;

		const rect = this._input.getBoundingClientRect();
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

		// Position below input with some margin
		this._container.style.top = `${rect.bottom + scrollTop + 4}px`;
		this._container.style.left = `${rect.left + scrollLeft}px`;
	}

	// ==============================
	// HEADER
	// ==============================

	private headerInit(): void {
		if (!this._container) return;

		const header = document.createElement("div");
		header.className = "qform-dp-header";
		header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 0 4px;
    `;

		// Left side: navigation buttons
		const leftNav = document.createElement("div");
		leftNav.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;

		const prevBtn = this.headerElementNav("‹", () => {
			this._core.navigate(-1);
			this.redraw();
		});

		const nextBtn = this.headerElementNav("›", () => {
			this._core.navigate(1);
			this.redraw();
		});

		leftNav.appendChild(prevBtn);
		leftNav.appendChild(nextBtn);

		// Center: title
		const titleContainer = document.createElement("div");
		titleContainer.style.cssText = `
        display: flex;
        justify-content: center;
        flex: 1;
    `;

		const title = this.headerElementTitle();
		titleContainer.appendChild(title);

		header.appendChild(leftNav);
		header.appendChild(titleContainer);

		this._container.appendChild(header);
	}

	private headerElementTitle(): HTMLButtonElement {
		const title = document.createElement("button");
		title.className = "qform-dp-title";
		title.style.cssText = `
        font-size: 16px;
        font-weight: 600;
        color: #1a202c;
        background: none;
        border: none;
        cursor: ${this._core.canSwitchModes() ? "pointer" : "default"};
        padding: 8px 16px;
        border-radius: 6px;
        transition: background-color 0.2s;
        min-width: 160px;
    `;

		this.headerElementTitleUpdate(title);

		if (this._core.canSwitchModes()) {
			title.addEventListener("mouseenter", () => {
				title.style.background = "#f7fafc";
			});
			title.addEventListener("mouseleave", () => {
				title.style.background = "none";
			});
			title.addEventListener("click", () => {
				this._core.switchMode();
				this.redraw();
			});
		}

		return title;
	}

	private headerElementNav(text: string, onClick: () => void): HTMLButtonElement {
		const button = document.createElement("button");
		button.textContent = text;
		button.style.cssText = `
			width: 32px;
			height: 32px;
			border: 1px solid #e2e8f0;
			background: white;
			border-radius: 8px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			color: #4a5568;
			transition: all 0.2s;
		`;

		button.addEventListener("mouseenter", () => {
			button.style.background = "#f7fafc";
			button.style.borderColor = "#cbd5e0";
		});

		button.addEventListener("mouseleave", () => {
			button.style.background = "white";
			button.style.borderColor = "#e2e8f0";
		});

		button.addEventListener("click", (e) => {
			e.stopPropagation();
			onClick();
		});

		return button;
	}

	private headerElementTitleUpdate(title: HTMLElement): void {
		const { currentDate, currentMode } = this._core.state;

		switch (currentMode) {
			case "days":
				title.textContent = `${this._core.locale.months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
				break;
			case "months":
				title.textContent = currentDate.getFullYear().toString();
				break;
			case "years":
				{
					const year = currentDate.getFullYear();
					title.textContent = `${year - 6} - ${year + 5}`;
				}
				break;
			case "time":
				title.textContent = "Select Time";
				break;
			default:
				title.textContent = "Date Picker";
		}
	}

	// ==============================
	// BODY
	// ==============================

	private bodyInit(): HTMLElement {
		const body = document.createElement("div");
		body.className = "qform-dp-body";
		this.bodyRender(body);
		return body;
	}

	private bodyRender(body: HTMLElement): void {
		// Clear existing content
		body.innerHTML = "";

		switch (this._core.state.currentMode) {
			case "days":
				this.bodyRenderDays(body);
				break;
			case "months":
				this.bodyRenderMonths(body);
				break;
			case "years":
				this.bodyRenderYears(body);
				break;
			case "time":
				this.bodyRenderTime(body);
				break;
		}

		// Add time section if enabled and in days mode
		if (this._core.options.time && this._core.state.currentMode === "days") {
			const timeSection = this.bodyElementTime();
			body.appendChild(timeSection);
		}
	}

	private bodyRenderDays(container: HTMLElement): void {
		// Weekdays header
		const weekdaysHeader = document.createElement("div");
		weekdaysHeader.style.cssText = `
			display: grid;
			grid-template-columns: repeat(7, 1fr);
			text-align: center;
			font-size: 12px;
			font-weight: 600;
			color: #718096;
			margin-bottom: 12px;
			gap: 4px;
		`;

		this._core.locale.weekdaysShort.forEach((day) => {
			const dayElement = document.createElement("div");
			dayElement.textContent = day;
			dayElement.style.padding = "8px 0";
			weekdaysHeader.appendChild(dayElement);
		});

		container.appendChild(weekdaysHeader);

		// Days grid
		const daysGrid = document.createElement("div");
		daysGrid.style.cssText = `
			display: grid;
			grid-template-columns: repeat(7, 1fr);
			gap: 4px;
		`;

		const dates = this.bodyPopulateDates();
		dates.forEach((date) => {
			const dayElement = this.bodyElementDay(date);
			daysGrid.appendChild(dayElement);
		});

		container.appendChild(daysGrid);
	}

	private bodyRenderMonths(container: HTMLElement): void {
		const grid = document.createElement("div");
		grid.style.cssText = `
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
		`;

		this._core.locale.months.forEach((month, index) => {
			const monthElement = this.bodyElementButton(month.substring(0, 3), () => {
				const date = new Date(this._core.state.currentDate);
				date.setMonth(index);
				this._core.selectDate(date);
				this.redraw();
			});
			grid.appendChild(monthElement);
		});

		container.appendChild(grid);
	}

	private bodyRenderYears(container: HTMLElement): void {
		const grid = document.createElement("div");
		grid.style.cssText = `
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 8px;
		`;

		const currentYear = this._core.state.currentDate.getFullYear();
		for (let i = currentYear - 6; i <= currentYear + 5; i++) {
			const yearElement = this.bodyElementButton(i.toString(), () => {
				const date = new Date(this._core.state.currentDate);
				date.setFullYear(i);
				this._core.selectDate(date);
				this.redraw();
			});
			grid.appendChild(yearElement);
		}

		container.appendChild(grid);
	}

	private bodyRenderTime(container: HTMLElement): void {
		const timeSection = this.bodyElementTime();
		container.appendChild(timeSection);
	}

	// elements
	private bodyElementDay(date: Date): HTMLElement {
		const day = date.getDate();
		const month = date.getMonth();
		const year = date.getFullYear();
		const { currentDate, selectedDates } = this._core.state;

		const isCurrentMonth = month === currentDate.getMonth() && year === currentDate.getFullYear();
		const isToday = this.isToday(date);
		const isSelected = selectedDates.some((d) => d.toDateString() === date.toDateString());
		const isDisabled = this.isDateDisabled(date);

		const dayElement = document.createElement("button");
		dayElement.textContent = day.toString();
		dayElement.className = "qform-dp-day";

		// Base styles
		dayElement.style.cssText = `
			width: 36px;
			height: 36px;
			border: 2px solid transparent;
			background: ${isCurrentMonth ? "white" : "transparent"};
			color: ${isCurrentMonth ? "#2d3748" : "#a0aec0"};
			cursor: ${isDisabled ? "not-allowed" : "pointer"};
			border-radius: 8px;
			font-size: 14px;
			font-weight: 500;
			transition: all 0.2s ease;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 auto;
		`;

		// Today styling
		if (isToday && isCurrentMonth) {
			dayElement.style.borderColor = "#4299e1";
			dayElement.style.color = "#4299e1";
			dayElement.style.fontWeight = "600";
		}

		// Selected styling
		if (isSelected && isCurrentMonth) {
			dayElement.style.background = "#4299e1";
			dayElement.style.color = "white";
			dayElement.style.borderColor = "#4299e1";
		}

		// Hover effects for enabled, non-selected dates in current month
		// if (!isDisabled && !isSelected && isCurrentMonth) {
		// 	dayElement.addEventListener("mouseenter", () => {
		// 		dayElement.style.background = "#ebf8ff";
		// 		dayElement.style.borderColor = "#bee3f8";
		// 	});

		// 	dayElement.addEventListener("mouseleave", () => {
		// 		dayElement.style.background = "white";
		// 		dayElement.style.borderColor = "transparent";
		// 	});
		// }

		// Click handler
		if (!isDisabled && isCurrentMonth) {
			dayElement.addEventListener("click", () => {
				// Create date with proper time if time is enabled
				const selectedDate = new Date(date);

				if (this._core.options.time && this._core.state.selectedDates.length > 0) {
					// Preserve time from previous selection if available
					const previousDate = this._core.state.selectedDates[0];
					selectedDate.setHours(previousDate.getHours(), previousDate.getMinutes());
				}

				this._core.selectDate(selectedDate);
				// this.bodyUpdateValue();
				this.redraw();

				// Auto-close if we've reached the final selection mode
				const availableModes = this._core.getAvailableModes();
				const currentModeIndex = availableModes.indexOf(this._core.state.currentMode);
				const isFinalMode = currentModeIndex === availableModes.length - 1;

				// if (!this._core.options.range && !this._core.options.multiple && isFinalMode) {
				// 	setTimeout(() => this.domHide(), 300);
				// }
			});
		}

		return dayElement;
	}

	private bodyElementButton(text: string, onClick: () => void): HTMLButtonElement {
		const button = document.createElement("button");
		button.textContent = text;
		button.style.cssText = `
			padding: 12px 8px;
			border: 2px solid #e2e8f0;
			background: white;
			border-radius: 8px;
			cursor: pointer;
			font-size: 14px;
			font-weight: 500;
			color: #2d3748;
			transition: all 0.2s;
		`;

		button.addEventListener("mouseenter", () => {
			button.style.background = "#ebf8ff";
			button.style.borderColor = "#bee3f8";
		});

		button.addEventListener("mouseleave", () => {
			button.style.background = "white";
			button.style.borderColor = "#e2e8f0";
		});

		button.addEventListener("click", onClick);

		return button;
	}

	private bodyElementTime(): HTMLElement {
		return createTimeElement(
			this._core.getCurrentTime(),
			this._core.options as Required<DatePicker.Options>,
			this._core.locale,
			(hours: number, minutes: number) => {
				this._core.setTime(hours, minutes);
				// Trigger change event for time updates
				this.eventTriggerTimeChange();
			},
			(isPM: boolean) => {
				this._core.setAMPM(isPM);
				// Trigger change event for time updates
				this.eventTriggerTimeChange();
			},
		);
	}

	// methods
	private bodyPopulateDates(): Date[] {
		const dates: Date[] = [];
		const { currentDate } = this._core.state;
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		// First day of current month
		const firstDay = new Date(year, month, 1);
		// Last day of current month
		const lastDay = new Date(year, month + 1, 0);

		// Start from the first day of the week that contains the first day of month
		const startDate = new Date(firstDay);
		startDate.setDate(firstDay.getDate() - firstDay.getDay());

		// End at the last day of the week that contains the last day of month
		const endDate = new Date(lastDay);
		endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

		// Generate all dates for the calendar grid (42 days for 6 weeks)
		const current = new Date(startDate);
		for (let i = 0; i < 42; i++) {
			dates.push(new Date(current));
			current.setDate(current.getDate() + 1);
		}

		return dates;
	}

	// ==============================
	// UTILITY METHODS
	// ==============================

	private isToday(date: Date): boolean {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	}

	private isDateDisabled(date: Date): boolean {
		const { minDate, maxDate } = this._core.options;
		if (minDate && date < minDate) return true;
		if (maxDate && date > maxDate) return true;
		return false;
	}

	private isPartialInput(value: string): boolean {
		// Consider it partial if it contains numbers but doesn't validate
		const hasDigits = /\d/.test(value);
		const hasValidStructure = /^[\d-/.\sampAMP]+$/i.test(value);
		return hasDigits && hasValidStructure;
	}

	// ==============================
	// EVENT HANDLING
	// ==============================

	private eventInit(): void {
		if (!this._input || !this._container) return;

		// this._input.addEventListener("click", this.eventInputClick.bind(this));
		// this._input.addEventListener("input", this.eventInputChange.bind(this));
		// this._input.addEventListener("blur", this.eventInputBlur.bind(this));

		// document.addEventListener("click", this.eventDocumentClick.bind(this));
		// this._container.addEventListener("click", (e) => e.stopPropagation());
	}

	private eventInputClick(e: Event): void {
		e.stopPropagation();
		this.toggle();
	}

	private eventInputChange(e: Event): void {
		const input = e.target as HTMLInputElement;
		let value = input.value;

		// Apply format-based cleaning in real-time
		const cleanedValue = this.eventFormatValue(value);
		if (cleanedValue !== value) {
			input.value = cleanedValue;
			value = cleanedValue;
		}

		// Update core value
		const isValid = this._core.setValue(value);

		// Update calendar
		this.redraw();

		// Trigger change event
		this.eventTriggerOnChange(value, isValid);
	}

	// In dom.ts, update the blur handler:
	private eventInputBlur(): void {
		const value = this._input?.value || "";
		const isValid = this._core.validate(value);

		// Only revert if completely invalid and non-empty
		if (!isValid && value.trim() && !this.isPartialInput(value)) {
			const validValue = this._core.getValue();
			if (this._input && validValue !== value) {
				this._input.value = validValue;
				this._core.setValue(validValue);
			}
		}
		// No style changes on blur
	}

	private eventDocumentClick(e: Event): void {
		if (
			this._container &&
			!this._container.contains(e.target as Node) &&
			e.target !== this._input
		) {
			this.hide();
		}
	}

	private eventTriggerTimeChange(): void {
		setTimeout(() => {
			const selectedDates = this._core.getSelectedDates();
			const value = this._core.getValue();
			const isValid = this._core.validate(value);

			this._core.events.onChange({
				date: getEventDates(selectedDates, this._core.options),
				formatted: getFormattedDates(selectedDates, this._core.options, this._core.locale),
				value: value,
				type: "time",
				isValid: isValid,
				// Remove 'complete' property
			});
		}, 0);
	}

	// methods
	private eventFormatValue(value: string): string {
		const format = this._core.options.format;

		// Get the expected separator from format
		const formatSeparators = format.replace(/[ymdht]/gi, "");
		const expectedSeparator = formatSeparators[0] || "-";

		if (!expectedSeparator || value.length === 0) return value;

		// Replace any non-digit, non-expected-separator characters
		// Escape the separator if it's a special regex character
		const escapedSeparator = expectedSeparator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		let cleaned = value.replace(new RegExp(`[^\\d${escapedSeparator}ampAMP]`, "gi"), "");

		// Replace any common separator with the expected one
		const commonSeparators = /[-/.\s]/g;
		cleaned = cleaned.replace(commonSeparators, expectedSeparator);

		// Remove duplicate separators
		cleaned = cleaned.replace(new RegExp(`\\${escapedSeparator}+`, "g"), expectedSeparator);

		return cleaned;
	}

	private eventTriggerOnChange(value: string, isValid: boolean): void {
		setTimeout(() => {
			const selectedDates = this._core.getSelectedDates();

			this._core.events.onChange({
				date: getEventDates(selectedDates, this._core.options),
				formatted: getFormattedDates(selectedDates, this._core.options, this._core.locale),
				value: value,
				type: "input",
				isValid: isValid,
				// Remove 'complete' property
			});
		}, 0);
	}

	// ==============================
	// VISIBILITY & UPDATES
	// ==============================

	public show(): void {
		if (this._container) {
			this._container.style.display = "block";
			this.containerUpdatePosition();
			this._core.state.isVisible = true;
			this._core.events.onShow();
		}
	}

	public hide(): void {
		if (this._container) {
			this._container.style.display = "none";
			this._core.state.isVisible = false;
			this._core.events.onHide();
		}
	}

	public toggle(): void {
		this._core.state.isVisible ? this.hide() : this.show();
	}

	public redraw(): void {
		if (this._body) {
			this.bodyRender(this._body);
		}

		// Update header title
		if (this._container) {
			const title = this._container.querySelector(".qform-dp-title") as HTMLElement;
			if (title) {
				this.headerElementTitleUpdate(title);
			}
		}
	}

	public destroy(): void {
		if (this._container) {
			this._container.remove();
			this._container = null;
			this._body = null;
		}
	}

	public get container(): HTMLElement | null {
		return this._container;
	}

	public get isVisible(): boolean {
		return this._core.state.isVisible;
	}
}
