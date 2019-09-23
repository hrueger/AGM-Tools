import { DatePipe } from "@angular/common";
import { Inject, LOCALE_ID, Pipe, PipeTransform } from "@angular/core";

import { isToday, isYesterday, parse } from "date-fns";

@Pipe({
    name: "shortWhen",
    pure: true,
})
export class ShortWhenPipe implements PipeTransform {

    public transform(value: string): string {
        const datePipe = new DatePipe("de-DE");
        // @ts-ignore
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
