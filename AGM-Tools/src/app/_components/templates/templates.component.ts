import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import config from "../../_config/config";
import { AuthenticationService } from "../../_services/authentication.service";

@Component({
    selector: "app-templates",
    templateUrl: "./templates.component.html",
    styleUrls: ["./templates.component.scss"]
})
export class TemplatesComponent implements OnInit {
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private authenticationService: AuthenticationService
    ) {}
    imgUrl: string;
    templates: any;
    ngOnInit() {
        this.remoteService.get("templatesGetTemplates").subscribe(data => {
            this.templates = data;
        });
    }
    show(template, content) {
        this.imgUrl =
            config.apiUrl +
            "getTemplate.php?tid=" +
            template.id +
            "&token=" +
            this.authenticationService.currentUserValue.token;
        this.modalService
            .open(content, {})
            .result.then(result => {}, reason => {});
    }
}
