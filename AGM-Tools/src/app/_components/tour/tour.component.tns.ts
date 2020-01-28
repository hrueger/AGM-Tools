import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Carousel } from "nativescript-carousel";
import { Page } from "tns-core-modules/ui/page";
import { FastTranslateService } from "../../_services/fast-translate.service";

@Component({
  selector: "app-tour",
  styleUrls: ["./tour.component.css"],
  templateUrl: "./tour.component.html",
})
export class TourComponent implements OnInit {
  @ViewChild("slidesCarousel", { static: false }) public carouselView: ElementRef<Carousel>;
  @ViewChild("btnNext", { static: false }) public btnNext: ElementRef<any>;
  @ViewChild("btnPrev", { static: false }) public btnPrev: ElementRef<any>;
  public currentBackgroundColor = "#fff";
  public slides = [];
  constructor(private page: Page, private router: RouterExtensions, private fts: FastTranslateService) { }

  public async ngOnInit() {
    this.page.actionBarHidden = true;
    this.slides = [
      {
        backgroundColor: "#2980b9",
        description: await this.fts.t("tour.description.everythingTogether"),
        headline: await this.fts.t("tour.headlines.everythingTogether"),
        imgSrc: "collaboration",
      },
      {
        backgroundColor: "#e74c3c",
        description: await this.fts.t("tour.description.everythingTogether"),
        headline: await this.fts.t("tour.headlines.everythingTogether"),
        imgSrc: "calendar",
      },
      {
        backgroundColor: "#3498db",
        description: await this.fts.t("tour.description.chat"),
        headline: await this.fts.t("tour.headlines.chat"),
        imgSrc: "chat",
      },
      {
        backgroundColor: "#8e44ad",
        description: await this.fts.t("tour.description.updates"),
        headline: await this.fts.t("tour.headlines.updates"),
        imgSrc: "mail",
      },
      {
        backgroundColor: "#27ae60",
        description: await this.fts.t("tour.description.files"),
        headline: await this.fts.t("tour.headlines.files"),
        imgSrc: "image",
      },
      {
        backgroundColor: "#f1c40f",
        description: await this.fts.t("tour.description.sharing"),
        headline: await this.fts.t("tour.headlines.sharing"),
        imgSrc: "share",
      },
    ];
  }
  public loaded() {
    this.pageChanged({ index: 0});
  }
  public prev() {
    if (this.carouselView.nativeElement.selectedPage > 0) {
      this.carouselView.nativeElement.selectedPage--;
    }
  }
  public next() {
    if (this.carouselView.nativeElement.selectedPage == this.slides.length - 1) {
      this.router.back();
    } else {
      this.carouselView.nativeElement.selectedPage++;
    }
  }

  public async pageChanged(args: any): Promise<void> {
    this.currentBackgroundColor = this.slides[args.index].backgroundColor;
    if (args.index + 1 == this.slides.length) { // last item
      this.btnNext.nativeElement.text = await this.fts.t("done.done");
      this.btnPrev.nativeElement.visibility = "visible";
    } else if (args.index == 0) { // first item
      this.btnPrev.nativeElement.visibility = "hidden";
    } else {
      this.btnPrev.nativeElement.visibility = "visible";
      this.btnNext.nativeElement.text = await this.fts.t("general.next");
    }
  }
}
