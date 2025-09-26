import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesTrigger } from "../render/attributes/trigger";
import { renderAttributesOption } from "../render/attributes/option";

export type IntegrationRef<S extends Field.Setup, O extends Form.Options> = Integration.Factory<
	S,
	O,
	{
		render: {
			input: (ref: any) => void;
			select: {
				trigger: (ref: any) => void;
				option: (ref: any, value: any) => void;
			};
			radio: {
				option: (ref: any, value: any) => void;
			};
		};
	}
>;
export function refIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationRef<S, O> {
	const { key, setup, store, options } = basic;
	// check user process

	return {
		// you can setup this integration through getters
		render: {
			input: (ref) => {
				if (ref == null || ref.name === key) {
					return;
				}
				const reactive = store.get();
				const attrType = "dom";
				const attrs = renderAttributesInput(basic, { attrType, reactive }) as any;
				for (const k in attrs) {
					ref[k] = attrs[k];
				}
			},
			select: {
				trigger: (ref) => {
					if (ref == null || ref.name === key) {
						return;
					}
					const reactive = store.get();
					const attrType = "dom";
					const attrs = renderAttributesTrigger(basic, { attrType, reactive }) as any;
					for (const k in attrs) {
						ref[k] = attrs[k];
					}
				},
				option: (ref, value) => {
					const reactive = store.get();
					const attrType = "dom";
					const attrs = renderAttributesOption(basic, {
						attrType,
						reactive,
						optionValue: value,
					}) as any;
					for (const k in attrs) {
						ref[k] = attrs[k];
					}
				},
			},
			radio: {
				option: (ref, value) => {
					const reactive = store.get();
					const attrType = "dom";
					const attrs = renderAttributesOption(basic, {
						attrType,
						reactive,
						optionValue: value,
					}) as any;
					for (const k in attrs) {
						ref[k] = attrs[k];
					}
				},
			},
		},
	};
}
