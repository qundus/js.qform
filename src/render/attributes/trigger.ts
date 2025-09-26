import type { Field, Form, FunctionProps, Render } from "../../_model";

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
		name: state.__key,
		// multiple: state?.element.multiple,
		// required: state?.element.required,
		// disabled: state?.element.disabled,
		[attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[attrType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			//
			const element = { ...state.element };
			element.focused = true;
			element.visited = true;
			store.set({
				...(state as any),
				element,
				__internal: {
					update: "element.focus",
					event,
					manual: false,
				},
			});
		},
		[attrType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			// if (field.validateOn === "change") {
			// 	return;
			// }
			//
			const element = { ...state.element };
			element.focused = false;
			element.visited = true;
			store.set({
				...(state as any),
				element,
				__internal: {
					update: "element.blur",
					event,
					manual: false,
				},
			});
		},
	} as any;

	// event listener id
	const listenerId = attrType !== "vdom" ? "onclick" : "onClick";
	attrs[listenerId] = (event: Event) => {
		event.preventDefault();
		store.set({
			...(state as any),
			__internal: {
				update: "element.click.trigger",
				manual: false,
				event,
			},
		});
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
