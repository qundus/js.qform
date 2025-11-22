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

- handles all types of input
- Clear separation of concern between data logic and markup/style
- Independant and straight forward form logic
- support for framework specific hooks through [qState]
- modify dom/vdom element right from any input
- global form options to control whole form behavior
- validator function or array of functions
- schema validation libraries converters, only Zod for now
- listen to form mount and change events and modify data accordingly
- separate logic (js) from markup and style (html and css)
- easily create reusable components through field extras
- zero-dependencies, only [qState] for state management
- ...and much more!

<!-- disclaimer -->
<br />
<img width="150px" height="50px" src="https://img.shields.io/badge/disclaimer-red?style=for-the-badge" />
<br />

i need testers please, i also need help with svelte and vue frameworks as well, any help/complaints/requests/bugs through github issues is much appreciated, thanks.

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


<!-- basics: attributes -->
<br />
<img height="50px" src="https://img.shields.io/badge/basics-attributes-blue?style=for-the-badge" />
<br />

Attributes is the api used to pass html element attributes, essentially it's what brings the input/component element to live with interactivity and other meta attributes like id, name, onclick...etc. 

Generally there are only `vdom` and `dom` html attribute types, these are keys used by your choosing to apply dom attributes, there's also `ref` which can be used to apply `dom` attributes to any element in vanilla js or can be used as ref in `react`, `preact` or any framework.

Attributes are also super helpful when it comes to building ui libraries because it sets the standard for dom attributes and it's already built in.

### Usage

You can just create a form as usual

```ts
// file: form.ts
import { createForm } from ":setup/form";
export default createForm(
  {
    name: null, // fallback input.type="text"
  }
);
```

and then use the attributes any where you like

```tsx
// file: component.<ext> // <- according to your framework or vanilla
import form from "./form";

// vanilla
const nameAttrs = form.fields.name.store.get().attrs.input.dom

// react, preact or framework that accepts vdom attributes
const nameAttrs = form.fields.name.store.get().attrs.input.vdom

// you can also access them directly from form.store
const nameAttrs = form.store.get().attrs.name.input.dom

```

### Extend

you can set your own keys to map to `dom attributes` of your liking, here we define the key `svelte` and map it to `dom` attributes, this is extremely useful if the need to switch dev environment occurs, for example the need to change from `react` to `solidjs` and you wish to switch `vdom` attributes used in react with `dom` attributes for `solid` for example, here all you have to is change dom for vdom:

```ts
import { createForm } from "@qundus/qform";

const form = createForm(
  {
    name: {
      type: 'text',
      // we can define attrs per field
      attrs: {
        map: {
          svelte: 'dom'
        }
      }
    },
  },
  {
    // or we can define attrs per form
    attrs: {
      map: {
        svelte: 'dom' // field specific attrs definitions will take precedence
      }
    }
  }
);

// now you can use it as this; notice that key is defined
const attrs = form.fields.name.store.get().attrs.input.svelte
```

awesome, but we're not finished yet, what if you want your whole app to have `svelte` as a key to dom attributes

```ts
import { createFormSetup } from "@qundus/qform";

const appWideForm = createFormSetup({
	attrs: {
		map: {
			svelte: "dom", // notice that this is double
		},
	},
});

// now any form created will have that key
const myForm = appWideForm({
  name: null
})

// and get the attributes
const attrs = myForm.fields.name.store.get().attrs.input.svelte
```


### Examples

#### DOM (Vanilla, SolidJS...etc)

`dom` attributes can be used by any envorenment that accepts plain (vanilla) js attributes:

```html
<div class="flex flex-col h-fit self-start">
  <label for="email" class="flex flex-row gap-2">
    <p>Email</p>
    <input id="email" class="self-end m5" />
    <div id="email_errors" class="text-red"></div>
  </label>
  <script>
    import form from "./form";
    const email = document.getElementById("email");
    const email_errors = document.getElementById("email_errors");
    form.store.subscribe((value) => {
      if (email != null) {
        const errors = value.errors.email;
        value.attrs.email.input.ref(email);
        if (email_errors) {
          email_errors.innerHTML = errors == null ? "" : JSON.stringify(errors);
        }
      }
    });
  </script>
</div>
```

#### Vdom (React, Preact...etc)

`vdom` attributes can be used by any framework that accepts/expects modified vdom attributes:

```ts
import form from "./form";

interface Props extends IntrinsicElement<"input"> {}
export default function (props: Props) {
	const field = form.fields.name;
  const state = field.storeh.react() // assuming you added react to form creation

	return (
		<label className="flex flex-col gap-2">
			<p>Name</p>
			<input
				{...props}
				// ref={state.attrs.input.ref} // you can also add
				{...state.attrs.input.vdom}
			/>
		</label>
	);
}
```

#### Svelte

here's an example how to be used with svelte:

```html
<script lang="ts">
  import form from "./form";
  const field = form.fields.password;
  const state = field.store;
  // const state = atom.$store.hooks.useSvelte(); // or use your hooks
  const props = $props();
</script>

<label class="flex flex-col gap-2">
  <p>Password</p>
  <input
    {...props}
    {...$state.attrs.input.dom}
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
- ATTRIBUTE: events to mark the readiness or state of the attributes object.

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
	if (value.event.ATTRIBUTE === FIELD.ATTRIBUTE.READY) {
		// do something when the field attribute elements have been called/requested
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
	return <input {...state.attrs.input.vdom} />
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

### Attributes

if the attributes api is used, it might be handy to know when the field has been mounted, attributes start off with `INIT` status and changes to `READY` only when the field has been mounted onto any html element.

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

> be carefull here, if you set any values within this function it will rerun again so make sure you have solid if statments/conditions to avoid infinite loops/maximum stacks.

`onAttrs` </br>
fired when html element attributes is requested, you can use this to attach any html attributes during runtime. 

> I chose to remove store mutations from here and keep the data handling within the previous onChange method/s, if you have solid reason why you need it here please open an issue on github.

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
these are options specifically tailored to certain types since they require way more understanding and cannot just be categorized like any other input field/type. you can find them in the next chapter `Extras`

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
fires when any field data changes, be carefull here, if you set any values within this function it will rerun again so make sure you have solid if statments/conditions to avoid infinite loops/maximum stacks.


### Fields
`fieldsRequired` </br>
default behavior of form is to consider all fields required, use this to change that default, indvidual fields 'required' options supercedes this. defaults to true


`fieldsDisabled` </br>
default behavior of form is to consider all enabled, use this to change that default, 'disabled' options supercedes this. defaults to true.

`fieldsInitCycle` </br>
default behavior of form is to start with CYCLES.IDLE, use this to change that default, indvidual fields 'initCycle' options supercedes this. defaults to CYCLE.INIT

`fieldsOnChange` </br>
listen to all changes occured on any field and alter it's data if necessary, this gets called before the individual field's method if any.

`fieldsOnAttrs` </br>
global per element attributes listener.

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


<!-- extras -->
<br />
<img height="50px" src="https://img.shields.io/badge/extras-red?style=for-the-badge" />
<br />
<br />

some field/data types require more than the regular processing and that's due to their nature and expected user experience. Here we're going to explain eachone separately.

`extras` is the name given to the extras data/behavior generated based on such field types, `extras` offer all the necessary properties i think is standard when using those field types.

the entire behavior is set once the field's data type is set, and the those field types involved here are:

- Checkbox
- File
- Select and all it's subtypes like `select.radio`
- Tel
- Date

all the extras can be set through the previous chapter's `field setup` as regular field settings/options under the respective type's name, so for example, if you want to set checkbox's `yes` option you have to set `field.checkbox.yes`.

Finally, these extras will be found in any store object property, like `field.store.get().extras` or during field setup/settings `onChange.$next.extras` and `validate.extras`. This is could be very helpful while building components and what not.

> CODE | where you can use extras
```ts
import { createForm } from "@qundus/qform";

export default createForm(
  {
    agreed: {
			type: 'checkbox',
			validate: ({value, extras}) => {
				// validate value based on extras
			},
			onChange: ({ $next }) => {
				const extras = $next.extras;
				// do something with value based on extras
			}
		}
  }
);

// later when you want to use form's data
import form from "../path/to/form";
const extras = field.store.get().extras;

// and ofcourse, element is set
const field = form.fields.agreed;
<input {...field.dom()} />
```


## Checkbox

allows the user to change the standard `on` and `off` values retrieved by html standard input field when type is set to `checkbox` to whatever the user wants.

for example, if you wish to use `boolean` data type or just want the property value to be something when set to `checked` you can use the checkbox extras setup to do so.

> API

`yes` </br>
used to set the value of the field when checked, can be set to anything including objects, defaults to 'true'

`no` </br>
used to set the value of the field when unchecked, can be set to anything including objects, defaults to 'false'

`checked` | readonly </br>
use this to know the current state of the filed weather checked or not.

> EXAMPLE

```ts
import { createForm } from "@qundus/qform";

export default createForm(
  {
    agreed: {
			type: 'checkbox',
			mandatory: false // here you can set weather this field is mandatory or not
			preprocessValue: true // use this to cancel value preprocessing
			checkbox: {
				yes: true, // checked
				no: "don't agree" // unchecked
			}
		}
  }
);

// later when you want to use form's data
import form from "../path/to/form";

// value
const data = form.values.get();
console.log(data.agreed); // checked = true | not checked = "don't agree"
```

default behavior here is `boolean` data type, if `preprocessValue` is set to false then whatever data handled by the raw html input field/element will be set.

## File

currently there's no special settings for this field type, it only offers extra data to deal with file input types.

> API

`count` | readonly </br>
offers file count when file/s uploaded, internally it loads the files buffers through a function and sets upload, failed and successful counts.

`fallback` | readonly, nullable </br>
offers a fallback placeholders for the field/element, you can set value through `field.setup` option to a string and that would be processed here since value can only be a file/s.

`files` | readonly, nullable </br>
offers all info regarding the uploaded files such as: buffers, progress, stage...etc. this would be very handy in building components.

It's worth noting that files array is updated asynchronously so you might notice multiple state updates when using this field type.

> EXAMPLE

you can look into how the file component is build in the next chapter `components`.

```tsx
import { createForm } from "@qundus/qform";
export default createForm(
  {
    picture: {
			type: 'file',
			value: '/placeholders/avatar.svg' // you can set an initial placeholder here, any string values will be trasnformed to extras.fallback
			multiple: true // optinoal, affects final value
		}
  }
);
```

## Select

select fields have always been a little bit annoying to deal with when it comes to data handling, options array, what type of data to store, what key should we store as the value and so on. Here i've tried to simplify things as much as possible while keeping it flexible and scalable, essentially, you can set the options array to whatever you like and the final options array will always be adjusted to an array of objects, for example, let's say options array is set to `[11, true, 'yeah']` then during runtime it will get normalized to an array of object with label and value -> `{label: "11", value: 11}`.
There's so much happening here to simplify the experience and i think it's better explained with the example below.

> API

`options` </br>
you can set the options array here and/or update it during `onMount` or `onChange` through the update addon/api, also you can set it to a certain type like `null as unknown as {code: string}[]` and that type would follow along as you use it.

`valueKey` </br>
the value key used to determine the key to take value from within object, defaults to 'value'

`labelKey` </br>
the value key used to determine the key to take value from within object, defaults to 'label'

`throwOnKeyNotFound` </br>
safety option to throw errors if value or label keys are not found in object, default to false.

`dynamic` </br>
used when options are set dynamically, for example you don't want to set the options array from the start but rather are using a select element with options and you wish those options whatever they maybe during runtime to be recorded as options internally, in other words, the options array are filled dynamically upon user selection in runtime. defaults to false

`removeOnReselect` </br>
what should happen if an option is selected and it's clicked/chosen again?. by default, the option will get deselected, you can prevent that here by setting this option to false which will disallow option deselection. defaults to true

`selected` | readonly </br>
offers currently selected index.

`prev` | readonly </br>
offers previously selected options indecies.

`current` | readonly </br>
offers currently selected options indecies.

> ATTRIBUTES 

this field type has it's own special attributes method/s.

```tsx
import form from "./path/to/form";
const field = form.fields.<your-field-name> // of type 'select'
const state = field.store.get();

// for triggers you can use
<div {...state.attrs.trigger.vdom}>select</div>
// for options you can use
<option {...state.attrs.option(<selected-option>).vdom}>option</option>
```

> EXAMPLE
```tsx
import { createForm } from "@qundus/qform";
import { solidHook } from "@qundus/qstate/solid";

export default createForm(
  {
    cities: {
			type: 'select',
			multiple: true, // optinoal, affects final value
			select: {
				options: ['sudan', 'saudi', {label: 'ir', name: 'iraq', __valueKey: 'name'}],// notice the per object valueKey renaming
				// valueKey: 'value', // global valueKey change
				// labelKey: 'value', // global valueKey change
			}
		}
  },
  {
    storeHooks: {
			solid: solidHook,
		},
  }
);

// somewhere in your code, let's assume we're using solidjs
import form from "./path/to/form";

export function SelectCities() {
	const field = form.fields.cities;
	const state = field.store.hooks.solid(); // assuming you added solid hook to form creation

	return (
		// 
		<div>
			{/* value, assuming not multiples */}
			<p {...state.attrs.trigger.dom}>{state.value?.[state.value.__labelKey ?? state.extras.labelKey]}</p>
			{state.extras.options?.map((option) => {
				return (
					<option
					class={option.selected? "text-blue" : "text-gray"}
					{...state.attrs.option(option).dom}
					>{option[option.__labelKey ?? state.extras.labelKey]}</option>
				)
			}}
		</div>
	)
}
```

this does not check for when the field is set to have `multiple` in which case it will use `extras.current` array to loop over options and display the chosen value, for a broader example please check `components` chapter.

## Tel
documentation coming soon, sorry i'm too busy

## Date
documentation coming soon, sorry i'm too busy

<!-- components -->
<br />
<img height="50px" src="https://img.shields.io/badge/components-black?style=for-the-badge" />
<br />
<br />

in this chapter i'm going to demonstrate how components are built with qform, this is a huge topic and while i'd really like to just dump everything i have here and explain it, i'm afraid this doc will get massively bigger, so until i build a website for this i'm going to stick to very few examples

## File

let's start with a file uploader and say we're using preact framework here.

```tsx
import { useStore } from '@nanostores/preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import type * as _QFORM from '@qundus/qform';

interface Props<F extends _QFORM.Field.Component<'file'>> {
  field: F
  description?: string;
  buttonLabel?: string;
}
export default function FileUpload<F extends _QFORM.Field.Component<'file'>>(props: Props<F>) {
  const { field, description, buttonLabel, ...other } = props;
  const state = useStore(field.store);
  const ref = useRef<HTMLInputElement>(null);

  function onInputClick(e: Event) {
    //
    e.preventDefault();
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    ref.current?.dispatchEvent(clickEvent);
  }

  return (
    <div class="flex flex-col w-full group-left gap5 debug">
      {/* input */}
      <input
        {...other}
        {...state.attrs.input.vdom}
        hidden
        ref={(_ref) => {
          ref.current = _ref;
        }}
      />
      {/* preview */}
      <div
        class="flex flex-col items-center justify-center min-w-64px min-h-64px w-64px h-64px max-w-64px max-h-64px cursor-pointer rounded-avatar"
        onClick={onInputClick}
      >
        {state.extras.files || state.extras.fallback ? (
          <img
            src={state.extras.files?.[0]?.url ?? state.extras.fallback?.[0]?.url}
            alt="avatar-placeholder"
            class="object-cover w-full h-full rounded-avatar"
          />
        ) : (
          <i class="icon-design:avatar w-full h-full" />
        )}
      </div>
      {/* label/discription/button */}
      <div class="flex flex-row flex-[1] items-start justify-between w-full h-full">
        <p class="flex flex-col items-center justify-center gap1 py1">
          {/* label */}
          <span class="text-sm font-medium capitalize">{state.element.label}</span>
          {state?.element.required && <span class="text-sm color-text-required ">*</span>}
        </p>
        <span class="flex flex-row w-full h-full style-text-secondary mt1">
          {description ?? 'upload your file please'}
        </span>
        <div class="flex flex-row items-center justify-start gap2">
          <button
            class="min-w-71px min-h-32px h-32px max-h-32px text-sm font-medium style-btn-outline capitalize mt3"
            onClick={onInputClick}
          >
            {buttonLabel ?? 'upload'}
          </button>
          {state.value != null && (
            <button
              class="min-w-71px min-h-32px h-32px max-h-32px text-sm font-medium style-btn-danger capitalize mt3"
              onClick={(event) => {
                event.preventDefault();
                // event.stopPropagation();
                // event.stopImmediatePropagation();
                field.reset.value({ clear: true });
              }}
            >
              {buttonLabel ?? 'Remove'}
            </button>
          )}
        </div>
      </div>
      {state?.element.focused && state?.errors && (
        <p class="flex flex-col items-center justify-center gap2 color-icon-fill-ds">
          <i class="icon-local:alert?size=sm&stroke=sm"></i>
          <span class="text-sm capitalize">{state?.errors?.[0]}</span>
        </p>
      )}
    </div>
  );
}
```

this example uses `qform`'s types/namespaces to set it's interface, the type where it calls the setup `_QFORM.Field.Setup<'file'>>` is where the type magic happens, if you set the field type to anything other than `file` then the whole field object will just follow, you can ofcourse follow a whole different approach here and say you just want a regular component that has all the attributes to function like: onclick, id, name...etc, and that would be awesome for a more loosely-coupled integration with `qform` and wider inclusion of libraries but then you lose all the benefits `qform` offers such as extras, so it's up to you how you build your components :).

## Select

here's another example that builds a component for select element

```tsx
import type * as _QFORM from '@qundus/qform';
import { useStore } from '@nanostores/preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { FIELD } from '@qundus/qform/const';

interface Props<F extends _QFORM.Field.Component<'select'>> {
  field: F
  noLabel?: boolean;
}
export function Select<F extends _QFORM.Field.Component<'select'>>(props: Props<F>) {
  const { field, noLabel = false, value, ...other } = props;
  const state = useStore(field?.store);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // console.log('wow :: ', state.value);
    if (state.element.entered) {
      // console.log('entered ', state.element);
      showList();
    }
    if (state.event.DOM === FIELD.DOM.CLICK) {
      setShow((prev) => !prev);
    }
    if (state.event.DOM === FIELD.DOM.BLUR) {
      hideList();
    }
  }, [state]);
  function showList() {
    setShow(true);
  }
  function hideList() {
    setShow(false);
  }
  return (
    //
    <label
      class={
        (state?.element.hidden ? ' hidden ' : ' wrap-col ') +
        (state?.event.CYCLE === FIELD.CYCLE.SUBMIT || state.element.disabled
          ? ' opacity-50 '
          : ' ') +
        ' w-full group-left gap2 '
      }
    >
      {!noLabel && (
        <p class="wrap-row group-center gap1 py1">
          {/* label */}
          <span class="text-sm font-medium capitalize">{state?.element.label}</span>
          {state?.element.required && <span class="text-sm color-text-required ">*</span>}
        </p>
      )}

      <div
        class={
          'relative wrap-row w-full group-between style-input style-input-height ' +
          (state.condition.error
            ? 'style-input-error'
            : state.element.focused
              ? 'style-input-focus'
              : ' ')
        }
        {...state.attrs.trigger.vdom}
      >
        {state.value == null ? (
          <p>Select an option</p>
        ) : !state.element.multiple ? (
          <p>{state.value?.[state.value.__labelKey ?? state.extras.labelKey]}</p>
        ) : (
          <div className="wrap-row group-left gap2">
            {state.extras.current.map((index) => {
              const option = state.extras.options[index];
              return (
                //
                <p
                  key={option.__key}
                  className={
                    'wrap-row group-center w-fit h-full bg-bg-accent-gray-bolder text-sm text-text-accent-gray rounded-md gap2 px2 py1'
                  }
                >
                  <span>{option[option.__labelKey ?? state.extras.labelKey]}</span>
                  <i
                    className="icon-local:close text-icon-outline-secondary z-50 cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation();
                      field.remove.option(option);
                    }}
                  ></i>
                </p>
              );
            })}
          </div>
        )}

        <i
          class={
            'icon-local:chevron-down color-icon-outline-secondary ' + (show ? 'rotate-180' : '')
          }
        ></i>
      </div>
      <div class="relative inline-block w-full h-inherit gap2">
        <div
          style={{ minHeight: '50px', maxHeight: '150px' }}
          class={
            (show ? 'flex flex-col' : 'hidden') +
            ' absolute z-1000 bg-bg-select w-full p0 style-input mt2 overflow-x-hidden overflow-y-auto'
          }
        >
          {state.extras.options && state.extras.options.length > 0
            ? state.extras.options?.map((option) => {
                const selected = option.__selected;
                return (
                  <div
                    key={option.__key}
                    class={
                      'wrap-row w-full style-input-height items-center gap2 capitalize py2 ltr:(pr2 pl3) rtl:(pr3 pl2) cursor-pointer hover:(bg-bg-select-item-hover) ' +
                      (selected ? ' bg-bg-select-item-hover ' : '')
                    }
                    {...state.attrs.option(option).vdom}
                  >
                    {/* checkbox for multiple */}
                    {state.element.multiple && (
                      <div
                        class={
                          (other.class ?? '') +
                          ' wrap-row w-10px h-10px min-w-10px min-h-10px overflow-hidden group-center style-checkbox  ' +
                          (selected ? 'style-checkbox-checked' : '')
                        }
                      >
                        {selected && (
                          <i class="min-w-16px min-h-16px icon-local:check-3 color-icon-outline-brand" />
                        )}
                      </div>
                    )}
                    <span className="text-sm leading-6 w-full">
                      {option[option.__labelKey ?? state.extras.labelKey]}
                    </span>
                    {/* check mark for non-multiple */}
                    {!state.element.multiple && selected && (
                      <i class="min-w-16px min-h-16px icon-local:check-3 text-icon-fill-discovery mx2"></i>
                    )}
                  </div>
                );
              })
            : 'no options offered'}
        </div>
      </div>
    </label>
  );
}
```

> for now, i'm only going to demonstrate file component since i don't have time for more examples or guidelines but i think this is more than enough to pass the idea on how components are built, contact me or open an issue if you think more examples are necessary, thanx :)

<!-- addons -->
<br />
<img height="50px" src="https://img.shields.io/badge/addons-yellow?style=for-the-badge" />
<br />
<br />

addons are form and field helpers, for now they're forced (sorry) but in the future you'll be able to pick and choose which ones you want to add to form/field object.

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

> not all addons are listed here, i'll try to finish them soon.

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

- [x] convert field value to accept primitives and also a function processor, allowing to shape value however user likes
- [-] reduce number of states used per form
	- partially done, currently one store per field, and one store per form
	- here store approach weather to realy entirely on one store (form) or split into mini stores (per fields) must be an option, to give user full controll over it.
- [-] optimize apis for processors and wherever possible
- [ ] adopt plugins/addons bahavior to use form actions, form button..etc and
- [ ] reduce main form object size through plugins/addons mentioned above
- [-] document how components can be written with `extras`
	- partially done with extras chapter, missing 
- [-] document examples and use cases for special input types like `select`
	- partially done with components and extras chapters
- [x] offer render framework apis as per need basis.
  - this has been massively changed and now it's no longer called `render` but the `attributes` or `attrs` api
  - user can now define their map of dom/vdom attributes, allowing for smoother transition between frameworks and/or vanillajs
  - added attrs shortcut through form object
  - massive fixes on attributes api and way of working
  - established seamless experience for setting up attributes type through form setups.
- [ ] document validators like vFile
- [ ] reduce bundle size
- [ ] make a website for better documentation and recognisabity.


<!-- refs & thanks -->
<br /><img height="50" src="https://img.shields.io/badge/references_&_thanks_to-gray?style=for-the-badge" />
<br />

- [@qundus/qstate][qState]