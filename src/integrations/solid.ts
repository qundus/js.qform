import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesTrigger } from "../render/attributes/trigger";
import { renderAttributesOption } from "../render/attributes/option";

export type IntegrationSolid<S extends Field.Setup, O extends Form.Options> = Integration.Factory<
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
export function solidIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationSolid<S, O> {
	const { key, setup, store, options } = basic;
	// check user process

	return {
		render: {
			input: (props) => {
				if (store.hooksUsed().preact == null) {
					throw new Error(
						"qform: solid hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().preact?.call();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesInput(basic, { attrType, reactive }) as any;
			},
			select: {
				trigger: (props) => {
					if (store.hooksUsed().preact == null) {
						throw new Error(
							"qform: solid hook does not exist, please add it to options.storeHooks option!",
						);
					}
					const reactive = store.hooksUsed().preact?.call();
					const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
					return renderAttributesTrigger(basic, { attrType, reactive }) as any;
				},
				option: (value, props) => {
					if (store.hooksUsed().preact == null) {
						throw new Error(
							"qform: solid hook does not exist, please add it to options.storeHooks option!",
						);
					}
					const reactive = store.hooksUsed().preact?.call();
					const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
					return renderAttributesOption(basic, { attrType, reactive, optionValue: value }) as any;
				},
			},
			radio: {
				option: (value, props) => {
					if (store.hooksUsed().preact == null) {
						throw new Error(
							"qform: solid hook does not exist, please add it to options.storeHooks option!",
						);
					}
					const reactive = store.hooksUsed().preact?.call();
					const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
					return renderAttributesOption(basic, { attrType, reactive, optionValue: value }) as any;
				},
			},
		},
	};
}
