// thanks for the idea -> https://github.com/paxcode-it/zod-to-fields
import type { Field } from "../../_model";
import type { SchemaToFields, SchemaToFieldsExtenders } from "./_model";

import helpers from "./helpers";
import type { ZodTypeAny } from "zod";

export default function schemaToFields<Z, E extends SchemaToFieldsExtenders<Z>>(
	zod: Z,
	extenders?: E,
) {
	const typeName = helpers.getZodTypeName(zod, "MAIN");
	if (!typeName.startsWith("object")) {
		throw new Error("qForm: please use a valid zod object not a " + typeName);
	}
	const result = _schemaToFields<Z, E>(zod, extenders);
	// console.log("result :: ", result);
	return result;
}

function _schemaToFields<Z, E extends SchemaToFieldsExtenders<Z>>(
	obj: Z,
	extenders?: E,
	baseKey = "",
) {
	let result = {} as SchemaToFields<Z>; //MergedFields<Z, O, E>;
	// @ts-ignore
	for (const [_key, _schema] of Object.entries(obj.shape)) {
		// get the key for flat/nested object
		const key = (baseKey.length > 0 ? `${baseKey}.` : "") + _key;
		const schema = _schema as ZodTypeAny;
		const typeName = helpers.getZodTypeName(schema, key);

		if (typeName.startsWith("object")) {
			const fields = _schemaToFields(schema, extenders, key);
			result = { ...result, ...fields };
			continue;
		}

		//
		const field = (extenders?.[key as keyof E] ?? {}) as Field;
		const active = {
			type: null as "string" | "number" | "boolean" | "date" | "file" | "enum" | "nativeEnum",
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
		} else {
			if (field.type == null) {
				// const baseType = helpers.unwrapZodType(schema);
				// console.error(
				// 	"qForm: Zod type ",
				// 	typeName,
				// 	" in key :: ",
				// 	key,
				// 	" doesn't have a proper way to be handled, ",
				// 	" please specify a type for it through the extenders, entry removed!!",
				// );
				continue;
			}
		}

		// field optional?
		field.required = field.required ?? !schema.isOptional();
		field.valueNullable = field.valueNullable ?? schema.isNullable();

		// validation
		const validation = (value: any) => {
			const parse = schema.safeParse(value);
			if (parse.success) {
				return null;
			}
			const result = [];
			for (const err of parse.error.errors) {
				result.push(err.message);
			}
			return result;
		};
		if (field.validate == null) {
			field.validate = validation;
		} else if (typeof field.validate === "function") {
			field.validate = [field.validate, validation];
		} else {
			field.validate.push(validation);
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
					if (!active.isArray) {
						field.processValue = ({ value }) => {
							if (value == null) {
								return value;
							}
							if (value instanceof FileList) {
								return value[0];
							}
							return value;
						};
					}
				}
				break;
		}

		result[key] = field as any;
	}

	return result;
}
