import type { Extras } from "../../../_model";

export type SelectedList = ReturnType<typeof createSelectedList>;
export function createSelectedList(extras: Extras.Date.Out<any>) {
	const list = [] as Extras.Date.ParsedResult[];
	const is12Hour = extras.timeFormat === "12h";
	const period = extras.TIME.activePeriod;
	const requiresDate = extras.mode.applyDate != null;
	const requiresTime = extras.mode.applyTime != null;
	let validCount = 0;
	return {
		list,
		get validCount() {
			return validCount;
		},
		requiresDate,
		requiresTime,
		append: (parsed: Extras.Date.ParsedResult) => {
			list.push(parsed);
			const invlidItem = parsed.time?.find((item) => item.valid === false);
			if (requiresDate && requiresTime) {
				if (parsed.date.valid && parsed.time.length > 0 && invlidItem == null) {
					validCount++;
				}
			} else if (requiresDate) {
				if (parsed.date.valid) validCount++;
			} else if (requiresTime) {
				if (parsed.time.length > 0 && invlidItem == null) {
					validCount++;
				}
			}
		},
		//
		hasYear: (year: number) => {
			return (
				year === extras.YEAR.active || list.findIndex((item) => item.date.yearNumber === year) >= 0
			);
		},
		hasYearMonth: (year: number, month: number) => {
			return (
				(year === extras.YEAR.active && month === extras.MONTH.active) ||
				list.findIndex(
					(item) => item.date.yearNumber === year && item.date.monthNumber === month,
				) >= 0
			);
		},
		hasDate: (year: number, month: number, day: number) => {
			return (
				list.findIndex(
					(item) =>
						item.date.yearNumber === year &&
						item.date.monthNumber === month &&
						item.date.dayNumber === day,
				) >= 0
			);
		},
		//
		populateSelectedTime(year: number, month: number, day: number) {
			const parsed = list.find(
				(item) =>
					item.date.yearNumber === year &&
					item.date.monthNumber === month &&
					item.date.dayNumber === day,
			);
			const times = parsed?.time ?? [];

			return {
				list: times,
				hasHour: (_hour: number) => {
					const hour = is12Hour ? _hour % 12 : _hour;
					return (
						times.findIndex(
							(time) => (is12Hour ? time.period === period : true) && time.hourNumber === hour,
						) >= 0
					);
				},
				hasHourMinute: (_hour: number, minute: number) => {
					const hour = is12Hour ? _hour % 12 : _hour;
					return (
						times.findIndex(
							(time) =>
								(is12Hour ? time.period === period : true) &&
								time.hourNumber === hour &&
								time.minuteNumber === minute,
						) >= 0
					);
				},
				hasTime: (_hour: number, minute: number, second: number) => {
					const hour = is12Hour ? _hour % 12 : _hour;
					return (
						times.findIndex(
							(time) =>
								(is12Hour ? time.period === period : true) &&
								time.hourNumber === hour &&
								time.minuteNumber === minute &&
								time.secondNumber === second,
						) >= 0
					);
				},
			};
		},
	};
}
