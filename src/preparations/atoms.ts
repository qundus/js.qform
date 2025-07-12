import type { Atoms, Basics, Fields, Options, State } from "../_model";
import prepareAtom from "../preparations/atom";

export default function prepareAtoms<F extends Fields>(props: {
	fields: F;
	options: Options<F>;
	$state: State<F>;
}) {
	const { fields, $state, options } = props;
	const atoms = {} as Atoms<F>;
	function getAtom<G extends keyof F>(key: G) {
		let atom = atoms[key];
		if (atom == null) {
			const field = fields[key];
			atom = prepareAtom({ key: key as string, field, options, $state });
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
			return <G extends keyof F>(key: keyof F) => {
				return getAtom(key).element;
			};
		},
	};
}
