import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { User } from "../../_models/user.model";
import { SetupItemViewArgs } from "nativescript-angular/directives";

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"]
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    constructor(private remoteService: RemoteService) {}

    ngOnInit() {
        this.remoteService.get("usersGetUsers").subscribe(data => {
            this.users = data;
        });
    }
    onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.users.length === 1;
        args.view.context.footer = args.index + 1 === this.users.length;
    }
}
