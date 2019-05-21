import { Component, OnInit } from "@angular/core";
import dayGridPlugin from "@fullcalendar/daygrid";

@Component({
    selector: "app-calendar",
    templateUrl: "./calendar.component.html",
    styleUrls: [
        "./calendar.component.scss",
        "../../../../node_modules/@fullcalendar/core/main.css",
        "../../../../node_modules/@fullcalendar/daygrid/main.css"
    ]
})
export class CalendarComponent implements OnInit {
    calendarEvents = [];
    calendarPlugins = [dayGridPlugin];
    constructor() {}

    ngOnInit(): void {}
}
