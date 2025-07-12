// courtesy of checking out https://github.com/paxcode-it/zod-to-fields
import { z } from "zod";
import type { Field } from "../../_model";
import type {
	MergeSchemaToFieldsAndExtenders,
	// Options,
	SchemaToFields,
	SchemaToFieldsExtenders,
} from "./_model";
import { isZodBoolean, isZodEnum, isZodNativeEnum, isZodNumber, isZodString } from "./checks";
import { unwrapZodType } from "./helpers";

function _createZodFields<
	T extends z.ZodRawShape,
	Z extends z.ZodObject<T>,
	O extends SchemaToFields<Z>,
	E extends SchemaToFieldsExtenders<Z>,
>(zod: Z, extenders?: E, baseKey = "") {
	let result = {} as MergeSchemaToFieldsAndExtenders<Z, O, E>;
	for (const [_key, schema] of Object.entries(zod.shape)) {
		// get the key for flat/nested object
		const key = (baseKey.length > 0 ? `${baseKey}.` : "") + _key;

		if (schema instanceof z.ZodObject) {
			// @ts-ignore
			const fields = _createZodFields(schema, extenders, key);
			// @ts-ignore
			result = { ...result, ...fields };
			continue;
		}

		//
		const field = (extenders?.[key as keyof E] ?? {}) as Field;
		const baseType = unwrapZodType(schema);

		// determine field type
		if (isZodString(baseType)) {
			field.type = field.type ?? "text";
		} else if (isZodNumber(baseType)) {
			field.type = field.type ?? "number";
		} else if (isZodBoolean(baseType)) {
			field.type = field.type ?? "checkbox";
		} else if (isZodEnum(baseType)) {
			field.type = field.type ?? "select";
			const options = schema._def.values.map((value: any) => ({
				label: value.charAt(0).toUpperCase() + value.slice(1),
				value: value as any,
			}));
			field.options = () => options;
		} else if (isZodNativeEnum(baseType)) {
			field.type = field.type ?? "select";
			const options = Object.entries(schema._def.values).map(([key, value]) => ({
				label: key.charAt(0).toUpperCase() + key.slice(1),
				value: value as any,
			}));
			field.options = () => options;
		} else {
			console.error("form-zod: Unsupported Zod type in key :: ", key);
			continue;
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

		// @ts-ignore
		result[key] = field as any;
	}

	return result;
}

// /**
//  * Generates an array of form elements based on the given Zod schema and options.
//  * @param {ZodObject<T>} schema - The Zod schema.
//  * @param {MappedFieldOptions<K>} [options] - Additional field options.
//  * @returns {FormFieldsArray} - Returns an array of form fields.
//  * @template T, K
//  */
export default function createZodFields<
	T extends z.ZodRawShape,
	Z extends z.ZodObject<T>,
	// O extends SchemaToFields<Z>,
	E extends SchemaToFieldsExtenders<Z>,
>(zod: Z, extenders?: E) {
	return _createZodFields(zod, extenders);
}
