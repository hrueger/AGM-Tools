import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";

import { isToday, isYesterday, toDate } from "date-fns";

@Pipe({
    name: "shortWhen",
    pure: true,
})
export class ShortWhenPipe implements PipeTransform {

    public transform(value: string): string {
        try {
            const datePipe = new DatePipe("de-DE");
            const parsedDate = toDate(Date.parse(value));
            if (isToday(parsedDate)) {
                return datePipe.transform(parsedDate, "HH:mm");
            }
            if (isYesterday(parsedDate)) {
                return "Gestern";
            }
            return datePipe.transform(parsedDate, "dd.MM.yyyy");
        } catch {
            return "";
        }
    }
}
