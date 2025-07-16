import { createForm } from "../src";
import { z } from "zod";
import { cZod } from "../src/converters";

enum Questions {
	first = "are you cool?",
	second = "why are you gay?",
}
enum Colors {
	red = "Red",
	blue = "Blue",
}
const jobs = ["student", "employee"] as const;
const locations = ["saudi", "kuwait"] as const;
const schema = z.object({
	// primitives
	name: z.string(),
	single: z.boolean(),
	stringOrBoolean: z.string().nullable().or(z.boolean()), // not supported, fallsback to "text" field.type
	huh: z.unknown().nullable(), // supports unknownTypes through unknownAsTextFields option
	// objects
	address: z.object({
		street: z.string(),
		zip: z.number(), // deep keys will be flattned address.zip
	}),
	// files
	picture: z.instanceof(File),
	documents: z.array(z.instanceof(File)),
	// enums & nativeEnums
	job: z.enum(jobs),
	jobAndLocations: z.enum(jobs).and(z.enum(locations)), // collective enums
	question: z.nativeEnum(Questions),
	color: z.nativeEnum(Colors).nullable(),
	questionOrColor: z.array(z.nativeEnum(Questions).and(z.nativeEnum(Colors))), // intersections and unions are treated the same for now
	// arrays are not supported for now, you have to set the type yourself
	// only enums, nativeEnums and files are supported for now
	options: z.array(z.string()),
});

// console.log(z.array(z.nativeEnum(Wow).and(z.nativeEnum(No)))._def);
const fields = cZod.schemaToFields(schema, {
	// override
	override: {
		huh: { valueNullable: false },
		// for logically undefined types like array<string>
		options: {
			type: "select",
			processValue: (value) => {}, // tell the form how to process the value before it's validated
		},
	},
});

// console.log("fields :: ", fields);
// const zodForm = createForm(fields);
