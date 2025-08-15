import { type _QFORM, formSetup } from "../src";
import { vFile } from "../src/validators";

const form = formSetup({});

export const $form = form(
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
			value: null,
			// required: false,
			options: () => [
				{ label: "male", value: "male" },
				{ label: "female", value: "female" },
			],
		},
	},
	{
		onMount: ({ init }) => {
			console.log("mounted form loginform :: ", init);
		},
		onChange: ($next) => {
			console.log("changed form loginform :: ", $next.newValue);
			// $next.conditions.phone.hidden = $next.values.name == null || $next.values.name === "";
		},
		// incompleteListCount: 0,
	},
);

interface Props<F extends _QFORM.Field<"email">> {
	atom: _QFORM.FieldAtom<F, any>;
}
