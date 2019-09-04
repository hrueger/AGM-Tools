import { Component, NgZone, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import * as ModalPicker from "nativescript-modal-datetimepicker";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { AlertService } from "../../_services/alert.service";
import { RemoteService } from "../../_services/remote.service";

export class CalendarEvent {
    public id: number;
    public title: string;
    public description: string;
    public location: string;
    public startDate: string;
    public endDate: string;
    public isAllDay: boolean;
    public important: boolean;

    constructor(title: string, description: string, location: string, isAllDay: boolean, important: boolean) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.isAllDay = isAllDay;
        this.important = important;
    }
}

// tslint:disable-next-line: max-classes-per-file
@Component({
    selector: "new-calendar-event-modal",
    templateUrl: "new-calendar-event.modal.tns.html",
})
export class NewCalendarEventModalComponent {
    public startDate: string = "";
    public endDate: string = "";
    public endDateInvalidMessage = false;
    public startDateInvalidMessage = false;
    public endDateBeforeStartDateInvalidMessage = false;
    public startDateToSend = "";
    public endDateToSend = "";
    @ViewChild("dataform", { static: false }) public dataform: RadDataFormComponent;
    public dataFormConfig = {
        commitMode: "Immediate",
        isReadOnly: false,
        propertyAnnotations:
            [
                {
                    displayName: "Titel",
                    index: 0,
                    name: "title",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Beschreibung",
                    editor: "MultilineText",
                    index: 1,
                    name: "description",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Ort",
                    index: 2,
                    name: "location",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Ganztägig",
                    index: 3,
                    name: "isAllDay",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Wichtiger Termin",
                    index: 4,
                    name: "important",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
            ],
            validationMode: "Immediate",
    };
    private event: CalendarEvent;

    public constructor(private params: ModalDialogParams) {}

    public pick(what: string) {
        const picker = new ModalPicker.ModalDatetimepicker();
        picker.pickDate({
            title: (what == "start" ? "Startdatum auswählen" : "Enddatum auswählen"),
        }).then((result) => {
            const res = result.day + "." + result.month + "." + result.year;
            const dateToSend = result.year + "-" + result.month + "-" + result.day;
            if (what == "start") {
                this.startDate = res;
                this.startDateToSend = dateToSend;
            } else {
                this.endDate = res;
                this.endDateToSend = dateToSend;
            }
            this.startDateInvalidMessage = false;
            this.endDateBeforeStartDateInvalidMessage = false;
            picker.pickTime({
                title: (what == "start" ? "Startzeit auswählen" : "Endzeit auswählen"),

            }).then((data) => {
                const time = data.hour + ":" + data.minute;
                if (what == "start") {
                    this.startDate += " " + time;
                    this.startDateToSend += " " + time;
                } else {
                    this.endDate += " " + time;
                    this.endDateToSend += " " + time;
                }
                this.endDateInvalidMessage = false;
                this.endDateBeforeStartDateInvalidMessage = false;
            }).catch((error) => {
                // tslint:disable-next-line: no-console
                console.log("Error: " + error);
            });
        }).catch((error) => {
            // tslint:disable-next-line: no-console
            console.log("Error: " + error);
        });
    }

    public close() {
        this.dataform.dataForm.validateAll()
            .then((result) => {
                if (result == true) {
                    if (this.startDate && this.startDate != "") {
                        if (this.endDate && this.endDate != "") {

                            if (new Date(this.startDate) >= new Date(this.endDate)) {
                                this.endDateBeforeStartDateInvalidMessage = true;
                            } else {
                                this.event.startDate = this.startDateToSend;
                                this.event.endDate = this.endDateToSend;
                                this.params.closeCallback(this.event);
                            }

                        } else {
                            this.endDateInvalidMessage = true;
                        }
                    } else {
                        this.startDateInvalidMessage = true;
                    }
                }
            });
    }

    public ngOnInit() {
        this.event = new CalendarEvent("", "", "", false, false);

    }

    public goBack() {
        this.params.closeCallback(null);
    }

}
