import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Carousel } from "nativescript-carousel";
import { Page } from "tns-core-modules/ui/page";

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
  public slides = [
    {
      backgroundColor: "#2980b9",
      description: "Profitiere vom einzigartigen Workflow, den dir diese Plattform bietet.\
      Alles ist vernetzt und perfekt aufeinander abgestimmt!",
      headline: "Alles vereint",
      imgSrc: "collaboration",
    },
    {
      backgroundColor: "#e74c3c",
      description: "Behalte mit dem integrierten Kalender deine Termine im Überblick\
      oder exportiere sie direkt in Deinen Kalender!",
      headline: "Integrierter Kalender",
      imgSrc: "calendar",
    },
    {
      backgroundColor: "#3498db",
      description: "Kommuniziere mit Deinen Mitstreitern direkt in der App und\
      verlinke Dateien, verwende Emojis und verschicke Bilder!",
      headline: "Eingebauter Chat",
      imgSrc: "chat",
    },
    {
      backgroundColor: "#8e44ad",
      description: "Die schnellsten Push-Nachrichten über alle Aktivitäten\
      halten Dich immer auf dem Laufenden!",
      headline: "Immer Up-to-Date",
      imgSrc: "mail",
    },
    {
      backgroundColor: "#27ae60",
      description: "Habe alle deine Dateien immer mit dabei - dank integrierter\
      Dateiverwaltung, Dateibrowser und Dateivorschau!",
      headline: "Dateien immer mit dabei",
      imgSrc: "image",
    },
    {
      backgroundColor: "#f1c40f",
      description: "Teile alles auch mit den Personen, die AGM-Tools (leider) noch nicht haben\
      - mit den Tools, die Du bereits kennst!",
      headline: "Teilen - was immer Du willst",
      imgSrc: "share",
    },
  ];
  constructor(private page: Page) { }

  public ngOnInit() {
    this.page.actionBarHidden = true;
  }
  public loaded() {
    this.pageChanged({ index: 0});
  }
  public prev() {
    this.carouselView.nativeElement.selectedPage--;
  }
  public next() {
    this.carouselView.nativeElement.selectedPage++;
  }

  public pageChanged(args: any): void {
    this.currentBackgroundColor = this.slides[args.index].backgroundColor;
    if (args.index + 1 == this.slides.length) { // last item
      this.btnNext.nativeElement.text = "Weiter";
      this.btnPrev.nativeElement.visibility = "visible";
    } else if (args.index == 0) { // first item
      this.btnPrev.nativeElement.visibility = "hidden";
    } else {
      this.btnPrev.nativeElement.visibility = "visible";
      this.btnNext.nativeElement.text = "Weiter";
    }
  }
}
