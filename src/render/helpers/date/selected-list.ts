import type { Extras } from "../../../_model";

interface DateItem {
	date: Extras.Date.ParsedDate;
	times: Extras.Date.ParsedTime[]; // Multiple times per date
}

export class SelectedList {
	private _items: DateItem[] = [];

	// Multi-level index for fast lookups
	private _index: Map<number, Map<number, Map<number, DateItem>>> = new Map();

	append(item: Extras.Date.ParsedResult): void {
		const { date, time: times } = item;

		// Check if we already have this date
		let dateItem: DateItem;
		if (date.yearNumber && date.monthNumber && date.dayNumber) {
			const existingItem = this.findByExactDate(date.yearNumber, date.monthNumber, date.dayNumber);

			if (existingItem) {
				// Date exists, add all times to existing item
				existingItem.times.push(...times);
				return; // No need to add to index or items array
			} else {
				// New date, create new item with all times
				dateItem = {
					date: date,
					times: [...times], // Copy the times array
				};
				this._items.push(dateItem);
			}
		} else {
			// Invalid date numbers, just add as new item
			dateItem = {
				date: date,
				times: [...times],
			};
			this._items.push(dateItem);
			return; // Skip indexing for invalid dates
		}

		// Add to index if we have valid numbers
		if (date.yearNumber && date.monthNumber && date.dayNumber) {
			const { yearNumber, monthNumber, dayNumber } = date;

			if (!this._index.has(yearNumber)) {
				this._index.set(yearNumber, new Map());
			}
			const yearMap = this._index.get(yearNumber)!;

			if (!yearMap.has(monthNumber)) {
				yearMap.set(monthNumber, new Map());
			}
			const monthMap = yearMap.get(monthNumber)!;

			monthMap.set(dayNumber, dateItem);
		}
	}

	// Add times to an existing date
	addTimesToDate(
		year: number,
		month: number,
		day: number,
		timesToAdd: Extras.Date.ParsedTime[],
	): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		dateItem.times.push(...timesToAdd);
		return true;
	}

	// Add a single time to an existing date
	addTimeToDate(year: number, month: number, day: number, time: Extras.Date.ParsedTime): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		dateItem.times.push(time);
		return true;
	}

	// TIME-RELATED METHODS

	// Check if a date has any times
	hasTimes(year: number, month: number, day: number): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		return dateItem ? dateItem.times.length > 0 : false;
	}

	// Check if a date has a specific time (by exact match)
	hasExactTime(year: number, month: number, day: number, time: Extras.Date.ParsedTime): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		return dateItem.times.some(
			(t) =>
				t.hour === time.hour &&
				t.minute === time.minute &&
				t.second === time.second &&
				t.period === time.period,
		);
	}

	// Check if a date has a time in a specific hour
	hasTimeInHour(year: number, month: number, day: number, hour: number): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		return dateItem.times.some((time) => {
			const timeHour = time.hour ? parseInt(time.hour) : null;
			return timeHour === hour;
		});
	}

	// Check if a date has AM times
	hasAMTimes(year: number, month: number, day: number): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		return dateItem.times.some((time) => time.period === "AM");
	}

	// Check if a date has PM times
	hasPMTimes(year: number, month: number, day: number): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		return dateItem.times.some((time) => time.period === "PM");
	}

	// Get all times for a specific date
	getTimesForDate(year: number, month: number, day: number): Extras.Date.ParsedTime[] {
		const dateItem = this.findByExactDate(year, month, day);
		return dateItem ? [...dateItem.times] : []; // Return copy
	}

	// Get times filtered by period (AM/PM)
	getTimesByPeriod(
		year: number,
		month: number,
		day: number,
		period: "AM" | "PM",
	): Extras.Date.ParsedTime[] {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return [];

		return dateItem.times.filter((time) => time.period === period);
	}

	// Get times filtered by hour range
	getTimesByHourRange(
		year: number,
		month: number,
		day: number,
		startHour: number,
		endHour: number,
	): Extras.Date.ParsedTime[] {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return [];

		return dateItem.times.filter((time) => {
			const timeHour = time.hour ? parseInt(time.hour) : -1;
			return timeHour >= startHour && timeHour <= endHour;
		});
	}

	// EXISTING DATE METHODS

	hasYear(year: number): boolean {
		return this._index.has(year);
	}

	hasYearMonth(year: number, month: number): boolean {
		const yearMap = this._index.get(year);
		return yearMap ? yearMap.has(month) : false;
	}

	hasDate(year: number, month: number, day: number): boolean {
		const yearMap = this._index.get(year);
		if (!yearMap) return false;

		const monthMap = yearMap.get(month);
		if (!monthMap) return false;

		return monthMap.has(day);
	}

	findByExactDate(year: number, month: number, day: number): DateItem | null {
		const yearMap = this._index.get(year);
		if (!yearMap) return null;

		const monthMap = yearMap.get(month);
		if (!monthMap) return null;

		return monthMap.get(day) || null;
	}

	findByYear(year: number): DateItem[] {
		const yearMap = this._index.get(year);
		if (!yearMap) return [];

		const results: DateItem[] = [];
		for (const monthMap of yearMap.values()) {
			for (const item of monthMap.values()) {
				results.push(item);
			}
		}
		return results;
	}

	findByYearMonth(year: number, month: number): DateItem[] {
		const yearMap = this._index.get(year);
		if (!yearMap) return [];

		const monthMap = yearMap.get(month);
		if (!monthMap) return [];

		return Array.from(monthMap.values());
	}

	find(predicate: (item: DateItem) => boolean): DateItem | undefined {
		return this._items.find(predicate);
	}

	filter(predicate: (item: DateItem) => boolean): DateItem[] {
		return this._items.filter(predicate);
	}

	getAll(): DateItem[] {
		return [...this._items];
	}

	get length(): number {
		return this._items.length;
	}

	// TIME COMPONENT METHODS

	// Check if any time has a specific hour
	hasHour(year: number, month: number, day: number, hour: number | string): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		const targetHour = typeof hour === "string" ? parseInt(hour) : hour;
		return dateItem.times.some((time) => {
			const timeHour = time.hour ? parseInt(time.hour) : null;
			return timeHour === targetHour;
		});
	}

	// Check if any time has a specific minute
	hasMinute(year: number, month: number, day: number, minute: number | string): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		const targetMinute = typeof minute === "string" ? parseInt(minute) : minute;
		return dateItem.times.some((time) => {
			const timeMinute = time.minute ? parseInt(time.minute) : null;
			return timeMinute === targetMinute;
		});
	}

	// Check if any time has a specific second
	hasSecond(year: number, month: number, day: number, second: number | string): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		const targetSecond = typeof second === "string" ? parseInt(second) : second;
		return dateItem.times.some((time) => {
			const timeSecond = time.second ? parseInt(time.second) : null;
			return timeSecond === targetSecond;
		});
	}

	// Check if any time has a specific period (AM/PM)
	hasPeriod(year: number, month: number, day: number, period: "AM" | "PM"): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		return dateItem.times.some((time) => time.period === period);
	}

	// Check if any time has specific hour AND minute
	hasHourMinute(
		year: number,
		month: number,
		day: number,
		hour: number | string,
		minute: number | string,
	): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		const targetHour = typeof hour === "string" ? parseInt(hour) : hour;
		const targetMinute = typeof minute === "string" ? parseInt(minute) : minute;

		return dateItem.times.some((time) => {
			const timeHour = time.hour ? parseInt(time.hour) : null;
			const timeMinute = time.minute ? parseInt(time.minute) : null;
			return timeHour === targetHour && timeMinute === targetMinute;
		});
	}

	// Check if any time has specific hour, minute AND second
	hasHourMinuteSecond(
		year: number,
		month: number,
		day: number,
		hour: number | string,
		minute: number | string,
		second: number | string,
	): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		const targetHour = typeof hour === "string" ? parseInt(hour) : hour;
		const targetMinute = typeof minute === "string" ? parseInt(minute) : minute;
		const targetSecond = typeof second === "string" ? parseInt(second) : second;

		return dateItem.times.some((time) => {
			const timeHour = time.hour ? parseInt(time.hour) : null;
			const timeMinute = time.minute ? parseInt(time.minute) : null;
			const timeSecond = time.second ? parseInt(time.second) : null;
			return timeHour === targetHour && timeMinute === targetMinute && timeSecond === targetSecond;
		});
	}

	// Check if any time has valid formatted time
	hasFormattedTime(year: number, month: number, day: number, formatted: string): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		return dateItem.times.some((time) => time.formatted === formatted);
	}

	// Check if any time has valid 24h formatted time
	hasFormatted24hTime(year: number, month: number, day: number, formatted24h: string): boolean {
		const dateItem = this.findByExactDate(year, month, day);
		if (!dateItem) return false;

		return dateItem.times.some((time) => time.formatted24h === formatted24h);
	}
}
