import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesBase } from "../render/attributes/base";
import { renderAttributesInput } from "../render/attributes/input";
import { renderProcessor } from "../render/processor";

export type IntegrationDom<S extends Field.Setup, O extends Form.Options> = Integration.Factory<
	S,
	O,
	"dom",
	<D extends Render.Attributes.Type>(props?: {
		attrType?: D;
	}) => Render.Element.Factory<S, O, "dom">
>;
export function domIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationDom<S, O> {
	const { key, setup, store, options } = basic;
	// check user process

	return {
		render: (props) => {
			// i chose this style because reactivity won't make any difference
			// if i placed it under individual sub-objects like select.option,
			// so field.render.<integration>.option is no different from
			// field.render.option.<integration>, it'll get rerendered anyway +
			// this way is much easier to handle with types and logic
			const reactive = store.get();
			// const state = typeof reactive === "function" ? reactive() : reactive;
			const attrType = props?.attrType ?? "dom";
			let result = {} as any;
			if (setup.type === "select") {
				// result =
			} else if (setup.type === "radio") {
				//
			} else {
				const base = renderAttributesBase(basic, { attrType, reactive });
				const input = renderAttributesInput(basic, { attrType, reactive });
				result = { ...base, ...input };
			}

			// process render element
			renderProcessor(basic, { attrType, reactive }, result);

			return result;
		},
	};
}
