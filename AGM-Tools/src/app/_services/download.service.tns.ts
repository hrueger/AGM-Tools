import { Injectable, NgZone } from "@angular/core";
import { Downloader, DownloadEventData, ProgressEventData } from "nativescript-downloader";
import { LocalNotifications } from "nativescript-local-notifications";
import * as permissions from "nativescript-permissions";
import { AlertService } from "./alert.service";
import { FastTranslateService } from "./fast-translate.service";

let android: any;

@Injectable({
    providedIn: "root",
})
export class DownloadService {
    constructor(
        private zone: NgZone,
        private alertService: AlertService,
        private fts: FastTranslateService,
    ) { }
    public download(url: string, destination:
    "alarms" | "audiobooks" | "dcim" | "documents" |
    "downloads" | "movies" | "music" | "notifications" |
    "pictures" | "podcasts" | "ringtones" | "screenshots",
    fileName: string,
    useProgressNotification = true,
    filenameToDisplay = "") {
        return new Promise((resolve, reject) => {
            const downloader = new Downloader();
            let d;
            switch (destination) {
            case "alarms":
                d = android.os.Environment.DIRECTORY_ALARMS;
                break;
            case "audiobooks":
                d = android.os.Environment.DIRECTORY_AUDIOBOOKS;
                break;
            case "dcim":
                d = android.os.Environment.DIRECTORY_DCIM;
                break;
            case "documents":
                d = android.os.Environment.DIRECTORY_DOCUMENTS;
                break;
            case "downloads":
                d = android.os.Environment.DIRECTORY_DOWNLOADS;
                break;
            case "movies":
                d = android.os.Environment.DIRECTORY_MOVIES;
                break;
            case "music":
                d = android.os.Environment.DIRECTORY_MUSIC;
                break;
            case "notifications":
                d = android.os.Environment.DIRECTORY_NOTIFICATIONS;
                break;
            case "pictures":
                d = android.os.Environment.DIRECTORY_PICTURES;
                break;
            case "podcasts":
                d = android.os.Environment.DIRECTORY_PODCASTS;
                break;
            case "ringtones":
                d = android.os.Environment.DIRECTORY_RINGTONES;
                break;
            case "screenshots":
                d = android.os.Environment.DIRECTORY_SCREENSHOTS;
                break;
            default:
                d = android.os.Environment.DIRECTORY_DOWNLOADS;
                break;
            }
            const path = android.os.Environment
                .getExternalStoragePublicDirectory(d).getAbsolutePath();

            permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
                .then(async () => {
                    const downloadId = downloader.createDownload({ fileName, path, url });
                    let notificationId;
                    if (useProgressNotification) {
                        [notificationId] = (await LocalNotifications.schedule([{
                            body: `${await this.fts.t("download.downloadingFile")} "${filenameToDisplay}"`,
                            ongoing: false,
                            subtitle: await this.fts.t("download.downloading"),
                            title: await this.fts.t("download.downloading"),
                        }]));
                    }
                    downloader.start(downloadId, (progressData: ProgressEventData) => {
                        // console.log(`Progress : ${progressData.value}`);
                        // console.log(`Current Size : ${progressData.currentSize}`);
                        // console.log(`Total Size : ${progressData.totalSize}`);
                        // console.log(`Download Speed in bytes : ${progressData.speed}`);
                        this.zone.run(async () => {
                            if (notificationId) {
                                await LocalNotifications.schedule([{
                                    body: `${await this.fts.t("download.downloadingFile")} "${filenameToDisplay}": ${progressData.value}%`,
                                    id: notificationId,
                                    ongoing: false,
                                    subtitle: await this.fts.t("download.downloading"),
                                    title: await this.fts.t("download.downloading"),
                                }]);
                            }
                        });
                    }).then((completed: DownloadEventData) => {
                        this.zone.run(async () => {
                            if (notificationId) {
                                await LocalNotifications.schedule([{
                                    body: await this.fts.t("download.savedToDownloads"),
                                    id: notificationId,
                                    ongoing: false,
                                    subtitle: await this.fts.t("download.downloadFinished"),
                                    title: (await this.fts.t("download.downloadFileFinished"))
                                        .replace("{file}", filenameToDisplay),
                                }]);
                            }
                            resolve(completed.path);
                        });
                    })
                        .catch(async (error) => {
                            this.alertService.error(error.message);
                            if (notificationId) {
                                await LocalNotifications.cancel(notificationId);
                            }
                            reject(error);
                        });
                });
        });
    }
}
