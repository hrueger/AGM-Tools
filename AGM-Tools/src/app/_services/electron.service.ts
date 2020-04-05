import { Injectable } from "@angular/core";
import isElectron from "is-electron";
import { FastTranslateService } from "./fast-translate.service";


@Injectable({
    providedIn: "root",
})
export class ElectronService {
    public readonly isElectron: boolean;
    public remote: any;
    public electron: any;
    constructor(private fts: FastTranslateService) {
        this.isElectron = isElectron();
        if (this.isElectron) {
            this.electron = (window as any).require("electron");
            this.remote = this.electron.remote;
            setTimeout(async () => {
                const cw = this.remote.getCurrentWindow();
                const tray = new this.remote.Tray("src/assets/logo/AGM-Tools.png");
                tray.setContextMenu(this.remote.Menu.buildFromTemplate([
                    {
                        label: await this.fts.t("general.open"),
                        click() {
                            cw.show();
                        },
                    },
                    {
                        label: await this.fts.t("general.quit"),
                        click() {
                            (window as any).require("electron").remote.app.quit();
                        },
                    },
                ]));
                tray.on("click", () => {
                    cw.show();
                    cw.focus();
                });
            });
        }
    }

    public runIfElectron(f: (remote, currentWindow) => void) {
        if (this.isElectron) {
            f(this.remote, this.remote.getCurrentWindow());
        }
    }

    public setTitle(t: string) {
        this.runIfElectron((_remote, currentWindow) => {
            currentWindow.setTitle(`${t} | AGM-Tools`);
        });
    }

    public getScreenshotThumbnails(): Promise<any[]> {
        return this.electron.desktopCapturer.getSources({ types: ["window", "screen"], thumbnailSize: { height: 1080, width: 1920 }, fetchWindowIcons: true });
    }
}
