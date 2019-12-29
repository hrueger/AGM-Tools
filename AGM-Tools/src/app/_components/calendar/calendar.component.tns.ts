import { ChangeDetectorRef, Component, NgZone, OnInit } from "@angular/core";
import { ViewChild, ViewContainerRef } from "@angular/core";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { CalendarEvent } from "nativescript-ui-calendar";
import { RadCalendarComponent } from "nativescript-ui-calendar/angular/calendar-directives";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { Color } from "tns-core-modules/color";
import { AlertService } from "../../_services/alert.service";
import { RemoteService } from "../../_services/remote.service";
import { NewCalendarEventModalComponent } from "../_modals/new-calendar-event.modal.tns";

export class CustomEvent extends CalendarEvent {
    public id: number;
    public location: string;
    public description: string;

    constructor(id: number, title: string, description: string,
                location: string, startDate: Date, endDate: Date, isAllDay?: boolean, eventColor?: Color) {
        super(title, startDate, endDate, isAllDay, eventColor);
        this.id = id;
        this.location = location;
        this.description = description;
    }
}

// tslint:disable-next-line: max-classes-per-file
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
        darkgreen: "#006400",
        darkgrey: "#a9a9a9",
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
        red: "#ff0000",
        silver: "#c0c0c0",
        violet: "#800080",
        white: "#ffffff",
        yellow: "#ffff00",
    };
    public static random() {
        let result;
        let count = 0;
        for (const prop in Colors.names) {
            if (Math.random() < 1 / ++count) {
                result = Colors.names[prop];
            }
        }
        return result;
    }
}

// tslint:disable-next-line: max-classes-per-file
@Component({
    selector: "app-calendar",
    styleUrls: ["./calendar.component.scss"],
    templateUrl: "./calendar.component.html",
})
export class CalendarComponent {
    public calendarEvents: CustomEvent[] = new Array<CustomEvent>();
    public viewMode: string = "Day";
    public currentViewIndex = -1;
    public viewModes = ["Year", "Month", "Day"];

    @ViewChild("calendar", { static: false }) public calendar: RadCalendarComponent;
    constructor(private remoteService: RemoteService, private modal: ModalDialogService,
                private vcRef: ViewContainerRef, private alertService: AlertService, private zone: NgZone) { }

    public ngAfterViewInit() {
        this.calendar.nativeElement.reload();
    }

    public ngOnInit() {
        this.remoteService.get("get", "events").subscribe(
            (data) => {
                this.gotNewCalendarData(data, true);
            },
        );
    }

    public gotNewCalendarData(data: any, skipReload = false) {
        this.calendarEvents = [];
        if (data) {
            data.forEach((event) => {
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                this.calendarEvents.push(new CustomEvent(
                    event.id,
                    event.headline,
                    event.description,
                    event.location,
                    startDate,
                    endDate,
                    false,
                    new Color(Colors.random()),
                ));
            });
        }
        if (!skipReload) {
            this.calendar.nativeElement.reload();
        }
    }

    public onNavigatedToDate(args) {
        // console.log("onNavigatedToDate: " + args.date);
    }

    public openNewModal() {
        const options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef,
        };
        this.modal.showModal(NewCalendarEventModalComponent, options).then((newCalendarEvent) => {
            if (newCalendarEvent) {

                this.remoteService
                    .getNoCache("post", "events", {
                        description: newCalendarEvent.description,
                        endDate: newCalendarEvent.endDate.toString(),
                        headline: newCalendarEvent.title,
                        important: newCalendarEvent.important,
                        location: newCalendarEvent.location,
                        startDate: newCalendarEvent.startDate.toString(),
                    })
                    .subscribe((data) => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Termin erfolgreich gespeichert!",
                            );
                            this.remoteService
                                .get("get", "events")
                                .subscribe((res) => {
                                    this.gotNewCalendarData(res);
                                });
                        }
                    });
            }
        });
    }

    public up() {
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
    public down() {
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
    public onDrawerButtonTap(): void {
        const sideDrawer =  app.getRootView() as RadSideDrawer;
        sideDrawer.showDrawer();
    }
}
