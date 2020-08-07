'use strict'
const electron = require("electron");
const { exec } = require("child_process");

//var sudo = require('sudo-prompt');
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
        var p = exec(`pkexec --disable-internal-agent /bin/bash -c "sudo apt install '${file.replace(/"/g,"\\\"").replace(/'/g,"\\'")}' -y"`);

        var latestE = "";

        p.stdout.on("data", (data) => {
            console.log(data);

            if (data.startsWith("("))
            {
                var percentage = data.match(/([0-9])+%/g)[0];

                if (percentage != undefined)
                {
                    event.reply("percentage",percentage.replace(/%/g,""));
                }
            }

            event.reply("data", data);
        })

        p.stderr.on("data", (data) => {
            latestE = data;

            event.reply("data", data);
        })

        p.on("close", (data) => {
            if (data == 0)
                event.reply("msg", "Finished installing");
            else
                event.reply("msg", latestE);
        })
    }
})

electron.ipcMain.on("exit", (event, args) => {
    electron.app.quit();
})

electron.app.whenReady().then(createWindow);