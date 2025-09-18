import type { Field, Form } from "../../_model";

export function mountCycle<S extends Field.Setup, O extends Form.Options<any>>(
	key: string,
	setup: S,
	options: O | undefined,
	$global: Form.StoreObject<Form.Fields<any>> | undefined,
	state: Field.Store<S, O>,
) {
	// do startup checks for input types like file
	//
}
