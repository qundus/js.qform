<!-- disclaimer -->
<br /><img height="50" src="https://img.shields.io/badge/Disclaimer-grey?style=for-the-badge" />
<br />
i don't have time rn to finish this but below are some helpful examples, this is still work in progress even though i'm testing it in production and it's working like a charm.
i appreciate any feedback, issues and/or PRs

<!-- installation -->
<br /><img height="50" src="https://img.shields.io/badge/Installation-grey?style=for-the-badge" />
<br />

```shell
bun install @qundus/qform
```

<!-- intro -->
<br /><img height="50" src="https://img.shields.io/badge/intro-gray?style=for-the-badge" />
<br />
this library targets the enforcement of separation of form logic away from html, so first, create a form file:

```ts
// login-form | any file type js, cjs, mjs or ts
import { createForm } from "@qundus/qform";
export const loginForm = createForm(
  {
    name: null, // fallback input.type="text"
    password: "text" // place the type
  }
);
```

now use it wherever

<!--  -->
<br /><img height="40" src="https://img.shields.io/badge/vanilla-red?style=for-the-badge" />
<br />

```html
<div class="flex flex-col h-fit self-start">
  <label for="name" class="flex flex-row gap-2">
    <input id="name" />
  </label>
  <label for="email" class="flex flex-row gap-2">
    <input id="email" />
  </label>
  <script type="module">
    import { loginForm } from "./login-form.mjs";
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    if (name != null) {
      const atom = loginForm.elements("name").ref(name);
    }
    if (email != null) {
      const atom = loginForm.elements("email").ref(email);
    }
  </script>
</div>
```

<!--  -->
<br /><img height="40" src="https://img.shields.io/badge/react_preact_solid-red?style=for-the-badge" />
<br />

```ts
import { loginForm } from "./login-form";

interface Props extends IntrinsicElement<"input"> {}
export default function (props: Props) {
	const atom = loginForm.atoms("email");
	const $state = atom.$hooks.preact(); // react, solid...
	return (
		<label className="flex flex-col gap-2">
			<p>Email</p>
			<input
				{...props}
				{...atom.element.preact()} // react, solid...
			/>
			{$state.errors?.[0]}
		</label>
	);
}
```

<!--  -->
<br /><img height="40" src="https://img.shields.io/badge/svelte-red?style=for-the-badge" />
<br />
```html
<script lang="ts">
  import { loginForm } from "./login-form";
  const atom = loginForm.atoms("name");
  const state = atom.$state.hooks.useSvelte();
  const props = $props();
</script>

<label class="flex flex-col gap-2">
  <p>Name</p>
  <input
    {...props}
    {...atom.element.preact()}
    class={`border-2px border-solid ${$state.condition.state === "focus" ? "!border-black" : "border-gray"}`}
  />
  {$state.errors?.[0]}
</label>
```

<!--  -->
<br /><img height="50" src="https://img.shields.io/badge/External_Validators-gray?style=for-the-badge" />
<br />

in this chapter we're going to tab into how this library can be used with zod validator and such data/schema validation libraries, for now only zod is supported:

```ts
import { createForm, cZod } from "@qundus/qform";
import { cZod } from "@qundus/qform/converters";
import { z } from "zod";


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

export const zodForm = createForm(fields);
```

and then use it how you would use the loginForm from before

<!--  -->
<br /><img height="50" src="https://img.shields.io/badge/buttons-gray?style=for-the-badge" />
<br />

```tsx
import {loginForm} from "../login-form";

export function Page() {
	const $button = loginForm.button.$hooks.preact() // react, solid...
	function submit() {
	e.preventDefault();
	loginForm.actions.submit({
		runner: async () => {
			const data = loginForm.actions.getValuesLowercase();
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


<!-- Later -->
<br /><img height="50" src="https://img.shields.io/badge/to_be_continued-gray?style=for-the-badge" />
<br />

so much more examples and use cases are on the way once i get time, i'll just through in these here randomly till i get back

```ts
import { createForm } from "@qundus/qform";
import { vFile } from "@qundus/qform/validators";
export const loginForm = createForm(
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
		onMounted: ({ init }) => {
			console.log("mounted form loginform :: ", init);
		},
		onChange: ({ $next }) => {
			console.log("changed form loginform :: ");
			// $next.conditions.phone.hidden = $next.values.name == null || $next.values.name === "";
		},
	},
);
```

<!-- refs & thanks -->
<br /><img height="50" src="https://img.shields.io/badge/references_&_thanks_to-gray?style=for-the-badge" />
<br />
- [@qundus/qstate](https://www.npmjs.com/package/@qundus/qstate)