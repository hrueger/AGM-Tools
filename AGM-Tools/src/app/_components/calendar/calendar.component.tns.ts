import { Component, OnInit } from "@angular/core";
import * as calendarModule from "nativescript-ui-calendar";
import { Color } from "tns-core-modules/color";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";

import * as app from "tns-core-modules/application";
import { RemoteService } from "../../_services/remote.service";
import { CalendarEvent } from "nativescript-ui-calendar";

export class CustomEvent extends CalendarEvent {
    id: number;
    location: string;
    description: string;

    constructor(id: number, title: string, description: string, location: string, startDate: Date, endDate: Date, isAllDay?: boolean, eventColor?: Color) {
        super(title, startDate, endDate, isAllDay, eventColor);
        this.id = id;
        this.location = location;
        const hours = startDate.getHours();
        const minutes = startDate.getMinutes();
        this.description = description;
    }
}


@Component({
    selector: "app-calendar",
    templateUrl: "./calendar.component.html",
    styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit {
    calendarEvents: Array<CustomEvent> = new Array<CustomEvent>();
    viewMode: string = "MonthNames";
    currentViewIndex = -1;
    viewModes = ["Year", "Month", "Week", "Day"];

    constructor(private remoteService: RemoteService) {
    }



    ngOnInit() {
        this.remoteService.get("calendarGetDates").subscribe(data => {

            var color = new Color(255, 255, 54, 3)
            console.log(data);
            data.forEach(event => {
                console.log(event);
                var startDate = new Date(event.startDate);
                var endDate = new Date(event.endDate);
                this.calendarEvents.push(new CustomEvent(
                    event.id,
                    event.headline,
                    event.description,
                    event.location,
                    startDate,
                    endDate,
                    false,
                    color
                ));
            });
        }
        );
    }

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
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
}
