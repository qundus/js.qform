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
export function baseElement<F extends Field.Setup, O extends Form.Options<any>>(
	basic: FunctionProps.Element<F, O>,
) {
	const { setup, store } = basic;
	return <D extends Element.DomType, K extends Element.KeysType>(
		dType: D,
		_kType: K,
		reactive: Field.StoreObject<Field.Setup> | (() => Field.StoreObject<Field.Setup>),
	) => {
		const data = typeof reactive === "function" ? reactive() : reactive;
		return {
			id: setup.label,
			[dType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
			required: data?.condition.element.required,
			disabled: data?.condition.element.disabled,
			[dType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
				//
				const condition = { ...data.condition };
				condition.element.state = "focus";
				condition.element.visited = true;
				store.set({
					...(data as any),
					condition,
					__internal: {
						update: "focus",
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
				const condition = { ...data.condition };
				condition.element.state = "blur";
				condition.element.visited = true;
				store.set({
					...(data as any),
					condition,
					__internal: {
						update: "blur",
						event,
						manual: false,
					},
				});
			},
		} as BaseElementFactory<D>;
	};
}
