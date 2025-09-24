import type { Field, Form, FunctionProps, Render } from "../_model";

export function renderProcessor<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(basic: FunctionProps.Field<S, O>, props: FunctionProps.RenderAttributes<S, O, A>, render: any) {
	const { key, setup, store, options } = basic;
	const { reactive, attrType } = props;
	const processProps = { key, reactive, render, store, isVdom: attrType === "vdom" };
	if (options?.onFieldElementOrder === "before") {
		options?.onFieldElement?.(processProps);
	}
	setup.onElement?.(processProps);
	if (options?.onFieldElementOrder === "after") {
		options?.onFieldElement?.(processProps);
	}
}
