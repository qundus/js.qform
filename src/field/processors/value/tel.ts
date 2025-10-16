import type { Extras, Field, Form, FunctionProps } from "../../../_model";
import { FIELD, MISC } from "../../../const";

const PREFIX = ["+", "00", "+(00)"];
function parsePhone3(
	_phone: string,
	prefixes: string[],
	_preserveChars: string | undefined | null,
) {
	let value = _phone as string;
	const preserveChars =
		_preserveChars != null && typeof _preserveChars === "string" ? _preserveChars : "";
	if (_phone == null) {
		return null;
	} else if (typeof _phone !== "string") {
		if (_phone === "") {
			return null;
		}
		value = String(_phone);
	}
	const result = {
		prefix: null as null | string,
		phone: null as null | string,
		phonePreserved: null as null | string,
		others: null as null | string,
		// Sort prefixes by length (longest first) for proper matching
		prefixes: [...prefixes].sort((a, b) => b.length - a.length),
		// prefixIndex: null as null | string,
		pending: null as null | string,
	};

	value = value.trim();

	// Find the longest matching prefix
	// let pending = undefined as any;
	for (const prefix of result.prefixes) {
		// check for full matches
		if (value.startsWith(prefix) || value === prefix) {
			result.prefix = prefix;
			break;
		} else if (result.pending == null && prefix.startsWith(value)) {
			if (value === "0") {
				continue;
			}
			// check for partial matches
			result.pending = value === "" ? null : value;
			break;
		}
	}

	// only assign pending if prefix doesn't exist
	if (result.prefix == null && result.pending != null) {
		result.prefix = result.pending;
		result.pending = null;
		// return result;
	}

	const rest = result.prefix ? value.slice(result.prefix.length) : value;
	const cleanNumber = rest.replace(/\D/g, "") as string | null;
	const preservePattern =
		preserveChars != null ? `[^\\d${preserveChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]` : "\\D";
	const cleanNumber2 = rest.replace(new RegExp(preservePattern, "g"), "");
	const otherChars = rest.replace(
		new RegExp(
			`[\\d${preserveChars != null ? preserveChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : ""}]`,
			"g",
		),
		"",
	);

	// result.prefix = result.prefix ?? prefix ?? null;
	result.phone = cleanNumber && cleanNumber.length > 0 ? cleanNumber : null;
	result.phonePreserved = cleanNumber2 && cleanNumber2.length > 0 ? cleanNumber2 : null;
	result.others = otherChars && otherChars.length > 0 ? otherChars : null;

	if (result.prefix == null && result.phone?.startsWith("00")) {
		result.prefix = "00";
		result.phone = result.phone.replace("00", "");
		result.phonePreserved = result.phonePreserved?.replace("00", "") as any;
		result.pending = null;
	}

	if (result.prefix == null) {
		for (const prefix of result.prefixes) {
			if (result.others && prefix.includes(result.others)) {
				result.pending = prefix;
				break;
			}
		}
	}
	// else if (result.prefix === result.others) {
	// 	result.others = null;
	// 	// result.pending = null;
	// }

	// console.log("parsed :: ", value, " :: ", result);

	return result;
}

export function processTelValue<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	const { setup } = props;
	const { el, manualUpdate, $next } = processor;
	const _value = !manualUpdate ? el?.value : processor.value;
	const extras = ($next.extras ?? setup.tel ?? {}) as unknown as Extras.Tel.Out<S>; //<Field.Setup<'tel'>, any>

	// setup
	// extras.valueAsNumber = extras.valueAsNumber ?? false;
	extras.international = (extras.international ?? {}) as Exclude<
		Extras.Tel.Out<S>["international"],
		null
	>;
	extras.international.prefixNormalization = extras.international.prefixNormalization ?? false;
	extras.international.displayMode = extras.international.displayMode ?? "normal";

	// process value
	$next.extras = extras as any;
	const prefixes: string[] = extras.international?.prefixes
		? typeof extras.international.prefixes === "string"
			? [extras.international.prefixes]
			: extras.international.prefixes
		: PREFIX;
	let processed = _value;

	if (extras.international.prefix) {
		const prefix = extras.international.prefix;
		const country = extras.international.country;
		if (manualUpdate) {
			extras.international.prefix = null;
			extras.international.country = null;
			// $next.event.MUTATE = MUTATE.__ABORT_VALIDATION
		} else {
			if (extras.international.displayMode === "no-prefix") {
				processed =
					country == null ? processed : `${prefix}${country.dial_code_no_id}${processed ?? ""}`;
			} else if (extras.international.displayMode === "keep-prefix") {
				// console.log("processed :: ", processed);
				processed =
					country == null || processed?.startsWith(prefix)
						? processed
						: `${prefix}${country.dial_code_no_id}${processed ?? ""}`;
			}
		}
	}
	//
	const parsed = parsePhone3(processed, prefixes, extras.preserveChars);

	extras.value = {
		number: parsed?.phone,
		preserved: parsed?.phonePreserved,
		numberNoZero: parsed?.phone?.startsWith("0") ? parsed?.phone.substring(1) : parsed?.phone,
		preservedNoZero: parsed?.phonePreserved?.startsWith("0")
			? parsed?.phonePreserved.substring(1)
			: parsed?.phonePreserved,
	};

	//
	if (parsed == null) {
		extras.international.prefix = null;
		extras.international.country = null;
		$next.extras = extras as any;
		return _value == null ? null : $next.value;
	}

	if (parsed.others != null) {
		if (parsed.pending) {
			return _value;
		}
	}

	//
	if (parsed.prefix) {
		extras.international.prefix = parsed.prefix;
	} else {
		extras.international.prefix = null;
		extras.international.country = null;
	}

	// find country
	if (extras.international.country == null && extras.international.prefix != null) {
		if (parsed.phone && parsed.phone.length > 0) {
			extras.international.country = null;
			const phone = `+${parsed.phone}`;
			for (let i = 0; i < MISC.COUNTRIES.length; i++) {
				const country = MISC.COUNTRIES[i];
				if (phone.startsWith(country.dial_code)) {
					extras.international.country = country as Exclude<
						Extras.Tel.Out<S>["international"]["country"],
						null
					>;
					extras.international.country.index = i;
					extras.international.country.dial_code_no_id = country.dial_code.replace("+", "");
					break;
				}
			}
		}
	} else {
		if (!parsed.phone?.startsWith(extras.international.country?.dial_code_no_id as any)) {
			extras.international.country = null;
		}
	}

	// offer more values for better exportation
	if (extras.international.country) {
		const country = extras.international.country;
		const phone = parsed.phone == null ? null : parsed.phone;
		const preserved = parsed.phonePreserved == null ? null : parsed.phonePreserved;
		if (phone != null) {
			extras.value.numberNoCode = phone.replace(country.dial_code_no_id, "");
			extras.value.numberNoCodeNoZero = extras.value.numberNoCode.startsWith("0")
				? extras.value.numberNoCode.substring(1)
				: extras.value.numberNoCode;
			extras.value.numberNoZero = `${country.dial_code_no_id}${extras.value.numberNoCodeNoZero}`;
		}
		if (preserved) {
			extras.value.preserved = preserved;
			extras.value.preservedNoCode = preserved.replace(country.dial_code_no_id, "");
			extras.value.preservedNoCodeNoZero = extras.value.preservedNoCode.startsWith("0")
				? extras.value.preservedNoCode.substring(1)
				: extras.value.preservedNoCode;
			extras.value.preservedNoZero = `${country.dial_code_no_id}${extras.value.preservedNoCodeNoZero}`;
		}
	}

	//
	// if (extras.valueAsNumber) { // find out a better way for valueAsNumber option
	// 	result = parsed.phone;
	// 	if (extras.isInternational) {
	// 		result = result == null ? Number("00") : (Number(`00${result ?? ""}`) as any);
	// 	}
	// } else {
	// }
	let result = parsed.phonePreserved as any;
	const prefix = extras.international.prefix;
	const country = extras.international.country;
	const phone = extras.value?.preservedNoCode;
	if (prefix) {
		result = `${extras.international.prefixNormalization ? "+" : (prefix ?? "")}${result ?? ""}`;
		if (extras.international.displayMode === "no-prefix") {
			result = country == null ? result : phone;
		} else if (extras.international.displayMode === "keep-prefix") {
			result =
				country == null
					? result
					: phone == null || phone.length <= 0
						? `${prefix}${country.dial_code_no_id}`
						: phone;
		}
	}

	// console.log("result :: ", extras.international, " :: ", extras.value);
	$next.extras = extras as any;
	return result;
}
