import { Component, Input } from "@angular/core";
import { getApiUrl } from "../../../_helpers/getApiUrl";

@Component({
    selector: "username",
    templateUrl: "./username.component.html",
    styleUrls: ["./username.component.scss"],
})
export class UsernameComponent {
    @Input() public user: any;

    public getAvatarSource(user) {
        return `${getApiUrl()}users/${user.id}`;
    }
}
