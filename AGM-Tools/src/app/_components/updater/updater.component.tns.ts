import { Component, NgZone, OnInit } from "@angular/core";
import { Downloader, DownloadEventData, ProgressEventData } from "nativescript-downloader";
import * as permissions from "nativescript-permissions";
import * as application from "tns-core-modules/application";
import { environment } from "../../../environments/environment";
import { AlertService } from "../../_services/alert.service";

let android;
let androidx;
let java;

@Component({
    selector: "app-updater",
    styleUrls: ["./updater.component.scss"],
    templateUrl: "./updater.component.html",
})
export class UpdaterComponent implements OnInit {
    public downloading = false;
    public currentProgress = 0;
    public currentProgressText = "0%";
    public downloadDone = false;
    private completedPath = "";

    public constructor(private alertService: AlertService, private zone: NgZone) { }

    public ngOnInit() {
        application.android.on(application.AndroidApplication.activityBackPressedEvent,
            (args: any) => {
                args.cancel = true;
            });
    }

    public downloadUpdate() {
        const downloader = new Downloader();
        const dest = android.os.Environment.getExternalStoragePublicDirectory(
            android.os.Environment.DIRECTORY_DOWNLOADS,
        ).getAbsolutePath();

        permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE, "Herunterladen eines Updates")
            .then(() => {
                const imageDownloaderId = downloader.createDownload({
                    fileName: `AGM-Tools_update_${Math.round(Math.random() * 100000000)}.apk`,
                    path: dest,
                    url: "ToDo",
                });
                this.downloading = true;
                downloader
                    .start(imageDownloaderId, (progressData: ProgressEventData) => {
                        // console.log(`Progress : ${progressData.value}`);
                        // console.log(`Current Size : ${progressData.currentSize}`);
                        // console.log(`Total Size : ${progressData.totalSize}`);
                        // console.log(`Download Speed in bytes : ${progressData.speed}`);
                        const that = this;
                        this.zone.run(() => {
                            that.currentProgress = progressData.value;
                            that.currentProgressText = `${progressData.value} %`;
                        });
                    })
                    .then((completed: DownloadEventData) => {
                        this.zone.run(() => {
                            this.completedPath = completed.path;
                            this.createIntent();
                        });
                    })
                    .catch((error) => {
                        this.alertService.error(error.message);
                        // eslint-disable-next-line no-console
                        console.error(error.message);
                    });
            });
    }

    public createIntent() {
        const saveFile = new java.io.File(this.completedPath);
        if (android.os.Build.VERSION.SDK_INT < 24) { // nougat
            saveFile.setReadable(true, false);
            const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);

            intent.setFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP
                | android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setDataAndType(android.net.Uri.fromFile(saveFile), "application/vnd.android.package-archive");
            application.android.foregroundActivity.startActivity(intent);
        } else {
            const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
            const fileUri = androidx.core.content.FileProvider.getUriForFile(application.android.context, "de.multimediaag.agmtools.provider", saveFile);
            intent.setDataAndType(fileUri, "application/vnd.android.package-archive");
            intent.setFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
            application.android.foregroundActivity.startActivity(intent);
        }
        this.downloadDone = true;
    }
}
