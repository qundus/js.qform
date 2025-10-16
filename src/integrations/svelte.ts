import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
//
import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";
//

export type IntegrationSvelte<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"SOLID",
	{
		input: { input: Render.Attributes.Input<S, O, "dom"> };
		select: {
			trigger: Render.Attributes.SelectTrigger<S, O, "dom">;
			option: (option: any) => Render.Attributes.SelectOption<S, O, "dom">;
		};
		date: any; //{ input: Render.Attributes.Input<S, O, "dom"> };
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
				return renderAttributesSelectTrigger(basic, { attrType, reactive }) as any;
			},
			get option() {
				const reactive = store.get();
				const attrType = "dom";
				return (value: any) => {
					return renderAttributesSelectOption(basic, {
						attrType,
						reactive,
						optionValue: value,
					}) as any;
				};
			},
		} as any;
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
