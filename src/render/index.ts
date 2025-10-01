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
	return {
		dom: domIntegration(props),
		ref: refIntegration(props),
		preact: preactIntegration(props),
		react: reactIntegration(props),
		solid: solidIntegration(props),
		svelte: svelteIntegration(props),
	};
}
