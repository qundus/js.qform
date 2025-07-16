import { createForm } from "../src";
import { z } from "zod";
import { cZod } from "../src/converters";

enum Wow {
	LOCATION = "location",
	yeah = "yeah",
}
enum No {
	geepe = "geepe",
	hooray = "hooray",
}
const schema = z.object({
	name: z.string().nullable().or(z.boolean()), //.nullable(), //.min(3, "at least 3 characters"),
	// single: z.boolean(),
	job: z
		.enum(["student", "employee"])
		.and(z.enum(["wow", "yeah"]))
		.nullable(),
	address: z.object({
		street: z.string(),
		zip: z.number(),
	}),
	wow: z.nativeEnum(Wow),
	picture: z.array(z.instanceof(File)),
	arrayOfNativeEnum: z.array(z.nativeEnum(Wow).and(z.nativeEnum(No))),
});
// console.log(z.array(z.nativeEnum(Wow).and(z.nativeEnum(No)))._def);
const fields = cZod.schemaToFields(schema);

// z.enum(["student", "employee"]).or(z.enum(["wow", "yeah"])).nullable()._def.innerType._def.

// import { z } from "zod";
// const schema = z.object({
// 	name: z.string().nullable(), //.min(3, "at least 3 characters"),
// 	single: z.boolean(),
// 	job: z.enum(["student", "employee"]),
// 	address: z.object({
// 		street: z.string(),
// 		zip: z.number(),
// 	}),
// 	picture: z.instanceof(String).nullable(),
// });

// const ss: SchemaToFields<typeof schema> = {};
