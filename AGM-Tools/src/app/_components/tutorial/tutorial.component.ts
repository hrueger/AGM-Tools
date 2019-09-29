import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
  selector: "app-tutorial",
  styleUrls: ["./tutorial.component.css"],
  templateUrl: "./tutorial.component.html",
})
export class TutorialComponent implements OnInit {
  public tutorialId: any;
  public tutorial: any;

  constructor(private navbarService: NavbarService,
              private route: ActivatedRoute,
              private remoteService: RemoteService) { }

  public ngOnInit() {
    this.navbarService.setHeadline("Tutorial");
    this.route.params.subscribe((params) => {
      this.tutorialId = params.index;
      this.remoteService.get("tutorialsGetTutorial", {id: this.tutorialId}).subscribe((tutorial) => {
        this.tutorial = tutorial;
      });
    });
  }
}
