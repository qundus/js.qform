import type {
	ElementDomType,
	ElementKeysType,
	ElementProps,
	ElementReturns,
	Field,
	FieldState,
} from "../_model";
import onBlur from "../interactions/on-blur";
import onFocus from "../interactions/on-focus";

//
type OnFocus = (event: FocusEvent) => void;
type OnBlur = (event: FocusEvent) => void;
export type Returns<T extends ElementDomType> = ElementReturns<
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
export default function makeBaseElement<F extends Field>(props: ElementProps<F>) {
	const { key, $state, field, options } = props;
	return <D extends ElementDomType, K extends ElementKeysType>(
		dType: D,
		_kType: K,
		reactive: FieldState<Field>["value"] | (() => FieldState<Field>["value"]),
	) => {
		const data = typeof reactive === "function" ? reactive() : reactive;
		return {
			// @ts-ignore
			id: field.label,
			[dType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
			required: data?.condition.element.required,
			disabled: data?.condition.element.disabled,
			[dType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
				// @ts-ignore
				// field?.element?.onfocus?.(event);
				$state.update((next) => {
					onFocus({ ...props, $next: next, event, value: null });
					return next;
				});
			},
			[dType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
				// if (field.validateOn === "change") {
				// 	return;
				// }
				$state.update((next) => {
					onBlur({ ...props, $next: next, event, value: null });
					return next;
				});
			},
		} as Returns<D>;
	};
}
