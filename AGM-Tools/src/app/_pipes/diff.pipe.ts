import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "subtractArray" })
export class DiffPipe implements PipeTransform {
    public transform(arr1: any[], arr2: any[]): any {
        return arr1.filter((item) => {
            return !arr2.some((test) => {
                return test.id === item.id;
            });
        });
    }
}
