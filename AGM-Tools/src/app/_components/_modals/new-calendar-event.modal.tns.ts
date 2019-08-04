import { Component, ViewChild, NgZone } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";
import * as ModalPicker from 'nativescript-modal-datetimepicker';

export class CalendarEvent {
    id: number;
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    important: boolean;

    constructor(title: string, description: string, location: string, isAllDay: boolean, important: boolean) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.isAllDay = isAllDay;
        this.important = important;
    }
}


@Component({
    selector: "new-calendar-event-modal",
    templateUrl: "new-calendar-event.modal.tns.html",
})
export class NewCalendarEventModalComponent {
    private event: CalendarEvent;
    public startDate: string = "";
    public endDate: string = "";
    endDateInvalidMessage = false;
    startDateInvalidMessage = false;
    endDateBeforeStartDateInvalidMessage = false;
    @ViewChild('dataform', { static: false }) dataform: RadDataFormComponent;
    dataFormConfig = {
        "isReadOnly": false,
        "commitMode": "Immediate",
        "validationMode": "Immediate",
        "propertyAnnotations":
            [
                {
                    "name": "title",
                    "displayName": "Titel",
                    "index": 0,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "description",
                    "displayName": "Beschreibung",
                    "index": 1,
                    "editor": "MultilineText",
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "location",
                    "displayName": "Ort",
                    "index": 2,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "isAllDay",
                    "displayName": "Ganztägig",
                    "index": 3,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "important",
                    "displayName": "Wichtiger Termin",
                    "index": 4,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                }
            ]
    };

    public constructor(private params: ModalDialogParams, private remoteService: RemoteService, private alertService: AlertService) {

    }

    pick(what: string) {
        const picker = new ModalPicker.ModalDatetimepicker();
        picker.pickDate({
            title: (what == "start" ? 'Startdatum auswählen' : "Enddatum auswählen"),
        }).then((result) => {
            var res = result.day + '.' + result.month + '.' + result.year;
            if (what == "start") {
                this.startDate = res;
            } else {
                this.endDate = res;
            }
            this.startDateInvalidMessage = false;
            this.endDateBeforeStartDateInvalidMessage = false;
            picker.pickTime({
                title: (what == "start" ? 'Startzeit auswählen' : "Endzeit auswählen"),

            }).then((result) => {
                var res = result.hour + ':' + result.minute;
                if (what == "start") {
                    this.startDate += " " + res;
                } else {
                    this.endDate += " " + res;
                }
                this.endDateInvalidMessage = false;
                this.endDateBeforeStartDateInvalidMessage = false;
            }).catch((error) => {
                console.log('Error: ' + error);
            });
        }).catch((error) => {
            console.log('Error: ' + error);
        });
    }


    public close() {
        this.dataform.dataForm.validateAll()
            .then(result => {
                if (result == true) {
                    if (this.startDate && this.startDate != "") {
                        if (this.endDate && this.endDate != "") {

                            this.event.startDate = new Date(this.startDate);
                            this.event.endDate = new Date(this.endDate);

                            if (this.event.startDate >= this.event.endDate) {
                                this.endDateBeforeStartDateInvalidMessage = true;
                            } else {
                                this.params.closeCallback(this.event);
                            }

                        } else {
                            this.endDateInvalidMessage = true;
                        }
                    } else {
                        this.startDateInvalidMessage = true;
                    }
                } else {
                    console.log("validation failed");
                }
            });
    }

    ngOnInit() {
        this.event = new CalendarEvent("", "", "", false, false);

    }



    goBack() {
        this.params.closeCallback(null);
    }




}