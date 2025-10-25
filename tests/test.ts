import { createForm, createField, Field, createFormSetup } from "../src";
import { FIELD, FORM } from "../src/const";
import { vFile } from "../src/validators";
import { preactHook } from "@qundus/qstate/preact";

// const form = formSetup();
export const name = createField("name", "text");
export const goal = createField("goal", "file");
export const picture = createField("picture", {
	type: "file",
	value: "wow",
});
export const cities = createField("cities", {
	type: "select",
	select: {
		options: ["wow", 22, { code: "yee" }],
	},
});
export const radio = createField("radio", "select.radio");
export const tel = createField("tel", {
	type: "tel",
	validate: ({ extras }) => {
		//
	},
	tel: {},
});

// radio.render.preact.

tel.store.get().element.focused;

// cities.store.get().element.select.options.map((item) => {
// 	// item.
// });
// cities.setup.
// radio.setup

// name.setup.type;
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
			type: "select.radio",
			onRender: ({ key, attrFor, attrs }) => {
				if (attrFor === "input") {
					// attrs.
				}
				console.log("process element :: ", key);
			},
		},
		cities: {
			type: "select",
			// value: undefined,
			multiple: true,
			// validateOn: "change",
			// validate(value) {
			// 	return null;
			// },
			select: {
				options: [
					{ label: "saudi", value: "sa", code: "" },
					{ label: "kuwait", value: "kw", code: "" },
					"madinah",
				],
			},
			// multiple: true,
			// processValue: ({ key, next }, { processors }) => {
			// 	return processors.checkbox();
			// },
		},
		picture: {
			type: "file",
			// value: "",
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
			type: "select.radio",
			// value: null, //null as { wow: string } | null,
			// required: false,
			// hidden: true,
			// selections: [
			// 	{ label: "male", value: "male", garage: "wow" },
			// 	{ label: "female", value: "female", garage: "wow" },
			// ],
		},
	},
	{
		onMount: ({ fields }, listen) => {
			// init.extras.gender?.[0].
			// console.log("mounted form loginform :: ", init);
			// listen([fields.cities.store, fields.color.store], (country, color) => {});
		},
		onEffect: ($next) => {
			console.log("changed form loginform :: ", $next);
			// $next.conditions.phone.hidden = $next.values.name == null || $next.values.name === "";
		},
		// incompleteListCount: 0,
		storeHooks: {
			useStore: preactHook,
		},
	},
);

const createWOw = createFormSetup({
	fieldsRequired: false,
	onEffect(props) {},
});

// const [res, err] = await form.submit.start();

// test dynamic/component type usage
// function wow<F extends Field.Setup<'file'>>(field: Field.Factory<F, any>) {
// 	const extras = field.store.get().extras
// }
form.values.get().picture;
form.fields.picture.store.hooks;
form.store.listen((value) => {
	// use a if statement
	if (value.status === FORM.STATUS.SUBMIT) {
		// do something on submit
	}
	// or use a switch
	switch (value.status) {
		case FORM.STATUS.ERROR:
			// do something on form error
			break;
		default:
			break;
	}
});

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
});

// form.fields.cities.setup.
// form.fields.cities.store.get();
// form.fields.gender.setup.
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
