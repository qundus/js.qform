import type { Field, Form, FunctionProps, Render } from "../../_model";
import { Extras } from "../../_model";
import { FIELD } from "../../const";
import { goToMode } from "../helpers/date/mode";

export type DateHeaderElement = "nav.next" | "nav.prev" | "month" | "year";
export function renderAttributesDateHeader<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A>,
	_element: DateHeaderElement,
) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive as unknown as Field.StoreObject<Field.Setup<"date">>;
	const element = _element ?? "";
	const id = (state?.element?.label ?? setup.label) + ".header." + element + ".id";
	const name = state.__internal.key + "header." + element;
	const attrs = {
		id,
		name,
		[attrType !== "vdom" ? "onclick" : "onClick"]: function onclick(event: PointerEvent) {
			event.preventDefault();
			const next = { ...store.get() } as Field.StoreObject<Field.Setup<"date">>;
			let update = false;
			let nextMode = next.extras.mode;
			if (element === "month") {
				nextMode = goToMode(Extras.Date.Mode.MONTH, next.extras);
			} else if (element === "year") {
				nextMode = goToMode(Extras.Date.Mode.YEAR, next.extras);
			}

			//
			if (nextMode.active !== next.extras.mode.active) {
				update = true;
			}

			if (!update) {
				return;
			}
			//
			const pointer = event.pointerType as "mouse" | "touch";
			next.extras.mode = nextMode;
			next.event.DOM = FIELD.DOM.CLICK_DATE_HEADER;
			next.event.MUTATE = FIELD.MUTATE.__EXTRAS;
			store.set(next as any);
		},
	} as any;

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "input" };
	options?.fieldsOnRender?.(processProps);
	setup.onRender?.(processProps);

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Render.Attributes.DateHeader<S, O, A>;
}
