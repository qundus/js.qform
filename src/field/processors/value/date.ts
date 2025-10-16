import type { Extras, Field, Form, FunctionProps } from "../../../_model";
import { extractFormatTokens, parseDateEnhanced } from "../../../render/helpers/date/parse";
import { initMode } from "../../../render/helpers/date/mode";
import { initHeaders } from "../../../render/helpers/date/headers";
import { makeCells } from "../../../render/helpers/date/cells";

// function determineInitialMode(format: string): Extras.Date.Mode {
// 	const hasDays = format.includes("dd");
// 	const hasMonths = format.includes("mm") && !format.includes("hh") && !format.includes("HH");
// 	const hasYears = format.includes("yyyy");
// 	const hasTime = (format.includes("hh") || format.includes("HH")) && format.includes("mm");

// 	// Priority: time > days > months > years
// 	if (hasTime && !hasDays && !hasMonths && !hasYears) return "time";
// 	if (hasDays) return "days";
// 	if (hasMonths) return "months";
// 	if (hasYears) return "years";

// 	return "days"; // fallback
// }

// export function getCurrentTime(now: Date): Extras.DateOut<any>["time"] {
// 	return {
// 		hours: now.getHours(),
// 		minutes: now.getMinutes(),
// 		isPM: now.getHours() >= 12,
// 	};
// }

//

export function processDateValue<S extends Field.Setup<"date">, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	// setup
	const { setup } = props;
	const { el, manualUpdate, $next } = processor;
	const _value = !manualUpdate ? el?.value : processor.value;
	const extras = ($next.extras ?? setup.date ?? {}) as unknown as Extras.Date.Out<
		Field.Setup<"date">
	>;

	// extras setup and rechecks
	extras.dateSeparators =
		typeof extras.dateSeparators === "string"
			? [extras.dateSeparators]
			: (extras.dateSeparators ?? ["/", "-", "."]);
	extras.timeSeparators =
		typeof extras.timeSeparators === "string"
			? [extras.timeSeparators]
			: (extras.timeSeparators ?? [":"]);
	extras.multipleSeparator = extras.multipleSeparator ?? "|";
	extras.format = extras.format ?? "d-m-yyyy h:n:s";
	extras.locale = extras.locale ?? "en-US";
	extras.spanYears = extras.spanYears ?? 12;
	extras.firstDayOfWeek = extras.firstDayOfWeek ?? 0;
	extras.timeFormat = extras.timeFormat ?? "24h";
	extras.now = extras.now ?? {};
	extras.now.year = extras.now.year ?? new Date().getFullYear();
	extras.now.month = extras.now.month ?? new Date().getMonth() + 1;
	extras.now.day = extras.now.day ?? new Date().getDate();
	extras.viewYear = extras.viewYear ?? extras.now.year;

	// not options
	extras.mode = extras.mode ?? initMode(extras);
	extras.headers = extras.headers ?? initHeaders(extras);

	//
	const selected = new Map() as typeof extras.selected;
	if (_value != null) {
		const values = $next.element.multiple ? _value.split(extras.multipleSeparator) : [_value];
		for (const v of values) {
			const parsed = parseDateEnhanced(
				v,
				extras.format,
				extras.dateSeparators,
				extras.timeSeparators,
			);

			//
			if (parsed.date.valid) {
				extras.now.year = parsed.date.yearNumber ?? extras.now.year;
				extras.now.month = parsed.date.monthNumber ?? extras.now.month;
				extras.now.day = parsed.date.dayNumber ?? extras.now.day;
			}

			//
			if (!selected.has(parsed.date)) {
				selected.set(parsed.date, [parsed.time]);
			} else {
				selected.get(parsed.date)?.push(parsed.time);
			}
		}
	}

	// populate arrays
	extras.selected = selected;
	extras.cells = makeCells(extras);

	console.log("result :: ", _value, " :: ", extras);

	$next.extras = extras as any;
	return _value;
}
