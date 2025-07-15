import { createForm } from "../src";
import { cZod } from "../src/converters";
import { z } from "zod";

enum Wow {
	location = "location",
	yeah = "yeah",
}
const schema = z.object({
	name: z.string().nullable().or(z.boolean()), //.nullable(), //.min(3, "at least 3 characters"),
	// single: z.boolean(),
	// job: z.enum(["student", "employee"]),
	address: z.object({
		street: z.string(),
		zip: z.number(),
	}),
	wow: z.nativeEnum(Wow),
	picture: z.array(z.instanceof(File)),
	ha: z.array(z.string()),
});

const fields = cZod.schemaToFields(schema);

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
