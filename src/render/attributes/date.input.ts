import type { Extras, Field, Form, FunctionProps, Render } from "../../_model";
import { FIELD } from "../../const";

export function renderAttributesDateInput<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(basic: FunctionProps.Field<S, O>, props: FunctionProps.RenderAttributes<S, O, A>) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive as unknown as Field.StoreObject<Field.Setup<"date">>;
	const attrs = {
		// "data-qform-const": `${setup.type}.${setup.label}`,
		id: state?.element?.label ?? setup.label,
		// type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__internal.key,
		multiple: state?.element.multiple,
		required: state?.element.required,
		disabled: state?.element.disabled,
		placeholder: state?.element.placeholder ?? state.extras.format,
		value: state.value ?? "",
		[attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[attrType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();

			// special date handling of blur
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
			}, 100);

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
		// [attrType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
		// 	event.preventDefault();
		// 	event.stopImmediatePropagation();
		// 	event.stopPropagation();
		// 	const next = { ...store.get() };
		// 	next.element.focused = false;
		// 	next.element.visited = true;
		// 	next.__internal.manual = false;
		// 	//
		// 	next.event.DOM = FIELD.DOM.BLUR;
		// 	next.event.MUTATE = FIELD.MUTATE.IDLE;
		// 	next.event.ev = undefined;
		// 	store.set(next);
		// },
		[attrType !== "vdom" ? "oninput" : "onInput"]: (event: Event) => {
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
	} as any;

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "input" };
	options?.fieldsOnRender?.(processProps);
	setup.onRender?.(processProps);

	// mark rendered and initialize element search and mount onto picker instance
	if (state.event.RENDER === FIELD.RENDER.INIT) {
		const next = { ...store.get() };
		next.event.RENDER = FIELD.RENDER.READY;
		next.event.MUTATE = FIELD.MUTATE.__RENDER;
		store.set(next);

		// search for dom element only on the client side
		// if (!isServerSide()) {
		// 	(async () => {
		// 		let element = null as null | HTMLInputElement;
		// 		while (element == null) {
		// 			element = document.querySelector(`[data-qform-const="${setup.type}.${setup.label}"]`);
		// 		}
		// 		// const next = { ...store.get() } as Field.StoreObject<Field.Setup<"date">>;
		// 		if (state.extras == null || state.extras.instance == null) {
		// 			throw new Error(
		// 				"qform: date extras.instance is null, please intilize it in date value processor!",
		// 			);
		// 		}
		// 		state.extras.instance.attachTo(element);
		// 		// store.set(next as any);
		// 	})();
		// }
	}

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Render.Attributes.DateInput<S, O, A>;
}
