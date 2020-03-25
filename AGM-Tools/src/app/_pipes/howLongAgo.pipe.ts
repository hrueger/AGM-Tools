import { Pipe, PipeTransform } from "@angular/core";
import { format, register } from "timeago.js";

@Pipe({
    name: "howLongAgo",
})
export class DateAgoPipe implements PipeTransform {
    public transform(value: any): any {
        const localeFunc = (n: number, index: number): any => [
            ["gerade eben", "gerade eben"],
            ["vor %s Sekunden", "in %s Sekunden"],
            ["vor 1 Minute", "in 1 Minute"],
            ["vor %s Minuten", "in %s Minuten"],
            ["vor 1 Stunde", "in 1 Stunde"],
            ["vor %s Stunden", "in %s Stunden"],
            ["vor 1 Tag", "in 1 Tag"],
            ["vor %s Tagen", "in %s Tagen"],
            ["vor 1 Woche", "in 1 Woche"],
            ["vor %s Wochen", "in %s Wochen"],
            ["vor 1 Monat", "in 1 Monat"],
            ["vor %s Monaten", "in %s Monaten"],
            ["vor 1 Jahr", "in 1 Jahr"],
            ["vor %s Jahren", "in %s Jahren"],
        ][index];
        register("de_DE", localeFunc);
        return format(value, "de_DE");
    }
}
