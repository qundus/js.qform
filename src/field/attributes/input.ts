import type { Field, Form, FunctionProps, Attributes } from "../../_model";
import { FIELD } from "../../const";
import { processAttrs } from "../processors/attributes";

// export const isServerSide = (): boolean =>
// 	typeof window === "undefined" || typeof document === "undefined";
export function renderAttributesInput<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
	state: Field.StoreObject<S, O>,
) {
	const { key, store, setup } = basic;
	const ssr = setup.ssr;
	const id = `${state?.element?.label ?? setup.label}-${ssr ? "server" : "client"}`;

	// console.log("key field :: ", key, " :: ", ssr);
	const attrs = {
		key: `${key}-${ssr ? "server" : "client"}`,
		id,
		type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__internal.key,
		multiple: state?.element.multiple,
		required: state?.element.required,
		disabled: state?.element.disabled,
		placeholder: state?.element.placeholder ?? "",
		autoComplete: "off",
		onFocus: (event: FocusEvent) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			//
			const next = { ...store.get() };
			next.element.focused = true;
			next.element.visited = true;
			next.__internal.manual = false;
			//
			next.event.DOM = FIELD.DOM.FOCUS;
			next.event.MUTATE = FIELD.MUTATE.IDLE;
			next.event.ev = {
				value: (event.target as any).value,
				checked: (event.target as any).checked,
				files: (event.target as any).files,
			};

			store.set(next);
		},
		onBlur: (event: Event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			const next = { ...store.get() };
			next.element.focused = false;
			next.element.visited = true;
			next.__internal.manual = false;
			//
			next.event.DOM = FIELD.DOM.BLUR;
			next.event.MUTATE = FIELD.MUTATE.IDLE;
			next.event.ev = undefined;
			store.set(next);
		},
		[state.element.validateOn === "change" ? "onChange" : "onInput"]: (event: Event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			const next = { ...store.get() };
			if (next.element.disabled) {
				return;
			}
			next.__internal.manual = false;
			//
			next.event.DOM = FIELD.DOM.IDLE; // questionable?
			next.event.MUTATE = FIELD.MUTATE.VALUE;
			const value = (event.target as any).value;
			next.event.ev = {
				value: value === "" ? undefined : value,
				checked: (event.target as any).checked,
				files: (event.target as any).files,
			};
			store.set(next);
		},
	};

	// check if value should be added to object
	if (setup.type === "checkbox") {
		// attrs.checked = (state.extras as any).checked ? true : false;
	} else {
		attrs.value = state?.value ?? "";
	}

	return processAttrs(basic, state, attrs, "input");
}
