import type { Fields, FormStore, Options } from "../_model";
import prepareAtom, { type FieldAtom } from "../preparations/field-atom";

export type Atoms<S extends Fields, O extends Options<S>> = {
	[K in keyof S]: FieldAtom<S[K], O>;
};
export type AtomsPrepared<S extends Fields, O extends Options<S>> = ReturnType<
	typeof prepareFormAtoms<S, O>
>;
export default function prepareFormAtoms<F extends Fields, O extends Options<F>>(props: {
	fields: F;
	options: O;
	$store: FormStore<F, O>;
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
