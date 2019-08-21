import { Component, OnInit } from "@angular/core";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "app-done",
    styleUrls: ["./done.component.css"],
    templateUrl: "./done.component.html",
})
export class DoneComponent implements OnInit {
    constructor(private navbarService: NavbarService) { }

    public ngOnInit() {
        this.navbarService.setHeadline("Fertig");
    }
}
