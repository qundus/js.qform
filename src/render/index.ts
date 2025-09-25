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
	return {
		dom: domIntegration(props).render,
		ref: refIntegration(props).render,
		preact: preactIntegration(props).render,
		react: reactIntegration(props).render,
		solid: solidIntegration(props).render,
		svelte: svelteIntegration(props).render,
	} as any;
}
