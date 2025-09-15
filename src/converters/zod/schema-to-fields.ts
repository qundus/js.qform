// thanks for the idea -> https://github.com/paxcode-it/zod-to-fields
import type { Field } from "../../_model";
import type { Options, SchemaToFields, SchemaToFieldsExtenders } from "./_model";
import checks from "./checks";

import helpers from "./helpers";
// import type { ZodTypeAny } from "zod";

export default function schemaToFields<Z, E extends SchemaToFieldsExtenders<Z>>(
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
	let result = {} as SchemaToFields<Z>; //MergedFields<Z, O, E>;
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
		const field = (options.override?.[key as keyof E] ?? {}) as Field.Options;
		const active = {
			type: "string" as "string" | "number" | "boolean" | "date" | "file" | "enum" | "nativeEnum",
			isArray: typeName.startsWith("array"),
		};

		// determine field type
		if (typeName.includes("string")) {
			field.type = field.type ?? "text";
			active.type = "string";
		} else if (typeName.includes("number")) {
			field.type = field.type ?? "number";
			active.type = "number";
		} else if (typeName.includes("boolean")) {
			field.type = field.type ?? "checkbox";
			active.type = "boolean";
		} else if (typeName.includes("enum")) {
			field.type = field.type ?? "select";
			active.type = "enum";
		} else if (typeName.includes("nativeEnum")) {
			field.type = field.type ?? "select";
			active.type = "nativeEnum";
		} else if (typeName.includes("file")) {
			field.type = field.type ?? "file";
			active.type = "file";
		} else if (typeName.includes("date")) {
			field.type = field.type ?? "date";
			active.type = "date";
		}

		// type specific settings
		switch (active.type) {
			case "nativeEnum":
			case "enum":
				{
					field.multiple = field.multiple ?? active.isArray ?? false;
					const obj = helpers.getEnumValues(schema);
					const options = [] as { label: string; value: string }[]; // maybe shift this logic to inside of the field.options function for performance??!
					for (const key in obj) {
						const value = obj[key];
						options.push({ label: key, value });
					}
					field.options = () => options;
				}
				break;
			case "file":
				{
					field.multiple = field.multiple ?? active.isArray ?? false;
					const processValue: Field.Processor<any, any> = ({ value, field }) => {
						if (value == null) {
							return null;
						}
						if (value instanceof FileList) {
							if (field.multiple) {
								return Array.from(value);
							}
							return value[0];
						}
						return value;
					};
					if (field.processValue == null) {
						field.processValue = processValue;
					} else if (typeof field.processValue === "function") {
						field.processValue = [processValue, field.processValue];
					} else {
						field.processValue = [processValue, ...field.processValue];
					}
				}
				break;
			default:
				{
					// const baseType = helpers.unwrapZodType(schema);
					let removeKey = false;
					if (field.type == null && options?.unknownsAsText) {
						if (checks.isZodTypeNameNull(typeName)) {
							field.type = "text";
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
		field.required = field.required ?? !schema.isOptional();
		field.valueNullable = field.valueNullable ?? schema.isNullable();

		// map validation function
		const validation = (value: any) => {
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
		if (field.validate == null) {
			field.validate = validation;
		} else if (typeof field.validate === "function") {
			field.validate = [field.validate, validation];
		} else {
			field.validate.push(validation);
		}

		result[key] = field as any;
	}

	return result;
}
