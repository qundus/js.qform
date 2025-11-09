import { isServerSide } from "@qundus/qstate/checks";
import type { Field, Form, FunctionProps, Render } from "../../_model";
import { FIELD } from "../../const";

// export const isServerSide = (): boolean =>
// 	typeof window === "undefined" || typeof document === "undefined";
export function renderAttributesInput<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(basic: FunctionProps.Field<S, O>, props: FunctionProps.RenderAttributes<S, O, A>, test?: true) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive;
	const ssr = setup.ssr;
	const id = `${state?.element?.label ?? setup.label}-${ssr ? "server" : "client"}`;

	// console.log("key field :: ", key, " :: ", ssr);

	const attrs = {
		key: `${key}-${ssr ? "server" : "client"}`,
		id,
		"data-hydrated": !ssr,
		type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__internal.key,
		multiple: state?.element.multiple,
		required: state?.element.required,
		disabled: state?.element.disabled,
		placeholder: state?.element.placeholder,
		[attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[attrType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
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
		[attrType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
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
	} as any;

	// check if value should be added to object
	if (setup.type === "checkbox") {
		// attrs.checked = (state.extras as any).checked ? true : false;
	} else {
		attrs.value = state?.value ?? "";
	}

	// type
	// event listener id
	let listenerId = undefined as string | undefined;
	if (state.element.validateOn === "change") {
		listenerId = attrType !== "vdom" ? "onchange" : "onChange";
	} else {
		listenerId = attrType !== "vdom" ? "oninput" : "onInput";
	}
	attrs[listenerId] = (event: Event) => {
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
	};

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "input" };
	options?.fieldsOnRender?.(processProps);
	setup.onRender?.(processProps);

	// mark rendered
	if (state.event.RENDER === FIELD.RENDER.INIT) {
		const next = { ...store.get() };
		next.event.RENDER = FIELD.RENDER.READY;
		next.event.MUTATE = FIELD.MUTATE.__RENDER;
		store.set(next);
	}

	// else if (ssr && state.event.RENDER === FIELD.RENDER.READY) {
	// 	// ssr
	// 	console.log("rendered field :: ", key, " :: ", state.element.disabled);
	// 	return {};
	// }

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Render.Attributes.Input<S, O, A>;
}
