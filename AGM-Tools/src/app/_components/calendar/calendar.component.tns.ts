import { Component, OnInit, ChangeDetectorRef, NgZone } from "@angular/core";
import { Color } from "tns-core-modules/color";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { RadCalendarComponent } from "nativescript-ui-calendar/angular/calendar-directives";
import * as app from "tns-core-modules/application";
import { RemoteService } from "../../_services/remote.service";
import { CalendarEvent } from "nativescript-ui-calendar";
import { ViewContainerRef, ViewChild } from "@angular/core";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { AlertService } from "../../_services/alert.service";
import { NewCalendarEventModalComponent } from "../_modals/new-calendar-event.modal.tns"

export class CustomEvent extends CalendarEvent {
    id: number;
    location: string;
    description: string;

    constructor(id: number, title: string, description: string, location: string, startDate: Date, endDate: Date, isAllDay?: boolean, eventColor?: Color) {
        super(title, startDate, endDate, isAllDay, eventColor);
        this.id = id;
        this.location = location;
        this.description = description;
    }
}

export class Colors {
    public static names = {
        aqua: "#00ffff",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        black: "#000000",
        blue: "#0000ff",
        brown: "#a52a2a",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgrey: "#a9a9a9",
        darkgreen: "#006400",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkviolet: "#9400d3",
        fuchsia: "#ff00ff",
        gold: "#ffd700",
        green: "#008000",
        indigo: "#4b0082",
        khaki: "#f0e68c",
        lightblue: "#add8e6",
        lightcyan: "#e0ffff",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        magenta: "#ff00ff",
        maroon: "#800000",
        navy: "#000080",
        olive: "#808000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        purple: "#800080",
        violet: "#800080",
        red: "#ff0000",
        silver: "#c0c0c0",
        white: "#ffffff",
        yellow: "#ffff00"
    };
    static random() {
        var result;
        var count = 0;
        for (var prop in Colors.names)
            if (Math.random() < 1 / ++count)
                result = Colors.names[prop];
        return result;
    }
}


@Component({
    selector: "app-calendar",
    templateUrl: "./calendar.component.html",
    styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent {
    calendarEvents: Array<CustomEvent> = new Array<CustomEvent>();
    viewMode: string = "Day";
    currentViewIndex = -1;
    viewModes = ["Year", "Month", "Day"];

    @ViewChild('calendar', { static: false }) calendar: RadCalendarComponent;
    constructor(private remoteService: RemoteService, private modal: ModalDialogService,
        private vcRef: ViewContainerRef, private alertService: AlertService, private zone: NgZone) { }


    ngAfterViewInit() {
        this.calendar.nativeElement.reload();
    }

    ngOnInit() {
        this.remoteService.get("calendarGetDates").subscribe(
            data => {
                this.gotNewCalendarData(data, true);
            }
        );
    }

    gotNewCalendarData(data: any, skipReload = false) {
        this.calendarEvents = [];
        if (data) {
            data.forEach(event => {
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
                    new Color(Colors.random())
                ));
            });
        }
        if (!skipReload) {
            this.calendar.nativeElement.reload();
        }

    }

    onNavigatedToDate(args) {
        console.log("onNavigatedToDate: " + args.date);
    }

    public openNewModal() {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(NewCalendarEventModalComponent, options).then(newCalendarEvent => {
            if (newCalendarEvent) {

                this.remoteService
                    .getNoCache("calendarNewEvent", {
                        startDate: newCalendarEvent.startDate.toString(),
                        endDate: newCalendarEvent.endDate.toString(),
                        headline: newCalendarEvent.title,
                        description: newCalendarEvent.description,
                        location: newCalendarEvent.location,
                        important: newCalendarEvent.important
                    })
                    .subscribe(data => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Termin erfolgreich gespeichert!"
                            );
                            this.remoteService
                                .get("calendarGetDates")
                                .subscribe(data => {
                                    this.gotNewCalendarData(data);
                                });
                        }
                    });
            }
        });
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
