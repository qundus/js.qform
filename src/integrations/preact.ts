import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesBase } from "../render/attributes/base";
import { renderAttributesInput } from "../render/attributes/input";
import { processRenderAttributes } from "../render/processors/attributes";

export type IntegrationPreact<S extends Field.Setup, O extends Form.Options> = Integration.Factory<
	S,
	O,
	<D extends Render.Attributes.Type = "vdom">(props?: {
		attrType?: D;
	}) => Render.Element.Factory<S, O, D>
>;
export function preactIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationPreact<S, O> {
	const { key, setup, store, options } = basic;
	return {
		render: (props) => {
			// i chose this style because reactivity won't make any difference
			// if i placed it under individual sub-objects like select.option,
			// so field.render.<integration>.option is no different from
			// field.render.option.<integration>, it'll get rerendered anyway +
			// this way is much easier to handle with types and logic
			if (store.hooksUsed().preact == null) {
				throw new Error(
					"qform: preact hook does not exist, please add it to options.storeHooks option!",
				);
			}
			const reactive = store.hooksUsed().preact?.call();
			const attrType = props?.attrType ?? "vdom";
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
			processRenderAttributes(basic, { attrType, reactive }, result);

			return result;
		},
	};
}
