import type { Fields, FormStore, Options, PluginProps } from "../_model";
import { PLACEHOLDERS } from "../const";

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
type FieldsKeysCaseMap<T extends Fields> = {
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
type IsValueKeyOfCase<
	T extends FieldKeyCase,
	V extends FieldKeyCase | undefined,
> = unknown extends V ? false : V extends T ? true : false;
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
> = unknown extends V ? Default : FieldKeyCase extends V ? Default : V;
type FieldsValues<T extends Fields, V extends FieldKeyCase, O extends FieldsKeysCaseMap<T>> = {
	[K in keyof T as ValueKeyCaseType<K, GetValueKeyCase<O[K], V>>]: T[K]["value"];
};

function camelToSnakeCase(str: string, joiner = "_", uppercaseIsNewWord = false): string {
	const regex = !uppercaseIsNewWord ? /[A-Z]+/g : /[A-Z]/g;
	return str.replace(regex, (match, index) => {
		// console.log("match :: ", match, "index :: ", index);
		return index === 0 ? match.toLowerCase() : `${joiner}${match.toLowerCase()}`;
	});
}

function getValueCase(key: string, convertCase: FieldKeyCase = "same") {
	if (convertCase === "snake") {
		return camelToSnakeCase(key, "_");
	}
	if (convertCase === "snake_aggressive") {
		return camelToSnakeCase(key, "_", true);
	}
	if (convertCase === "kebab") {
		return camelToSnakeCase(key, "-");
	}
	if (convertCase === "kebab_aggressive") {
		return camelToSnakeCase(key, "-", true);
	}
	if (convertCase === "lowercase") {
		return key.toLowerCase();
	}
	if (convertCase === "uppercase") {
		return key.toUpperCase();
	}
	return key;
}

function _getValues<
	F extends Fields,
	L extends Options<F>,
	S extends FormStore<F, L>,
	D extends FieldKeyCase = FieldKeyCase,
	O extends FieldsKeysCaseMap<F> = FieldsKeysCaseMap<F>,
>(props: { fields: F; $store: S; defaultCase: D; special?: O }) {
	const result = {} as any;
	const values = props.$store.get().values;
	for (const key in props.fields) {
		const field = props.fields[key];
		const key_case = getValueCase(key, props.special?.[key] ?? props.defaultCase);
		let value = values[key];
		// postprocess values
		if (field.type === "select") {
			if (value === PLACEHOLDERS.select.value) {
				value = null;
			}
		}

		// attach final value
		result[key_case] = value;
	}
	return result as FieldsValues<F, D, O>;
}

export default function getFormValues<F extends Fields, L extends Options<F>>(
	props: PluginProps<F, L>,
) {
	const { fields, $store } = props;
	return {
		getValues<O extends FieldsKeysCaseMap<F>>(special?: O) {
			return _getValues<F, L, typeof $store>({ fields, $store, defaultCase: "same", special });
		},
		getValuesLowercase<O extends FieldsKeysCaseMap<F>>(special?: O) {
			return _getValues<F, L, typeof $store>({ fields, $store, defaultCase: "lowercase", special });
		},
		getValuesUppercase<O extends FieldsKeysCaseMap<F>>(special?: O) {
			return _getValues<F, L, typeof $store>({ fields, $store, defaultCase: "uppercase", special });
		},
		getValuesSnakecase<O extends FieldsKeysCaseMap<F>>(special?: O) {
			return _getValues<F, L, typeof $store>({ fields, $store, defaultCase: "snake", special });
		},
		getValuesSnakecaseAggressive<O extends FieldsKeysCaseMap<F>>(special?: O) {
			return _getValues<F, L, typeof $store>({
				fields,
				$store,
				defaultCase: "snake_aggressive",
				special,
			});
		},
		getValuesKebabcase<O extends FieldsKeysCaseMap<F>>(special?: O) {
			return _getValues<F, L, typeof $store>({ fields, $store, defaultCase: "kebab", special });
		},
		getValuesKebabcaseAggressive<O extends FieldsKeysCaseMap<F>>(special?: O) {
			return _getValues<F, L, typeof $store>({
				fields,
				$store,
				defaultCase: "kebab_aggressive",
				special,
			});
		},
	};
}
