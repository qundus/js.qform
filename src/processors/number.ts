import type { CreateProcessorProps, Field, Options } from "../_model";

export default function createNumberProcessor<F extends Field, O extends Options<any>>(
	_props: CreateProcessorProps<F, O>,
) {
	// const { field } = _props;
	return (value: any) => {
		let result = null as number;
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
