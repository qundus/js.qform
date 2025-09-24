import type { Field, Form, FunctionProps, Render } from "../../_model";

export type RenderAttributesBase<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
> = Render.Attributes.Factory<
	A extends "dom" ? Render.Attributes.BaseDom : Render.Attributes.BaseVdom
>;
export function renderAttributesBase<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(basic: FunctionProps.Field<S, O>, props: FunctionProps.RenderAttributes<S, O, A>) {
	const { setup, store } = basic;
	const { attrType: dType, reactive } = props;
	const state = reactive;
	return {
		id: state?.element?.label ?? setup.label,
		required: state?.element.required,
		disabled: state?.element.disabled,
		[dType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[dType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
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
		[dType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
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
	};
}
