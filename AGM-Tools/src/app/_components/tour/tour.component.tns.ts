import { Component, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page";

@Component({
  selector: "app-tour",
  styleUrls: ["./tour.component.css"],
  templateUrl: "./tour.component.html",
})
export class TourComponent implements OnInit {

  constructor(private page: Page) { }

  public ngOnInit() {
    this.page.actionBarHidden = true;
  }

}
