import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesTrigger } from "../render/attributes/trigger";
import { renderAttributesOption } from "../render/attributes/option";
import { renderAttributesDate } from "../render/attributes/date";

export type IntegrationRef<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"REF",
	{
		input: (ref: any) => void;
		date: (ref: any) => void;
		select: {
			trigger: (ref: any) => void;
			option: (ref: any, option: any) => void;
		};
	}
>;
export function refIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationRef<S, O> {
	const { key, setup, store, options } = basic;
	// check user process
	let result = undefined as any;
	if (setup.type === "select" || setup.type === "select.radio") {
		result = {
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
		} as any;
	} else if (setup.type === "date") {
		result = (ref) => {
			if (ref == null || ref.name === key) {
				return;
			}
			const reactive = store.get();
			const attrType = "dom";
			const attrs = renderAttributesDate(basic, { attrType, reactive }) as any;
			for (const k in attrs) {
				ref[k] = attrs[k];
			}
		};
	} else {
		result = (ref) => {
			if (ref == null || ref.name === key) {
				return;
			}
			const reactive = store.get();
			const attrType = "dom";
			const attrs = renderAttributesInput(basic, { attrType, reactive }) as any;
			for (const k in attrs) {
				ref[k] = attrs[k];
			}
		};
	}

	result.__integrationFor = "REF";
	result.__integrationName = "REF-RENDER";
	return result;
}
