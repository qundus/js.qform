// thanks for the idea -> https://github.com/paxcode-it/zod-to-fields
import type { Field } from "../../_model";
import type { SchemaToFields, SchemaToFieldsExtenders } from "./_model";

import helpers from "./helpers";
import type { ZodTypeAny } from "zod";

export default function schemaToFields<Z, E extends SchemaToFieldsExtenders<Z>>(
	zod: Z,
	extenders?: E,
) {
	const typeName = helpers.getZodTypeName(zod);
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
		const typeName = helpers.getZodTypeName(schema);

		if (typeName.startsWith("object")) {
			const fields = _schemaToFields(schema, extenders, key);
			result = { ...result, ...fields };
			continue;
		}

		//
		const field = (extenders?.[key as keyof E] ?? {}) as Field;

		// determine field type
		if (typeName.startsWith("string")) {
			field.type = field.type ?? "text";
		} else if (typeName.startsWith("number")) {
			field.type = field.type ?? "number";
		} else if (typeName.startsWith("boolean")) {
			field.type = field.type ?? "checkbox";
		} else if (typeName.startsWith("enum")) {
			field.type = field.type ?? "select";
			const options = schema._def.values.map((value: any) => ({
				label: value.charAt(0).toUpperCase() + value.slice(1),
				value: value as any,
			}));
			field.options = () => options;
		} else if (typeName.startsWith("nativeEnum")) {
			field.type = field.type ?? "select";
			const options = Object.entries(schema._def.values).map(([key, value]) => ({
				label: key.charAt(0).toUpperCase() + key.slice(1),
				value: value as any,
			}));
			field.options = () => options;
		} else if (typeName.includes("file")) {
			field.type = field.type ?? "file";
			if (typeName.startsWith("array")) {
				field.multiple = field.multiple ?? true;
			} else {
				// TODO: find a way for files when singular
				field.processValue = ({value}) => {
					if (value == null) {
						return value;
					}
					if (value instanceof FileList) {
						return value[0]
					}
					return value;
				}
			}
		} else if (typeName.startsWith("date")) {
			field.type = field.type ?? "date";
		} else {
			// TODO: find a proper way to handle arrays
			// TODO: find a proper way to process arrays values 
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

		// // @ts-ignore
		result[key] = field as any;
	}

	return result;
}
