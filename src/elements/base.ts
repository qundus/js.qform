import type { Element, Field, Form } from "../_model";
import { blurInteraction } from "../interactions/blur";
import { focusInteraction } from "../interactions/focus";

//
type OnFocus = (event: FocusEvent) => void;
type OnBlur = (event: FocusEvent) => void;
export type ElementFactory<T extends Element.DomType> = Element.Factory<
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
	key: string,
	field: F,
	options: O,
	$store: Form.Store<any, O>,
) {
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
					focusInteraction({ ...props, $form, event, value: null });
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
					onBlur({ ...props, $form, event, value: null });
					return $form;
				});
			},
		} as ElementFactory<D>;
	};
}
