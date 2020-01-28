import { Component, OnInit } from "@angular/core";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "app-done",
    styleUrls: ["./done.component.css"],
    templateUrl: "./done.component.html",
})
export class DoneComponent implements OnInit {
    constructor(private navbarService: NavbarService, private fts: FastTranslateService) { }

    public async ngOnInit() {
        this.navbarService.setHeadline(await this.fts.t("done.done"));
    }
}
