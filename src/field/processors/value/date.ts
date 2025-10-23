import type { Extras, Field, Form, FunctionProps } from "../../../_model";
import { parseDateEnhanced } from "../../../render/helpers/date/parse";
import { initMode } from "../../../render/helpers/date/mode";
import { FIELD } from "../../../const";
import { createSelectedList } from "../../../render/helpers/date/selected-list";
//
import DATE from "../../../render/helpers/date/DATE";
import TIME from "../../../render/helpers/date/TIME";
import YEAR from "../../../render/helpers/date/YEAR";
import MONTH from "../../../render/helpers/date/MONTH";
import DAY from "../../../render/helpers/date/DAY";
import HOUR from "../../../render/helpers/date/HOUR";
import MINUTE from "../../../render/helpers/date/MINUTE";
import SECOND from "../../../render/helpers/date/SECOND";

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
	extras.format = extras.format ?? "d-m-yyyy"; //"d-m-yyyy h:n:s";
	extras.locale = extras.locale ?? "en-US";
	extras.yearSpan = extras.yearSpan == null || extras.yearSpan <= 0 ? 12 : extras.yearSpan;
	extras.firstDayOfWeek = extras.firstDayOfWeek ?? 0;
	extras.timeFormat = extras.timeFormat ?? "24h";
	// extras.range = extras.range ?? false; // TODO: leave for later

	// not options
	extras.mode = extras.mode ?? initMode(extras as any);

	// fatals
	if (extras.multipleDateSeparator === extras.multipleTimeSeparator) {
		throw new Error(
			"qform: options.multipleDateSeparator & options.multipleTimeSeparator cannot be the same for form key :: " +
				key,
		);
	}

	// crucial api preparations
	extras.DATE = extras.DATE ?? DATE.init(extras);
	extras.TIME = extras.TIME ?? TIME.init(extras);
	extras.YEAR = extras.YEAR ?? YEAR.init(extras);
	extras.MONTH = extras.MONTH ?? MONTH.init(extras);
	extras.DAY = extras.DAY ?? DAY.init(extras);
	extras.HOUR = extras.HOUR ?? HOUR.init(extras);
	extras.MINUTE = extras.MINUTE ?? MINUTE.init(extras);
	extras.SECOND = extras.SECOND ?? SECOND.init(extras);

	//
	const selected = createSelectedList(extras);
	let putResult = false;
	const result = [] as string[];
	if (_value != null) {
		const values = $next.element.multiple ? _value.split(extras.multipleDateSeparator) : [_value];
		for (const v of values) {
			const parsed = parseDateEnhanced(
				v,
				extras.format,
				extras.dateSeparators,
				extras.timeSeparators,
				extras.multipleTimeSeparator,
			);

			//
			if (parsed.date.valid && $next.event.MUTATE !== FIELD.MUTATE.__EXTRAS) {
				YEAR.update(parsed.date.yearNumber, extras);
				MONTH.update(parsed.date.monthNumber, extras);
				DAY.update(parsed.date.dayNumber, extras);
			}

			//
			selected.append(parsed);
			// TODO: allow free language input writing for date and time as well
			if (parsed.date.valid) {
				putResult = true;
			}
			const date = parsed.date.formatted ?? "";
			const time = [] as (string | null)[];
			for (const t of parsed.time) {
				if (t.formatted == null || t.formatted24h == null) {
					continue;
				}
				time.push(extras.timeFormat === "12h" ? t.formatted : t.formatted24h);
			}
			result.push(
				`${date} ${extras.multipleTime ? time.join(extras.multipleTimeSeparator) : (time[0] ?? "")}`.trim(),
			);
		}
	}

	// regular checks
	extras.selected = selected;
	//
	YEAR.check(extras);
	MONTH.check(extras);
	DAY.check(extras);
	HOUR.check(extras);
	MINUTE.check(extras);
	SECOND.check(extras);
	//
	DATE.check(extras);
	TIME.check(extras);
	$next.extras = extras as any;

	// console.log("result :: ", _value, " :: ", selected);

	if (!$next.element.preprocessValue) {
		return _value;
	}

	if (!putResult) {
		return _value;
	}

	return $next.element.multiple ? result.join(extras.multipleDateSeparator) : result[0];
	// return _value;
}
