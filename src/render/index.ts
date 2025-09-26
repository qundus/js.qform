import type { Field, Form, FunctionProps } from "../_model";
import { domIntegration } from "../integrations/dom";
import { refIntegration } from "../integrations/ref";
import { preactIntegration } from "../integrations/preact";
import { reactIntegration } from "../integrations/react";
import { solidIntegration } from "../integrations/solid";
import { svelteIntegration } from "../integrations/svelte";

export function createRender<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
) {
	const { setup } = props;
	const integrations = {
		dom: domIntegration(props),
		ref: refIntegration(props),
		preact: preactIntegration(props),
		react: reactIntegration(props),
		solid: solidIntegration(props),
		svelte: svelteIntegration(props),
	};
	const render = {};
	for (const key in integrations) {
		if (setup.type === "select") {
			render[key] = integrations[key].render.select;
		} else if (setup.type === "radio") {
			render[key] = integrations[key].render.radio;
		} else {
			render[key] = integrations[key].render.input;
		}
	}
	return render as any;
}
