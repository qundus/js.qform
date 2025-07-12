export type NestedObject = { [key: string]: NestedObject | unknown };

// flatten
// export type FlatObjectKeyValue<T, K = keyof T> = T extends NestedObject
// 	? K extends `${infer U}.${infer V}`
// 		? U extends keyof T
// 			? FlatObjectKeyValue<T[U], V> // repeat the loop with nested keys and object
// 			: never
// 		: K extends keyof T // key is clean of dots
// 			? T[K]
// 			: never
// 	: T;

// export type FlatObjectKeys<T extends NestedObject, Key = keyof T> = Key extends string
// 	? T[Key] extends NestedObject
// 		? `${Key}.${FlatObjectKeys<T[Key]>}`
// 		: `${Key}`
// 	: never;

// export type FlatObject<T extends NestedObject> = {
// 	[K in FlatObjectKeys<T>]: FlatObjectKeyValue<T, K>;
// };

type FlatObjectKeyValue<T, K = keyof T> = T extends NestedObject
	? K extends `${infer U}.${infer V}`
		? U extends keyof T
			? FlatObjectKeyValue<T[U], V>
			: never
		: K extends keyof T
			? T[K]
			: never
	: T;

type FlatObjectKeys<T extends NestedObject, Key = keyof T> = Key extends string
	? T[Key] extends NestedObject
		? `${Key}.${FlatObjectKeys<T[Key]>}`
		: `${Key}`
	: never;

export type FlatObject<T extends NestedObject> = {
	[K in FlatObjectKeys<T>]: FlatObjectKeyValue<T, K>;
};
// const flat: FlatObject<typeof object> = {};

// unflatten
// NOTES: using keys for the loop over the nested/dotted keys to objects don't work
// because it's never possible to combine the final object which meanes you have to
// settle for union type/s and it breaks ts intellisense and the user cannot see the result
// trying to access object.key.<this is not showing up in the browser>
export type _UnflatObject<T> = T extends Record<string, unknown>
	? {
			[K in keyof T as K extends `${infer Prefix}.${string}`
				? Prefix
				: K]: K extends `${infer Prefix}.${string}` //!! NEVER CHANGE STRING
				? _UnflatObject<{
						[P in keyof T as P extends `${Prefix}.${infer Suffix}` ? Suffix : never]: T[P];
					}>
				: T[K];
		}
	: T;
export type UnflatObject<T> = _UnflatObject<T> extends infer G ? G : never;
// const unflat: UnflatObject<typeof flat> = {};

// const object = {
// 	name: "eas",
// 	wow: {
// 		wowwowow: null as number,
// 		me: null as string[],
// 		nested: {
// 			mean: ["mean"],
// 		},
// 	},
// 	address: {
// 		street: "easd",
// 		zip: 5646,
// 		location: {
// 			city: "london",
// 			nested: {
// 				mean: ["mean"],
// 			},
// 		},
// 	},
// };
