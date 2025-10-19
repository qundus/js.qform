import type { Extras, Field, Form, FunctionProps, Render } from "../../_model";
import { type CALENDAR, FIELD } from "../../const";

export type DateAttributeOptions = { [K in keyof typeof CALENDAR.OPTIONS]?: Extras.Date.Option };
export function renderAttributesDateOption<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A>,
	_option: Extras.Date.Option | DateAttributeOptions,
) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive as unknown as Field.StoreObject<Field.Setup<"date">>;
	const option = "typeName" in _option ? { [_option.typeName]: _option } : _option;
	if (option === null) throw new Error("qform: unknown date option :: " + _option);
	const id = (state?.element?.label ?? setup.label) + ".option.id";
	const name = state.__internal.key + ".option";
	const attrs = {
		id,
		name,
		[attrType !== "vdom" ? "onclick" : "onClick"]: function onclick(event: PointerEvent) {
			event.preventDefault();
			const next = { ...store.get() } as Field.StoreObject<Field.Setup<"date">>;
			let update = false;
			let nextPeriod = next.extras.now.period;
			if (option.TIME_PERIOD != null) {
				nextPeriod = option.TIME_PERIOD.value;
			}

			//
			if (nextPeriod !== next.extras.now.period) {
				update = true;
			}

			if (!update) {
				return;
			}
			// const pointer = event.pointerType as "mouse" | "touch";
			next.extras.now.period = nextPeriod;
			next.event.DOM = FIELD.DOM.CLICK_DATE_OPTION;
			next.event.MUTATE = FIELD.MUTATE.__EXTRAS;
			store.set(next as any);
		},
	} as any;

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "option" };
	options?.fieldsOnRender?.(processProps);
	setup.onRender?.(processProps);

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Render.Attributes.DateOption<S, O, A>;
}
