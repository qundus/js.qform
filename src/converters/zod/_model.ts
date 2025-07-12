import type {
	AnyZodObject,
	ZodBoolean,
	ZodEnum,
	ZodNativeEnum,
	ZodNullable,
	ZodNumber,
	ZodObject,
	ZodString,
	ZodTypeAny,
} from "zod";
import type { Basics, Field, FieldType, Fields } from "../../_model";

// base
export type UnwrapZodType<T extends ZodTypeAny> = T extends {
	_def: { innerType: infer U };
}
	? U extends ZodTypeAny
		? UnwrapZodType<U>
		: T
	: T;

// fletteners
type NestedObject = ZodObject<any>;
type FlatObjectKeyValue<T, K = keyof T> = T extends NestedObject
	? K extends `${infer U}.${infer V}`
		? U extends keyof T["shape"]
			? FlatObjectKeyValue<T["shape"][U], V> // repeat the loop with nested keys and object
			: never
		: K extends keyof T["shape"] // key is clean of dots
			? T["shape"][K]
			: never
	: T;
type FlatObjectKeys<T extends NestedObject, Key = keyof T["shape"]> = Key extends string
	? T["shape"][Key] extends NestedObject
		? `${Key}.${FlatObjectKeys<T["shape"][Key]>}`
		: `${Key}`
	: never;
export type FlatObject<T extends NestedObject> = {
	[K in FlatObjectKeys<T>]: FlatObjectKeyValue<T, K>;
};

// conversions
export type SchemaToFields<
	// T extends ZodRawShape,
	Z extends ZodObject<any>,
> = FlatObject<Z> extends infer G
	? {
			[K in keyof G]: AnyToField<G[K]>;
		}
	: never;
export type AnyToField<T> = T extends ZodBoolean | ZodNullable<ZodBoolean>
	? Field<"checkbox">
	: T extends ZodString | ZodNullable<ZodString>
		? Field<"text">
		: T extends ZodNumber | ZodNullable<ZodNumber>
			? Field<"number">
			: T extends
						| ZodEnum<any>
						| ZodNativeEnum<any>
						| ZodNullable<ZodEnum<any>>
						| ZodNullable<ZodNativeEnum<any>>
				? Field<"select"> | Field<"radio">
				: never;
export type SchemaToFieldsExtenders<
	// T extends ZodRawShape,
	Z extends ZodObject<any>,
> = SchemaToFields<Z> extends infer G
	? {
			[K in keyof G]?: FieldType | Partial<Omit<Field, "options">>;
		}
	: never;
/**
 * TODO: finished to merge field types of both SchemaToFields & SchemaToFieldsExtenders
 * to affect the last result of the object
 */
export type MergeSchemaToFieldsAndExtenders<
	// T extends ZodRawShape,
	Z extends ZodObject<any>,
	O extends SchemaToFields<Z>,
	E extends SchemaToFieldsExtenders<Z>,
> = {
	[K in keyof O]: O[K];
};

// options
export type Options<Z extends ZodObject<any>, O extends SchemaToFields<Z>> = {};

// tests
// const schema = object({
// 	name: string().nullable(), //.min(3, "at least 3 characters"),
// 	single: boolean(),
// 	job: enum(["student", "employee"]),
// 	address: object({
// 		street: string(),
// 		zip: number(),
// 	}),
// });

// const ss: SchemaToFields<typeof schema> = {};
