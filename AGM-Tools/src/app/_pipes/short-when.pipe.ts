import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform, Inject, LOCALE_ID } from "@angular/core";

import * as isToday from "date-fns/is_today";
import * as isYesterday from "date-fns/is_yesterday";
import * as parse from "date-fns/parse";

@Pipe({
    name: "shortWhen",
    pure: true
})
export class ShortWhenPipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) private _locale: string) {}

    transform(value: number | string | Date): string {
        const datePipe = new DatePipe("de-DE");
        const parsedDate = parse(value);

        if (isToday(parsedDate)) {
            return datePipe.transform(parsedDate, "HH:mm");
        }

        if (isYesterday(parsedDate)) {
            return "Gestern";
        }

        return datePipe.transform(parsedDate, "dd.MM.yyyy");
    }
}
