import type { Extras } from "../../../../_model";
import { CALENDAR } from "../../../../const";

export default {
	init: (extras: Extras.Date.Out<any>): Extras.Date.Out<any>["DATE"] => {
		const result: Extras.Date.Out<any>["DATE"] = {} as any;
		//
		return result;
	},
	check: (extras: Extras.Date.Out<any>) => {
		//
		const activeMode = extras.mode.active;
		if (activeMode <= CALENDAR.MODE.DAY) {
			extras.DATE.cells = extras[extras.mode.activeName].cells as any;
		} else {
			extras.DATE.cells = null as any;
		}
	},
};
