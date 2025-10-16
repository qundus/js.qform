import type { Field, Form, FunctionProps, Render } from "../../_model";
import { FIELD } from "../../const";

export function renderAttributesSelectTrigger<
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
		name: state.__internal.key,
		// multiple: state?.element.multiple,
		// required: state?.element.required,
		// disabled: state?.element.disabled,
		// [attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[attrType !== "vdom" ? "onclick" : "onClick"]: function onclick(event: PointerEvent) {
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
	} as any;

	// process trigger
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "trigger" };

	options?.fieldsOnRender?.(processProps);
	setup.onRender?.(processProps);

	// mark rendered
	if (state.event.RENDER === FIELD.RENDER.INIT) {
		const next = { ...store.get() };
		next.event.RENDER = FIELD.RENDER.READY;
		next.event.MUTATE = FIELD.MUTATE.__RENDER;
		store.set(next);
	}
	return attrs as Render.Attributes.SelectTrigger<S, O, A>;
}
