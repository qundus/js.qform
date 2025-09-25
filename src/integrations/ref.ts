import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesBase } from "../render/attributes/base";
import { renderAttributesInput } from "../render/attributes/input";
import { processRenderAttributes } from "../render/processors/attributes";

export type IntegrationRef<S extends Field.Setup, O extends Form.Options> = Integration.Factory<
	S,
	O,
	(ref: any) => S["type"] extends "select" | "radio" ? Render.Element.Factory<S, O, "dom"> : void
>;
export function refIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationRef<S, O> {
	const { key, setup, store, options } = basic;
	// check user process

	return {
		render: (ref) => {
			// i chose this style because reactivity won't make any difference
			// if i placed it under individual sub-objects like select.option,
			// so field.render.<integration>.option is no different from
			// field.render.option.<integration>, it'll get rerendered anyway +
			//
			// keep type as any to avoid unnecessary type issues
			// initialization only
			if (ref == null || ref.name === key) {
				return;
			}
			const reactive = store.get();
			const attrType = "dom";
			let result = {} as any;

			if (setup.type === "select") {
				// result =
			} else if (setup.type === "radio") {
				//
			} else {
				result = renderAttributesInput(basic, { attrType, reactive });
			}

			// process render element
			processRenderAttributes(basic, { attrType, reactive }, result);

			// run
			if (setup.type === "select") {
				//
			} else if (setup.type === "radio") {
				//
			} else {
				for (const k in result) {
					ref[k] = result[k];
				}
			}

			return result;
		},
	};
}
