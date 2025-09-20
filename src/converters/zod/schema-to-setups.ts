// thanks for the idea -> https://github.com/paxcode-it/zod-to-fields
import type { Field } from "../../_model";
import type { Options, SchemaToSetups, SchemaToFieldsExtenders } from "./_model";
import checks from "./checks";

import helpers from "./helpers";
// import type { ZodTypeAny } from "zod";

export default function schemaToSetups<Z, E extends SchemaToFieldsExtenders<Z>>(
	zod: Z,
	_options?: Options<Z, E>,
) {
	const typeName = helpers.getZodTypeName(zod, "MAIN");
	if (!typeName.startsWith("object")) {
		throw new Error("qForm: please use a valid zod object not a " + typeName);
	}
	const options = helpers.processOptions(_options);
	const result = _schemaToFields<Z, E>(zod, options);
	return result;
}

function _schemaToFields<Z, E extends SchemaToFieldsExtenders<Z>>(
	obj: Z,
	options: Options<Z, E>,
	baseKey = "",
) {
	let result = {} as SchemaToSetups<Z>; //MergedFields<Z, O, E>;
	// @ts-ignore
	for (const [_key, _schema] of Object.entries(obj.shape)) {
		// get the key for flat/nested object
		const key = (baseKey.length > 0 ? `${baseKey}.` : "") + _key;
		const schema = _schema as any;
		const typeName = helpers.getZodTypeName(schema, key);

		if (typeName.startsWith("object")) {
			// @ts-ignore
			const fields = _schemaToFields(schema, options, key);
			result = { ...result, ...fields };
			continue;
		}

		//
		const setup = (options.override?.[key as keyof E] ?? {}) as Field.Setup;
		const active = {
			type: "string" as "string" | "number" | "boolean" | "date" | "file" | "enum" | "nativeEnum",
			isArray: typeName.startsWith("array"),
		};

		// determine field type
		if (typeName.includes("string")) {
			setup.type = setup.type ?? "text";
			active.type = "string";
		} else if (typeName.includes("number")) {
			setup.type = setup.type ?? "number";
			active.type = "number";
		} else if (typeName.includes("boolean")) {
			setup.type = setup.type ?? "checkbox";
			active.type = "boolean";
		} else if (typeName.includes("enum")) {
			setup.type = setup.type ?? "select";
			active.type = "enum";
		} else if (typeName.includes("nativeEnum")) {
			setup.type = setup.type ?? "select";
			active.type = "nativeEnum";
		} else if (typeName.includes("file")) {
			setup.type = setup.type ?? "file";
			active.type = "file";
		} else if (typeName.includes("date")) {
			setup.type = setup.type ?? "date";
			active.type = "date";
		}

		// type specific settings
		switch (active.type) {
			case "nativeEnum":
			case "enum":
				{
					setup.multiple = setup.multiple ?? active.isArray ?? false;
					const obj = helpers.getEnumValues(schema);
					const selections = [] as { label: string; value: string }[]; // maybe shift this logic to inside of the field.options function for performance??!
					for (const key in obj) {
						const value = obj[key];
						selections.push({ label: key, value });
					}
					setup.selections = selections;
				}
				break;
			case "file":
				{
					setup.multiple = setup.multiple ?? active.isArray ?? false;
					// const onChange: Field.OnChange<any, any> = ({ $next, setup }) => {
					// 	const value = $next.value
					// 	if ($next.value == null) {
					// 		return;
					// 	}
					// 	if (Array.isArray(value)) {
					// 		if (setup.multiple) {
					// 			$next.value = Array.from($next.value);
					// 		} else {

					// 		}
					// 		return $next.value[0];
					// 	}
					// 	// return $next.value;
					// };
					// if (setup.onChange == null) {
					// 	setup.onChange = onChange;
					// } else if (typeof setup.onChange === "function") {
					// 	setup.onChange = [onChange, setup.onChange];
					// } else {
					// 	setup.onChange = [onChange, ...setup.onChange];
					// }
				}
				break;
			default:
				{
					// const baseType = helpers.unwrapZodType(schema);
					let removeKey = false;
					if (setup.type == null && options?.unknownsAsText) {
						if (checks.isZodTypeNameNull(typeName)) {
							setup.type = "text";
						} else {
							removeKey = true;
						}
					}
					// for any other types of array that is not clear on how to make a field
					if (active.isArray) {
						if (options?.verbose) {
							console.error(
								"qForm: removed ",
								key,
								" with type ",
								typeName,
								", because requires explicit intervention!",
							);
						}
						removeKey = true;
					}
					if (removeKey) {
						continue;
					}
				}
				break;
		}

		// field optional?
		setup.required = setup.required ?? !schema.isOptional();
		setup.valueNullable = setup.valueNullable ?? schema.isNullable();

		// map validation function
		const validation: Field.Validate = ({ value }) => {
			const parse = schema.safeParse(value);
			if (parse.success) {
				return null;
			}
			const result = [] as string[];
			for (const err of parse.error.errors) {
				result.push(err.message);
			}
			if (result.length <= 0) {
				return null;
			}
			return result;
		};
		// add the function to field
		if (setup.validate == null) {
			setup.validate = validation;
		} else if (typeof setup.validate === "function") {
			setup.validate = [setup.validate, validation];
		} else {
			setup.validate.push(validation);
		}

		result[key] = setup as any;
	}

	return result;
}
