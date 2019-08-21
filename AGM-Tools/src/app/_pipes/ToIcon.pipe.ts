import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "ToIcon",
})
export class ToIconPipe implements PipeTransform {

    public transform(value: string, args: string[]): string {
        return String.fromCharCode(parseInt(value, 16));
    }
}
