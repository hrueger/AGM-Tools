import { Component, OnInit } from "@angular/core";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "app-done",
    templateUrl: "./done.component.html",
    styleUrls: ["./done.component.css"],
})
export class DoneComponent implements OnInit {
    constructor(private NavbarService: NavbarService) {}

    public ngOnInit() {
        this.NavbarService.setHeadline("Fertig");
    }
}
