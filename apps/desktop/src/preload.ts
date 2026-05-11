const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    versions: process.versions,
    // Add more APIs here if needed (e.g. for native dialogs or local file access)
});
