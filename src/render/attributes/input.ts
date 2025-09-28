import type { Field, Form, FunctionProps, Render } from "../../_model";
import { DOM, MUTATE } from "../../const";

export function renderAttributesInput<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(basic: FunctionProps.Field<S, O>, props: FunctionProps.RenderAttributes<S, O, A>) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive;
	const attrs = {
		id: state?.element?.label ?? setup.label,
		type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__internal.key,
		multiple: state?.element.multiple,
		required: state?.element.required,
		disabled: state?.element.disabled,
		[attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[attrType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			//
			const next = { ...store.get() };
			next.element.focused = true;
			next.element.visited = true;
			next.__internal.manual = false;
			//
			next.event.DOM = DOM.FOCUS;
			next.event.MUTATE = MUTATE.IDLE;
			next.event.ev = event;
			store.set(next);
		},
		[attrType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			const next = { ...store.get() };
			next.element.focused = false;
			next.element.visited = true;
			next.__internal.manual = false;
			//
			next.event.DOM = DOM.BLUR;
			next.event.MUTATE = MUTATE.IDLE;
			next.event.ev = event;
			store.set(next);
		},
	} as any;
	// check if value should be added to object
	const addValue = setup.type !== "checkbox" && setup.type !== "radio" && setup.type !== "file";
	if (addValue) {
		attrs.value = state?.value ?? "";
	}

	// event listener id
	let listenerId = undefined as string | undefined;
	if (state.element.validateOn === "change") {
		listenerId = attrType !== "vdom" ? "onchange" : "onChange";
	} else {
		listenerId = attrType !== "vdom" ? "oninput" : "onInput";
	}
	attrs[listenerId] = (event: Event) => {
		event.preventDefault();
		const next = { ...store.get() };
		if (next.element.disabled) {
			return;
		}
		next.__internal.manual = false;
		//
		next.event.DOM = DOM.IDLE; // questionable?
		next.event.MUTATE = MUTATE.VALUE;
		next.event.ev = event;
		store.set(next);
	};

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "input" };
	if (options?.onFieldElementOrder === "before") {
		options?.onFieldRender?.(processProps);
	}
	setup.onRender?.(processProps);
	if (options?.onFieldElementOrder === "after") {
		options?.onFieldRender?.(processProps);
	}

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Render.Attributes.Input<S, O, A>;
}
