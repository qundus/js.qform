import { DatePickerOptions } from ".";
import type { StyleManager } from "./style";

//

export interface CalendarView {
	// Core rendering method
	renderBody(
		container: HTMLElement,
		currentDate: Date,
		selectedDates: Date[],
		onDateSelect: (date: Date) => void,
	): void;

	// Navigation methods
	navigate(direction: number, currentDate: Date): Date;
	canNavigate(): boolean;

	// Header methods
	getHeaderText(currentDate: Date): string;
	isHeaderClickable(): boolean;

	// Container sizing
	getContainerSize(): { width: string; height: string };
}

export interface ViewOptions {
	range: boolean;
	minDate: Date;
	maxDate: Date;
	format: string;
}

abstract class BaseView implements CalendarView {
	constructor(protected viewOptions: ViewOptions) {}

	abstract renderBody(
		container: HTMLElement,
		currentDate: Date,
		selectedDates: Date[],
		onDateSelect: (date: Date) => void,
	): void;
	abstract navigate(direction: number, currentDate: Date): Date;
	abstract getHeaderText(currentDate: Date): string;

	canNavigate(): boolean {
		return true;
	}

	isHeaderClickable(): boolean {
		return true;
	}

	getContainerSize(): { width: string; height: string } {
		return { width: "250px", height: "300px" }; // Consistent size for all views
	}

	protected isSameDay(date1: Date, date2: Date): boolean {
		return date1.toDateString() === date2.toDateString();
	}

	protected isToday(date: Date): boolean {
		return this.isSameDay(date, new Date());
	}

	protected isDateDisabled(date: Date): boolean {
		return date < this.viewOptions.minDate || date > this.viewOptions.maxDate;
	}
}

//
export class DaysView extends BaseView {
	private styleManager: StyleManager;

	constructor(viewOptions: ViewOptions, styleManager: StyleManager) {
		super(viewOptions);
		this.styleManager = styleManager;
	}

	renderBody(
		container: HTMLElement,
		currentDate: Date,
		selectedDates: Date[],
		onDateSelect: (date: Date) => void,
	): void {
		container.innerHTML = "";

		// Create days header container
		const daysHeader = document.createElement("div");
		this.styleManager.applyStyles(daysHeader, "daysHeader", {
			display: "grid",
			gridTemplateColumns: "repeat(7, 1fr)",
			gap: "2px",
			marginBottom: "5px",
		});

		// Week days header
		const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
		weekDays.forEach((day) => {
			const dayEl = document.createElement("div");
			dayEl.textContent = day;
			this.styleManager.applyStyles(dayEl, "day", {
				textAlign: "center",
				fontWeight: "bold",
				fontSize: "12px",
				color: "#666",
				padding: "5px 0",
			});
			daysHeader.appendChild(dayEl);
		});

		// Create calendar grid container
		const calendarGrid = document.createElement("div");
		this.styleManager.applyStyles(calendarGrid, "container", {
			display: "grid",
			gridTemplateColumns: "repeat(7, 1fr)",
			gap: "2px",
		});

		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDay = firstDay.getDay();
		const daysInMonth = lastDay.getDate();

		// Previous month days
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = startDay - 1; i >= 0; i--) {
			this.createDayCell(calendarGrid, prevMonthLastDay - i, "other-month");
		}

		// Current month days
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			this.createDayCell(calendarGrid, day, "current-month", date, selectedDates, onDateSelect);
		}

		// Next month days
		const totalCells = 42;
		const cellsUsed = startDay + daysInMonth;
		for (let day = 1; day <= totalCells - cellsUsed; day++) {
			this.createDayCell(calendarGrid, day, "other-month");
		}

		// Append both containers to the main container
		container.appendChild(daysHeader);
		container.appendChild(calendarGrid);
	}

	navigate(direction: number, currentDate: Date): Date {
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() + direction);
		return newDate;
	}

	getHeaderText(currentDate: Date): string {
		return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
	}

	private createDayCell(
		container: HTMLElement,
		day: number,
		type: "current-month" | "other-month",
		date?: Date,
		selectedDates: Date[] = [],
		onDateSelect?: (date: Date) => void,
	): void {
		const cell = document.createElement("div");
		cell.textContent = day.toString();

		this.styleManager.applyStyles(cell, "day", {
			textAlign: "center",
			padding: "5px",
			cursor: "pointer",
			borderRadius: "3px",
			fontSize: "14px",
			transition: "all 0.2s ease",
		});

		if (type === "other-month") {
			this.styleManager.applyStyles(cell, "otherMonth", {
				color: "#ccc",
			});
			container.appendChild(cell);
			return;
		}

		if (!date || !onDateSelect) return;

		const isSelected = selectedDates.some((selectedDate) => this.isSameDay(selectedDate, date));

		const isInRange =
			this.viewOptions.range &&
			selectedDates.length === 2 &&
			date > selectedDates[0] &&
			date < selectedDates[1];

		if (isSelected) {
			this.styleManager.applyStyles(cell, "selectedDay", {
				background: "#007cba",
				color: "white",
			});
		} else if (isInRange) {
			this.styleManager.applyStyles(cell, "rangeDay", {
				background: "#e3f2fd",
			});
		}

		if (this.isToday(date) && !isSelected) {
			this.styleManager.applyStyles(cell, "today", {
				border: "1px solid #007cba",
			});
		}

		if (this.isDateDisabled(date)) {
			this.styleManager.applyStyles(cell, "disabled", {
				color: "#ccc",
				cursor: "not-allowed",
			});
		} else {
			cell.addEventListener("click", (e) => {
				e.stopPropagation();
				onDateSelect(date);
			});

			cell.addEventListener("mouseenter", () => {
				if (!isSelected && !this.isDateDisabled(date)) {
					cell.style.background = "#f0f0f0";
				}
			});

			cell.addEventListener("mouseleave", () => {
				if (!isSelected && !isInRange && !this.isDateDisabled(date)) {
					cell.style.background = "";
				}
			});
		}

		container.appendChild(cell);
	}
}

export class MonthsView extends BaseView {
	private styleManager: StyleManager;

	constructor(viewOptions: ViewOptions, styleManager: StyleManager) {
		super(viewOptions);
		this.styleManager = styleManager;
	}

	renderBody(
		container: HTMLElement,
		currentDate: Date,
		selectedDates: Date[],
		onDateSelect: (date: Date) => void,
	): void {
		container.innerHTML = "";

		this.styleManager.applyStyles(container, "container", {
			display: "grid",
			gridTemplateColumns: "repeat(4, 1fr)",
			gap: "5px",
			padding: "10px",
		});

		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];

		months.forEach((month, index) => {
			const cell = document.createElement("div");
			cell.textContent = month;

			this.styleManager.applyStyles(cell, "day", {
				textAlign: "center",
				padding: "10px 5px",
				cursor: "pointer",
				borderRadius: "3px",
				fontSize: "14px",
			});

			const isSelected = selectedDates.some(
				(date) => date.getMonth() === index && date.getFullYear() === currentDate.getFullYear(),
			);

			if (isSelected) {
				this.styleManager.applyStyles(cell, "selectedDay", {
					background: "#007cba",
					color: "white",
				});
			}

			cell.addEventListener("click", () => {
				const newDate = new Date(currentDate.getFullYear(), index, 1);
				onDateSelect(newDate);
			});

			container.appendChild(cell);
		});
	}

	navigate(direction: number, currentDate: Date): Date {
		const newDate = new Date(currentDate);
		newDate.setFullYear(newDate.getFullYear() + direction);
		return newDate;
	}

	getHeaderText(currentDate: Date): string {
		return currentDate.getFullYear().toString();
	}
}

export class YearsView extends BaseView {
	private styleManager: StyleManager;

	constructor(viewOptions: ViewOptions, styleManager: StyleManager) {
		super(viewOptions);
		this.styleManager = styleManager;
	}

	renderBody(
		container: HTMLElement,
		currentDate: Date,
		selectedDates: Date[],
		onDateSelect: (date: Date) => void,
	): void {
		container.innerHTML = "";

		this.styleManager.applyStyles(container, "container", {
			display: "grid",
			gridTemplateColumns: "repeat(4, 1fr)",
			gap: "5px",
			padding: "10px",
		});

		const currentYear = currentDate.getFullYear();

		for (let year = currentYear - 5; year <= currentYear + 6; year++) {
			const cell = document.createElement("div");
			cell.textContent = year.toString();

			this.styleManager.applyStyles(cell, "day", {
				textAlign: "center",
				padding: "10px 5px",
				cursor: "pointer",
				borderRadius: "3px",
				fontSize: "14px",
			});

			const isSelected = selectedDates.some((date) => date.getFullYear() === year);

			if (isSelected) {
				this.styleManager.applyStyles(cell, "selectedDay", {
					background: "#007cba",
					color: "white",
				});
			}

			cell.addEventListener("click", () => {
				const newDate = new Date(year, 0, 1);
				onDateSelect(newDate);
			});

			container.appendChild(cell);
		}
	}

	isHeaderClickable(): boolean {
		return false; // Years view header should not be clickable
	}

	canNavigate(): boolean {
		return false; // Years view should not have navigation arrows
	}

	navigate(direction: number, currentDate: Date): Date {
		const newDate = new Date(currentDate);
		newDate.setFullYear(newDate.getFullYear() + direction * 12);
		return newDate;
	}

	getHeaderText(currentDate: Date): string {
		const year = currentDate.getFullYear();
		return `${year - 5} - ${year + 6}`;
	}
}

export class MonthsYearsView extends BaseView {
	private styleManager: StyleManager;

	constructor(viewOptions: ViewOptions, styleManager: StyleManager) {
		super(viewOptions);
		this.styleManager = styleManager;
	}

	renderBody(
		container: HTMLElement,
		currentDate: Date,
		selectedDates: Date[],
		onDateSelect: (date: Date) => void,
	): void {
		container.innerHTML = "";

		this.styleManager.applyStyles(container, "container", {
			display: "grid",
			gridTemplateColumns: "repeat(4, 1fr)",
			gap: "5px",
			padding: "10px",
		});

		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];

		months.forEach((month, index) => {
			const cell = document.createElement("div");
			cell.textContent = month;

			this.styleManager.applyStyles(cell, "day", {
				textAlign: "center",
				padding: "10px 5px",
				cursor: "pointer",
				borderRadius: "3px",
				fontSize: "14px",
			});

			const isSelected = selectedDates.some(
				(date) => date.getMonth() === index && date.getFullYear() === currentDate.getFullYear(),
			);

			if (isSelected) {
				this.styleManager.applyStyles(cell, "selectedDay", {
					background: "#007cba",
					color: "white",
				});
			}

			cell.addEventListener("click", () => {
				const newDate = new Date(currentDate.getFullYear(), index, 1);
				onDateSelect(newDate);
			});

			container.appendChild(cell);
		});
	}

	navigate(direction: number, currentDate: Date): Date {
		const newDate = new Date(currentDate);
		newDate.setFullYear(newDate.getFullYear() + direction);
		return newDate;
	}

	getHeaderText(currentDate: Date): string {
		return currentDate.getFullYear().toString();
	}
}

// View factory functions
export function createView(
	format: string,
	viewOptions: ViewOptions,
	styleManager: StyleManager,
): CalendarView {
	switch (format) {
		case "yyyy":
			return new YearsView(viewOptions, styleManager);
		case "mm":
			return new MonthsView(viewOptions, styleManager);
		case "dd":
			return new DaysView(viewOptions, styleManager);
		case "yyyy-mm":
		case "mm-dd":
			return new MonthsYearsView(viewOptions, styleManager);
		case "yyyy-mm-dd":
		case "dd-mm":
		default:
			return new DaysView(viewOptions, styleManager);
	}
}

export function getNextView(
	currentView: CalendarView,
	format: string,
	viewOptions: ViewOptions,
	styleManager: StyleManager,
): CalendarView | null {
	// Determine if there's a logical next view for the format
	switch (format) {
		case "yyyy-mm-dd":
		case "dd-mm":
			return currentView instanceof DaysView
				? new MonthsYearsView(viewOptions, styleManager)
				: new DaysView(viewOptions, styleManager);
		case "yyyy-mm":
		case "mm-dd":
			return currentView instanceof MonthsYearsView
				? new YearsView(viewOptions, styleManager)
				: new MonthsYearsView(viewOptions, styleManager);
		default:
			return null; // No view switching for single-component formats
	}
}
