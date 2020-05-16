import { Component, Input } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { EnvironmentService } from "../../../_services/environment.service";

@Component({
    selector: "username",
    templateUrl: "./username.component.html",
    styleUrls: ["./username.component.scss"],
})
export class UsernameComponent {
    @Input() public user: any;

    constructor(private environmentService: EnvironmentService) {}

    public getAvatarSource(user) {
        return `${this.environmentService.environment.apiUrl}users/${user.id}`;
    }
}
