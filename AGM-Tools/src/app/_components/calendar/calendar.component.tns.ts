import { Component, OnInit } from "@angular/core";
import * as calendarModule from "nativescript-ui-calendar";
import { Color } from "tns-core-modules/color";

@Component({
    selector: "app-calendar",
    templateUrl: "./calendar.component.html",
    styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit {
    calendarEvents = [];
    viewMode: string = "MonthNames";
    currentViewIndex = -1;
    viewModes = ["Year", "Month", "Week", "Day"];

    constructor() {
        let events: calendarModule.CalendarEvent[] = [];
        let now = new Date();
        let startDate;
        let endDate;
        let colors = [
            new Color(200, 188, 26, 214),
            new Color(220, 255, 109, 130),
            new Color(255, 55, 45, 255),
            new Color(199, 17, 227, 10),
            new Color(255, 255, 54, 3)
        ];
        for (let i = 1; i < 10; i++) {
            startDate = new Date(now.getFullYear(), now.getMonth(), i * 2, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), i * 2, 3);
            let event = new calendarModule.CalendarEvent(
                "event " + i,
                startDate,
                endDate,
                false,
                colors[(i * 10) % (colors.length - 1)]
            );
            events.push(event);
            if (i % 3 == 0) {
                event = new calendarModule.CalendarEvent(
                    "second " + i,
                    startDate,
                    endDate,
                    true,
                    colors[(i * 5) % (colors.length - 1)]
                );
                events.push(event);
            }
        }
        this.calendarEvents = events;
    }

    ngOnInit(): void {}

    onNavigatedToDate(args) {
        console.log("onNavigatedToDate: " + args.date);
    }

    up() {
        if (this.currentViewIndex == -1) {
            this.currentViewIndex = 1;
        } else {
            this.currentViewIndex -= 1;
        }

        if (this.currentViewIndex < 0) {
            this.currentViewIndex = this.viewModes.length - 1;
        }
        this.viewMode = this.viewModes[this.currentViewIndex];
    }
    down() {
        if (this.currentViewIndex == -1) {
            this.currentViewIndex = 2;
        } else {
            this.currentViewIndex += 1;
        }

        if (this.currentViewIndex > this.viewModes.length - 1) {
            this.currentViewIndex = 0;
        }
        this.viewMode = this.viewModes[this.currentViewIndex];
    }
}
