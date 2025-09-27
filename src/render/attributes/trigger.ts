import type { Field, Form, FunctionProps, Render } from "../../_model";
import { DOM, MUTATE } from "../../const";

export function renderAttributesTrigger<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(basic: FunctionProps.Field<S, O>, props: FunctionProps.RenderAttributes<S, O, A>) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive;
	const attrs = {
		id: state?.element?.label ?? setup.label,
		// type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__internal.key,
		// multiple: state?.element.multiple,
		// required: state?.element.required,
		// disabled: state?.element.disabled,
		// [attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[attrType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			//
			const next = { ...state };
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
			//
			const next = { ...state };
			next.element.focused = false;
			next.element.visited = true;
			next.__internal.manual = false;
			//
			next.event.DOM = DOM.BLUR;
			next.event.MUTATE = MUTATE.IDLE;
			next.event.ev = event;
			store.set(next);
		},
		[attrType !== "vdom" ? "onmouseleave" : "onMouseLeave"]: (event: Event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			// const parent = event.parent
			console.log("parent :: ", event);
			return;
			const next = { ...state };
			next.element.focused = false;
			next.element.visited = true;
			next.__internal.manual = false;
			//
			next.event.DOM = DOM.BLUR;
			next.event.MUTATE = MUTATE.IDLE;
			next.event.ev = event;
			store.set(next);
		},
		blur: (event: Event) => {
			console.log("blurrr :: ", event);
		},
	} as any;

	// event listener id
	const onclickId = attrType !== "vdom" ? "onclick" : "onClick";
	attrs[onclickId] = (event: Event) => {
		event.preventDefault();
		const next = { ...state };
		next.element.focused = true;
		next.element.visited = true;
		next.__internal.manual = false;
		//
		next.event.DOM = DOM.CLICK;
		next.event.MUTATE = MUTATE.IDLE;
		next.event.ev = event;
		store.set(next);
	};
	const ontouchId = attrType !== "vdom" ? "ontouchstart" : "onTouchStart";
	attrs[ontouchId] = (event: Event) => {
		event.preventDefault();
		const next = { ...state };
		next.element.focused = true;
		next.element.visited = true;
		next.__internal.manual = false;
		//
		next.event.DOM = DOM.TOUCH;
		next.event.MUTATE = MUTATE.IDLE;
		next.event.ev = event;
		store.set(next);
	};

	// process trigger
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "trigger" };
	if (options?.onFieldElementOrder === "before") {
		options?.onFieldRender?.(processProps);
	}
	setup.onRender?.(processProps);
	if (options?.onFieldElementOrder === "after") {
		options?.onFieldRender?.(processProps);
	}
	return attrs as Render.Attributes.Trigger<S, O, A>;
}
