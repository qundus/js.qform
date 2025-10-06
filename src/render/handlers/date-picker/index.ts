import { StyleManager, type StyleOptions } from "./style";
import {
	type CalendarView,
	createView,
	DaysView,
	getNextView,
	MonthsView,
	MonthsYearsView,
	type ViewOptions,
	YearsView,
} from "./view";

export interface DatePickerOptions {
	format?: "yyyy-mm-dd" | "mm-dd" | "dd-mm" | "yyyy-mm" | "mm" | "yyyy" | "dd";
	range?: boolean;
	separator?: string;
	minDate?: Date;
	maxDate?: Date;
	position?: "top" | "bottom";
	onInput?: (value: string, isValid: boolean) => void;
	onChange?: (dates: Date[] | null, isValid: boolean) => void;
	styles?: StyleOptions;
}

export class DatePicker {
	private input: HTMLInputElement;
	private options: Required<DatePickerOptions>;
	private selectedDates: Date[] = [];
	private currentDate: Date;
	private isVisible: boolean = false;
	// @ts-expect-error
	private picker: HTMLDivElement;
	// @ts-expect-error
	private monthYear: HTMLSpanElement;
	// @ts-expect-error
	private calendarGrid: HTMLDivElement;
	private lastValidValue: string = "";
	private styleManager: StyleManager;
	private currentView: CalendarView;

	constructor(inputElement: HTMLInputElement, options: DatePickerOptions = {}) {
		this.input = inputElement;
		this.options = {
			format: "yyyy-mm-dd",
			range: false,
			separator: " - ",
			minDate: new Date(1900, 0, 1),
			maxDate: new Date(2100, 11, 31),
			position: "bottom",
			onInput: () => {},
			onChange: () => {},
			styles: {},
			...options,
		};

		this.styleManager = new StyleManager(this.options.styles);
		this.currentDate = new Date();
		this.lastValidValue = this.input.value;

		// Create view options without currentDate
		const viewOptions: ViewOptions = {
			range: this.options.range,
			minDate: this.options.minDate,
			maxDate: this.options.maxDate,
			format: this.options.format,
		};

		this.currentView = createView(this.options.format, viewOptions, this.styleManager);
		this.init();
	}

	private init(): void {
		this.createPicker();
		this.attachEvents();
		this.render();
	}

	// ==================== CREATION METHODS ====================
	private createPicker(): void {
		this.picker = document.createElement("div");
		this.picker.className = "simple-datepicker";

		// Apply consistent container size
		const containerSize = this.currentView.getContainerSize();
		this.styleManager.applyStyles(this.picker, "container", {
			position: "absolute",
			display: "none",
			zIndex: "1000",
			width: containerSize.width,
			height: containerSize.height,
			overflow: "hidden", // Prevent content from expanding container
		});

		this.createHeader();
		this.createCalendarGrid();
		document.body.appendChild(this.picker);
	}

	private createHeader(): void {
		const header = document.createElement("div");

		this.styleManager.applyStyles(header, "header", {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: "10px",
			padding: "0 10px",
		});

		const prevBtn = this.createNavButton("‹", () => this.navigate(-1));
		const nextBtn = this.createNavButton("›", () => this.navigate(1));

		this.monthYear = document.createElement("span");
		this.styleManager.applyStyles(this.monthYear, "monthYear", {
			fontWeight: "bold",
			cursor: this.currentView.isHeaderClickable() ? "pointer" : "default",
			flex: "1",
			textAlign: "center",
		});

		if (this.currentView.isHeaderClickable()) {
			this.monthYear.addEventListener("click", () => this.switchView());
		}

		header.appendChild(prevBtn);
		header.appendChild(this.monthYear);
		header.appendChild(nextBtn);
		this.picker.appendChild(header);
	}

	private createCalendarGrid(): void {
		this.calendarGrid = document.createElement("div");

		// Make calendar grid fill remaining space
		this.styleManager.applyStyles(this.calendarGrid, "container", {
			height: "calc(100% - 50px)", // Subtract header height
			overflow: "auto",
			padding: "0 10px",
		});

		this.picker.appendChild(this.calendarGrid);
	}

	private createNavButton(text: string, onClick: () => void): HTMLButtonElement {
		const button = document.createElement("button");
		button.textContent = text;
		button.onclick = onClick;

		this.styleManager.applyStyles(button, "navButton", {
			border: "none",
			background: "#f0f0f0",
			padding: "5px 10px",
			cursor: "pointer",
			borderRadius: "3px",
		});

		return button;
	}

	// ==================== EVENT HANDLERS ====================
	private attachEvents(): void {
		// Toggle calendar on input click - FIXED: Use mousedown instead of click
		this.input.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.toggle();
		});

		// Allow free typing in input
		this.input.addEventListener("focus", () => this.handleInputFocus());
		this.input.addEventListener("input", (e) => this.handleInputChange(e));
		this.input.addEventListener("blur", () => this.handleInputBlur());
		this.input.addEventListener("keydown", (e) => this.handleKeydown(e));

		document.addEventListener("click", (e) => this.handleClickOutside(e));

		// FIXED: Add click event to prevent calendar from closing when clicking inside
		this.picker.addEventListener("click", (e) => {
			e.stopPropagation();
		});
	}

	private handleInputFocus(): void {
		this.lastValidValue = this.input.value;
	}

	private handleInputChange(e: Event): void {
		const value = this.input.value;
		const isValid = this.validateInput(value);

		this.options.onInput(value, isValid);
		this.input.style.borderColor = isValid ? "#ccc" : "#ff4444";
	}

	private handleInputBlur(): void {
		const value = this.input.value.trim();

		if (!value) {
			this.clear();
			this.options.onChange(null, true);
			return;
		}

		const isValid = this.validateInput(value);

		if (isValid) {
			this.applyInputValue(value);
			this.lastValidValue = value;
		} else {
			this.input.value = this.lastValidValue;
			this.input.style.borderColor = "#ccc";
		}

		this.options.onChange(this.selectedDates.length > 0 ? this.selectedDates : null, isValid);
	}

	private handleKeydown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			this.handleInputBlur();
			this.hide();
		} else if (e.key === "Escape") {
			this.input.value = this.lastValidValue;
			this.input.style.borderColor = "#ccc";
			this.hide();
		}
	}

	private handleClickOutside(e: MouseEvent): void {
		const target = e.target as Node;
		if (!this.picker.contains(target) && target !== this.input) {
			this.hide();
		}
	}

	// ==================== RENDERING METHODS ====================
	private render(): void {
		this.updateHeader();
		this.updateNavigationVisibility();
		this.currentView.renderBody(
			this.calendarGrid,
			this.currentDate,
			this.selectedDates,
			(date: Date) => this.handleDateSelect(date),
		);
	}

	private updateHeader(): void {
		this.monthYear.textContent = this.currentView.getHeaderText(this.currentDate);

		// Update header clickability
		this.monthYear.style.cursor = this.currentView.isHeaderClickable() ? "pointer" : "default";
		if (this.currentView.isHeaderClickable()) {
			this.monthYear.onclick = () => this.switchView();
		} else {
			this.monthYear.onclick = null;
		}

		// Center header text if not clickable
		if (!this.currentView.isHeaderClickable()) {
			this.monthYear.style.flex = "1";
			this.monthYear.style.textAlign = "center";
		}
	}

	private updateNavigationVisibility(): void {
		const navButtons = this.picker.querySelectorAll("button");
		navButtons.forEach((button) => {
			if (button.textContent === "‹" || button.textContent === "›") {
				button.style.display = this.currentView.canNavigate() ? "block" : "none";
			}
		});
	}

	private shouldAutoClose(): boolean {
		return (
			this.options.format === "dd" ||
			this.options.format === "mm" ||
			this.options.format === "yyyy" ||
			this.options.format === "yyyy-mm" ||
			this.options.format === "mm-dd"
		);
	}

	private canSwitchViews(): boolean {
		return this.options.format === "yyyy-mm-dd" || this.options.format === "dd-mm";
	}

	private navigate(direction: number): void {
		if (!this.currentView.canNavigate()) return;

		this.currentDate = this.currentView.navigate(direction, this.currentDate);
		this.render();
	}

	private switchToNextView(): void {
		const viewOptions: ViewOptions = {
			range: this.options.range,
			minDate: this.options.minDate,
			maxDate: this.options.maxDate,
			format: this.options.format,
		};

		if (this.currentView instanceof YearsView) {
			this.currentView = new MonthsYearsView(viewOptions, this.styleManager);
		} else if (this.currentView instanceof MonthsView) {
			this.currentView = new DaysView(viewOptions, this.styleManager);
		} else if (this.currentView instanceof MonthsYearsView) {
			this.currentView = new DaysView(viewOptions, this.styleManager);
		}

		this.render();
	}

	private switchToView(targetView: "days" | "months" | "years" | "months-years"): void {
		const viewOptions: ViewOptions = {
			range: this.options.range,
			minDate: this.options.minDate,
			maxDate: this.options.maxDate,
			format: this.options.format,
		};

		switch (targetView) {
			case "days":
				this.currentView = new DaysView(viewOptions, this.styleManager);
				break;
			case "months":
				this.currentView = new MonthsView(viewOptions, this.styleManager);
				break;
			case "years":
				this.currentView = new YearsView(viewOptions, this.styleManager);
				break;
			case "months-years":
				this.currentView = new MonthsYearsView(viewOptions, this.styleManager);
				break;
		}

		this.render();
	}

	private switchView(): void {
		if (!this.canSwitchViews()) return;

		const viewOptions: ViewOptions = {
			range: this.options.range,
			minDate: this.options.minDate,
			maxDate: this.options.maxDate,
			format: this.options.format,
		};

		if (this.currentView instanceof DaysView) {
			this.currentView = new MonthsYearsView(viewOptions, this.styleManager);
		} else if (this.currentView instanceof MonthsYearsView) {
			this.currentView = new YearsView(viewOptions, this.styleManager);
		} else if (this.currentView instanceof YearsView) {
			this.currentView = new DaysView(viewOptions, this.styleManager);
		}

		this.render();
	}

	// ==================== PUBLIC METHODS ====================
	public show(): void {
		this.isVisible = true;
		this.updatePosition();
		this.picker.style.display = "block";
	}

	public hide(): void {
		this.isVisible = false;
		this.picker.style.display = "none";
	}

	public toggle(): void {
		this.isVisible ? this.hide() : this.show();
	}

	public setDate(date: Date | Date[]): void {
		this.selectedDates = Array.isArray(date) ? [...date] : [date];
		this.updateInput();
		this.render();
	}

	public getDate(): Date | null {
		return this.selectedDates[0] || null;
	}

	public getDates(): Date[] {
		return [...this.selectedDates];
	}

	public clear(): void {
		this.selectedDates = [];
		this.updateInput();
		this.render();
	}

	public isValid(): boolean {
		return this.validateInput(this.input.value);
	}

	public getFormattedValue(): string {
		if (this.selectedDates.length === 0) return "";

		const formattedDates = this.selectedDates.map((date) => this.formatDate(date));

		if (this.options.range && this.selectedDates.length === 2) {
			return formattedDates.join(this.options.separator);
		} else {
			return formattedDates[0];
		}
	}

	public updateStyles(newStyles: StyleOptions): void {
		this.styleManager.updateStyles(newStyles);
		this.render(); // Re-render with new styles
	}

	public destroy(): void {
		this.hide();
		if (this.picker.parentNode) {
			this.picker.parentNode.removeChild(this.picker);
		}
	}

	// ==================== PRIVATE HELPERS ====================
	private handleDateSelect(date: Date): void {
		// Handle different selection behaviors based on format and current view
		if (this.currentView instanceof YearsView) {
			// If we're in years view and select a year
			if (this.options.format === "yyyy") {
				// For year-only format, select and close
				this.selectDate(date);
			} else {
				// For other formats, update current date and switch to appropriate view
				this.currentDate = date;
				this.switchToNextView();
			}
		} else if (this.currentView instanceof MonthsView) {
			// If we're in months view and select a month
			if (this.options.format === "mm") {
				// For month-only format, select and close
				this.selectDate(date);
			} else {
				// For other formats, update current date and switch to appropriate view
				this.currentDate = date;
				this.switchToNextView();
			}
		} else if (this.currentView instanceof MonthsYearsView) {
			// If we're in months-years view and select a month
			if (this.options.format === "yyyy-mm" || this.options.format === "mm-dd") {
				// For month-year formats, select and close
				this.selectDate(date);
			} else {
				// For full date formats, update current date and switch to days view
				this.currentDate = date;
				this.switchToView("days");
			}
		} else if (this.currentView instanceof DaysView) {
			// Regular date selection in days view
			this.selectDate(date);
		}
	}

	private selectDate(date: Date): void {
		if (this.isDateDisabled(date)) {
			console.warn("Date is outside allowed range");
			return;
		}

		let newDates: Date[] = [];

		if (this.options.range) {
			if (this.selectedDates.length === 2) {
				newDates = [date];
			} else if (this.selectedDates.length === 1) {
				const [firstDate] = this.selectedDates;
				if (date > firstDate) {
					newDates = [firstDate, date];
				} else {
					newDates = [date, firstDate];
				}
			} else {
				newDates = [date];
			}
		} else {
			newDates = [date];
		}

		this.selectedDates = newDates;
		this.updateInput();
		this.render();
		this.options.onChange(this.selectedDates.length > 0 ? this.selectedDates : null, true);

		// Auto-close for appropriate formats
		if (!this.options.range && this.shouldAutoClose()) {
			setTimeout(() => this.hide(), 150);
		}
	}

	private updateInput(): void {
		this.input.value = this.getFormattedValue();
		this.lastValidValue = this.input.value;
		// this.input.style.borderColor = "#ccc";
	}

	private updatePosition(): void {
		const rect = this.input.getBoundingClientRect();
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		let top = rect.bottom + scrollTop;
		if (this.options.position === "top") {
			top = rect.top + scrollTop - this.picker.offsetHeight - 10;
		}

		this.picker.style.top = `${top}px`;
		this.picker.style.left = `${rect.left + window.pageXOffset}px`;
	}

	private validateInput(value: string): boolean {
		if (!value.trim()) return true;

		if (this.options.range) {
			const dateParts = value.split(this.options.separator);

			if (dateParts.length === 1) {
				const date = this.parseDate(dateParts[0].trim());
				return date !== null && !this.isDateDisabled(date);
			} else if (dateParts.length === 2) {
				const startDate = this.parseDate(dateParts[0].trim());
				const endDate = this.parseDate(dateParts[1].trim());

				return (
					startDate !== null &&
					endDate !== null &&
					!this.isDateDisabled(startDate) &&
					!this.isDateDisabled(endDate) &&
					startDate <= endDate
				);
			}
			return false;
		} else {
			const date = this.parseDate(value.trim());
			return date !== null && !this.isDateDisabled(date);
		}
	}

	private applyInputValue(value: string): void {
		if (!value.trim()) {
			this.clear();
			return;
		}

		const dates: Date[] = [];

		if (this.options.range) {
			const dateParts = value.split(this.options.separator);

			if (dateParts.length === 1) {
				const date = this.parseDate(dateParts[0].trim());
				if (date) dates.push(date);
			} else if (dateParts.length === 2) {
				const startDate = this.parseDate(dateParts[0].trim());
				const endDate = this.parseDate(dateParts[1].trim());
				if (startDate && endDate) {
					dates.push(startDate, endDate);
				}
			}
		} else {
			const date = this.parseDate(value.trim());
			if (date) dates.push(date);
		}

		this.selectedDates = dates;
		this.render();
	}

	private parseDate(dateString: string): Date | null {
		if (!dateString) return null;

		const format = this.options.format.toLowerCase();
		const separators = dateString.replace(/[0-9]/g, "");
		const separator = separators[0] || "-";

		const formatRegex = new RegExp(`^(\\d{1,4})${separator}(\\d{1,2})${separator}(\\d{1,4})$`);

		const match = dateString.match(formatRegex);
		if (!match) return null;

		let year: number, month: number, day: number;

		if (format.startsWith("yyyy")) {
			[, year, month, day] = match.map(Number);
		} else if (format.startsWith("mm")) {
			[, month, day, year] = match.map(Number);
		} else if (format.startsWith("dd")) {
			[, day, month, year] = match.map(Number);
		} else {
			return null;
		}

		if (year < 100) year += 2000;
		if (year < 1000 || year > 9999) return null;
		if (month < 1 || month > 12) return null;
		if (day < 1 || day > 31) return null;

		const date = new Date(year, month - 1, day);
		if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
			return null;
		}

		return date;
	}

	private formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return this.options.format
			.replace("yyyy", year.toString())
			.replace("mm", month)
			.replace("dd", day);
	}

	private isSameDay(date1: Date, date2: Date): boolean {
		return date1.toDateString() === date2.toDateString();
	}

	private isToday(date: Date): boolean {
		return this.isSameDay(date, new Date());
	}

	private isDateDisabled(date: Date): boolean {
		return date < this.options.minDate || date > this.options.maxDate;
	}
}
