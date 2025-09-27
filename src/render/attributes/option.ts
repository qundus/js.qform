import type { Field, Form, FunctionProps, Render } from "../../_model";
import { DOM, MUTATE } from "../../const";

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
		name: state.__internal.key,
		// multiple: state?.element.multiple,
		// required: state?.element.required,
		// disabled: state?.element.disabled,
		[attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[attrType !== "vdom" ? "onclick" : "onClick"]: (event: Event) => {
			event.preventDefault();
			const valueKey = state.element.selectionsValueKey;
			let nextValue = Array.isArray(state.value)
				? [...state.value]
				: state.value == null
					? []
					: [state.value];
			//
			if (nextValue.length > 0) {
				if (nextValue.includes(optionValue[valueKey])) {
					nextValue = nextValue.filter((item) => item === optionValue[valueKey]);
				} else {
					nextValue.push(optionValue[valueKey]);
				}
			} else {
				nextValue.push(optionValue[valueKey]);
			}
			//
			const next = { ...state };
			next.value = next.element.multiple ? nextValue[0] : nextValue;
			next.__internal.manual = false;
			//
			next.event.DOM = DOM.CLICK_OPTION;
			next.event.MUTATE = MUTATE.VALUE;
			next.event.ev = event;
			store.set(next);
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
