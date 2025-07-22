import type { Fields, Options, Store } from "../_model";
import prepareAtom, { type FieldAtom } from "../preparations/field-atom";

export type Atoms<S extends Fields, O extends Options<S, any>> = {
	[K in keyof S]: FieldAtom<S[K], O>;
};
export default function prepareAtoms<F extends Fields, O extends Options<F, any>>(props: {
	fields: F;
	options: O;
	$store: Store<F, O>;
}) {
	const { fields, $store, options } = props;
	const atoms = {} as Atoms<F, O>;
	function getAtom<G extends keyof F>(key: G) {
		let atom = atoms[key];
		if (atom == null) {
			const field = fields[key];
			atom = prepareAtom({ key: key as string, field, options, $store });
			atoms[key] = atom;
		}
		return atom;
	}
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
