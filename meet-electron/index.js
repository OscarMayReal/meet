import { app, BrowserWindow } from "electron";

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        trafficLightPosition: {
            x: 22,
            y: 22
        },
        titleBarStyle: "hiddenInset"
    });
    mainWindow.loadURL("https://meet.quntem.com/app");
}

app.whenReady().then(() => {
    createWindow()
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});