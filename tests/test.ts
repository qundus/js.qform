import { form, setupForm } from "../src";
import { vFile } from "../src/validators";
import { preactHook } from "@qundus/qstate/hooks";

const formSetup = setupForm({
	hooks: {
		preactFromSetup: preactHook,
	},
});

export const $form = formSetup(
	{
		name: null,
		color: "color",
		email: {
			type: "email",
			// value: "wow@gmail.com",
			validate: (value) => {
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
			// value: null,
			// required: false,
			options: () => [
				{ label: "male", value: "male" },
				{ label: "female", value: "female" },
			],
		},
	},
	{
		hooks: {
			preact: preactHook,
		},
		events: {
			onMount: ({ init }) => {
				console.log("mounted form loginform :: ", init);
			},
			onChange: ({ $next }) => {
				console.log("changed form loginform :: ", $next.newValue);
				// $next.conditions.phone.hidden = $next.values.name == null || $next.values.name === "";
			},
		},
		// incompleteListCount: 0,
	},
);
// const button = form.button.$store.form.actions.getValues();
// form.actions.getValuesLowercase();
// const fo = form.$store..hooks..preact();
// form.$listen((value) => {});
// const name = form.atoms("picture");
// const $store = name.$store.hooks.preact();

// name.$listen((value) => {});
// loginForm.fields.picture.$state.value.;
// loginForm.fields.email.$state.value.;
//
// loginForm.fields.name.value;
// loginForm.fields.section.value;
// loginForm.fields.email.value;
// loginForm.fields.email.options;
// loginForm.fields.picture.value;
// loginForm.fields.isSingle.value;
// loginForm.fields.phone.value;
// loginForm.fields.gender.value;
// loginForm.elements("cities");
// loginForm.fields.cities.options();
//
// loginForm.state.value.values.
// loginForm.state.value.extras.;
