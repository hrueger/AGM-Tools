import { Component, ViewEncapsulation, ChangeDetectorRef } from "@angular/core";
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
import { loadCldr, L10n } from "@syncfusion/ej2-base";
import { NavbarService } from "../../_services/navbar.service";

L10n.load({
    de: {
        schedule: {
            day: "Tag",
            week: "Woche",
            workWeek: "Arbeitswoche",
            month: "Monat",
            agenda: "Agenda",
            weekAgenda: "Wochenagenda",
            workWeekAgenda: "Arbeitswochenagenda",
            monthAgenda: "Monatsagenda",
            today: "Heute",
            noEvents: "Keine Termine",
            emptyContainer:
                "Für diesen Zeitraum sind keine termine eingetragen.",
            allDay: "Ganzer Tag",
            start: "Start",
            end: "Ende",
            more: "mehr",
            close: "Schließen",
            cancel: "Abbrechen",
            noTitle: "(Unbenannt)",
            delete: "Löschen",
            deleteEvent: "Termin löschen",
            deleteMultipleEvent: "Mehrere Termine löschen",
            selectedItems: "Ausgewählte Termine",
            deleteSeries: "Serie löschen",
            edit: "Bearbeiten",
            editSeries: "Serie bearbeiten",
            editEvent: "Termin bearbeiten",
            createEvent: "Erstellen",
            subject: "Betreff",
            addTitle: "Titel hinzufügen",
            moreDetails: "Mehr Details",
            save: "Speichern",
            editContent:
                "Möchten Sie nur diesen Termin oder die ganze Serie bearbeiten?",
            deleteRecurrenceContent:
                "Möchten Sie nur diesen Termin oder die ganze Serie löschen?",
            deleteContent: "Soll dieser Termin wirklich gelöscht werden?",
            deleteMultipleContent:
                "Sollen alle ausgewählten Termine wirklich gerlöscht werden?",
            newEvent: "Neuer Termin",
            title: "Titel",
            location: "Ort",
            description: "Beschreibung",
            timezone: "Zeitzone",
            startTimezone: "Start Zeitzone",
            endTimezone: "Ende Zeitzone",
            repeat: "Wiederholen",
            saveButton: "Speichern",
            cancelButton: "Abbrechen",
            deleteButton: "Löschen",
            recurrence: "Wiederholung",
            wrongPattern: "Dieses Wiederholungsmuster ist ungültig.",
            seriesChangeAlert:
                "Die an bestimmten Instanzen dieser Serie vorgenommenen Änderungen werden rückgängig gemacht und diese Ereignisse werden wieder mit der Serie übereinstimmen.",
            createError:
                "Die Dauer des Termins muss kürzer als die Häufigkeit sein, mit der es auftritt. Verkürzen Sie die Dauer oder ändern Sie das Wiederholungsmuster im Wiederholungsereignis-Editor.",
            recurrenceDateValidation:
                "Einige Monate haben weniger Tage als das ausgewählte Datum. Für diese Monate fällt das Vorkommen auf das letzte Datum des Monats.",
            sameDayAlert:
                "Zwei Ereignisse desselben Termins können nicht am selben Tag auftreten.",
            editRecurrence: "Wiederholungen bearbeiten",
            repeats: "wiederholt sich",
            alert: "Warnung",
            startEndError: "Das ausgewählte Enddatum liegt vor dem Startdatum.",
            invalidDateError: "Der eingegebene Datumswert ist ungültig.",
            ok: "Ok",
            occurrence: "Auftreten",
            series: "Serie",
            previous: "Zurück",
            next: "Weiter",
            timelineDay: "Zeitleiste Tag",
            timelineWeek: "Zeitleiste Woche",
            timelineWorkWeek: "Zeitleiste Arbeitswoche",
            timelineMonth: "Zeitleiste Monat"
        },
        recurrenceeditor: {
            none: "Nichts ausgewählt",
            daily: "Täglich",
            weekly: "Wöchentlich",
            monthly: "Monatlich",
            month: "Monat",
            yearly: "Jährlich",
            never: "Nie",
            until: "Bis",
            count: "Anzahl",
            first: "Erste(s)",
            second: "Zweites(s)",
            third: "Drittes(s)",
            fourth: "Vierte(s)",
            last: "Letzte(s)",
            repeat: "Wiederholen",
            repeatEvery: "Wiederholen alle",
            on: "Wiederholen am",
            end: "Ende",
            onDay: "Tag",
            days: "Tag(e)",
            weeks: "Woche(n)",
            months: "Monat(e)",
            years: "Jahr(e)",
            every: "jede(s/n)",
            summaryTimes: "mal",
            summaryOn: "an",
            summaryUntil: "bis",
            summaryRepeat: "Wiederholt sich",
            summaryDay: "Tag(e)",
            summaryWeek: "Woche(n)",
            summaryMonth: "Monat(e)",
            summaryYear: "Jahr(e)"
        }
    }
});

loadCldr(
    require("../../../../node_modules/cldr-data/supplemental/numberingSystems.json"),
    require("../../../../node_modules/cldr-data/main/de/ca-gregorian.json"),
    require("../../../../node_modules/cldr-data/main/de/numbers.json"),
    require("../../../../node_modules/cldr-data/main/de/timeZoneNames.json")
);

@Component({
    selector: "app-calendar",
    templateUrl: "./calendar.component.html",

    styleUrls: ["./calendar.component.scss"],

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
    requesting: boolean = false;
    constructor(
        private remoteService: RemoteService,
        private NavbarService: NavbarService,
        private cdr: ChangeDetectorRef
    ) {}
    //public data: object[] = [];
    public weekFirstDay: number = 1;
    public selectedDate: Date = new Date();
    public eventSettings: EventSettingsModel = {
        dataSource: [],
        fields: {
            id: "Id",
            subject: { name: "Subject" },
            isAllDay: { name: "IsAllDay" },
            location: { name: "Location" },
            description: { name: "Description" },
            startTime: { name: "StartTime" },
            endTime: { name: "EndTime" },
            startTimezone: { name: "StartTimezone" },
            endTimezone: { name: "EndTimezone" }
            //recurrenceRule: { name: "RecurrenceRule" },
            //recurrenceID: { name: "RecurrenceID" }
        }
    };

    ngOnInit() {
        this.NavbarService.setHeadline("Kalender");
        this.remoteService.get("calendarGetDates").subscribe(dates => {
            if (this.requesting == false) {
                this.requesting = true;
                for (let date of dates) {
                    //@ts-ignore
                    this.eventSettings.dataSource.push({
                        Id: date.id,
                        Subject: date.headline,
                        StartTime: new Date(date.startDate),
                        EndTime: new Date(date.endDate),
                        IsAllDay: false,
                        //RecurrenceID: 10,
                        //RecurrenceRule:
                        //    "FREQ=DAILY;INTERVAL=1;COUNT=5",
                        Location: date.location,
                        Description: date.description,
                        StartTimezone: "Europe/Berlin",
                        EndTimezone: "Europe/Berlin"
                    });
                }
            }
            this.cdr.detectChanges();
            //console.log(this.data);
        });
    }
}
