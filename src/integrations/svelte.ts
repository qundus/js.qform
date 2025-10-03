import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesTrigger } from "../render/attributes/trigger";
import { renderAttributesOption } from "../render/attributes/option";
import { renderAttributesDate } from "../render/attributes/date";

export type IntegrationSvelte<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"SOLID",
	{
		input: { input: Render.Attributes.Input<S, O, "dom"> };
		date: { date: Render.Attributes.Input<S, O, "dom"> };
		select: {
			trigger: Render.Attributes.Trigger<S, O, "dom">;
			option: (option: any) => Render.Attributes.Option<S, O, "dom">;
		};
	}
>;
export function svelteIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationSvelte<S, O> {
	const { key, setup, store, options } = basic;
	// check user process

	let result = undefined as any;
	if (setup.type === "select" || setup.type === "select.radio") {
		result = {
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
		} as any;
	} else if (setup.type === "date") {
		result = {
			get input() {
				const reactive = store.get();
				const attrType = "dom";
				return renderAttributesDate(basic, { attrType, reactive }) as any;
			},
		};
	} else {
		result = {
			get input() {
				const reactive = store.get();
				const attrType = "dom";
				return renderAttributesInput(basic, { attrType, reactive }) as any;
			},
		};
	}

	result.__integrationFor = "SVELTE";
	result.__integrationName = "SVELTE-RENDER";
	return result;
}
