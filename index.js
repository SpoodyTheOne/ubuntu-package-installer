'use strict'
const electron = require("electron");
const { exec } = require("child_process");

var sudo = require('sudo-prompt');
const { ipcMain } = require("electron");
var options = {
    name: 'Package Installer',
};

function createWindow() {

    const win = new electron.BrowserWindow({
        width: 800,
        height: 200,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadFile("./pages/index.html");
    //win.webContents.openDevTools();
    win.setMenu(null);
}

electron.app.on('window-all-closed', () => {
    electron.app.quit()
})

electron.ipcMain.on("request-state", (event, args) => {

    var file = process.argv[1] == "." ? process.argv[2] : process.argv[1];

    event.reply("state", file);

    if (file != undefined) {
        sudo.exec("apt install " + file + " -y", options,
            function (error, stdout, stderr) {
                if (error) {
                    event.reply("msg", error.message);
                    //throw error;
                }

                event.reply("msg","Finished Installing");

            }
        );
    }
})

electron.ipcMain.on("exit", (event, args) => {
    electron.app.quit();
})

electron.app.whenReady().then(createWindow);