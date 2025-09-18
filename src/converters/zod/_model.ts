//!!! WARNING: NEVER USE ANY OF ZOD TYPES !!!\\
//!!! WARNING: NEVER USE ANY OF ZOD TYPES !!!\\
//!!! WARNING: NEVER USE ANY OF ZOD TYPES !!!\\
//!!! WARNING: NEVER USE ANY OF ZOD TYPES !!!\\
// it generates excessive type depth when exported
// find another way to get to the type, like with _def
// import type {
// 	ZodBoolean,
// 	ZodEnum,
// 	ZodNativeEnum,
// 	ZodNullable,
// 	ZodNumber,
// 	ZodString,
// 	ZodType,
// 	ZodTypeAny,
// } from "zod";
// import type { ZodTypeAny } from "zod";
import type { Field } from "../../_model";

// base
// export type UnwrapZodType<T> = T extends {
// 	_def: { innerType: infer U };
// }
// 	? U extends ZodTypeAny
// 		? UnwrapZodType<U>
// 		: T
// 	: T;

export type IsZodObject<T> = {
	_def: { typeName: "ZodObject" };
	shape: Record<string, unknown>;
	_output: Record<string, unknown>;
};

// fletteners
// type NestedObject = { _def: { typeName: "ZodObject" } };
export type FlatObjectKeyValue<T, K = ""> = T extends IsZodObject<T>
	? K extends `${infer U}.${infer V}`
		? U extends keyof T["shape"]
			? FlatObjectKeyValue<T["shape"][U], V> // repeat the loop with nested keys and object
			: never
		: K extends keyof T["shape"] // key is clean of dots
			? T["shape"][K]
			: never
	: T;
export type FlatObjectKeys<T extends Record<string, unknown>, Key = keyof T> = Key extends string
	? T[Key] extends IsZodObject<T[Key]>
		? `${Key}.${FlatObjectKeys<T[Key]["shape"]>}`
		: `${Key}`
	: never;
export type FlatObject<T> = T extends IsZodObject<T>
	? { [K in FlatObjectKeys<T["shape"]>]: ZodTypeName<FlatObjectKeyValue<T, K>> }
	: T;

// conversions
export type SchemaToFields<Z> = FlatObject<Z> extends infer G
	? {
			[K in keyof G]: ZodTypeNameToField<G[K]>;
		}
	: never;
export type ZodTypeNameToField<T> = T extends "boolean" | "nullable:boolean"
	? Field.Setup<"checkbox">
	: T extends "string" | "nullable:string"
		? Field.Setup<"text">
		: T extends "number" | "nullable:number"
			? Field.Setup<"number">
			: T extends "enum" | "nullable:enum" | "nativeEnum" | "nullable:nativeEnum"
				? Field.Setup<"select" | "radio">
				: T extends "date" | "nullable:date"
					? Field.Setup<"date" | "datetime-local">
					: T extends "file"
						? Field.Setup<"file">
						: Field.Setup;
export type SchemaToFieldsExtenders<Z> = FlatObject<Z> extends infer G
	? {
			[K in keyof G]?: Field.Type | Partial<Omit<Field.Setup, "options">>;
		}
	: never;

/**
 * TODO: finished to merge field types of both SchemaToFields & SchemaToFieldsExtenders
 * to affect the last result of the object
 */
// export type MergedFields<
// 	Z extends ZodObject<any>,
// 	// E extends SchemaToFieldsExtenders<Z>,
// > = SchemaToFields<Z>;

// options
export type Options<Z, E extends SchemaToFieldsExtenders<Z>> = {
	override?: E;
	verbose?: boolean;
	unknownsAsText?: boolean;
};

// tests
type ZodTypeName<T> = // Primitives
	T extends { _def: { typeName: "ZodString" } }
		? "string"
		: T extends { _def: { typeName: "ZodNumber" } }
			? "number"
			: T extends { _def: { typeName: "ZodBoolean" } }
				? "boolean"
				: T extends { _def: { typeName: "ZodBigInt" } }
					? "bigint"
					: T extends { _def: { typeName: "ZodDate" } }
						? "date"
						: // Special primitives
							T extends { _def: { typeName: "ZodSymbol" } }
							? "symbol"
							: T extends { _def: { typeName: "ZodUndefined" } }
								? "undefined"
								: T extends { _def: { typeName: "ZodNull" } }
									? "null"
									: T extends { _def: { typeName: "ZodVoid" } }
										? "void"
										: T extends { _def: { typeName: "ZodAny" } }
											? "any"
											: T extends { _def: { typeName: "ZodUnknown" } }
												? "unknown"
												: T extends { _def: { typeName: "ZodNever" } }
													? "never"
													: T extends { _def: { typeName: "ZodNaN" } }
														? "nan"
														: // Complex types
															T extends {
																	_def: { typeName: "ZodLiteral"; value: infer V };
																}
															? `literal:${V & (string | number | boolean)}`
															: T extends { _def: { typeName: "ZodEnum" } }
																? "enum"
																: T extends { _def: { typeName: "ZodNativeEnum" } }
																	? "nativeEnum"
																	: T extends {
																				_def: { typeName: "ZodArray"; type: infer E };
																			}
																		? `array:${ZodTypeName<E>}`
																		: T extends { _def: { typeName: "ZodObject" } }
																			? "object"
																			: T extends { _def: { typeName: "ZodRecord" } }
																				? "record"
																				: T extends {
																							_def: { typeName: "ZodUnion"; options: infer O };
																						}
																					? `union:${O extends any[] ? ZodTypeName<O[number]> : never}`
																					: T extends {
																								_def: {
																									typeName: "ZodIntersection";
																									left: infer L;
																									right: infer R;
																								};
																							}
																						? `intersection:${ZodTypeName<L> & ZodTypeName<R>}`
																						: T extends {
																									_def: { typeName: "ZodTuple"; items: infer I };
																								}
																							? `tuple:[${I extends any[] ? ZodTypeName<I[number]> : never}]`
																							: // Wrappers
																								T extends {
																										_def: {
																											typeName: "ZodOptional";
																											innerType: infer I;
																										};
																									}
																								? `optional:${ZodTypeName<I>}`
																								: T extends {
																											_def: {
																												typeName: "ZodNullable";
																												innerType: infer I;
																											};
																										}
																									? `nullable:${ZodTypeName<I>}`
																									: T extends {
																												_def: {
																													typeName: "ZodDefault";
																													innerType: infer I;
																												};
																											}
																										? `default:${ZodTypeName<I>}`
																										: T extends {
																													_def: {
																														typeName: "ZodPromise";
																														type: infer I;
																													};
																												}
																											? `promise:${ZodTypeName<I>}`
																											: // Fallback
																												"unknown";
