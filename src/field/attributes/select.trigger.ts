import type { Field, Form, FunctionProps, Attributes } from "../../_model";
import { FIELD } from "../../const";
import { processAttrs } from "../processors/attributes";

export function renderAttributesSelectTrigger<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
	state: Field.StoreObject<S, O>,
) {
	const { key, options, store, setup } = basic;
	const attrs = {
		id: state?.element?.label ?? setup.label,
		// type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__internal.key,
		// multiple: state?.element.multiple,
		// required: state?.element.required,
		// disabled: state?.element.disabled,
		// [attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		onClick: function onclick(event: PointerEvent) {
			event.preventDefault();
			const next = { ...store.get() };
			if (next.element.disabled) {
				return;
			}
			// detect if first time click
			if (!next.element.focused) {
				const element = event.target as HTMLElement;
				setTimeout(() => {
					// Attach click listener to document
					document.addEventListener("click", function outsideClick(e) {
						const target = e.target as HTMLElement;
						const name = target?.getAttribute("name");
						if (!element.contains(target)) {
							if (name && name.startsWith(state.__internal.key)) {
								return;
							}
							// Remove the listener after detecting outside click
							document.removeEventListener("click", outsideClick);
							const next = { ...store.get() };
							next.element.focused = false;
							next.element.visited = true;
							next.__internal.manual = false;
							//
							next.event.DOM = FIELD.DOM.BLUR;
							next.event.MUTATE = FIELD.MUTATE.IDLE;
							next.event.ev = undefined;
							store.set(next);
						}
					});
				}, 0);
			}
			//
			const pointer = event.pointerType as "mouse" | "touch";
			next.element.focused = true;
			next.element.visited = true;
			next.__internal.manual = false;
			//
			// const ischildclick = event.target !== event.currentTarget;
			// console.log("is child click :: ", ischildclick);
			next.event.DOM = FIELD.DOM.CLICK;
			next.event.MUTATE = FIELD.MUTATE.IDLE;
			next.event.ev = {
				value: (event.target as any).value,
				// checked: event.target.value,
			};
			store.set(next);
		},
	};

	return processAttrs(basic, state, attrs, "trigger");
}
