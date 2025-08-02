<!-- header : <img width="150px" height="50px" src="https://img.shields.io/badge/name-blue?style=for-the-badge" /> -->
<!-- header2: <img width="150px" src="https://img.shields.io/badge/name-blue?style=for-the-badge" /> -->
<!-- vars -->
[qState]: https://www.npmjs.com/package/@qundus/qstate

<!-- intro -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/intro-blue?style=for-the-badge" />
<br />

it feels absolutly bizzare how html forms have become framework dedicated solution over the years, and it becomes almost impossible to switch/jump between framework if a feature is not applicable somewhere or there's simply a library in another framework would make the job at hand go faster, this is what this library targets. Offering a fresh way to look at forms and how they're used without depending on any framework and offer framework dependant solutions wherever neccessary.

<!-- features -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/features-yellow?style=for-the-badge" />
<br />

- Independant and straight forward form logic
- support for framework specific hooks through [qState]
- modify dom/vdom element right from any input
- global form options to control whole form behavior
- validator function or array of functions
- schema validation libraries converters, only Zod for now
- listen to form mount and change events and modify data accordingly
- ...and much more!

<!-- disclaimer -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/disclaimer-red?style=for-the-badge" />
<br />

i don't have time rn to finish this but below are some helpful examples, this is still work in progress even though i'm testing it in production and it's working like a charm.
i appreciate any feedback, issues and/or PRs

<!-- installation -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/Installation-grey?style=for-the-badge" />
<br />

```shell
pnpm install @qundus/qform @qundus/qstate
```

<!-- basics -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/basics-gray?style=for-the-badge" />
<br />

```ts
// login-form | any file type js, cjs, mjs or ts
import { form } from "@qundus/qform";

export const login = form(
  {
    name: null, // fallback input.type="text"
    password: "text" // place the type
  }
);
```



<!-- basics: usage -->
<br />
<img height="50px" src="https://img.shields.io/badge/basics-usage-blue?style=for-the-badge" />
<br />
<br />

> Vanilla

```html
<div class="flex flex-col h-fit self-start">
  <label for="name" class="flex flex-row gap-2">
    <input id="name" />
  </label>
  <label for="password" class="flex flex-row gap-2">
    <input id="password"  />
  </label>
  <script type="module">
    import { login } from "./login-form.mjs";
    const name = document.getElementById("name");
    const password = document.getElementById("password");
    if (name != null) {
      const atom = login.elements("name").ref(name);
    }
    if (email != null) {
      const atom = login.elements("password").ref(email);
    }
  </script>
</div>
```
> Preact React Solid tsx jsx

```ts
import { login } from "./login-form";

interface Props extends IntrinsicElement<"input"> {}
export default function (props: Props) {
	const atom = login.atoms("name");
	// const $state = atom.$store.hooks.preact(); // use your hooks

	return (
		<label className="flex flex-col gap-2">
			<p>Name</p>
			<input
				{...props}
				ref={atom.element.ref}
				// {...atom.element.preact()} // or use your hooks
			/>
			{$state.errors?.[0]}
		</label>
	);
}
```

> Svelte

```html
<script lang="ts">
  import { login } from "./login-form";
  const atom = login.atoms("password");
  const state = atom.$store;
  // const state = atom.$store.hooks.useSvelte(); // or use your hooks
  const props = $props();
</script>

<label class="flex flex-col gap-2">
  <p>Password</p>
  <input
    {...props}
    {...atom.element.svelte()}
    class={`border-2px border-solid ${$state.condition.element.state === "focus" ? "!border-black" : "border-gray"}`}
  />
  {$state.errors?.[0]}
</label>
```

<!-- basics: converters -->
<br />
<img height="50px" src="https://img.shields.io/badge/basics-converters-blue?style=for-the-badge" />
<br />

converters are a way to use external schema validation libraries, converters work on forming the given schema object and flattening it and then creating the form fields.

> Zod

```ts
import { form, cZod } from "@qundus/qform";
import { cZod } from "@qundus/qform/converters";
import { z } from "zod";

// schema data
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

// now let's make our form fields
const fields = cZod.schemaToFields(schema, {
	// override
	override: {
		huh: { valueNullable: false },
		// for logically undefined types like array<string>
		options: {
			type: "select",
			processValue: (value) => {
				// tell the form how to process the value before it's validated
				return value
			}, 
		},
	},
});

// now pass it and create the form object
export const zodForm = form(fields);
```

and then use it how you would use the login from before.

<!-- basics: form button -->
<br />
<img height="50px" src="https://img.shields.io/badge/basics-buttons-blue?style=for-the-badge" />
<br />

```tsx
import { login } from "../login-form";

// let's assume you're using preact hook
export function Page() {
	const $button = login.button.$store.hooks.preact();
	function submit() {
	e.preventDefault();
	login.actions.submit({
		runner: async () => {
			const data = login.actions.getValuesLowercase();
			// if the data was flattened, you can unflatten it
			const cdata = cObj.unflatten(data);
		},
		cannotSubmit: () => {
			console.log("runner blocked");
		},
	 });
	}
	return (
		<button
		className="flex px-2 py-2 bg-green rounded-md !disabled:bg-red disabled:(cursor-not-allowed)"
		disabled={$button.disabled}
		onClick={submit}
	>
		submit
	</button>
	)
}
```


<!-- options  -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/options-gray?style=for-the-badge" />
<br />
<br />

TODO: list options

<!-- roadmap  -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/roadmap-gray?style=for-the-badge" />
<br />
<br />

- convert field value to accept primitives and also a function processor, allowing to shape value however user likes
- reduce number of states used per form
- optimize apis for processors and wherever possible
- adopt plugins/addons bahavior to use form actions, form button..etc and
- reduce main form object size through plugins/addons mentioned above

<!-- Later -->
<br />
<img height="50" src="https://img.shields.io/badge/to_be_continued-gray?style=for-the-badge" />
<br />

so much more examples and use cases are on the way once i get time, i'll just throw in these here randomly till i get back

```ts
import { form } from "@qundus/qform";
import { vFile } from "@qundus/qform/validators";
export const login = form(
	{
		name: null,
		color: "color",
		email: {
			type: "email",
			value: "wow@gmail.com",
			validate(value) {
				if (value == null) {
					return "email is required";
				}
				if (!value.includes("@")) {
					return "email must have @";
				}
				return null;
			},
		},
		phone: {
			type: "tel",
			hidden: true,
			// value: 5004625,
			// validateOn: "change",
			validate: (value) => {
				if (typeof value === "number") {
					if (value < 3) {
						return "phone number must be at least 3";
					}
				}
				if (typeof value === "string") {
					if (value.length < 3) {
						return "phone number must be at least 3";
					}
				}
				return undefined;
			},
			// processValue: () => {
			// 	console.log("process value phone :: ");
			// },
			// processCondition: ({ value, $condition, getValueOf }) => {
			// 	const name = getValueOf("name");
			// 	console.log("name from phone value is :: ", name);
			// 	// if (name == null) {
			// 	// 	$condition.hidden = true;
			// 	// } else {
			// 	// 	$condition.hidden = false;
			// 	// }
			// },
			processElement: ({ key, isVdom, element }) => {
				console.log("process element :: ", key);
			},
		},
		cities: {
			type: "select",
			value: undefined,
			// validateOn: "change",
			// validate(value) {
			// 	return null;
			// },
			options: () => [
				{ label: "saudi", value: "sa" },
				{ label: "kuwait", value: "kw" },
			],
			// multiple: true,
			// processValue: ({ key, next }, { processors }) => {
			// 	return processors.checkbox();
			// },
		},
		picture: {
			type: "file",
			// value: null,
			validate: (value: FileList) => {
				const range = vFile.Ranges.kilo;
				const size_limit = 2;
				const t = vFile.isFileSizeLessThan(value[0], size_limit, range);
				if (!t) {
					return "File size limit is " + size_limit + range;
				}
			},
			required: false,
			// options: () => ([{label: "", value: ""}]),
			// element: {
			// 	multiple: true,
			// },
		},
		isSingle: {
			type: "checkbox",
			// value: false,
			// mandatory: true,
			// options: () => [{ label: "", value: "" }],
		},
		gender: {
			type: "radio",
			value: null,
			// required: false,
			options: () => [
				{ label: "male", value: "male" },
				{ label: "female", value: "female" },
			],
		},
	},
	{
		// incompleteListCount: 0,
		onMount: ({ init }) => {
			console.log("mounted form login :: ", init);
		},
		onChange: ({ newValue }) => {
			console.log("changed form login :: ");
			// newValue.conditions.phone.hidden = newValue.values.name == null || newValue.values.name === "";
		},
	},
);
```

<!-- refs & thanks -->
<br /><img height="50" src="https://img.shields.io/badge/references_&_thanks_to-gray?style=for-the-badge" />
<br />

- [@qundus/qstate][qState]