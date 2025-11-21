import type { Field, Form, FunctionProps } from "../../../_model";
import { FIELD } from "../../../const";
import { vdomToDomAttributes } from "./vdom-to-dom";

export function processAttrs<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
	state: Field.StoreObject<S, O>,
	vdom: any, // control the type from _model is enough
	attrFor: "input" | "trigger" | "option",
) {
	// process input
	type PP = Parameters<Field.OnAttrs<Field.Type>>[0];
	const props: PP = { state, key: basic.key, attrs: vdom, attrFor };

	// run user event
	basic.options?.fieldsOnAttrs?.(props);
	basic.setup?.onAttrs?.(props);

	// create dom attributes
	const dom = vdomToDomAttributes(vdom);

	// define ref if user didn't
	// if (vdom.ref == null) {
	// 	vdom.ref = ;
	// 	dom.ref = vdom.ref;
	// }

	// check for render state
	// mark rendered and initialize element search and mount onto picker instance
	if (state.event.ATTRIBUTE === FIELD.ATTRIBUTE.INIT) {
		const next = { ...state };
		next.event.ATTRIBUTE = FIELD.ATTRIBUTE.READY;
		next.event.MUTATE = FIELD.MUTATE.__ATTRIBUTE;
		basic.store.set(next as any);
	}

	return { vdom, dom, ref: makeDomRef(basic.key, dom) };
}

export function makeDomRef(key: string, attrs: any) {
	return (ref: any) => {
		if (ref == null || ref.name === key) {
			return;
		}
		for (const k in attrs) {
			if (k === "ref") {
				continue;
			}
			ref[k] = attrs[k];
		}
	};
}
