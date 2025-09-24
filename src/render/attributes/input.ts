import type { Field, Form, FunctionProps, Render } from "../../_model";

export type RenderAttributesInput<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
> = Render.Attributes.Factory<
	A extends "dom" ? Render.Attributes.BaseDom : Render.Attributes.BaseVdom
>;
export function renderAttributesInput<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(basic: FunctionProps.Field<S, O>, props: FunctionProps.RenderAttributes<S, O, A>) {
	const { options, store, setup } = basic;
	const { attrType: dType, reactive } = props;
	const state = reactive;
	const render = {
		type: state?.element.hidden ? "hidden" : setup.type,
		name: state.__key,
		multiple: state?.element.multiple,
	} as any;
	// check if value should be added to object
	const addValue = setup.type !== "checkbox" && setup.type !== "radio" && setup.type !== "file";
	if (addValue) {
		render.value = state?.value ?? "";
	}

	// event listener id
	let listenerId = undefined as string | undefined;
	if (state.element.validateOn === "change") {
		listenerId = dType !== "vdom" ? "onchange" : "onChange";
	} else {
		//if (setup.validateOn === "input") {
		listenerId = dType !== "vdom" ? "oninput" : "onInput";
	}
	render[listenerId] = (event: Event) => {
		event.preventDefault();
		store.set({
			...(state as any),
			__internal: {
				update: "value",
				manual: false,
				event,
			},
		});
	};

	// console.log("element input :: ", key, " :: ", result.value);
	return render as RenderAttributesInput<S, O, A>;
}
