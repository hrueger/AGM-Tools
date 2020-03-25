import { Component, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import * as ModalPicker from "nativescript-modal-datetimepicker";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { FastTranslateService } from "../../_services/fast-translate.service";

export class CalendarEvent {
    public id: number;
    public title: string;
    public description: string;
    public location: string;
    public startDate: string;
    public endDate: string;
    public isAllDay: boolean;
    public important: boolean;

    public constructor(title: string,
        description: string,
        location: string,
        isAllDay: boolean,
        important: boolean) {
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
    public startDate = "";
    public endDate = "";
    public endDateInvalidMessage = false;
    public startDateInvalidMessage = false;
    public endDateBeforeStartDateInvalidMessage = false;
    public startDateToSend = "";
    public endDateToSend = "";
    @ViewChild("dataform", { static: false }) public dataform: RadDataFormComponent;
    public dataFormConfig: any;
    private event: CalendarEvent;

    public constructor(private params: ModalDialogParams, private fts: FastTranslateService) {}

    public async pick(what: string): Promise<void> {
        const picker = new ModalPicker.ModalDatetimepicker();
        picker.pickDate({
            title: await this.fts.t(what == "start" ? "events.pickStartDate" : "events.pickEndDate"),
        }).then(async (result): Promise<any> => {
            const res = `${result.day}.${result.month}.${result.year}`;
            const dateToSend = `${result.year}-${result.month}-${result.day}`;
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
                title: await this.fts.t(what == "start" ? "events.pickStartTime" : "events.pickEndTime"),

            }).then((data): void => {
                const time = `${data.hour}:${data.minute}`;
                if (what == "start") {
                    this.startDate += ` ${time}`;
                    this.startDateToSend += ` ${time}`;
                } else {
                    this.endDate += ` ${time}`;
                    this.endDateToSend += ` ${time}`;
                }
                this.endDateInvalidMessage = false;
                this.endDateBeforeStartDateInvalidMessage = false;
            }).catch((error): void => {
                // eslint-disable-next-line no-console
                console.log(`Error: ${error}`);
            });
        }).catch((error): void => {
            // eslint-disable-next-line no-console
            console.log(`Error: ${error}`);
        });
    }

    public close(): void {
        this.dataform.dataForm.validateAll()
            .then((result): void => {
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

    public async ngOnInit(): Promise<void> {
        this.event = new CalendarEvent("", "", "", false, false);
        this.dataFormConfig = {
            commitMode: "Immediate",
            isReadOnly: false,
            propertyAnnotations:
                [
                    {
                        displayName: await this.fts.t("general.title"),
                        index: 0,
                        name: "title",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                    {
                        displayName: await this.fts.t("general.description"),
                        editor: "MultilineText",
                        index: 1,
                        name: "description",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                    {
                        displayName: await this.fts.t("general.location"),
                        index: 2,
                        name: "location",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                    {
                        displayName: await this.fts.t("events.isAllDay"),
                        index: 3,
                        name: "isAllDay",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                    {
                        displayName: await this.fts.t("events.importantEvent"),
                        index: 4,
                        name: "important",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                ],
            validationMode: "Immediate",
        };
    }

    public goBack(): void {
        this.params.closeCallback(null);
    }
}
