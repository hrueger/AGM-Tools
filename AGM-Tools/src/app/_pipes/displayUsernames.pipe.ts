import { Pipe, PipeTransform } from "@angular/core";
import { User } from "../_models/user.model";

@Pipe({
    name: "displayUsernames",
})

export class DisplayUsernamesPipe implements PipeTransform {
    public transform(value: User[], delimiter: string = ", "): string {
        return value.map((user) => user.username).join(delimiter);
    }
}
