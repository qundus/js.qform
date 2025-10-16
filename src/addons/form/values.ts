import type { Check, Extras, Field, Form, FunctionProps } from "../../_model";

export type FormAddonValues<F extends Form.Fields, O extends Form.Options<F>> = ReturnType<
	typeof formValuesAddon<F, O>
>;
export function formValuesAddon<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormAddon<F, O>,
) {
	const { fields, store } = props;
	return {
		get<KC extends FieldsKeysCaseMap<F>>(special?: KC) {
			return _getValues({ fields, store, defaultCase: "same", special });
		},
		getLowercase<KC extends FieldsKeysCaseMap<F>>(special?: KC) {
			return _getValues({ fields, store, defaultCase: "lowercase", special });
		},
		getUppercase<KC extends FieldsKeysCaseMap<F>>(special?: KC) {
			return _getValues({ fields, store, defaultCase: "uppercase", special });
		},
		getSnakecase<KC extends FieldsKeysCaseMap<F>>(special?: KC) {
			return _getValues({ fields, store, defaultCase: "snake", special });
		},
		getSnakecaseAggressive<KC extends FieldsKeysCaseMap<F>>(special?: KC) {
			return _getValues({
				fields,
				store,
				defaultCase: "snake_aggressive",
				special,
			});
		},
		getKebabcase<KC extends FieldsKeysCaseMap<F>>(special?: KC) {
			return _getValues({ fields, store, defaultCase: "kebab", special });
		},
		getKebabcaseAggressive<KC extends FieldsKeysCaseMap<F>>(special?: KC) {
			return _getValues({
				fields,
				store,
				defaultCase: "kebab_aggressive",
				special,
			});
		},
	};
}

function _getValues<
	F extends Form.Fields,
	L extends Form.Options<F>,
	S extends Form.Store<F, L>,
	D extends FieldKeyCase,
	O extends FieldsKeysCaseMap<F> = FieldsKeysCaseMap<F>,
>(props: { fields: F; store: S; defaultCase: D; special?: O }) {
	const result = {} as any;
	const values = props.store.get().values;
	for (const key in props.fields) {
		const field = props.fields[key];
		const key_case = _getValueCase(key, props.special?.[key] ?? props.defaultCase);
		let value = values[key];
		// postprocess values
		// if (field.setup.type === "select") {
		// 	if (value === PLACEHOLDERS.select.value) {
		// 		value = null as any;
		// 	}
		// }
		if (value != null) {
			if (field.setup.type.startsWith("select")) {
				const isArray = Array.isArray(value);
				value = (isArray ? value : [value]) as Extras.Select.Out<Field.Setup<"select">>["options"];
				value.forEach((item, idx, arr) => {
					const next = {};
					for (const key in item) {
						if (key.startsWith("__")) {
							continue;
						}
						next[key] = item[key];
					}
					arr[idx] = next;
				});
				value = isArray ? value : value[0];
			} else if (field.setup.type === "tel") {
				const extras = field.store.value?.extras as Extras.Tel.Out<Field.Setup<"tel">>;
				if (extras) {
					const prefix = extras.international?.prefix;
					// const country = extras.international?.country;
					const phone = extras.value.preserved;
					value = `${prefix ?? ""}${phone ?? ""}`;
				}
			}
		}

		// attach final value
		result[key_case] = value;
	}
	return result as FieldsValues<F, D, O>;
}

// basics
export type CamelToSnakeCase<
	S extends string,
	Sep extends string = "_",
	UppercaseIsNewWord extends boolean = false,
	Start extends boolean = true,
	PreviousLetterIsCapital = false,
> = S extends `${infer T}${infer U}`
	? `${T extends Capitalize<T>
			? Start extends false
				? UppercaseIsNewWord extends true
					? Sep
					: PreviousLetterIsCapital extends false
						? Sep
						: ""
				: ""
			: ""}${Lowercase<T>}${T extends Capitalize<T>
			? CamelToSnakeCase<U, Sep, UppercaseIsNewWord, false, true>
			: CamelToSnakeCase<U, Sep, UppercaseIsNewWord, false, false>}`
	: S;
// type ControlGroup = Fields; //{ [K: string]: ICollection<any, any> };
type FieldsKeysCaseMap<T extends Form.Fields> = {
	[K in keyof T]?: FieldKeyCase;
};
type FieldKeyCase =
	| "same"
	| "snake"
	| "snake_aggressive"
	| "kebab"
	| "kebab_aggressive"
	| "lowercase"
	| "uppercase";
//

// type ControlGroupOnChange<V extends ValueKeyCase, T extends ControlGroup = ControlGroup> = (
// 	actions: Pick<
// 		ReturnType<typeof createFormActions<V, T>>,
// 		| "getValues"
// 		| "getValuesSnakecase"
// 		| "getValuesKebabcase"
// 		| "getValuesSnakecaseAggressive"
// 		| "getValuesUppercase"
// 		| "getValuesKebabcaseAggressive"
// 		| "getValuesLowercase"
// 	>,
// ) => void;
type IsValueKeyOfCase<T extends FieldKeyCase, V extends FieldKeyCase | undefined> = true extends
	| Check.IsUnknown<V>
	| Check.IsUndefined<V>
	| Check.IsNull<V>
	? false
	: V extends T
		? true
		: false;
type ValueKeyCaseType<K, V extends FieldKeyCase | undefined> = IsValueKeyOfCase<
	"snake",
	V
> extends true
	? CamelToSnakeCase<string & K>
	: IsValueKeyOfCase<"snake_aggressive", V> extends true
		? CamelToSnakeCase<string & K, "_", true>
		: IsValueKeyOfCase<"kebab_aggressive", V> extends true
			? CamelToSnakeCase<string & K, "-", true>
			: IsValueKeyOfCase<"kebab", V> extends true
				? CamelToSnakeCase<string & K, "-">
				: IsValueKeyOfCase<"lowercase", V> extends true
					? Lowercase<string & K>
					: IsValueKeyOfCase<"uppercase", V> extends true
						? Uppercase<string & K>
						: // : IsValueKeyOfCase<"same", V> extends true
							K;
// : never;

type GetValueKeyCase<
	V extends FieldKeyCase | undefined,
	Default extends FieldKeyCase,
> = true extends Check.IsUnknown<V> | Check.IsUndefined<V> | Check.IsNull<V>
	? Default
	: FieldKeyCase extends V
		? Default
		: V;
type FieldsValues<T extends Form.Fields, V extends FieldKeyCase, O extends FieldsKeysCaseMap<T>> = {
	[K in keyof T as ValueKeyCaseType<K, GetValueKeyCase<O[K], V>>]: T[K]["setup"]["value"];
};

function _camelToSnakeCase(str: string, joiner = "_", uppercaseIsNewWord = false): string {
	const regex = !uppercaseIsNewWord ? /[A-Z]+/g : /[A-Z]/g;
	return str.replace(regex, (match, index) => {
		// console.log("match :: ", match, "index :: ", index);
		return index === 0 ? match.toLowerCase() : `${joiner}${match.toLowerCase()}`;
	});
}

function _getValueCase(key: string, convertCase: FieldKeyCase = "same") {
	if (convertCase === "snake") {
		return _camelToSnakeCase(key, "_");
	}
	if (convertCase === "snake_aggressive") {
		return _camelToSnakeCase(key, "_", true);
	}
	if (convertCase === "kebab") {
		return _camelToSnakeCase(key, "-");
	}
	if (convertCase === "kebab_aggressive") {
		return _camelToSnakeCase(key, "-", true);
	}
	if (convertCase === "lowercase") {
		return key.toLowerCase();
	}
	if (convertCase === "uppercase") {
		return key.toUpperCase();
	}
	return key;
}
