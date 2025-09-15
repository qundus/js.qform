import type { Element, Field, Form, FunctionProps } from "../_model";
import { blurInteraction } from "../interactions/blur";
import { focusInteraction } from "../interactions/focus";

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
export function baseElement<F extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
) {
	const { field, $store } = basic;
	return <D extends Element.DomType, K extends Element.KeysType>(
		dType: D,
		_kType: K,
		reactive: Field.StoreObject<Field.Options> | (() => Field.StoreObject<Field.Options>),
	) => {
		const data = typeof reactive === "function" ? reactive() : reactive;
		return {
			id: field.label,
			[dType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
			required: data?.condition.element.required,
			disabled: data?.condition.element.disabled,
			[dType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
				$store.update(({ $next: $form }) => {
					focusInteraction(basic, { $form, event, value: null });
					return $form;
				});
			},
			[dType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
				// if (field.validateOn === "change") {
				// 	return;
				// }
				$store.update(({ $next: $form }) => {
					blurInteraction(basic, { $form, event, value: null });
					return $form;
				});
			},
		} as BaseElementFactory<D>;
	};
}
