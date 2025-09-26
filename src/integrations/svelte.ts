import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesTrigger } from "../render/attributes/trigger";
import { renderAttributesOption } from "../render/attributes/option";

export type IntegrationSvelte<S extends Field.Setup, O extends Form.Options> = Integration.Factory<
	S,
	O,
	{
		render: {
			input: Render.Attributes.Input<S, O, "dom">;
			select: {
				trigger: Render.Attributes.Trigger<S, O, "dom">;
				option: (value: any) => Render.Attributes.Option<S, O, "dom">;
			};
			radio: {
				option: (value: any) => Render.Attributes.Option<S, O, "dom">;
			};
		};
	}
>;
export function svelteIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationSvelte<S, O> {
	const { key, setup, store, options } = basic;
	// check user process

	return {
		render: {
			get input() {
				const reactive = store.get();
				const attrType = "dom";
				return renderAttributesInput(basic, { attrType, reactive }) as any;
			},
			select: {
				get trigger() {
					const reactive = store.get();
					const attrType = "dom";
					return renderAttributesTrigger(basic, { attrType, reactive }) as any;
				},
				get option() {
					const reactive = store.get();
					const attrType = "dom";
					return (value: any) => {
						return renderAttributesOption(basic, {
							attrType,
							reactive,
							optionValue: value,
						}) as any;
					};
				},
			},
			radio: {
				get option() {
					const reactive = store.get();
					const attrType = "dom";
					return (value: any) => {
						return renderAttributesOption(basic, {
							attrType,
							reactive,
							optionValue: value,
						}) as any;
					};
				},
			},
		},
	};
}
