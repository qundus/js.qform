import type { Field, Form, FunctionProps, Render } from "../../_model";
import { DOM, MUTATE } from "../../const";

export function renderAttributesOption<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A> & { optionValue: any },
) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive, optionValue: _optionValue } = props;
	const state = reactive; //as Field.StoreObject<Field.Setup<'select'>>;
	// prepare option value
	let optionValue = _optionValue;
	let name = "";
	if (optionValue === undefined) {
		optionValue = { label: "unknown", value: "unknown" };
	} else if (typeof optionValue === "string" || typeof optionValue === "number") {
		optionValue = { label: optionValue, value: optionValue };
	}
	// create option name
	try {
		name = state.__internal.key + "-" + String(typeof optionValue.value);
	} catch (e: any) {
		name = state.__internal.key + "-option";
	}

	//
	const attrs = {
		name, // affects target ability to detect onblur, edit with care
		id: state?.element?.label ?? setup.label,
		// type: state?.element.hidden ? "hidden" : setup.type,
		// multiple: state?.element.multiple,
		// required: state?.element.required,
		// disabled: state?.element.disabled,
		// [attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		[attrType !== "vdom" ? "onclick" : "onClick"]: (event: PointerEvent) => {
			event.preventDefault();
			const next = { ...store.get() };
			if (next.element.disabled) {
				return;
			}
			const valueKey = state.element.select?.valueKey ?? "value";
			// dynamic check
			if (setup.type === "select" && next.element.select?.dynamic) {
				next.element.select.valueKey = next.element.select.valueKey ?? "value";
				next.element.select.labelKey = next.element.select.valueKey ?? "label";
				if (next.element.select.options == null) {
					next.element.select.options = [];
				}
				const item = next.element.select?.options?.find(
					(item) => item[valueKey] === optionValue[valueKey],
				);
				if (item == null) {
					next.element.select?.options?.push(optionValue);
				}
			}
			//
			if (Array.isArray(next.value)) {
				const item = next.value.find((item) => item[valueKey] === optionValue[valueKey]);
				if (item == null) {
					next.value.push(optionValue);
				} else {
					next.value = (next.value as any[]).filter(
						(item) => item[valueKey] !== optionValue[valueKey],
					);
				}
			} else if (next.value == null) {
				next.value = next.element.multiple ? [optionValue] : optionValue;
			} else {
				next.value = next.value[valueKey] === optionValue[valueKey] ? undefined : optionValue;
			}

			next.__internal.manual = false;
			//
			next.event.DOM = event.pointerType === "touch" ? DOM.TOUCH_OPTION : DOM.CLICK_OPTION;
			next.event.MUTATE = MUTATE.VALUE;
			next.event.ev = event;
			store.set(next);
		},
	} as any;

	//

	// process trigger
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "option" };
	if (options?.onFieldElementOrder === "before") {
		options?.onFieldRender?.(processProps);
	}
	setup.onRender?.(processProps);
	if (options?.onFieldElementOrder === "after") {
		options?.onFieldRender?.(processProps);
	}

	return attrs as Render.Attributes.Option<S, O, A>;
}
