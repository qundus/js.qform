import { createForm, createField, Field } from "../src";
import { vFile } from "../src/validators";
import { preactHook } from "@qundus/qstate/preact";

// const form = formSetup();
export const name = createField("name", "text");
export const goal = createField("goal", "file");
export const picture = createField("picture", {
	type: "text",
});
export const cities = createField("name", "select");
export const radio = createField("name", "radio");

// cities.render.dom.trigger();
// radio.render.dom()

name.render;
// name.render.dom()
// picture.store.get().element.
// picture.update.element({
// })
// name.setup;
// goal.setup;
// name.render.dom()

const form = createForm(
	{
		name: null,
		color: "color",
		email: {
			type: "email",
			// value: "wow@gmail.com",
			validate: ({ value }) => {
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
			hidden: true,
			// value: 5004625,
			// validateOn: "change",
			validate: ({ value }) => {
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
			type: "radio",
			onRender: ({ key, attrFor, attrs }) => {
				if (attrFor === "input") {
					// attrs.
				}
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
			selections: [
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
			value: "",
			// val
			validate: (value) => {
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
			value: null, //null as { wow: string } | null,
			// required: false,
			// hidden: true,
			selections: [
				{ label: "male", value: "male", garage: "wow" },
				{ label: "female", value: "female", garage: "wow" },
			],
		},
		// wow: {}
	},
	{
		onMount: (init) => {
			// init.extras.gender?.[0].
			console.log("mounted form loginform :: ", init);
		},
		onChange: ($next) => {
			console.log("changed form loginform :: ", $next);
			// $next.conditions.phone.hidden = $next.values.name == null || $next.values.name === "";
		},
		// incompleteListCount: 0,
		storeHooks: {
			useStore: preactHook,
		},
	},
);

// test dynamic/component type usage
// function wow<F extends Field.Setup<'file'>>(field: Field.Factory<F, any>) {
// 	const extras = field.store.get().extras
// }

form.fields.picture.store.hooks;
form.store.hooks;
// const data = form.submit

// const gender = $form.atoms("gender");
// const name = $form.atoms("name");
// const color = $form.atoms("color");

// gender.store.get().extras;
// name.store.get().extras;
// color.store.get().extras;
// color.element;

// const result = $form.values.get();

// result.picture;
// result.gender;
// result.color;
// result.email;
