import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesTrigger } from "../render/attributes/trigger";
import { renderAttributesOption } from "../render/attributes/option";

export type IntegrationDom<S extends Field.Setup, O extends Form.Options> = Integration.Factory<
	S,
	O,
	{
		render: {
			input: <D extends Render.Attributes.Type = "dom">(props?: {
				attrType?: D;
			}) => Render.Attributes.Input<S, O, D>;
			select: {
				trigger: <D extends Render.Attributes.Type = "dom">(props?: {
					attrType?: D;
				}) => Render.Attributes.Trigger<S, O, D>;
				option: <D extends Render.Attributes.Type = "dom">(
					value: any,
					props?: { attrType?: D },
				) => Render.Attributes.Option<S, O, D>;
			};
			radio: {
				option: <D extends Render.Attributes.Type = "dom">(
					value: any,
					props?: { attrType?: D },
				) => Render.Attributes.Option<S, O, D>;
			};
		};
	}
>;
export function domIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationDom<S, O> {
	const { key, setup, store, options } = basic;
	// check user process

	return {
		// you can setup this integration through getters
		render: {
			input: (props) => {
				const reactive = store.get();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesInput(basic, { attrType, reactive }) as any;
			},
			select: {
				trigger: (props) => {
					const reactive = store.get();
					const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
					return renderAttributesTrigger(basic, { attrType, reactive }) as any;
				},
				option: (value, props) => {
					const reactive = store.get();
					const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
					return renderAttributesOption(basic, { attrType, reactive, optionValue: value }) as any;
				},
			},
			radio: {
				option: (value, props) => {
					const reactive = store.get();
					const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
					return renderAttributesOption(basic, { attrType, reactive, optionValue: value }) as any;
				},
			},
		},
	};
}
