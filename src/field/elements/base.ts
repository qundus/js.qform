import type { Element, Field, Form, FunctionProps } from "../../_model";

//
type OnFocus = (event: FocusEvent) => void;
type OnBlur = (event: FocusEvent) => void;
export type BaseElementFactory<T extends Element.DomType> = Element.Factory<
	T,
	{
		required: boolean;
		disabled: boolean;
	},
	{
		onfocus: OnFocus;
		onblur: OnBlur;
		autocomplete?: "on" | "off";
	},
	{
		onFocus: OnFocus;
		onBlur: OnBlur;
		autoComplete?: "on" | "off";
	}
>;
export function baseElement<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
) {
	const { setup, store } = basic;
	return <D extends Element.DomType, K extends Element.KeysType>(
		dType: D,
		_kType: K,
		reactive: Field.StoreObject<S> | (() => Field.StoreObject<S>),
	) => {
		const data = typeof reactive === "function" ? reactive() : reactive;
		return {
			id: data?.element?.label ?? setup.label,
			[dType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
			required: data?.element.required,
			disabled: data?.element.disabled,
			[dType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
				//
				const element = { ...data.element };
				element.focused = true;
				element.visited = true;
				store.set({
					...(data as any),
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
				const element = { ...data.element };
				element.focused = false;
				element.visited = true;
				store.set({
					...(data as any),
					element,
					__internal: {
						update: "element.blur",
						event,
						manual: false,
					},
				});
			},
		} as BaseElementFactory<D>;
	};
}
