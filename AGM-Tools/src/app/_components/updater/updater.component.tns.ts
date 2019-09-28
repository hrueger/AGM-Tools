import { Component, NgZone, OnInit } from "@angular/core";
import { Downloader, DownloadEventData, ProgressEventData } from "nativescript-downloader";
import * as permissions from "nativescript-permissions";
import * as application from "tns-core-modules/application";
import * as utils from "tns-core-modules/utils/utils";
import config from "../../_config/config";
import { AlertService } from "../../_services/alert.service";
declare var android;
declare var androidx;
declare var java;

@Component({
  selector: "app-updater",
  styleUrls: ["./updater.component.scss"],
  templateUrl: "./updater.component.html",
})
export class UpdaterComponent implements OnInit {

  public downloading: boolean = false;
  public currentProgress: number = 0;
  public currentProgressText: string = "0%";

  constructor(private alertService: AlertService, private zone: NgZone) {}

  public ngOnInit() {
    application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
      args.cancel = true;
    });
  }

  public downloadUpdate() {

    /*const downloader = new Downloader();
    const dest = android.os.Environment.getExternalStoragePublicDirectory(
        android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath();
    console.log(dest);

    permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE, "Herunterladen eines Updates")
        .then(() => {
          const imageDownloaderId = downloader.createDownload({
            fileName: `AGM-Tools_update_${Math.round(Math.random() * 100000000)}.apk`,
            path: dest,
            url: `${config.apiUrl}?downloadMobileLatest`,
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
                console.log(`${completed.path}`);
                /*const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
                const apkFile = new java.io.File(completed.path);
                const fileUri = androidx.core.content.FileProvider.getUriForFile(
                  this, application.android.context.getPackageName() + ".provider", apkFile);

                intent.setDataAndType(fileUri, "application/vnd.android.package-archive");
                intent.setFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                application.android.startActivity(intent);

                *//*
                const saveFile = new java.io.File(completed.path);
                console.log(saveFile.length());
                if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.N) {
                  console.log(1);
                  saveFile.setReadable(true, false);
                  const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
                  // tslint:disable-next-line: no-bitwise
                  intent.setFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP
                    | android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                  intent.setDataAndType(java.net.Uri.fromFile(saveFile), "application/vnd.android.package-archive");
                  application.android.startActivity(intent);
                } else {
                  console.log(2);
                  const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
                  const fileUri = androidx.core.content.FileProvider.getUriForFile(application.android.context,
                          "ir.mhdr.provider",
                          saveFile);
                  intent.setDataAndType(fileUri, "application/vnd.android.package-archive");
                  intent.setFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                  application.android.startActivity(intent);
                }
              });
            })
            .catch((error) => {
              this.alertService.error(error.message);
              console.error(error.message);
            });
         });
*/
      utils.openUrl(`${config.apiUrl}?downloadMobileLatest`);
    }

}
