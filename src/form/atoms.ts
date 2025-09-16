import { onMount } from "@qundus/qstate";
import type { Form } from "../_model";
import { fieldAtom } from "../field/atom";

export function formAtoms<F extends Form.Fields, O extends Form.Options<F>>(
	fields: F,
	options: O,
	$store: Form.Store<F, O>,
) {
	let atoms = {} as Form.Atoms<F, O>;
	function getAtom<G extends keyof F>(key: G) {
		let atom = atoms[key];
		if (atom == null) {
			const field = fields[key];
			atom = fieldAtom({ key: key as string, field, options, $store });
			atoms[key] = atom;
		}
		return atom;
	}
	// reset onunmount
	onMount($store, () => {
		return () => {
			atoms = {} as Form.Atoms<F, O>;
		};
	});
	return {
		get atoms() {
			return <G extends keyof F>(key: G) => {
				return getAtom(key);
			};
		},
		get elements() {
			return <G extends keyof F>(key: G) => {
				return getAtom(key).element;
			};
		},
	};
}
