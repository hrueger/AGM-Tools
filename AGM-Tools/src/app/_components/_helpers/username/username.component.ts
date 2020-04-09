import { Component, Input } from "@angular/core";
import { environment } from "../../../../environments/environment";

@Component({
    selector: "username",
    templateUrl: "./username.component.html",
    styleUrls: ["./username.component.scss"],
})
export class UsernameComponent {
    @Input() public user: any;

    public getAvatarSource(user) {
        return `${environment.apiUrl}users/${user.id}`;
    }
}
