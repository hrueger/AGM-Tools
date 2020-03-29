/**
 * This is the startup file for the Electron version.
 */

import { app, BrowserWindow, globalShortcut } from "electron";
// import { initSplashScreen, OfficeTemplate } from "electron-splashscreen";
import * as path from "path";
import * as url from "url";

let win: BrowserWindow;
const args = process.argv.slice(1);
const serve = args.some((val) => val === "--serve");

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        frame: false,
        icon: path.join(__dirname, "src/favicon.ico"),
        show: true,
        webPreferences: { nodeIntegration: true },
        x: 0,
        y: 0,
        title: "AGM-Tools",
        minHeight: 500,
        minWidth: 1000,
    });
    win.maximize();
    if (serve) {
        // eslint-disable-next-line
        require("electron-reload")(__dirname, {
            // eslint-disable-next-line
            electron: require(`${__dirname}/node_modules/electron`),
        });
        win.loadURL("http://localhost:4200");
    } else {
        win.loadURL(
            url.format({
                pathname: path.join(__dirname, "dist/index.html"),
                protocol: "file:",
                slashes: true,
            }),
        );
    }
    globalShortcut.register("CommandOrControl+Shift+R", () => {
        win.reload();
    });
    globalShortcut.register("CommandOrControl+Shift+I", () => {
        win.webContents.toggleDevTools();
    });

    if (serve) {
        // win.webContents.openDevTools();
    }
    /* const hideSplashscreen = initSplashScreen({
        brand: "H. Rüger",
        color: "#f1c40f",
        height: 300,
        logo: path.join(__dirname, "src/favicon.png"),
        mainWindow: win,
        productName: "AGLight",
        text: "Initializing ...",
        url: OfficeTemplate,
        website: "https://github.com/hrueger/AGM-Tools",
        width: 500,
    }); */

    // ipcMain.on("ready", hideSplashscreen);

    win.on("closed", () => {
        win = null;
    });
}

try {
    app.on("ready", createWindow);
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    app.on("activate", () => {
        if (win === null) {
            createWindow();
        }
    });
} catch (e) {
    // eslint-disable-next-line
    console.error(e);
}
