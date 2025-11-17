import type { Extras, Field, Form, FunctionProps, Attributes } from "../../_model";
import { derive } from "@qundus/qstate";
import { renderAttributesInput } from "./input";

import { renderAttributesSelectTrigger } from "./select.trigger";
import { renderAttributesSelectOption } from "./select.option";
//
import { type CALENDAR, FIELD } from "../../const";
import { renderAttributesDateInput } from "./date.input";
import { renderAttributesDateEvent } from "./date.event";
import { renderAttributesDateCell, type DateAttributeCells } from "./date.cell";
import { renderAttributesDateOption } from "./date.option";

//
export function createAttributes<
	S extends Field.Setup,
	O extends Form.Options,
	D extends Attributes.Objects.Type = "vdom",
>(basic: FunctionProps.Field<S, O>, _attrType: D) {
	const { key, setup, store } = basic;
	const attrType = _attrType ?? "vdom";
	const derived = derive(store, (reactive) => {
		if (setup.type === "select" || setup.type === "select.radio") {
			return {
				get trigger() {
					const attrs = renderAttributesSelectTrigger(basic, { attrType, reactive }) as any;
					return processAttrs(basic, { key, attrs, attrType, data: reactive, attrFor: "trigger" });
				},
				get option() {
					return (option: any) => {
						const attrs = renderAttributesSelectOption(basic, {
							attrType,
							reactive,
							optionValue: option,
						}) as any;
						return processAttrs(basic, { key, attrs, attrType, data: reactive, attrFor: "option" });
					};
				},
			};
		} else if (setup.type === "date") {
			return {
				get input() {
					const attrs = renderAttributesDateInput(basic, { attrType, reactive }) as any;
					return processAttrs(basic, { key, attrs, attrType, data: reactive, attrFor: "input" });
				},
				get event() {
					return (event: CALENDAR.EVENTS | keyof typeof CALENDAR.EVENTS) => {
						const attrs = renderAttributesDateEvent(basic, { attrType, reactive }, event) as any;
						return processAttrs(basic, { key, attrs, attrType, data: reactive, attrFor: "option" });
					};
				},
				get cell() {
					return (items: Extras.Date.CellDate | Extras.Date.CellTime | DateAttributeCells) => {
						const attrs = renderAttributesDateCell(basic, { attrType, reactive }, items) as any;
						return processAttrs(basic, { key, attrs, attrType, data: reactive, attrFor: "option" });
					};
				},
				get option() {
					return (option: Extras.Date.Option) => {
						const attrs = renderAttributesDateOption(basic, { attrType, reactive }, option) as any;
						return processAttrs(basic, { key, attrs, attrType, data: reactive, attrFor: "option" });
					};
				},
			};
		}

		const attrs = renderAttributesInput(basic, { attrType, reactive }) as any;
		return processAttrs(basic, { key, attrs, attrType, data: reactive, attrFor: "input" });
	});

	return derived;
}

function processAttrs<
	S extends Field.Setup,
	O extends Form.Options,
	D extends Attributes.Objects.Type = "vdom",
>(basic: FunctionProps.Field<S, O>, props: Parameters<Field.OnRender<Field.Type>>[0]) {
	// process input
	// type PP = Parameters<Field.OnRender<Field.Type>>[0];
	// const processProps: PP = { key, data: state, attrType, attrs, attrFor: "option" };

	// add ref
	props.attrs.ref = makeRef(basic.key, props.attrs, props.attrType);

	// run user event
	basic.options?.fieldsOnRender?.(props);
	basic.setup.onRender?.(props);

	// check for render state
	// mark rendered and initialize element search and mount onto picker instance
	if (props.data.event.ATTRIBUTE === FIELD.ATTRIBUTE.INIT) {
		const next = { ...props.data };
		next.event.ATTRIBUTE = FIELD.ATTRIBUTE.READY;
		next.event.MUTATE = FIELD.MUTATE.__ATTRIBUTE;
		basic.store.set(next as any);
	}

	return props.attrs;
}

export function makeRef(key: string, attrs: any, attrType: any) {
	return (ref: any) => {
		if (ref == null || ref.name === key) {
			return;
		}
		for (const k in attrs) {
			if (k === "ref") {
				continue;
			}
			const finalKey = attrType === "vdom" ? k.toLowerCase() : k;
			ref[finalKey] = attrs[k];
		}
	};
}
