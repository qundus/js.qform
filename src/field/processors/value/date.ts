import type { Extras, Field, Form, FunctionProps } from "../../../_model";
import { parseDateEnhanced } from "../../../render/helpers/date/parse";
import { initMode } from "../../../render/helpers/date/mode";
import { makeHeaders } from "../../../render/helpers/date/headers";
import { makeCells } from "../../../render/helpers/date/cells";
import { FIELD } from "../../../const";
import { SelectedList } from "../../../render/helpers/date/selected-list";

export function processDateValue<S extends Field.Setup<"date">, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	// setup
	const { key, setup } = props;
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
	extras.multipleDateSeparator = extras.multipleDateSeparator ?? "|";
	extras.multipleTimeSeparator = extras.multipleTimeSeparator ?? ",";
	extras.multipleTime = extras.multipleTime ?? false;
	extras.format = extras.format ?? "d-m-yyyy h:n:s";
	extras.locale = extras.locale ?? "en-US";
	extras.yearSpan = extras.yearSpan == null || extras.yearSpan <= 0 ? 12 : extras.yearSpan;
	extras.firstDayOfWeek = extras.firstDayOfWeek ?? 0;
	extras.timeFormat = extras.timeFormat ?? "24h";
	extras.now = extras.now ?? {};
	extras.now.year = extras.now.year ?? new Date().getFullYear();
	extras.now.month = extras.now.month ?? new Date().getMonth() + 1;
	extras.now.day = extras.now.day ?? new Date().getDate();
	extras.now.hour = extras.now.hour ?? new Date().getHours();
	extras.now.minute = extras.now.minute ?? new Date().getMinutes();
	extras.now.second = extras.now.second ?? new Date().getSeconds();
	extras.now.period = extras.timeFormat === "12h" ? (extras.now.period ?? "am") : null;
	extras.yearView = extras.yearView ?? extras.now.year;

	// not options
	extras.mode = extras.mode ?? initMode(extras);

	// fatals
	if (extras.multipleDateSeparator === extras.multipleTimeSeparator) {
		throw new Error(
			"qform: options.multipleDateSeparator & options.multipleTimeSeparator cannot be the same for form key :: " +
				key,
		);
	}
	//
	const selected = new SelectedList();
	if (_value != null) {
		const values = $next.element.multiple ? _value.split(extras.multipleDateSeparator) : [_value];
		for (const v of values) {
			const parsed = parseDateEnhanced(
				v,
				extras.format,
				extras.dateSeparators,
				extras.timeSeparators,
			);

			//
			if (parsed.date.valid && $next.event.MUTATE !== FIELD.MUTATE.__EXTRAS) {
				extras.now.year = parsed.date.yearNumber ?? extras.now.year;
				extras.now.month = parsed.date.monthNumber ?? extras.now.month;
				extras.now.day = parsed.date.dayNumber ?? extras.now.day;
				extras.yearView = extras.now.year;
			}

			//
			selected.append(parsed);
		}
	}

	// populate arrays
	extras.selected = selected;
	extras.cells = makeCells(extras);
	extras.headers = makeHeaders(extras);

	console.log("result :: ", _value, " :: ", extras);

	$next.extras = extras as any;
	return _value;
}
