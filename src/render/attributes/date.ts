import type { Extras, Field, Form, FunctionProps, Render } from "../../_model";
import { FIELD } from "../../const";
import dp from "air-datepicker";

export function renderAttributesDate<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(basic: FunctionProps.Field<S, O>, props: FunctionProps.RenderAttributes<S, O, A>) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive;
	const attrs = {
		"data-qform-const": `${setup.type}.${setup.label}`,
		id: state?.element?.label ?? setup.label,
		type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__internal.key,
		multiple: state?.element.multiple,
		required: state?.element.required,
		disabled: state?.element.disabled,
		[attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",

		// [attrType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
		// 	event.preventDefault();
		// 	event.stopImmediatePropagation();
		// 	event.stopPropagation();
		// 	//
		// 	const next = { ...store.get() };
		// 	next.element.focused = true;
		// 	next.element.visited = true;
		// 	next.__internal.manual = false;
		// 	//
		// 	next.event.DOM = FIELD.DOM.FOCUS;
		// 	next.event.MUTATE = FIELD.MUTATE.IDLE;
		// 	next.event.ev = {
		// 		value: (event.target as any).value,
		// 		checked: (event.target as any).checked,
		// 		files: (event.target as any).files,
		// 	};

		// 	store.set(next);
		// },
		// [attrType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
		// 	event.preventDefault();
		// 	event.stopImmediatePropagation();
		// 	event.stopPropagation();
		// 	const next = { ...store.get() };
		// 	next.element.focused = false;
		// 	next.element.visited = true;
		// 	next.__internal.manual = false;
		// 	//
		// 	next.event.DOM = FIELD.DOM.BLUR;
		// 	next.event.MUTATE = FIELD.MUTATE.IDLE;
		// 	next.event.ev = undefined;
		// 	store.set(next);
		// },
	} as any;

	// if (state.extras.)

	let element = null as null | HTMLElement;
	while (element == null) {
		element = document.querySelector(`[data-qform-const="${setup.type}.${setup.label}"]`);
		// console.log("element :: ", element);
	}
	new dp(element, {
		...setup.date,
		onSelect(props) {
			const { date, formattedDate, datepicker } = props;
			let value = setup.date?.onSelect?.(props);
			if (value == null) {
				value = formattedDate as any;
			}

			console.log("selected :: ", date);
		},
	});

	// type
	// event listener id
	let listenerId = undefined as string | undefined;
	if (state.element.validateOn === "change") {
		listenerId = attrType !== "vdom" ? "onchange" : "onChange";
	} else {
		listenerId = attrType !== "vdom" ? "oninput" : "onInput";
	}
	attrs[listenerId] = (event: Event) => {
		event.preventDefault();
		event.stopImmediatePropagation();
		event.stopPropagation();
		const next = { ...store.get() };
		if (next.element.disabled) {
			return;
		}
		next.__internal.manual = false;
		//
		next.event.DOM = FIELD.DOM.IDLE; // questionable?
		next.event.MUTATE = FIELD.MUTATE.VALUE;
		const value = (event.target as any).value;
		next.event.ev = {
			value: value === "" ? undefined : value,
			checked: (event.target as any).checked,
			files: (event.target as any).files,
		};
		store.set(next);
	};

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "input" };
	options?.fieldsOnRender?.(processProps);
	setup.onRender?.(processProps);

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Render.Attributes.Date<S, O, A>;
}
