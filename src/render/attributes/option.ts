import type { Field, Form, FunctionProps, Render } from "../../_model";

export function renderAttributesOption<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A> & { optionValue: any },
) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive, optionValue: _optionValue } = props;
	const state = reactive;
	// prepare option value
	let optionValue = _optionValue;
	if (optionValue === undefined) {
		optionValue = { label: "unknown", value: "unknown" };
	} else if (typeof optionValue === "string" || typeof optionValue === "number") {
		optionValue = { label: optionValue, value: optionValue };
	}

	//
	const attrs = {
		id: state?.element?.label ?? setup.label,
		// type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__key,
		// multiple: state?.element.multiple,
		// required: state?.element.required,
		// disabled: state?.element.disabled,
		[attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		// [attrType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
		// 	event.preventDefault();
		// 	event.stopImmediatePropagation();
		// 	event.stopPropagation();
		// 	//
		// 	const element = { ...state.element };
		// 	element.focused = true;
		// 	element.visited = true;
		// 	store.set({
		// 		...(state as any),
		// 		element,
		// 		__internal: {
		// 			update: "element.focus",
		// 			event,
		// 			manual: false,
		// 		},
		// 	});
		// },
		// [attrType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
		// 	event.preventDefault();
		// 	event.stopImmediatePropagation();
		// 	event.stopPropagation();
		// 	// if (field.validateOn === "change") {
		// 	// 	return;
		// 	// }
		// 	//
		// 	const element = { ...state.element };
		// 	element.focused = false;
		// 	element.visited = true;
		// 	store.set({
		// 		...(state as any),
		// 		element,
		// 		__internal: {
		// 			update: "element.blur",
		// 			event,
		// 			manual: false,
		// 		},
		// 	});
		// },
		[attrType !== "vdom" ? "onclick" : "onClick"]: (event: Event) => {
			event.preventDefault();
			const valueKey = state.element.selectionsValueKey;
			let next = Array.isArray(state.value)
				? [...state.value]
				: state.value == null
					? []
					: [state.value];
			//
			if (next.length > 0) {
				if (next.includes(optionValue[valueKey])) {
					next = next.filter((item) => item === optionValue[valueKey]);
				} else {
					next.push(optionValue[valueKey]);
				}
			} else {
				next.push(optionValue[valueKey]);
			}
			store.set({
				...(state as any),
				value: state.element.multiple ? next[0] : next,
				__internal: {
					update: "element.click.option",
					manual: false,
					event,
				},
			});
		},
	} as any;

	// process trigger
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "option" };
	if (options?.onFieldElementOrder === "before") {
		options?.onFieldRender?.(processProps);
	}
	setup.onRender?.(processProps);
	if (options?.onFieldElementOrder === "after") {
		options?.onFieldRender?.(processProps);
	}

	return attrs as Render.Attributes.Option<S, O, A>;
}
