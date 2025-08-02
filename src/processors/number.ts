import type { ProcessorProps, Field, Options } from "../_model";

export default function createNumberProcessor<F extends Field, O extends Options<any>>(
	_props: ProcessorProps<F, O>,
) {
	// const { field } = _props;
	return (value: any) => {
		let result = null as number | null;
		try {
			result = Number(value);
			if (Number.isNaN(result)) {
				result = value;
			}
		} catch (e) {
			result = value;
		}
		return result;
	};
}
