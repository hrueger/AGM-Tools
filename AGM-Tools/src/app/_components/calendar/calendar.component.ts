import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-calendar",
    templateUrl: "./calendar.component.html",
    styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit {
    calendarEvents = [];

    constructor() {}

    ngOnInit(): void {}
}
