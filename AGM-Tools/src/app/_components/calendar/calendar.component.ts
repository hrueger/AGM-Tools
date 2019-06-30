import { Component, ViewEncapsulation } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { RemoteService } from "../../_services/remote.service";
import {
    EventSettingsModel,
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    AgendaService,
    MonthAgendaService
} from "@syncfusion/ej2-angular-schedule";
import { fifaEventsData } from "./datasource";
import { extend } from "@syncfusion/ej2-base";

@Component({
    selector: "app-calendar",
    //templateUrl: "./calendar.component.html",
    template: `
        <ejs-schedule
            width="100%"
            height="550px"
            [selectedDate]="selectedDate"
            [eventSettings]="eventSettings"
        ></ejs-schedule>
    `,

    styleUrls: [
        "./calendar.component.scss",
        "../../../../node_modules/@syncfusion/ej2-base/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-buttons/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-calendars/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-dropdowns/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-inputs/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-icons/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-lists/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-popups/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-navigations/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-angular-schedule/styles/bootstrap.css",
        "../../../../node_modules/@syncfusion/ej2-popups/styles/bootstrap.css"
    ],
    encapsulation: ViewEncapsulation.ShadowDom,
    providers: [
        DayService,
        WeekService,
        WorkWeekService,
        MonthService,
        AgendaService,
        MonthAgendaService
    ]
})
export class CalendarComponent {
    public data: object[] = [
        {
            Id: 2,
            Subject: "Paris",
            StartTime: new Date(2018, 1, 15, 10, 0),
            EndTime: new Date(2018, 1, 15, 12, 30),
            IsAllDay: false,
            RecurrenceID: 10,
            RecurrenceRule: "FREQ=DAILY;INTERVAL=1;COUNT=5",
            Location: "London",
            Description: "Summer vacation planned for outstation.",
            StartTimezone: "Asia/Yekaterinburg",
            EndTimezone: "Asia/Yekaterinburg"
        }
    ];
    public selectedDate: Date = new Date(2018, 1, 15);
    public eventSettings: EventSettingsModel = {
        dataSource: this.data,
        fields: {
            id: "Id",
            subject: { name: "Subject" },
            isAllDay: { name: "IsAllDay" },
            location: { name: "Location" },
            description: { name: "Description" },
            startTime: { name: "StartTime" },
            endTime: { name: "EndTime" },
            startTimezone: { name: "StartTimezone" },
            endTimezone: { name: "EndTimezone" },
            recurrenceRule: { name: "RecurrenceRule" },
            recurrenceID: { name: "RecurrenceID" }
        }
    };
}
