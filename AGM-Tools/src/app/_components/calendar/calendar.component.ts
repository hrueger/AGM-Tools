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
import { FastTranslateService } from "../../_services/fast-translate.service";
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
    // eslint-disable-next-line
    require("../../../../node_modules/cldr-data/supplemental/numberingSystems.json"),
    // eslint-disable-next-line
    require("../../../../node_modules/cldr-data/main/de/ca-gregorian.json"),
    // eslint-disable-next-line
    require("../../../../node_modules/cldr-data/main/de/numbers.json"),
    // eslint-disable-next-line
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
    @ViewChild("calendar") public calendar;
    public weekFirstDay = 1;
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
    public constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private fts: FastTranslateService,
    ) { }

    public async ngOnInit(): Promise<void> {
        this.navbarService.setHeadline(await this.fts.t("calendar.calendar"));
        this.remoteService.get("get", "events/").subscribe((dates): void => {
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
                    if (date.id == this.eventToNavigateTo) {
                        this.selectedDate = new Date(date.startDate);
                    }
                }
                if (this.showCalendar) {
                    this.showCalendar = false;
                    const that = this;
                    window.setTimeout((): void => {
                        that.showCalendar = true;
                    }, 50);
                } else {
                    this.showCalendar = true;
                }
            }
        });
        this.route.params.subscribe((params): void => {
            this.eventToNavigateTo = params.index;
        });
    }

    public async onChange(ev): Promise<void> {
        if (ev) {
            switch (ev.requestType) {
            case "eventCreated":
                this.remoteService
                    .getNoCache("post", "events/", {
                        description: ev.data[0].Description ? ev.data[0].Description : await this.fts.t("errors.noDescriptionProvided"),
                        endDate: ev.data[0].EndTime.toISOString(),
                        headline: ev.data[0].Subject ? ev.data[0].Subject : await this.fts.t("errors.noHeadlineProvided"),
                        important: true,
                        location: ev.data[0].Location ? ev.data[0].Location : await this.fts.t("errors.noLocationProvided"),
                        startDate: ev.data[0].StartTime.toISOString(),
                    })
                    .subscribe(async (data): Promise<void> => {
                        if (data && data.status == true) {
                            this.alertService.success(await this.fts.t("calendar.eventSavedSuccessfully"));
                            this.idsToReplace.push(
                                {
                                    bad: (this.eventSettings.dataSource as any[])
                                        .find((e): boolean => e.Id == ev.data[0].Id).Id,
                                    good: data.id,
                                },
                            );
                            // eslint-disable-next-line no-console
                            console.log(this.idsToReplace);
                        }
                    });
                break;
            case "eventChanged":
                const id = this.getRealId(ev.data[0].Id);
                if (id != null) {
                    this.remoteService
                        .getNoCache("post", `events/${id}`, {
                            description: ev.data[0].Description ? ev.data[0].Description : await this.fts.t("errors.noDescriptionProvided"),
                            endDate: ev.data[0].EndTime.toISOString(),
                            headline: ev.data[0].Subject ? ev.data[0].Subject : await this.fts.t("errors.noHeadlineProvided"),
                            important: true,
                            location: ev.data[0].Location ? ev.data[0].Location : await this.fts.t("errors.noLocationProvided"),
                            startDate: ev.data[0].StartTime.toISOString(),
                        })
                        .subscribe(async (data): Promise<void> => {
                            if (data && data.status == true) {
                                this.alertService.success(await this.fts.t("calendar.eventUpdatedSuccessfully"));
                            }
                        });
                }
                break;
            case "eventRemoved":
                if (!(ev && ev.data && ev.data[0] && ev.data[0].Id)) {
                    return;
                }
                const evId = this.getRealId(ev.data[0].Id);
                if (evId != null) {
                    this.remoteService
                        .getNoCache("delete", `events/${evId}`)
                        .subscribe(async (data): Promise<void> => {
                            if (data && data.status == true) {
                                this.alertService.success(await this.fts.t("calendar.eventDeletedSuccessfully"));
                            }
                        });
                }
                break;
            default:
                // eslint-disable-next-line no-console
                console.log(ev);
            }
        }
    }

    private getRealId(id: string): string {
        const index = this.idsToReplace.findIndex((e): boolean => e.bad == id);
        if (index != -1) {
            id = this.idsToReplace[index].good;
        } else {
            id = null;
        }
        return id;
    }
}
