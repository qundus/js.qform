import type { Extras, Field, Form, FunctionProps } from "../../../_model";
import { COUNTRIES, MUTATE } from "../../../const";

const PREFIX = ["+", "00", "+(00)"];
function parsePhone3(_phone: string, prefixes: string[], preserveChars: string) {
	let value = _phone as string;
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
		others: null as null | string,
		// Sort prefixes by length (longest first) for proper matching
		prefixes: [...prefixes].sort((a, b) => b.length - a.length),
		// prefixIndex: null as null | string,
		pending: null as null | string,
	};

	value = value.trim();

	// // Find the longest matching prefix
	for (const prefix of result.prefixes) {
		if (value.startsWith(prefix)) {
			result.prefix = prefix;
			break;
		}
	}

	// // If no exact prefix match, check for partial matches
	if (!result.prefix) {
		for (const prefix of result.prefixes) {
			if (prefix.startsWith(value)) {
				// Entire input is a partial prefix
				result.prefix = value === "" ? null : value;
				return result;
			}
		}
	}

	// const escapedPrefixes = prefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	// const prefixPattern = escapedPrefixes.join("|");
	// const match = new RegExp(`^(?<prefix>${prefixPattern})?(?<rest>.*)$`).exec(value.trim());

	// if (!match?.groups) return result.prefix == null ? null : result;

	// const { prefix, rest } = match.groups;
	const rest = result.prefix ? value.slice(result.prefix.length) : value;
	// const cleanNumber = rest.replace(/\D/g, "") as string | null;
	// const otherChars = rest.replace(/\d/g, "") as string | null;

	const preservePattern = preserveChars
		? `[^\\d${preserveChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`
		: "\\D";
	const cleanNumber = rest.replace(new RegExp(preservePattern, "g"), "");
	const otherChars = rest.replace(
		new RegExp(`[\\d${preserveChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`, "g"),
		"",
	);

	// result.prefix = result.prefix ?? matchedPrefix ?? null;
	result.phone = cleanNumber && cleanNumber.length > 0 ? cleanNumber : null;
	result.others = otherChars && otherChars.length > 0 ? otherChars : null;

	for (const prefix of result.prefixes) {
		if (result.others && prefix.includes(result.others)) {
			result.pending = prefix;
			break;
		}
	}
	return result;
}

export function processTelValue<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	const { setup } = props;
	const { el, manualUpdate, $next } = processor;
	const _value = !manualUpdate ? el?.value : processor.value;
	const extras = ($next.extras ?? setup.tel ?? {}) as unknown as Extras.TelOut; //<Field.Setup<'tel'>, any>
	const prefixes: string[] = extras.internationalPrefixes
		? typeof extras.internationalPrefixes === "string"
			? [extras.internationalPrefixes]
			: extras.internationalPrefixes
		: PREFIX;
	// light reseting due to possible heavy calculations
	extras.valueAsNumber = extras.valueAsNumber ?? false;

	// process value
	const parsed = parsePhone3(_value, prefixes, "-");
	if (parsed == null) {
		return _value == null ? null : $next.value;
	}
	console.log("parsed :: ", parsed);

	if (parsed.others != null) {
		if (parsed.pending) {
			return _value;
		}
		if (parsed.prefix == null) {
			if (parsed.phone?.startsWith("00")) {
				parsed.prefix = "+";
				parsed.phone = parsed.phone.replace("00", "");
			} else if (extras.valueAsNumber) {
				parsed.prefix = "00";
				// parsed.prefix = null as any;
			}
		}
	}

	//
	if (parsed.prefix) {
		extras.isInternational = true;
		extras.internationalPrefix = parsed.prefix;
		extras.valueNoId = parsed.phone;
		extras.valueNoCode = parsed.phone;
	} else {
		extras.isInternational = false;
		extras.internationalPrefix = undefined;
		extras.valueNoId = null;
		extras.valueNoCode = null;
		extras.country = undefined;
	}

	// find country
	if (extras.country == null && extras.isInternational && parsed.phone && parsed.phone.length > 0) {
		extras.country = undefined;
		const phone = `+${parsed.phone}`;
		for (let i = 0; i < COUNTRIES.length; i++) {
			const country = COUNTRIES[i];
			if (phone.startsWith(country.dial_code)) {
				extras.country = country as Exclude<Extras.TelOut["country"], undefined>;
				extras.country.index = i;
				extras.country.dial_code_no_id = Number(country.dial_code.replace("+", ""));
				break;
			}
		}
	} else {
		if (!parsed.phone?.startsWith(extras.country?.dial_code_no_id as any)) {
			extras.country = undefined;
		}
	}

	//
	let result = parsed.phone;
	if (extras.isInternational) {
		if (extras.valueAsNumber) {
			result = result == null ? Number("00") : (Number(`00${result ?? ""}`) as any);
		} else {
			result = `${extras.internationalPrefixNormalization ? "+" : (extras.internationalPrefix ?? "")}${result ?? ""}`;
		}
	}
	console.log("result :: ", extras);

	$next.extras = extras as any;
	return result;
}
