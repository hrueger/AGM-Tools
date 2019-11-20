import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
    AgendaService,
    DayService,
    EventSettingsModel,
    MonthAgendaService,
    MonthService,
    WeekService,
    WorkWeekService,
} from "@syncfusion/ej2-angular-schedule";
import { L10n, loadCldr } from "@syncfusion/ej2-base";
import { AlertService } from "../../_services/alert.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

L10n.load({
    de: {
        recurrenceeditor: {
            count: "Anzahl",
            daily: "Täglich",
            days: "Tag(e)",
            end: "Ende",
            every: "jede(s/n)",
            first: "Erste(s)",
            fourth: "Vierte(s)",
            last: "Letzte(s)",
            month: "Monat",
            monthly: "Monatlich",
            months: "Monat(e)",
            never: "Nie",
            none: "Nichts ausgewählt",
            on: "Wiederholen am",
            onDay: "Tag",
            repeat: "Wiederholen",
            repeatEvery: "Wiederholen alle",
            second: "Zweites(s)",
            summaryDay: "Tag(e)",
            summaryMonth: "Monat(e)",
            summaryOn: "an",
            summaryRepeat: "Wiederholt sich",
            summaryTimes: "mal",
            summaryUntil: "bis",
            summaryWeek: "Woche(n)",
            summaryYear: "Jahr(e)",
            third: "Drittes(s)",
            until: "Bis",
            weekly: "Wöchentlich",
            weeks: "Woche(n)",
            yearly: "Jährlich",
            years: "Jahr(e)",
        },
        schedule: {
            addTitle: "Titel hinzufügen",
            agenda: "Agenda",
            alert: "Warnung",
            allDay: "Ganzer Tag",
            cancel: "Abbrechen",
            cancelButton: "Abbrechen",
            close: "Schließen",
            createError: "Die Dauer des Termins muss kürzer als die Häufigkeit sein, mit der es auftritt.\
            Verkürzen Sie die Dauer oder ändern Sie das Wiederholungsmuster im Wiederholungsereignis-Editor.",
            createEvent: "Erstellen",
            day: "Tag",
            delete: "Löschen",
            deleteButton: "Löschen",
            deleteContent: "Soll dieser Termin wirklich gelöscht werden?",
            deleteEvent: "Termin löschen",
            deleteMultipleContent: "Sollen alle ausgewählten Termine wirklich gerlöscht werden?",
            deleteMultipleEvent: "Mehrere Termine löschen",
            deleteRecurrenceContent: "Möchten Sie nur diesen Termin oder die ganze Serie löschen?",
            deleteSeries: "Serie löschen",
            description: "Beschreibung",
            edit: "Bearbeiten",
            editContent: "Möchten Sie nur diesen Termin oder die ganze Serie bearbeiten?",
            editEvent: "Termin bearbeiten",
            editRecurrence: "Wiederholungen bearbeiten",
            editSeries: "Serie bearbeiten",
            emptyContainer: "Für diesen Zeitraum sind keine termine eingetragen.",
            end: "Ende",
            endTimezone: "Ende Zeitzone",
            invalidDateError: "Der eingegebene Datumswert ist ungültig.",
            location: "Ort",
            month: "Monat",
            monthAgenda: "Monatsagenda",
            more: "mehr",
            moreDetails: "Mehr Details",
            newEvent: "Neuer Termin",
            next: "Weiter",
            noEvents: "Keine Termine",
            noTitle: "(Unbenannt)",
            occurrence: "Auftreten",
            ok: "Ok",
            previous: "Zurück",
            recurrence: "Wiederholung",
            recurrenceDateValidation: "Einige Monate haben weniger Tage als das ausgewählte Datum.\
            Für diese Monate fällt das Vorkommen auf das letzte Datum des Monats.",
            repeat: "Wiederholen",
            repeats: "wiederholt sich",
            sameDayAlert: "Zwei Ereignisse desselben Termins können nicht am selben Tag auftreten.",
            save: "Speichern",
            saveButton: "Speichern",
            selectedItems: "Ausgewählte Termine",
            series: "Serie",
            seriesChangeAlert: "Die an bestimmten Instanzen dieser Serie vorgenommenen Änderungen werden\
            rückgängig gemacht und diese Ereignisse werden wieder mit der Serie übereinstimmen.",
            start: "Start",
            startEndError: "Das ausgewählte Enddatum liegt vor dem Startdatum.",
            startTimezone: "Start Zeitzone",
            subject: "Betreff",
            timelineDay: "Zeitleiste Tag",
            timelineMonth: "Zeitleiste Monat",
            timelineWeek: "Zeitleiste Woche",
            timelineWorkWeek: "Zeitleiste Arbeitswoche",
            timezone: "Zeitzone",
            title: "Titel",
            today: "Heute",
            week: "Woche",
            weekAgenda: "Wochenagenda",
            workWeek: "Arbeitswoche",
            workWeekAgenda: "Arbeitswochenagenda",
            wrongPattern: "Dieses Wiederholungsmuster ist ungültig.",
        },
    },
});

loadCldr(
    require("../../../../node_modules/cldr-data/supplemental/numberingSystems.json"),
    require("../../../../node_modules/cldr-data/main/de/ca-gregorian.json"),
    require("../../../../node_modules/cldr-data/main/de/numbers.json"),
    require("../../../../node_modules/cldr-data/main/de/timeZoneNames.json"),
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
        MonthAgendaService,
    ],
})
export class CalendarComponent {
    @ViewChild("calendar", { static: false }) public calendar;
    public weekFirstDay: number = 1;
    public showCalendar = false;
    public selectedDate: Date = new Date();
    public eventSettings: EventSettingsModel = {
        dataSource: [],
        fields: {
            description: { name: "Description" },
            endTime: { name: "EndTime" },
            endTimezone: { name: "EndTimezone" },
            id: "Id",
            isAllDay: { name: "IsAllDay" },
            location: { name: "Location" },
            startTime: { name: "StartTime" },
            startTimezone: { name: "StartTimezone" },
            subject: { name: "Subject" },
            // recurrenceRule: { name: "RecurrenceRule" },
            // recurrenceID: { name: "RecurrenceID" }
        },
    };
    public idsToReplace: any = [];
    public eventToNavigateTo = null;
    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
        private route: ActivatedRoute,
        private alertService: AlertService,
    ) { }

    public ngOnInit() {
        this.navbarService.setHeadline("Kalender");
        this.remoteService.get("get", "events/").subscribe((dates) => {
            if (dates) {
                this.eventSettings.dataSource = [];
                for (const date of dates) {
                    // @ts-ignore
                    this.eventSettings.dataSource.push({
                        Description: date.description,
                        EndTime: new Date(date.end),
                        EndTimezone: "Europe/Berlin",
                        Id: date.id,
                        IsAllDay: false,
                        Location: date.location,
                        StartTime: new Date(date.start),
                        StartTimezone: "Europe/Berlin",
                        Subject: date.headline,
                    });
                    console.info("added to data source: ", this.eventSettings.dataSource);
                    if (date.id == this.eventToNavigateTo) {
                        this.selectedDate = new Date(date.startDate);
                    }
                }
                if (this.showCalendar) {
                    this.showCalendar = false;
                    const that = this;
                    window.setTimeout(() => {
                        that.showCalendar = true;
                    }, 50);
                } else {
                    this.showCalendar = true;
                }
            }
        });
        this.route.params.subscribe((params) => {
            this.eventToNavigateTo = params.index;
        });
    }

    public onChange(ev) {
        if (ev) {
            switch (ev.requestType) {
                case "eventCreated":
                    this.remoteService
                        .getNoCache("post", "events/", {
                            description: ev.data.Description ? ev.data.Description : "Keine Beschreibung angegeben",
                            endDate: ev.data.EndTime.toISOString(),
                            headline: ev.data.Subject ? ev.data.Subject : "Kein Betreff angegeben",
                            important: true,
                            location: ev.data.Location ? ev.data.Location : "Kein Ort angegeben",
                            startDate: ev.data.StartTime.toISOString(),
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Termin erfolgreich gespeichert!",
                                );
                                this.idsToReplace.push(
                                    {
                                        // @ts-ignore
                                        bad: this.eventSettings.dataSource.find((e) => e.Id == ev.data.Id).Id,
                                        good: data.id,
                                    },
                                );
                                // tslint:disable-next-line: no-console
                                console.log(this.idsToReplace);
                            }
                        });
                case "eventChanged":
                    const id = this.getRealId(ev.data.Id);
                    if (id != null) {
                        this.remoteService
                            .getNoCache("post", `events/${id}`, {
                                description: ev.data.Description ? ev.data.Description : "Keine Beschreibung angegeben",
                                endDate: ev.data.EndTime.toISOString(),
                                headline: ev.data.Subject ? ev.data.Subject : "Kein Betreff angegeben",
                                important: true,
                                location: ev.data.Location ? ev.data.Location : "Kein Ort angegeben",
                                startDate: ev.data.StartTime.toISOString(),
                            })
                            .subscribe((data) => {
                                if (data && data.status == true) {
                                    this.alertService.success(
                                        "Termin erfolgreich aktualisiert!",
                                    );
                                }
                            });
                    }
                case "eventRemoved":
                    if (!(ev && ev.data && ev.data[0] && ev.data[0].Id)) {
                        return;
                    }
                    const evId = this.getRealId(ev.data[0].Id);
                    if (evId != null) {
                        this.remoteService
                            .getNoCache("delete", `events/${evId}`)
                            .subscribe((data) => {
                                if (data && data.status == true) {
                                    this.alertService.success(
                                        "Termin erfolgreich gelöscht!",
                                    );
                                }
                            });
                    }
                default:
                    // tslint:disable-next-line: no-console
                    console.log(ev);
            }
        }
    }

    private getRealId(id: string) {
        const index = this.idsToReplace.findIndex((e) => e.bad == id);
        if (index != -1) {
            id = this.idsToReplace[index].good;
        } else {
            id = null;
        }
        return id;
    }
}
