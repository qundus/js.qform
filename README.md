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
- separate logic (js) from markup and style (html and css)
- easily create reusable components through field extras
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
<br />

you can create a form directly or make a form setup through `createFormSetup`, the difference is that the setup allows you to control all forms in your app from a single place. First let's take a look at creating a form directly:

```ts
// login-form | any file type js, cjs, mjs or ts
import { createForm } from "@qundus/qform";

export default createForm(
  {
    name: null, // fallback input.type="text"
    password: "text" // place the type
  }
);
```

that's it, you can just go ahead and use that in your app, but let's say you're making an app where all/any form fields across are optional, this would be a somewhat a hassle, this is where form setup comes in:

```ts
import { createFormSetup } from "@qundus/qform";

// consider it as making your own mini form maker/creator
export const createForm = createFormSetup({
	fieldsRequired: false,
	onEffect(props) {
		// listen to all forms changes across your app
	},
	// ...other options ofcourse
})
```


<!-- basics: hooks -->
<br />
<img height="50px" src="https://img.shields.io/badge/basics-hooks-blue?style=for-the-badge" />
<br />
<br />

hooks are the core that makes this library framework agnostic, you can install and import them individually, here's an example of how to create a form with framework specific hooks:

```ts
// setup/form.ts
import { createFormSetup } from "@qundus/qform";
import { preactHook } from "@qundus/qstate/preact";

export const createForm = createFormSetup({
	storeHooks: {
		useStore: preactHook,
	},
})

// src/modules/auth/login-form.ts
import { createForm } from ":setup/form";
export default createForm(
  {
    name: null, // fallback input.type="text"
    password: "text" // place the type
  },
	{
		// you can also add the hooks here directly
		storeHooks: {
			useStore: preactHook,
		},
	}
);

// src/pages/index.html|astro|tsx|jsx|...
import loginForm from ":src/modules/auth/login-form";
// ...somewhere down the code
const state = loginForm.fields.name.store.hooks.useStore();
// ...use the hook
```

hooks are a massive part of [qState] please check it out.


<!-- basics: render -->
<br />
<img height="50px" src="https://img.shields.io/badge/basics-render-blue?style=for-the-badge" />
<br />

Render is the api used to pass html element attributes, essentially it's what brings the input/component element to live with interactivity and other meta attributes like id, name, onclick...etc

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
    import loginForm from "./login-form.mjs";
    const name = document.getElementById("name");
    const password = document.getElementById("password");
    if (name != null) {
      const atom = loginForm.fields.name.render.ref(name);
    }
    if (email != null) {
      const atom = loginForm.fields.password.render.ref(email);
    }
  </script>
</div>
```
> Preact React Solid tsx jsx

```ts
import loginForm from "./login-form";

interface Props extends IntrinsicElement<"input"> {}
export default function (props: Props) {
	const field = loginForm.fields.name;

	return (
		<label className="flex flex-col gap-2">
			<p>Name</p>
			<input
				{...props}
				ref={field.render.ref}
				// {...field.render.react()} // or use your hooks
			/>
		</label>
	);
}
```

> Svelte

```html
<script lang="ts">
  import loginForm from "./login-form";
  const field = loginForm.fields.password;
  const state = field.store;
  // const state = atom.$store.hooks.useSvelte(); // or use your hooks
  const props = $props();
</script>

<label class="flex flex-col gap-2">
  <p>Password</p>
  <input
    {...props}
    {...field.render.svelte.input}
    class={`border-2px border-solid ${$state.element.focused "!border-black" : "border-gray"}`}
  />
  {$state.errors?.[0]}
</label>
```

<!-- basics: events -->
<br />
<img height="50px" src="https://img.shields.io/badge/basics-events-blue?style=for-the-badge" />
<br />
<br />

this is how you can listen to events occured on the form in general and on the element/field in particular from anywhere, weather it happened through dom events or through manual update.

## Form Events

for now form has only one type of events `STATUS` and that is to denote the general state of a form at any given moment.

```ts
import loginForm from "./login-form.mjs";
import { FORM } from "@qundus/qform/const"
loginForm.store.listen((value) => {
	// use a if statement
	if (value.status === FORM.STATUS.SUBMIT) {
		// do something on submit
	}
	// or use a switch
	switch (value.status) {
		case FORM.STATUS.ERROR:
			// do something on form error
			break;
	}
});
```

## Field Events

each field has independant set of events devided into 4 groups:
- DOM: events that denote dom events.
- MUTATE: events that denote changes in data.
- CYCLE: state machine to mark the current active cycle the field is in.
- RENDER: events to mark the readiness or state of the render object.

```ts
import loginForm from "./login-form.mjs";
import { FIELD } from "@qundus/qform/const"
form.fields.name.store.listen((value) => {
	if (value.event.CYCLE === FIELD.CYCLE.SKELETON) {
		// do something while field is in loading cycle
	}
	if (value.event.DOM === FIELD.DOM.CLICK) {
		// do something when the field is clicked on
	}
	if (value.event.MUTATE === FIELD.MUTATE.VALUE) {
		// do something when the field value has been mutated
	}
	if (value.event.RENDER === FIELD.RENDER.READY) {
		// do something when the field render elements have been mounted
	}
})

// you can also do it in framework specific effects 
// for example, in react's effect

export default function Input() {
	const field = loginForm.fields.name;
	const state = field.store.hooks.react();
	useEffect(() => {
		if (state.event.CYCLE === FIELD.CYCLE.SKELETON) {
			// do something while field is in loading cycle
		}
	}, [state]);
	return <input {...field.render.react()} />
}
```

### Cycles

this describes the fields current status, there are 5 cycles that control the behavior or general state of the field, namely: 

- `INIT`: used during the setup of the field
- `IDLE`: idle status of the field where it accepts any changes
- `SUBMIT`: signals field under submit and won't be accepting any changes
- `LOAD`: user controlled status to denote loading
- `SKELETON`: user controlled status to denote data loading

### Dom

this describes events that occur through `html dom events`, i won't be listing all of them here but you can always find them under `FIELD.DOM` constant.

### Mutations

any data change is hapening under a group/umbrella, you can listen or get notified of these data changes through the `FIELD.MUTATE` constant.

### Render

if the render api is used, it might be handy to know when the field has been mounted, all render elements start off with `INIT` status and changes to `READY` only when the field has been mounted onto any html element.

<!-- field setup -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/field_setup-purple?style=for-the-badge" />
<br />
<br />

field options are refered to as setup options, here's a list of those setup options:

### Essentials
`type` </br>
html input type of the field.

`value` </br>
initial value, sometimes affects the final resulting field type as typescript type.

`placeholder` </br>
input field placeholder.

`label` </br>
label to better describe the field, falls back to field key.

`labelReplace` </br>
when labels are taken from key because they're null, this replaces certain chars like '_' or '-' with ' '

`validate` </br>
function or array of functions to validate value.

`validateOn` </br>
some developers like to validate on field.blur and others on field.change.
- @option {change} run checks only on field.blur
- @option {input} run checks on everychange occurs


### Events
`onMount` </br>
fired once the field is mounted, you can use it fetch remote data or do any calculations per field mount.

`onChange` </br>
fired everytime data changes, used in case of complex data values
need to be extracted from field element and the basic html.element.value attribute isn't accurate enough. some processors run when events like onfocus and onblur fire, this gives the chance to modify field state like required, disabled..etc, according to specific needs or logic.

`onRender` </br>
fired when html element is requesting render attributes, you can use this to attach any html attributes during runtime. 

### Conditions
`hidden` </br>
mark field as hidden, this affects field type directly if the field is of type html.input. defaults to false.

`required` </br>
mark field required, defaults to true.

`disabled` </br>
mark field disabled, defaults to false.

`mandatory` </br>
used for when a field is mandatory, like a checkbox.

`initCycle` </br>
usually the cycle starts with INIT then IDLE moving to whatever developer logic prefers to set through onMount function, this alters the MOUNT cycle allowing for any cycle to replace it.
defaults to CYCLE.IDLE

### Value Effects
`vmcm` </br>
Value Manual Change Mechanism (VMCM), happens when values are updated from api fetch data or just manual programmatic interferrence. this affects whether the updated values go through the proper channels of validation, proccessing and affects on form status or just updates values without affecting anything else. defaults to "normal".

- @option normal: value updates go through the proper channeels of validation, proccessing, error handling and condition report.
- @option bypass: value updates are not validated so no proccessing or error handling, condition is changed though.
- @option force-valid: value updates defaults fields value condition to valid.

`preprocessValue` </br>
all values go through preprocessing phase, use this to prevent that if you wish to have full controll over the input field and it's value, defaults to true

`incompleteStatus` </br>
checks for missing/required value and mark condition.error as
incomplete. defaults to true

`valueNullable` </br>
allowing the field value to be null

### State Effects

`onChangeException` </br>
abort state changes when an exception is thrown from onChange method or not, defaults to false

### Passables
`props` </br>
user defined data/properties passed around

`multiple` </br>
signals weather this field is requesting plural of whatever the value is or singular, defaults to false.

### Special Type Options
these are options specifically tailored to certain types since they require way more understanding and cannot just be categorized like any other input field/type.

`tel` </br>
TBD

`select` </br>
TBD

`checkbox` </br>
TBD

`date` </br>
TBD


<!-- form options -->
<br />
<img width="170px" height="50px" src="https://img.shields.io/badge/form_options-blue?style=for-the-badge" />
<br />
<br />

these options affect all the fields under assigned form.

### Value Effects
`vmcm` </br>
same as field.setup.vmcm

`labelReplace` </br>
when labels are taken from key because they're null, this replaces certain chars like '_' or '-' with ' '

`preprocessValues` </br>
global options to optin or out of values preprocessing based on field type. this option precedes individual ones.

`preventErroredValues` </br>
usually all values are immediatly updated in the state, by setting this to true, only valid values will be commited. defaults to false

`validateOn` </br>
wheather the preferred method of checking values is ran oninput or onchange, oninput checks for validation for every change happens, onchange checks once there's a state change like blur or focus. field specific validateOn takes precedence here.
defaults to input.


### Passables
`props` </br>
store and pass any data around

`propsMergeStrategy` </br>
how's the props passed/merged with field's specific props. defaults to 'none'.

- @option 'none' each props is kept independantly
- @option 'form-override' global form props trumps/overrides field's props
- @option 'field-override' field specific props trumps/overrides form's props
		 
### Store
`storeHooks` </br>
add hooks to be used by the store, relies on [qState].

### Events
`onMount` </br>
fires when all fields in the form have mounted

`onEffect` </br>
fires when any field or form data changes


### Fields
`fieldsRequired` </br>
default behavior of form is to consider all fields required, use this to change that default, indvidual fields 'required' options supercedes this. defaults to true


`fieldsDisabled` </br>
default behavior of form is to consider all enabled, use this to change that default, 'disabled' options supercedes this. defaults to true.

`fieldsInitCycle` </br>
default behavior of form is to start with CYCLES.IDLE, use this to change that default, indvidual fields 'initCycle' options supercedes this. defaults to CYCLE.INIT

`fieldsOnChange` </br>
listen to all changes occured on any field and alter it's data if necessary, this gets called before the individual field's method if any.

`fieldsOnRender` </br>
global per element render listener, gets called before or after field's specific onElement based on onFieldElementOrder option.

### Exportation and Usage
`incompleteListCount` </br>
the last step of checking for form validity is to check for required fields' values and add them to the incompleteList, this option allows for choosing how big or small this list goes. defaults to false.

- @option true collect all incomplete fields
- @option false don't collect any incomplete fields
- @option number collect this many of incomplete fields

`onUpdateKeyNotFound` </br>
how should the form react to updating values, defaults to "silent".

`flatObjectKeysChar` </br>
if the desired data extracted from the form is in the shape of a nested object, then this splitter is used to determine which keys are nested, for now only the dot is supported. defaults to '.'.

`flatLabelJoinChar` </br>
when no label is provided, the key is used as fallback but sometimes the key is meant to be unflattened later on when fetching the form data, so this offers a way to replace the key flatObjectKeysChar with any character. defaults to ' ' or empty space

<!-- addons -->
<br />
<img height="50px" src="https://img.shields.io/badge/addons-yellow?style=for-the-badge" />
<br />
<br />

addons are form and field helpers, for now they're forced (sorry) but in the future you'll be able to pick and choose which ones you want to use.

<!-- addons: submit -->
<br />
<img height="50px" src="https://img.shields.io/badge/addons-submit-yellow?style=for-the-badge" />
<br />
<br />

this addon helps control submission and notifies all fields to move to submit cycle, usefull to place a lock on all form fields while marking it as submitting.

```tsx
import loginForm from "../login-form";

// let's assume you're using preact hook
export function Page() {
	async function submit(e: any) {
		e.preventDefault();
		// use possible to check if submission is possible
		const ispossible = form.submit.possible();
		// manually control submission cycle
		const endSumbission = form.submit.start();
		// use task to start a submission task
		const [res, err] = await form.submit.task(() => {
			return 'qform is awesome!'
		});
		if (err) {
			console.error(err);
			return
		}
		// successfull
		console.log("success :: ", res)
	}
	return <button onClick={submit}>submit</button>
}
```

<!-- addons: form button -->
<br />
<img height="50px" src="https://img.shields.io/badge/addons-button-yellow?style=for-the-badge" />
<br />
<br />

this addon offers an independant store that tailors to locking and unlocking form submit or action button, useful for disabling form submit button 

```tsx
import loginForm from "../login-form";

// let's assume you're using preact hook
export function Page() {
	const $button = login.button.$store.hooks.preact();
	async function submit(e: any) {
		e.preventDefault();
		const [res, err] = await form.submit.task(() => {
			return 'qform is awesome!'
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

<!-- converters -->
<br />
<img height="50px" src="https://img.shields.io/badge/converters-cyan?style=for-the-badge" />
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
	second = "COD or Battlefield?",
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
- document how components can be written with `extras`
- document examples and use cases for special input types like `select`
- offer render framework apis as per need basis.
- document validators like vFile


<!-- refs & thanks -->
<br /><img height="50" src="https://img.shields.io/badge/references_&_thanks_to-gray?style=for-the-badge" />
<br />

- [@qundus/qstate][qState]